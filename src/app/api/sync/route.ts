import { NextRequest, NextResponse } from 'next/server';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { supabase } from '@/lib/supabase';
import type { Book } from '@/lib/supabase';
import { logger } from '@/lib/logger';

// ============================================================================
// GOOGLE SHEETS СИНХРОНИЗАЦИЯ
// ============================================================================

// Настройка аутентификации для Google Sheets
function getGoogleAuth() {
  const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;

  if (!clientEmail || !privateKey || !spreadsheetId) {
    throw new Error('Missing Google Sheets environment variables');
  }

  return {
    auth: new JWT({
      email: clientEmail,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    }),
    spreadsheetId,
  };
}

// Функция для подключения к Google Sheets
async function connectToGoogleSheets() {
  const { auth, spreadsheetId } = getGoogleAuth();
  const doc = new GoogleSpreadsheet(spreadsheetId, auth);
  await doc.loadInfo();
  return doc;
}

// ============================================================================
// РЕЗЕРВНОЕ КОПИРОВАНИЕ В GOOGLE SHEETS
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();

    if (action === 'backup_to_sheets') {
      logger.info('Starting backup to Google Sheets', undefined, 'Sync');
      
      // Получаем все книги из Supabase
      const { data: books, error } = await supabase
        .from('books')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        throw new Error(`Ошибка получения данных из Supabase: ${error.message}`);
      }

      // Подключаемся к Google Sheets
      const doc = await connectToGoogleSheets();
      let sheet = doc.sheetsByTitle['Books'];
      
      // Если листа нет, создаём его
      if (!sheet) {
        sheet = await doc.addSheet({
          title: 'Books',
          headerValues: [
            'id', 'code', 'title', 'author', 'category', 'subcategory',
            'description', 'short_description', 'isbn', 'pages', 'age_range',
            'language', 'publisher', 'publication_year', 'cover_url',
            'status', 'available', 'qty_total', 'qty_available', 'price_uah',
            'location', 'rating', 'rating_count', 'badges', 'tags',
            'created_at', 'updated_at'
          ]
        });
      }

      // Очищаем существующие данные (кроме заголовков)
      await sheet.clear();
      await sheet.setHeaderRow([
        'id', 'code', 'title', 'author', 'category', 'subcategory',
        'description', 'short_description', 'isbn', 'pages', 'age_range',
        'language', 'publisher', 'publication_year', 'cover_url',
        'status', 'available', 'qty_total', 'qty_available', 'price_uah',
        'location', 'rating', 'rating_count', 'badges', 'tags',
        'created_at', 'updated_at'
      ]);

      // Подготавливаем данные для записи в Google Sheets
      const rowsData = books?.map((book: Book) => ({
        id: book.id,
        code: book.code || '',
        title: book.title,
        author: book.author,
        category: book.category_id,
        subcategory: book.subcategory || '',
        description: book.description || '',
        short_description: book.short_description || '',
        isbn: book.isbn || '',
        pages: book.pages || '',
        age_range: book.age_range || '',
        language: book.language || 'Ukrainian',
        publisher: book.publisher || '',
        publication_year: book.publication_year || '',
        cover_url: book.cover_url || '',
        status: book.status || 'available',
        available: book.available ? 'TRUE' : 'FALSE',
        qty_total: book.qty_total || 1,
        qty_available: book.qty_available || 1,
        price_uah: book.price_uah || 0,
        location: book.location || '',
        rating: book.rating || 0,
        rating_count: book.rating_count || 0,
        badges: Array.isArray(book.badges) ? book.badges.join(', ') : '',
        tags: Array.isArray(book.tags) ? book.tags.join(', ') : '',
        created_at: book.created_at || '',
        updated_at: book.updated_at || '',
      })) || [];

      // Записываем данные в Google Sheets
      if (rowsData.length > 0) {
        await sheet.addRows(rowsData);
      }

      logger.info(`Backup completed: ${rowsData.length} books backed up to Google Sheets`, undefined, 'Sync');

      return NextResponse.json({
        success: true,
        message: `Резервная копия создана: ${rowsData.length} книг сохранено в Google Sheets`,
        count: rowsData.length
      });
    }

    // ================================================================
    // ЗАГРУЗКА ДАННЫХ ИЗ УКРАИНСКОЙ GOOGLE SHEETS В SUPABASE
    // ================================================================

    if (action === 'import_from_sheets') {
      logger.info('Starting enriched import from Ukrainian Google Sheets', undefined, 'Sync');
      
      const { GoogleSheetsService } = await import('@/lib/googleSheets');
      
      // Используем улучшенную функцию импорта с обогащением данных
      const { books, stats } = await GoogleSheetsService.importUkrainian();
      
      if (!books.length) {
        return NextResponse.json({
          success: false,
          error: `Нет данных для импорта. Ошибки: ${stats.errors.join(', ')}`
        });
      }

      logger.info(`Processing ${books.length} books for import`, { stats }, 'Sync');

      // Вставляем обогащённые данные в Supabase пакетами по 50 книг
      const batchSize = 50;
      let totalInserted = 0;
      const insertErrors: string[] = [];

      for (let i = 0; i < books.length; i += batchSize) {
        const batch = books.slice(i, i + batchSize);
        
        try {
          const { data, error: insertError } = await (supabase
            .from('books') as any)
            .insert(batch)
            .select();

          if (insertError) {
            insertErrors.push(`Batch ${Math.floor(i/batchSize) + 1}: ${insertError.message}`);
            logger.error(`Batch insert error`, insertError, 'Sync');
          } else {
            totalInserted += data?.length || 0;
            logger.info(`Batch ${Math.floor(i/batchSize) + 1} completed: ${data?.length || 0} books inserted`, undefined, 'Sync');
          }
        } catch (error) {
          insertErrors.push(`Batch ${Math.floor(i/batchSize) + 1}: ${error instanceof Error ? error.message : 'Невідома помилка'}`);
        }
      }

      logger.info(`Import completed: ${totalInserted}/${books.length} books imported from Google Sheets`, undefined, 'Sync');

      return NextResponse.json({
        success: totalInserted > 0,
        message: totalInserted > 0 
          ? `Імпорт завершено: ${totalInserted} з ${books.length} книг імпортовано з Google Sheets` 
          : 'Помилка імпорту: жодної книги не вдалося імпортувати',
        count: totalInserted,
        stats: {
          total_processed: stats.totalBooks,
          enriched: stats.successCount,
          inserted: totalInserted,
          errors: [...stats.errors, ...insertErrors]
        }
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Неизвестное действие'
    }, { status: 400 });

  } catch (error) {
    logger.error('Sync error', error, 'Sync');
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Неизвестная ошибка синхронизации'
    }, { status: 500 });
  }
}

// ============================================================================
// ПОЛУЧЕНИЕ СТАТУСА СИНХРОНИЗАЦИИ
// ============================================================================

export async function GET() {
  try {
    logger.info('Getting sync status', undefined, 'Sync');
    
    // Проверяем подключение к Google Sheets
    const doc = await connectToGoogleSheets();
    const sheet = doc.sheetsByTitle['Каталог книг'] || doc.sheetsByTitle['Books'];
    
    let sheetsCount = 0;
    if (sheet) {
      const rows = await sheet.getRows();
      sheetsCount = rows.length;
    }

    // Получаем количество книг в Supabase
    const { count: supabaseCount, error } = await supabase
      .from('books')
      .select('*', { count: 'exact', head: true });

    if (error) {
      throw new Error(`Ошибка получения данных из Supabase: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      data: {
        supabase_count: supabaseCount || 0,
        sheets_count: sheetsCount,
        last_check: new Date().toISOString(),
        sheets_available: !!sheet,
        sync_needed: (supabaseCount || 0) !== sheetsCount
      }
    });

  } catch (error) {
    logger.error('Sync status error', error, 'Sync');
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Ошибка проверки статуса синхронизации'
    }, { status: 500 });
  }
}