#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-var-requires */

/**
 * ПРОВЕРКА КНИГ БЕЗ ОБЛОЖЕК В GOOGLE SHEETS
 */

const { google } = require('googleapis');
require('dotenv').config({ path: '.env.local' });

const auth = new google.auth.GoogleAuth({
  keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
});

const sheets = google.sheets({ version: 'v4', auth });

async function checkMissingCovers() {
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
    
    const missingCodes = ['1378', '1916', '197', '1982', '2768', '4030', '4538', '4932', '4969', '5431', '5452', '5657', '5755', '7006', '8150', '8706', '9681'];
    
    console.log('🔍 Проверяем книги без обложек в Google Sheets:');
    
    dataRows.forEach(row => {
      const code = row[0] || '';
      if (missingCodes.includes(code)) {
        const title = row[1] || '';
        const coverUrl = row[10] || '';
        const coverFilename = row[row.length - 1] || '';
        
        console.log(`\n📖 ${code}: ${title}`);
        console.log(`   URL обложки: ${coverUrl}`);
        console.log(`   Имя файла: ${coverFilename}`);
      }
    });
    
  } catch (error) {
    console.error('Ошибка:', error.message);
  }
}

checkMissingCovers();

/* eslint-enable @typescript-eslint/no-var-requires */
