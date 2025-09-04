#!/usr/bin/env node

/**
 * ПРОВЕРКА ДАННЫХ ИЗ GOOGLE SHEETS
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

async function checkSheetData() {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID,
      range: 'Каталог книг!A1:Z10'
    });
    
    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      console.log('Нет данных в таблице');
      return;
    }
    
    console.log('📊 Первые 10 строк из Google Sheets:');
    rows.forEach((row, index) => {
      console.log(`Строка ${index + 1}: ${row.join(' | ')}`);
    });
    
  } catch (error) {
    console.error('Ошибка:', error.message);
  }
}

checkSheetData();
