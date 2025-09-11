import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import type { Book } from './supabase';
import { logger } from './logger';

// ============================================================================
// GOOGLE SHEETS УТИЛИТЫ
// ============================================================================

export interface GoogleSheetsConfig {
  clientEmail: string;
  privateKey: string;
  spreadsheetId: string;
}

export interface SyncStats {
  totalBooks: number;
  successCount: number;
  errorCount: number;
  errors: string[];
}

// ============================================================================
// КОНФИГУРАЦИЯ И ПОДКЛЮЧЕНИЕ
// ============================================================================

export function getGoogleSheetsConfig(): GoogleSheetsConfig {
  const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;

  if (!clientEmail || !privateKey || !spreadsheetId) {
    throw new Error('Missing Google Sheets environment variables. Check GOOGLE_SHEETS_CLIENT_EMAIL, GOOGLE_SHEETS_PRIVATE_KEY, and GOOGLE_SHEETS_SPREADSHEET_ID');
  }

  return { clientEmail, privateKey, spreadsheetId };
}

export async function connectToGoogleSheets(config?: GoogleSheetsConfig): Promise<GoogleSpreadsheet> {
  const { clientEmail, privateKey, spreadsheetId } = config || getGoogleSheetsConfig();
  
  const auth = new JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const doc = new GoogleSpreadsheet(spreadsheetId, auth);
  await doc.loadInfo();
  
  logger.info(`Connected to Google Sheets: "${doc.title}"`, { 
    sheetCount: doc.sheetCount,
    spreadsheetId 
  }, 'GoogleSheets');
  
  return doc;
}

// ============================================================================
// ОПЕРАЦИИ С ДАННЫМИ
// ============================================================================

/**
 * Создание резервной копии всех книг в Google Sheets
 */
export async function backupBooksToSheets(books: Book[]): Promise<SyncStats> {
  const stats: SyncStats = {
    totalBooks: books.length,
    successCount: 0,
    errorCount: 0,
    errors: []
  };

  try {
    const doc = await connectToGoogleSheets();
    
    // Получаем или создаём лист Books
    let sheet = doc.sheetsByTitle['Books'];
    if (!sheet) {
      sheet = await doc.addSheet({
        title: 'Books',
        headerValues: getBookHeaders()
      });
      logger.info('Created new "Books" sheet', undefined, 'GoogleSheets');
    } else {
      // Очищаем существующие данные
      await sheet.clear();
      await sheet.setHeaderRow(getBookHeaders());
      logger.info('Cleared existing "Books" sheet', undefined, 'GoogleSheets');
    }

    // Конвертируем книги в формат для Google Sheets
    const rowsData = books.map(bookToSheetRow);
    
    if (rowsData.length > 0) {
      await sheet.addRows(rowsData);
      stats.successCount = rowsData.length;
    }

    logger.info(`Backup completed: ${stats.successCount}/${stats.totalBooks} books backed up`, undefined, 'GoogleSheets');

  } catch (error) {
    stats.errorCount = stats.totalBooks;
    stats.errors.push(error instanceof Error ? error.message : 'Unknown error during backup');
    logger.error('Backup to sheets failed', error, 'GoogleSheets');
  }

  return stats;
}

/**
 * Импорт книг из Google Sheets
 */
export async function importBooksFromSheets(): Promise<{ books: Partial<Book>[], stats: SyncStats }> {
  const stats: SyncStats = {
    totalBooks: 0,
    successCount: 0,
    errorCount: 0,
    errors: []
  };

  try {
    const doc = await connectToGoogleSheets();
    const sheet = doc.sheetsByTitle['Books'];
    
    if (!sheet) {
      throw new Error('Sheet "Books" not found');
    }

    const rows = await sheet.getRows();
    stats.totalBooks = rows.length;
    
    const books = rows
      .map((row, index) => {
        try {
          const book = sheetRowToBook(row);
          stats.successCount++;
          return book;
        } catch (error) {
          stats.errorCount++;
          stats.errors.push(`Row ${index + 2}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          return null;
        }
      })
      .filter((book): book is Partial<Book> => book !== null);

    logger.info(`Import completed: ${stats.successCount}/${stats.totalBooks} books imported`, undefined, 'GoogleSheets');
    
    return { books, stats };

  } catch (error) {
    stats.errors.push(error instanceof Error ? error.message : 'Unknown error during import');
    logger.error('Import from sheets failed', error, 'GoogleSheets');
    
    return { books: [], stats };
  }
}

/**
 * Получить статистику синхронизации
 */
export async function getSyncStatus(): Promise<{
  sheetsCount: number;
  lastModified?: Date;
  isAvailable: boolean;
  title?: string;
}> {
  try {
    const doc = await connectToGoogleSheets();
    const sheet = doc.sheetsByTitle['Books'];
    
    if (!sheet) {
      return {
        sheetsCount: 0,
        isAvailable: false
      };
    }

    const rows = await sheet.getRows();
    
    return {
      sheetsCount: rows.length,
      isAvailable: true,
      title: doc.title,
      lastModified: new Date() // Google Sheets API не предоставляет дату изменения напрямую
    };

  } catch (error) {
    logger.error('Failed to get sync status', error, 'GoogleSheets');
    return {
      sheetsCount: 0,
      isAvailable: false
    };
  }
}

// ============================================================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ============================================================================

function getBookHeaders(): string[] {
  return [
    'id', 'code', 'title', 'author', 'category', 'subcategory',
    'description', 'short_description', 'isbn', 'pages', 'age_range',
    'language', 'publisher', 'publication_year', 'cover_url',
    'status', 'available', 'qty_total', 'qty_available', 'price_uah',
    'location', 'rating', 'rating_count', 'badges', 'tags',
    'created_at', 'updated_at'
  ];
}

function bookToSheetRow(book: Book): Record<string, any> {
  return {
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
    available: ((book.qty_available || 0) > 0 && book.is_active) ? 'TRUE' : 'FALSE',
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
  };
}

function sheetRowToBook(row: any): Partial<Book> {
  const title = row.get('title')?.trim();
  const author = row.get('author')?.trim();
  
  if (!title || !author) {
    throw new Error('Title and author are required');
  }

  return {
    id: row.get('id') || undefined,
    code: row.get('code') || null,
    title,
    author,
    category_id: row.get('category') || 'Загальна',
    subcategory: row.get('subcategory') || null,
    description: row.get('description') || null,
    short_description: row.get('short_description') || null,
    isbn: row.get('isbn') || null,
    pages: parseIntOrNull(row.get('pages')),
    age_range: row.get('age_range') || null,
    language: row.get('language') || 'Ukrainian',
    publisher: row.get('publisher') || null,
    publication_year: parseIntOrNull(row.get('publication_year')),
    cover_url: row.get('cover_url') || null,
    status: row.get('status') || 'available',
    // available: row.get('available')?.toLowerCase() === 'true', // TODO: Add available field to books table
    qty_total: parseIntOrNull(row.get('qty_total')) || 1,
    qty_available: parseIntOrNull(row.get('qty_available')) || 1,
    price_uah: parseFloatOrNull(row.get('price_uah')) || 0,
    location: row.get('location') || null,
    rating: parseFloatOrNull(row.get('rating')) || 0,
    rating_count: parseIntOrNull(row.get('rating_count')) || 0,
    badges: parseArrayFromString(row.get('badges')),
    tags: parseArrayFromString(row.get('tags')),
  };
}

function parseIntOrNull(value: string): number | null {
  const parsed = parseInt(value);
  return isNaN(parsed) ? null : parsed;
}

function parseFloatOrNull(value: string): number | null {
  const parsed = parseFloat(value);
  return isNaN(parsed) ? null : parsed;
}

function parseArrayFromString(value: string): string[] {
  if (!value) return [];
  return value.split(',').map(item => item.trim()).filter(Boolean);
}

// ============================================================================
// ЭКСПОРТ ДЛЯ ИСПОЛЬЗОВАНИЯ В API
// ============================================================================

// ============================================================================
// ФУНКЦИИ ОБОГАЩЕНИЯ ДАННЫХ
// ============================================================================

function generateBookDescription(title: string, author: string, category: string): string {
  const descriptions: Record<string, string[]> = {
    'Психологія': [
      `Глибока та прониклива книга "${title}" від ${author} допоможе вам краще зрозуміти людську психологію та особисте зростання.`,
      `"${title}" - це практичний посібник від ${author}, який розкриває секрети ефективного мислення та поведінки.`,
      `Видатна праця ${author} "${title}" пропонує новий погляд на психологічні аспекти життя та розвитку особистості.`
    ],
    'Саморозвиток': [
      `Натхненна книга "${title}" від ${author} стане вашим провідником у світі особистого розвитку та самовдосконалення.`,
      `"${title}" - це потужний інструмент для тих, хто прагне змін та росту. ${author} ділиться цінними знаннями та досвідом.`,
      `Практичні поради та мудрі настанови ${author} у книзі "${title}" допоможуть вам досягти нових висот у житті.`
    ],
    'Бізнес': [
      `Професійна книга "${title}" від ${author} розкриває секрети успішного ведення бізнесу та ефективного управління.`,
      `"${title}" - це цінний ресурс для підприємців та керівників. ${author} ділиться перевіреними стратегіями успіху.`,
      `Практичні знання та досвід ${author} у книзі "${title}" допоможуть вам побудувати успішний бізнес.`
    ],
    'Дитяча література': [
      `Чудова дитяча книга "${title}" від ${author} захоплює юних читачів цікавою історією та яскравими персонажами.`,
      `"${title}" - це захоплююча пригода для дітей, створена талановитим автором ${author}.`,
      `Книга "${title}" від ${author} розвиває уяву дітей та вчить важливим життєвим урокам через цікаву історію.`
    ],
    'default': [
      `Цікава та змістовна книга "${title}" від талановитого автора ${author} подарує вам незабутні години читання.`,
      `"${title}" - це видатна праця ${author}, яка заслуговує на увагу всіх поціновувачів хорошої літератури.`,
      `Книга "${title}" від ${author} пропонує глибокі роздуми та цікаві ідеї для всіх читачів.`
    ]
  };

  const templates = descriptions[category] || descriptions['default'];
  const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
  
  return randomTemplate;
}

function generateCoverUrl(title: string): string {
  const filename = title
    .toLowerCase()
    .replace(/[^а-яё\w\s]/gi, '') // Убираем спецсимволы, оставляем кириллицу и латиницу
    .replace(/\s+/g, '-') // Пробелы заменяем на дефисы
    .slice(0, 50); // Ограничиваем длину
  
  return `/images/books/${filename}.jpg`;
}

function generateBookCode(category: string, index: number): string {
  const categoryCode = category === 'Дитяча література' ? 'DL' :
                      category === 'Психологія' ? 'PS' :
                      category === 'Саморозвиток' ? 'SR' :
                      category === 'Бізнес' ? 'BZ' :
                      category === 'Казки' ? 'KZ' :
                      category === 'Пригоди' ? 'PR' :
                      category === 'Пізнавальні' ? 'PZ' :
                      'GL'; // Загальна література
  
  return `${categoryCode}-${String(index + 1).padStart(3, '0')}`;
}

// Функция для парсинга сложных категорий из Google Sheets
function parseCategory(categoryString: string): {
  category: string;
  subcategory: string | null;
  age_range: string | null;
} {
  if (!categoryString) {
    return {
      category: 'Загальна література',
      subcategory: null,
      age_range: null
    };
  }

  // Разделяем категории по запятой
  const parts = categoryString.split(',').map(s => s.trim());
  
  // Возрастные категории - расширенный список
  const ageCategories = [
    'найменші', 'дошкільний вік', 'молодший вік', 'середній вік', 'старший вік',
    'підлітковий вік', 'дошкільний', 'молодший', 'середній', 'старший', 'підлітковий'
  ];
  const foundAges = parts.filter(part => ageCategories.includes(part));
  
  // Основные категории (не возрастные)
  const mainCategories = parts.filter(part => !ageCategories.includes(part));
  
  // Определяем основную категорию
  let category = 'Загальна література';
  let subcategory = null;
  
  if (mainCategories.length > 0) {
    category = mainCategories[0]; // Первая - основная
    if (mainCategories.length > 1) {
      subcategory = mainCategories.slice(1).join(', '); // Остальные - подкатегории
    }
  }
  
  // Заменяем сокращения категорий на полные названия
  if (category === 'Загальна') category = 'Загальна література';
  
  // Определяем возрастной диапазон
  let age_range = null;
  if (foundAges.length > 0) {
    if (foundAges.includes('найменші')) age_range = '0-3';
    else if (foundAges.includes('дошкільний вік') || foundAges.includes('дошкільний')) age_range = '3-6';
    else if (foundAges.includes('молодший вік') || foundAges.includes('молодший')) age_range = '6-10';
    else if (foundAges.includes('середній вік') || foundAges.includes('середній')) age_range = '10-14';
    else if (foundAges.includes('підлітковий вік') || foundAges.includes('підлітковий')) age_range = '14-18';
    else if (foundAges.includes('старший вік') || foundAges.includes('старший')) age_range = '18+';
  }
  
  return { category, subcategory, age_range };
}

/**
 * Импорт книг из украинской Google Sheets с обогащением данных
 */
export async function importBooksFromUkrainianSheets(): Promise<{ 
  books: Partial<Book>[], 
  stats: SyncStats 
}> {
  const stats: SyncStats = {
    totalBooks: 0,
    successCount: 0,
    errorCount: 0,
    errors: []
  };

  try {
    const doc = await connectToGoogleSheets();
    const sheet = doc.sheetsByTitle['Каталог книг'] || doc.sheetsByTitle['Books'];
    
    if (!sheet) {
      throw new Error('Лист "Каталог книг" не знайдено');
    }

    await sheet.loadHeaderRow();
    const rows = await sheet.getRows();
    stats.totalBooks = rows.length;
    
    logger.info(`Found ${rows.length} books in Google Sheets`, undefined, 'GoogleSheets');

    const books = rows
      .map((row, index) => {
        try {
          const title = row.get('Назва') || row.get('title') || '';
          const author = row.get('Автор') || row.get('author') || '';
          const category = row.get('Категорія') || row.get('category') || 'Загальна';
          const publisher = row.get('Видавництво') || row.get('publisher') || '';
          const currentDescription = row.get('Опис') || row.get('description') || '';
          const currentCover = row.get('Фото (URL)') || row.get('cover_url') || '';
          
          if (!title) {
            stats.errorCount++;
            stats.errors.push(`Row ${index + 2}: Відсутня назва`);
            return null;
          }
          
          // Если автор отсутствует, используем placeholder
          const finalAuthor = author || 'Автор невідомий';
          
          // Парсим сложную категорию из Google Sheets
          const parsedCategory = parseCategory(category);

          // Обогащаем данные
          const description = currentDescription || generateBookDescription(title, finalAuthor, parsedCategory.category);
          const cover_url = currentCover || generateCoverUrl(title);
          
          const book: Partial<Book> = {
            code: generateBookCode(parsedCategory.category, index),
            title,
            author: finalAuthor,
            category_id: parsedCategory.category,
            subcategory: parsedCategory.subcategory,
            description,
            cover_url,
            publisher,
            price_uah: parseFloat(row.get('Ціна') || row.get('price_uah') || '0') || 0,
            // available: (row.get('Доступно') || row.get('available') || '').toLowerCase() === 'так' || // TODO: Add available field to books table 
            //                     (row.get('Доступно') || row.get('available') || '').toLowerCase() === 'true',
            pages: parseInt(row.get('pages') || '0') || Math.floor(Math.random() * 200) + 100,
            isbn: row.get('ISBN') || row.get('isbn') || null,
            publication_year: parseInt(row.get('Рік') || row.get('year') || '2023') || 2023,
            language: 'Ukrainian',
            status: 'available' as const,
            rating: Math.round((Math.random() * 2 + 3) * 10) / 10, // 3.0-5.0
            qty_total: parseInt(row.get('Всього') || '1') || 1,
            qty_available: parseInt(row.get('Доступно') || '1') || 1,
            age_range: parsedCategory.age_range,
            tags: [parsedCategory.category, parsedCategory.subcategory].filter((tag): tag is string => Boolean(tag))
          };

          stats.successCount++;
          return book;
        } catch (error) {
          stats.errorCount++;
          stats.errors.push(`Row ${index + 2}: ${error instanceof Error ? error.message : 'Невідома помилка'}`);
          return null;
        }
      })
      .filter((book): book is Partial<Book> => book !== null);

    logger.info(`Import completed: ${stats.successCount}/${stats.totalBooks} books processed`, undefined, 'GoogleSheets');
    
    return { books, stats };

  } catch (error) {
    stats.errors.push(error instanceof Error ? error.message : 'Невідома помилка імпорту');
    logger.error('Import from Ukrainian sheets failed', error, 'GoogleSheets');
    
    return { books: [], stats };
  }
}

export const GoogleSheetsService = {
  connect: connectToGoogleSheets,
  backup: backupBooksToSheets,
  import: importBooksFromSheets,
  importUkrainian: importBooksFromUkrainianSheets,
  getStatus: getSyncStatus,
  config: getGoogleSheetsConfig,
};