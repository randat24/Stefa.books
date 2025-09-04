#!/usr/bin/env node

/**
 * ПРАВИЛЬНОЕ ОБНОВЛЕНИЕ ОБЛОЖЕК В БАЗЕ ДАННЫХ
 * Использует данные из Google Sheets для правильного сопоставления
 */

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { createClient } = require('@supabase/supabase-js');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { google } = require('googleapis');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs');
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config({ path: '.env.local' });

// Конфигурация Google Sheets API
const auth = new google.auth.GoogleAuth({
  keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
});

const sheets = google.sheets({ version: 'v4', auth });

// Конфигурация Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Загружает результаты загрузки обложек
 */
function loadUploadResults() {
  try {
    const data = fs.readFileSync('direct-upload-results.json', 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('❌ Ошибка загрузки результатов:', error.message);
    return null;
  }
}

/**
 * Получает данные из Google Sheets
 */
async function getSheetData() {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID,
      range: 'Каталог книг!A:Z'
    });
    
    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      console.log('Нет данных в таблице');
      return [];
    }
    
    // Пропускаем заголовок
    const dataRows = rows.slice(1);
    
    return dataRows.map(row => ({
      code: row[0] || '',
      title: row[1] || '',
      author: row[2] || '',
      coverUrl: row[10] || '', // Фото (URL)
      coverFilename: row[row.length - 1] || '' // Последняя колонка с именем файла
    }));
    
  } catch (error) {
    console.error('❌ Ошибка получения данных из Google Sheets:', error.message);
    return [];
  }
}

/**
 * Получает все книги из базы данных
 */
async function getAllBooks() {
  try {
    const { data, error } = await supabase
      .from('books')
      .select('id, code, title, cover_url')
      .order('code');
    
    if (error) {
      console.error('❌ Ошибка получения книг:', error.message);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('❌ Ошибка получения книг:', error.message);
    return [];
  }
}

/**
 * Обновляет URL обложки для книги
 */
async function updateBookCover(bookId, newCoverUrl) {
  try {
    const { error } = await supabase
      .from('books')
      .update({ cover_url: newCoverUrl })
      .eq('id', bookId);
    
    if (error) {
      console.error(`❌ Ошибка обновления обложки для книги ${bookId}:`, error.message);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error(`❌ Ошибка обновления обложки для книги ${bookId}:`, error.message);
    return false;
  }
}

/**
 * Создает правильное сопоставление обложек с книгами
 */
function createCorrectMapping(sheetData, uploadResults, books) {
  const mapping = [];
  
  // Создаем мапу книг по коду для быстрого поиска
  const booksByCode = {};
  books.forEach(book => {
    booksByCode[book.code] = book;
  });
  
  // Создаем мапу загруженных обложек по имени файла
  const coversByFilename = {};
  uploadResults.results.forEach(result => {
    if (result.success) {
      coversByFilename[result.filename] = result.cloudinaryUrl;
    }
  });
  
  // Сопоставляем данные из Google Sheets с загруженными обложками
  sheetData.forEach(sheetRow => {
    const bookCode = sheetRow.code;
    const coverFilename = sheetRow.coverFilename;
    const book = booksByCode[bookCode];
    const cloudinaryUrl = coversByFilename[coverFilename];
    
    if (book && cloudinaryUrl) {
      mapping.push({
        bookId: book.id,
        bookCode: book.code,
        bookTitle: book.title,
        sheetTitle: sheetRow.title,
        coverFilename: coverFilename,
        cloudinaryUrl: cloudinaryUrl,
        currentCoverUrl: book.cover_url
      });
    } else if (book && !cloudinaryUrl) {
      console.log(`⚠️  Обложка не найдена для книги ${bookCode}: ${book.title} (файл: ${coverFilename})`);
    } else if (!book && cloudinaryUrl) {
      console.log(`⚠️  Книга не найдена в БД для обложки: ${coverFilename} (код: ${bookCode})`);
    }
  });
  
  return mapping;
}

/**
 * Основная функция
 */
async function main() {
  console.log('🚀 ПРАВИЛЬНОЕ ОБНОВЛЕНИЕ ОБЛОЖЕК В БАЗЕ ДАННЫХ');
  console.log('=' .repeat(60));
  
  try {
    // Загружаем результаты загрузки обложек
    console.log('📁 Загружаем результаты загрузки обложек...');
    const uploadResults = loadUploadResults();
    if (!uploadResults) {
      console.error('❌ Не удалось загрузить результаты');
      return;
    }
    
    console.log(`✅ Загружено ${uploadResults.successful} обложек`);
    
    // Получаем данные из Google Sheets
    console.log('📊 Получаем данные из Google Sheets...');
    const sheetData = await getSheetData();
    console.log(`✅ Получено ${sheetData.length} записей из Google Sheets`);
    
    // Получаем все книги из базы данных
    console.log('📚 Получаем книги из базы данных...');
    const books = await getAllBooks();
    console.log(`✅ Найдено ${books.length} книг в базе данных`);
    
    // Создаем правильное сопоставление
    console.log('🔗 Создаем правильное сопоставление обложек с книгами...');
    const mapping = createCorrectMapping(sheetData, uploadResults, books);
    console.log(`✅ Создано ${mapping.length} сопоставлений`);
    
    if (mapping.length === 0) {
      console.log('❌ Не найдено сопоставлений между обложками и книгами');
      return;
    }
    
    // Показываем примеры сопоставлений
    console.log('\n📋 Примеры сопоставлений:');
    mapping.slice(0, 5).forEach(item => {
      console.log(`📖 ${item.bookCode}: ${item.bookTitle}`);
      console.log(`   Файл: ${item.coverFilename}`);
      console.log(`   Новая обложка: ${item.cloudinaryUrl}`);
      console.log(`   Текущая обложка: ${item.currentCoverUrl ? 'Есть' : 'Нет'}`);
      console.log('');
    });
    
    // Обновляем обложки
    console.log('🔄 Обновляем обложки в базе данных...');
    let successCount = 0;
    let errorCount = 0;
    
    for (const item of mapping) {
      console.log(`📖 Обновляем обложку для ${item.bookCode}: ${item.bookTitle}`);
      
      const success = await updateBookCover(item.bookId, item.cloudinaryUrl);
      if (success) {
        console.log(`   ✅ Обложка обновлена`);
        successCount++;
      } else {
        console.log(`   ❌ Ошибка обновления`);
        errorCount++;
      }
      
      // Небольшая пауза между запросами
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Сохраняем результаты
    const resultData = {
      timestamp: new Date().toISOString(),
      totalMappings: mapping.length,
      successful: successCount,
      failed: errorCount,
      mappings: mapping
    };
    
    fs.writeFileSync('correct-cover-update-results.json', JSON.stringify(resultData, null, 2));
    
    console.log('\n🎉 ОБНОВЛЕНИЕ ЗАВЕРШЕНО!');
    console.log('=' .repeat(60));
    console.log(`✅ Успешно обновлено: ${successCount}`);
    console.log(`❌ Ошибок: ${errorCount}`);
    console.log(`📚 Всего сопоставлений: ${mapping.length}`);
    console.log(`📁 Результаты сохранены: correct-cover-update-results.json`);
    
  } catch (error) {
    console.error('\n❌ КРИТИЧЕСКАЯ ОШИБКА:', error.message);
    console.error('Детали:', error);
    process.exit(1);
  }
}

// Запуск скрипта
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };
