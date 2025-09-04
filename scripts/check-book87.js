#!/usr/bin/env node

/**
 * ПРОВЕРКА КНИГИ BOOK87
 */

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { google } = require('googleapis');
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config({ path: '.env.local' });

const auth = new google.auth.GoogleAuth({
  keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
});

const sheets = google.sheets({ version: 'v4', auth });

async function checkBook87() {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID,
      range: 'Каталог книг!A:Z'
    });
    
    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      console.log('Нет данных в таблице');
      return;
    }
    
    // Пропускаем заголовок
    const dataRows = rows.slice(1);
    
    console.log('🔍 Ищем книгу BOOK87:');
    
    dataRows.forEach((row, index) => {
      const code = row[0] || '';
      if (code === 'BOOK87') {
        const title = row[1] || '';
        const coverUrl = row[10] || '';
        const coverFilename = row[row.length - 1] || '';
        
        console.log(`📖 ${code}: ${title}`);
        console.log(`   URL обложки: ${coverUrl}`);
        console.log(`   Имя файла: ${coverFilename}`);
        console.log(`   Строка: ${index + 2}`);
      }
    });
    
  } catch (error) {
    console.error('Ошибка:', error.message);
  }
}

checkBook87();
