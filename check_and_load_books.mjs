#!/usr/bin/env node

/**
 * Скрипт для проверки состояния базы данных и загрузки всех 105 книг
 */

import { createClient } from '@supabase/supabase-js';
import { google } from 'googleapis';
import fs from 'fs';

// Конфигурация
const CONFIG = {
  // Supabase
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  
  // Google Sheets
  spreadsheetId: process.env.GOOGLE_SHEET_ID || 'YOUR_SPREADSHEET_ID',
  range: process.env.GOOGLE_SHEET_RANGE || 'Books!A1:Z105',
  
  // Настройки
  batchSize: 20,
  dryRun: process.env.DRY_RUN === 'true',
};

// Инициализация клиентов
const supabase = createClient(CONFIG.supabaseUrl, CONFIG.supabaseServiceKey);

// Функция для проверки состояния базы данных
async function checkDatabaseStatus() {
  try {
    console.log('🔍 Проверка состояния базы данных...');
    
    const { data: books, error: booksError } = await supabase
      .from('books')
      .select('id, title, author, code, available');
    
    if (booksError) {
      console.error('❌ Ошибка получения книг:', booksError.message);
      return { totalBooks: 0, availableBooks: 0 };
    }
    
    const totalBooks = books?.length || 0;
    const availableBooks = books?.filter(book => book.available).length || 0;
    
    console.log(`📊 Текущее состояние базы данных:`);
    console.log(`   📚 Всего книг: ${totalBooks}`);
    console.log(`   ✅ Доступных книг: ${availableBooks}`);
    
    if (totalBooks > 0) {
      console.log(`\n📖 Последние книги:`);
      books.slice(-5).forEach(book => {
        console.log(`   - ${book.title} (${book.author}) - ${book.code}`);
      });
    }
    
    return { totalBooks, availableBooks, books };
  } catch (error) {
    console.error('❌ Ошибка проверки базы данных:', error.message);
    return { totalBooks: 0, availableBooks: 0 };
  }
}

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
    console.error('❌ Ошибка аутентификации Google Sheets:', error.message);
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
  
  // Генерируем код книги
  const year = new Date().getFullYear();
  const sequence = String(index + 1).padStart(4, '0');
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

// Основная функция
async function main() {
  try {
    console.log('🚀 Запуск загрузки всех 105 книг из Google Sheets...');
    console.log(`📊 Таблица: ${CONFIG.spreadsheetId}`);
    console.log(`📋 Диапазон: ${CONFIG.range}`);
    console.log(`🧪 Режим тестирования: ${CONFIG.dryRun ? 'ВКЛ' : 'ВЫКЛ'}`);
    
    // 1. Проверяем текущее состояние базы данных
    const dbStatus = await checkDatabaseStatus();
    
    if (dbStatus.totalBooks > 0) {
      console.log(`\n⚠️ В базе данных уже есть ${dbStatus.totalBooks} книг.`);
      console.log('Продолжаем загрузку (дубликаты будут обновлены)...');
    }
    
    // 2. Получаем данные из Google Sheets
    const { headers, dataRows } = await getDataFromGoogleSheets();
    
    // 3. Преобразуем строки в объекты книг
    const books = dataRows
      .filter(row => row.some(cell => cell && cell.trim() !== ''))
      .map((row, index) => rowToBookObject(headers, row, index));
    
    console.log(`📚 Обработано ${books.length} книг`);
    
    // 4. Загружаем книги в базу данных
    const result = await loadBooksToDatabase(books);
    
    console.log('🎉 Загрузка завершена успешно!');
    
    // 5. Проверяем финальное состояние
    const finalStatus = await checkDatabaseStatus();
    
    // 6. Сохраняем отчет
    const reportPath = './books_loading_report.json';
    fs.writeFileSync(reportPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      config: CONFIG,
      initialStatus: dbStatus,
      finalStatus: finalStatus,
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
  checkDatabaseStatus,
  getDataFromGoogleSheets,
  loadBooksToDatabase,
  rowToBookObject
};
