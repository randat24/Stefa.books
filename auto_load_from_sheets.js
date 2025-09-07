#!/usr/bin/env node

/**
 * Автоматическая загрузка всех книг из Google Sheets
 * Начинает с 11-й книги (так как первые 10 уже загружены)
 */

import { google } from 'googleapis';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Конфигурация
const CONFIG = {
  // Google Sheets
  spreadsheetId: process.env.GOOGLE_SHEET_ID || 'YOUR_SPREADSHEET_ID',
  range: process.env.GOOGLE_SHEET_RANGE || 'Books!A1:Z105',
  
  // Supabase
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  
  // Настройки
  startFromBook: 11, // Начинаем с 11-й книги
  batchSize: 20,
  dryRun: process.env.DRY_RUN === 'true',
};

// Инициализация клиентов
const supabase = createClient(CONFIG.supabaseUrl, CONFIG.supabaseServiceKey);

// Функция для аутентификации в Google Sheets
async function authenticateGoogleSheets() {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE || './google-service-account.json',
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });
    
    const authClient = await auth.getClient();
    return google.sheets({ version: 'v4', auth: authClient });
  } catch (error) {
    console.error('Ошибка аутентификации Google Sheets:', error.message);
    throw error;
  }
}

// Функция для получения данных из Google Sheets
async function getDataFromGoogleSheets() {
  try {
    const sheets = await authenticateGoogleSheets();
    
    console.log('📊 Получение данных из Google Sheets...');
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: CONFIG.spreadsheetId,
      range: CONFIG.range,
    });
    
    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      throw new Error('Данные не найдены в таблице');
    }
    
    // Первая строка - заголовки
    const headers = rows[0];
    const dataRows = rows.slice(1);
    
    console.log(`✅ Получено ${dataRows.length} строк данных`);
    console.log('📋 Заголовки:', headers);
    
    return { headers, dataRows };
  } catch (error) {
    console.error('❌ Ошибка получения данных из Google Sheets:', error.message);
    throw error;
  }
}

// Функция для преобразования строки в объект книги
function rowToBookObject(headers, row, index) {
  const book = {};
  
  headers.forEach((header, colIndex) => {
    const value = row[colIndex] || '';
    
    // Маппинг заголовков на поля базы данных
    switch (header.toLowerCase()) {
      case 'назва':
      case 'title':
        book.title = value;
        break;
      case 'автор':
      case 'author':
        book.author = value;
        break;
      case 'isbn':
        book.isbn = value;
        break;
      case 'опис':
      case 'description':
        book.description = value;
        break;
      case 'обкладинка':
      case 'cover_url':
        book.cover_url = value;
        break;
      case 'категорія':
      case 'category':
        book.category = value;
        break;
      case 'доступна':
      case 'available':
        book.available = value.toLowerCase() === 'так' || value.toLowerCase() === 'true' || value === '1';
        break;
    }
  });
  
  // Генерируем код книги (начиная с 11-й)
  const year = new Date().getFullYear();
  const sequence = String(index + CONFIG.startFromBook).padStart(4, '0');
  book.code = `SB-${year}-${sequence}`;
  
  return book;
}

// Функция для загрузки книг в базу данных
async function loadBooksToDatabase(books) {
  try {
    console.log(`📚 Загрузка ${books.length} книг в базу данных...`);
    
    if (CONFIG.dryRun) {
      console.log('🧪 Режим тестирования - данные не будут сохранены');
      console.log('📖 Пример первой книги:', JSON.stringify(books[0], null, 2));
      return { success: true, loaded: 0, updated: 0, errors: 0 };
    }
    
    let loaded = 0;
    const updated = 0;
    let errors = 0;
    const errorMessages = [];
    
    // Загружаем книги батчами
    for (let i = 0; i < books.length; i += CONFIG.batchSize) {
      const batch = books.slice(i, i + CONFIG.batchSize);
      
      try {
        const { error } = await supabase
          .from('books')
          .upsert(batch, { 
            onConflict: 'code',
            ignoreDuplicates: false 
          });
        
        if (error) {
          console.error(`❌ Ошибка загрузки батча ${i + 1}:`, error.message);
          errors += batch.length;
          errorMessages.push(`Батч ${i + 1}: ${error.message}`);
        } else {
          loaded += batch.length;
          console.log(`✅ Загружено ${batch.length} книг (батч ${i + 1})`);
        }
      } catch (error) {
        console.error(`❌ Ошибка загрузки батча ${i + 1}:`, error.message);
        errors += batch.length;
        errorMessages.push(`Батч ${i + 1}: ${error.message}`);
      }
    }
    
    console.log('✅ Загрузка завершена:');
    console.log(`   📥 Загружено: ${loaded}`);
    console.log(`   🔄 Обновлено: ${updated}`);
    console.log(`   ❌ Ошибок: ${errors}`);
    
    if (errorMessages.length > 0) {
      console.log('❌ Ошибки:');
      errorMessages.forEach(error => console.log(`   - ${error}`));
    }
    
    return { success: true, loaded, updated, errors, errorMessages };
  } catch (error) {
    console.error('❌ Ошибка загрузки в базу данных:', error.message);
    throw error;
  }
}

// Функция для создания SQL скрипта
function createSqlScript(books) {
  let sql = `-- ============================================================================
-- АВТОМАТИЧЕСКИ СГЕНЕРИРОВАННЫЙ СКРИПТ ЗАГРУЗКИ КНИГ
-- ============================================================================
-- Создан: ${new Date().toISOString()}
-- Количество книг: ${books.length}
-- Начинаем с книги: ${CONFIG.startFromBook}

-- 1. Создаем необходимые функции
CREATE OR REPLACE FUNCTION find_category_by_parts(category_string TEXT)
RETURNS UUID AS $$
DECLARE
    category_parts TEXT[];
    part TEXT;
    found_category_id UUID;
BEGIN
    IF category_string IS NULL OR trim(category_string) = '' THEN
        RETURN NULL;
    END IF;
    
    category_parts := string_to_array(trim(category_string), ',');
    
    FOREACH part IN ARRAY category_parts
    LOOP
        part := trim(part);
        
        SELECT id INTO found_category_id 
        FROM public.categories 
        WHERE name ILIKE '%' || part || '%' 
        AND parent_id IS NOT NULL
        ORDER BY 
            CASE WHEN name ILIKE part THEN 1 ELSE 2 END
        LIMIT 1;
        
        IF found_category_id IS NOT NULL THEN
            RETURN found_category_id;
        END IF;
    END LOOP;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 2. Загружаем книги
INSERT INTO public.books (
    title, 
    author, 
    isbn, 
    description, 
    cover_url, 
    category_id, 
    available, 
    code
) VALUES

`;

  // Добавляем книги
  books.forEach((book, index) => {
    const year = new Date().getFullYear();
    const sequence = String(index + CONFIG.startFromBook).padStart(4, '0');
    const code = `SB-${year}-${sequence}`;
    
    const available = book.available ? 'true' : 'false';
    
    sql += `('${book.title.replace(/'/g, "''")}', '${book.author.replace(/'/g, "''")}', '${book.isbn}', '${book.description.replace(/'/g, "''")}', '${book.cover_url}', find_category_by_parts('${book.category}'), ${available}, '${code}')`;
    
    if (index < books.length - 1) {
      sql += ',\n';
    } else {
      sql += '\n';
    }
  });
  
  sql += `
ON CONFLICT (code) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    isbn = EXCLUDED.isbn,
    description = EXCLUDED.description,
    cover_url = EXCLUDED.cover_url,
    category_id = EXCLUDED.category_id,
    updated_at = NOW();

-- 3. Проверяем результат
SELECT 
    'Книги загружены успешно!' as status,
    (SELECT COUNT(*) FROM public.books) as total_books,
    (SELECT COUNT(*) FROM public.books WHERE available = true) as available_books,
    (SELECT COUNT(DISTINCT category_id) FROM public.books WHERE category_id IS NOT NULL) as categories_with_books,
    (SELECT COUNT(DISTINCT author) FROM public.books) as unique_authors;

-- 4. Показываем последние загруженные книги
SELECT 
    b.title,
    b.author,
    b.code,
    c.name as category_name,
    b.available
FROM public.books b
LEFT JOIN public.categories c ON b.category_id = c.id
ORDER BY b.created_at DESC
LIMIT 20;
`;

  return sql;
}

// Основная функция
async function main() {
  try {
    console.log('🚀 Запуск автоматической загрузки книг из Google Sheets...');
    console.log(`📊 Таблица: ${CONFIG.spreadsheetId}`);
    console.log(`📋 Диапазон: ${CONFIG.range}`);
    console.log(`🔢 Начинаем с книги: ${CONFIG.startFromBook}`);
    console.log(`🧪 Режим тестирования: ${CONFIG.dryRun ? 'ВКЛ' : 'ВЫКЛ'}`);
    
    // Получаем данные из Google Sheets
    const { headers, dataRows } = await getDataFromGoogleSheets();
    
    // Преобразуем строки в объекты книг
    const books = dataRows
      .filter(row => row.some(cell => cell && cell.trim() !== ''))
      .map((row, index) => rowToBookObject(headers, row, index));
    
    console.log(`📚 Обработано ${books.length} книг`);
    
    // Создаем SQL скрипт
    const sqlScript = createSqlScript(books);
    const sqlPath = './auto_generated_books_loader.sql';
    fs.writeFileSync(sqlPath, sqlScript);
    console.log(`📄 SQL скрипт создан: ${sqlPath}`);
    
    // Загружаем книги в базу данных
    const result = await loadBooksToDatabase(books);
    
    console.log('🎉 Загрузка завершена успешно!');
    
    // Сохраняем результат в файл
    const reportPath = './auto_load_report.json';
    fs.writeFileSync(reportPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      config: CONFIG,
      result: result,
      booksCount: books.length
    }, null, 2));
    
    console.log(`📄 Отчет сохранен в: ${reportPath}`);
    
  } catch (error) {
    console.error('💥 Критическая ошибка:', error.message);
    process.exit(1);
  }
}

// Запуск скрипта
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export {
  getDataFromGoogleSheets,
  loadBooksToDatabase,
  createSqlScript,
  rowToBookObject
};
