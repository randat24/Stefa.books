#!/usr/bin/env node

/**
 * ОБНОВЛЕНИЕ GOOGLE SHEETS С CLOUDINARY ССЫЛКАМИ
 * Заменяет старые Google Drive ссылки на новые Cloudinary ссылки
 */

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { google } = require('googleapis');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { createClient } = require('@supabase/supabase-js');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs');
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config({ path: '.env.local' });

// Конфигурация Google Sheets API
const auth = new google.auth.GoogleAuth({
  keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

const sheets = google.sheets({ version: 'v4', auth });

// Конфигурация Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Получает все книги с Cloudinary обложками из базы данных
 */
async function getBooksWithCloudinaryCovers() {
  try {
    const { data, error } = await supabase
      .from('books')
      .select('code, title, cover_url')
      .like('cover_url', '%cloudinary%')
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
    
    return rows;
  } catch (error) {
    console.error('❌ Ошибка получения данных из Google Sheets:', error.message);
    return [];
  }
}

/**
 * Обновляет Google Sheets с новыми Cloudinary ссылками
 */
async function updateGoogleSheets(rows, booksWithCovers) {
  try {
    // Создаем мапу книг по коду для быстрого поиска
    const booksByCode = {};
    booksWithCovers.forEach(book => {
      booksByCode[book.code] = book;
    });
    
    // Находим колонку с URL обложек (колонка K, индекс 10)
    const coverUrlColumnIndex = 10;
    
    // Подготавливаем обновления
    const updates = [];
    let updateCount = 0;
    
    // Пропускаем заголовок (первая строка)
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const bookCode = row[0] || '';
      const currentCoverUrl = row[coverUrlColumnIndex] || '';
      
      // Проверяем, есть ли книга с Cloudinary обложкой
      const book = booksByCode[bookCode];
      if (book && currentCoverUrl !== book.cover_url) {
        // Обновляем URL обложки
        rows[i][coverUrlColumnIndex] = book.cover_url;
        
        updates.push({
          range: `Каталог книг!K${i + 1}`,
          values: [[book.cover_url]]
        });
        
        updateCount++;
        console.log(`📖 Обновляем ${bookCode}: ${book.title}`);
        console.log(`   Старая ссылка: ${currentCoverUrl}`);
        console.log(`   Новая ссылка: ${book.cover_url}`);
      }
    }
    
    if (updates.length === 0) {
      console.log('✅ Все ссылки уже актуальны');
      return { success: true, updated: 0 };
    }
    
    // Выполняем обновления батчами по 10
    const batchSize = 10;
    for (let i = 0; i < updates.length; i += batchSize) {
      const batch = updates.slice(i, i + batchSize);
      
      const request = {
        spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID,
        resource: {
          valueInputOption: 'RAW',
          data: batch
        }
      };
      
      await sheets.spreadsheets.values.batchUpdate(request);
      console.log(`✅ Обновлен батч ${Math.floor(i / batchSize) + 1}/${Math.ceil(updates.length / batchSize)}`);
      
      // Небольшая пауза между батчами
      if (i + batchSize < updates.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return { success: true, updated: updateCount };
    
  } catch (error) {
    console.error('❌ Ошибка обновления Google Sheets:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Основная функция
 */
async function main() {
  console.log('🚀 ОБНОВЛЕНИЕ GOOGLE SHEETS С CLOUDINARY ССЫЛКАМИ');
  console.log('=' .repeat(60));
  
  try {
    // Проверяем конфигурацию
    if (!process.env.GOOGLE_SPREADSHEET_ID) {
      console.error('❌ Отсутствует GOOGLE_SPREADSHEET_ID');
      process.exit(1);
    }
    
    console.log(`✅ Google Sheets ID: ${process.env.GOOGLE_SPREADSHEET_ID}`);
    
    // Получаем книги с Cloudinary обложками
    console.log('📚 Получаем книги с Cloudinary обложками...');
    const booksWithCovers = await getBooksWithCloudinaryCovers();
    console.log(`✅ Найдено ${booksWithCovers.length} книг с Cloudinary обложками`);
    
    if (booksWithCovers.length === 0) {
      console.log('❌ Нет книг с Cloudinary обложками для обновления');
      return;
    }
    
    // Получаем данные из Google Sheets
    console.log('📊 Получаем данные из Google Sheets...');
    const rows = await getSheetData();
    console.log(`✅ Получено ${rows.length} строк из Google Sheets`);
    
    // Обновляем Google Sheets
    console.log('🔄 Обновляем Google Sheets...');
    const result = await updateGoogleSheets(rows, booksWithCovers);
    
    if (result.success) {
      console.log('\n🎉 ОБНОВЛЕНИЕ ЗАВЕРШЕНО!');
      console.log('=' .repeat(60));
      console.log(`✅ Успешно обновлено: ${result.updated} ссылок`);
      console.log(`📊 Всего книг с Cloudinary обложками: ${booksWithCovers.length}`);
      
      // Сохраняем результаты
      const resultData = {
        timestamp: new Date().toISOString(),
        spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID,
        totalBooksWithCovers: booksWithCovers.length,
        updatedLinks: result.updated,
        books: booksWithCovers
      };
      
      fs.writeFileSync('google-sheets-update-results.json', JSON.stringify(resultData, null, 2));
      console.log(`📁 Результаты сохранены: google-sheets-update-results.json`);
      
    } else {
      console.error('❌ Ошибка обновления:', result.error);
    }
    
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
