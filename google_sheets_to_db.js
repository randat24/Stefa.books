#!/usr/bin/env node

/**
 * Скрипт для загрузки данных из Google Sheets в базу данных
 * Использует Google Sheets API для получения данных и Supabase для загрузки
 */

const { google } = require('googleapis');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Конфигурация
const CONFIG = {
  // Google Sheets
  spreadsheetId: process.env.GOOGLE_SHEET_ID || 'YOUR_SPREADSHEET_ID',
  range: process.env.GOOGLE_SHEET_RANGE || 'Books!A1:Z1000',
  
  // Supabase
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  
  // Настройки
  batchSize: 50, // Количество книг для обработки за раз
  dryRun: process.env.DRY_RUN === 'true', // Режим тестирования
};

// Инициализация клиентов
const supabase = createClient(CONFIG.supabaseUrl, CONFIG.supabaseServiceKey);

// Функция для аутентификации в Google Sheets
async function authenticateGoogleSheets() {
  try {
    // Используем Service Account
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
function rowToBookObject(headers, row) {
  const book = {};
  
  headers.forEach((header, index) => {
    const value = row[index] || '';
    
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
      case 'короткий опис':
      case 'short_description':
        book.short_description = value;
        break;
      case 'обкладинка':
      case 'cover_url':
        book.cover_url = value;
        break;
      case 'категорія':
      case 'category':
        book.category = value;
        break;
      case 'вікова категорія':
      case 'age_range':
        book.age_range = value;
        break;
      case 'сторінки':
      case 'pages':
        book.pages = parseInt(value) || null;
        break;
      case 'мова':
      case 'language':
        book.language = value || 'uk';
        break;
      case 'видавець':
      case 'publisher':
        book.publisher = value;
        break;
      case 'рік видання':
      case 'publication_year':
        book.publication_year = parseInt(value) || null;
        break;
      case 'доступна':
      case 'available':
        book.available = value.toLowerCase() === 'так' || value.toLowerCase() === 'true' || value === '1';
        break;
      case 'статус':
      case 'status':
        book.status = value || 'available';
        break;
      case 'кількість загальна':
      case 'qty_total':
        book.qty_total = parseInt(value) || 1;
        break;
      case 'кількість доступна':
      case 'qty_available':
        book.qty_available = parseInt(value) || 1;
        break;
      case 'ціна за день':
      case 'price_daily':
        book.price_daily = parseFloat(value) || null;
        break;
      case 'ціна за тиждень':
      case 'price_weekly':
        book.price_weekly = parseFloat(value) || null;
        break;
      case 'ціна за місяць':
      case 'price_monthly':
        book.price_monthly = parseFloat(value) || null;
        break;
      case 'ціна закупки':
      case 'price_uah':
        book.price_uah = parseFloat(value) || null;
        break;
      case 'місцезнаходження':
      case 'location':
        book.location = value;
        break;
      case 'теги':
      case 'tags':
        book.tags = value ? value.split(',').map(tag => tag.trim()) : [];
        break;
      case 'значки':
      case 'badges':
        book.badges = value ? value.split(',').map(badge => badge.trim()) : [];
        break;
      case 'код':
      case 'code':
        book.code = value;
        break;
    }
  });
  
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
    
    // Вызываем функцию загрузки из базы данных
    const { data, error } = await supabase.rpc('load_books_from_data', {
      books_data: books
    });
    
    if (error) {
      throw new Error(`Ошибка загрузки в базу данных: ${error.message}`);
    }
    
    const result = data[0];
    console.log('✅ Загрузка завершена:');
    console.log(`   📥 Загружено новых: ${result.loaded_count}`);
    console.log(`   🔄 Обновлено: ${result.updated_count}`);
    console.log(`   ❌ Ошибок: ${result.error_count}`);
    
    if (result.errors && result.errors.length > 0) {
      console.log('❌ Ошибки:');
      result.errors.forEach(error => console.log(`   - ${error}`));
    }
    
    return result;
  } catch (error) {
    console.error('❌ Ошибка загрузки в базу данных:', error.message);
    throw error;
  }
}

// Функция для валидации данных
function validateBooks(books) {
  const errors = [];
  
  books.forEach((book, index) => {
    if (!book.title) {
      errors.push(`Книга ${index + 1}: отсутствует название`);
    }
    if (!book.author) {
      errors.push(`Книга ${index + 1}: отсутствует автор`);
    }
  });
  
  if (errors.length > 0) {
    console.warn('⚠️ Найдены ошибки валидации:');
    errors.forEach(error => console.warn(`   - ${error}`));
  }
  
  return errors.length === 0;
}

// Основная функция
async function main() {
  try {
    console.log('🚀 Запуск загрузки книг из Google Sheets...');
    console.log(`📊 Таблица: ${CONFIG.spreadsheetId}`);
    console.log(`📋 Диапазон: ${CONFIG.range}`);
    console.log(`🧪 Режим тестирования: ${CONFIG.dryRun ? 'ВКЛ' : 'ВЫКЛ'}`);
    
    // Получаем данные из Google Sheets
    const { headers, dataRows } = await getDataFromGoogleSheets();
    
    // Преобразуем строки в объекты книг
    const books = dataRows
      .filter(row => row.some(cell => cell && cell.trim() !== '')) // Фильтруем пустые строки
      .map(row => rowToBookObject(headers, row));
    
    console.log(`📚 Обработано ${books.length} книг`);
    
    // Валидируем данные
    if (!validateBooks(books)) {
      console.warn('⚠️ Продолжаем загрузку несмотря на ошибки валидации...');
    }
    
    // Загружаем книги в базу данных
    const result = await loadBooksToDatabase(books);
    
    console.log('🎉 Загрузка завершена успешно!');
    
    // Сохраняем результат в файл
    const reportPath = path.join(__dirname, 'load_report.json');
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
if (require.main === module) {
  main();
}

module.exports = {
  getDataFromGoogleSheets,
  loadBooksToDatabase,
  validateBooks,
  rowToBookObject
};
