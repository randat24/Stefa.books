import { createClient } from '@supabase/supabase-js';
import { google } from 'googleapis';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Google Sheets configuration
const GOOGLE_SHEETS_ID = process.env.GOOGLE_SHEETS_ID; // ID вашей Google таблицы
const GOOGLE_SHEETS_RANGE = 'A:C'; // Диапазон: A - название книги, B - автор, C - ссылка на обложку

if (!GOOGLE_SHEETS_ID) {
  console.error('❌ Missing GOOGLE_SHEETS_ID environment variable');
  console.log('Please add GOOGLE_SHEETS_ID to your .env.local file');
  process.exit(1);
}

async function getGoogleSheetsData() {
  try {
    // Используем API ключ для доступа к публичной таблице
    const sheets = google.sheets({ version: 'v4', auth: process.env.GOOGLE_API_KEY });
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: GOOGLE_SHEETS_ID,
      range: GOOGLE_SHEETS_RANGE,
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      console.log('❌ No data found in Google Sheets');
      return [];
    }

    // Пропускаем заголовок, если есть
    const dataRows = rows.slice(1);
    
    return dataRows.map((row, index) => ({
      row: index + 2, // +2 потому что мы пропустили заголовок и индексация с 0
      title: row[0]?.trim() || '',
      author: row[1]?.trim() || '',
      coverUrl: row[2]?.trim() || ''
    })).filter(item => item.title && item.coverUrl); // Фильтруем только строки с названием и обложкой

  } catch (error) {
    console.error('❌ Error fetching Google Sheets data:', error.message);
    
    if (error.message.includes('API key')) {
      console.log('💡 To use Google Sheets API, you need to:');
      console.log('1. Go to Google Cloud Console');
      console.log('2. Enable Google Sheets API');
      console.log('3. Create an API key');
      console.log('4. Add GOOGLE_API_KEY to your .env.local file');
    }
    
    return [];
  }
}

async function updateBookCovers() {
  console.log('🔄 Updating book covers from Google Sheets...');
  
  try {
    // Получаем данные из Google таблицы
    const sheetsData = await getGoogleSheetsData();
    
    if (sheetsData.length === 0) {
      console.log('❌ No data to process');
      return;
    }

    console.log(`📊 Found ${sheetsData.length} books with cover URLs in Google Sheets`);

    // Получаем все книги из базы данных
    const { data: books, error: fetchError } = await supabase
      .from('books')
      .select('id, title, author, cover_url');

    if (fetchError) {
      console.error('❌ Error fetching books:', fetchError.message);
      return;
    }

    console.log(`📚 Found ${books.length} books in database`);

    let updatedCount = 0;
    let notFoundCount = 0;

    // Обновляем обложки
    for (const sheetBook of sheetsData) {
      // Ищем книгу в базе данных по названию и автору
      const matchingBook = books.find(dbBook => 
        dbBook.title.toLowerCase().trim() === sheetBook.title.toLowerCase().trim() &&
        dbBook.author.toLowerCase().trim() === sheetBook.author.toLowerCase().trim()
      );

      if (matchingBook) {
        // Проверяем, нужно ли обновлять обложку
        if (matchingBook.cover_url !== sheetBook.coverUrl) {
          const { error: updateError } = await supabase
            .from('books')
            .update({ cover_url: sheetBook.coverUrl })
            .eq('id', matchingBook.id);

          if (updateError) {
            console.error(`❌ Error updating book "${matchingBook.title}":`, updateError.message);
          } else {
            console.log(`✅ Updated cover for "${matchingBook.title}"`);
            updatedCount++;
          }
        } else {
          console.log(`⏭️ Cover for "${matchingBook.title}" is already up to date`);
        }
      } else {
        console.log(`❓ Book not found in database: "${sheetBook.title}" by ${sheetBook.author}`);
        notFoundCount++;
      }
    }

    console.log('\n📈 Summary:');
    console.log(`✅ Updated: ${updatedCount} books`);
    console.log(`❓ Not found: ${notFoundCount} books`);
    console.log(`📊 Total processed: ${sheetsData.length} books from Google Sheets`);

  } catch (error) {
    console.error('❌ An unexpected error occurred:', error.message);
  }
}

// Функция для тестирования подключения к Google Sheets
async function testGoogleSheetsConnection() {
  console.log('🔍 Testing Google Sheets connection...');
  
  const sheetsData = await getGoogleSheetsData();
  
  if (sheetsData.length > 0) {
    console.log('✅ Google Sheets connection successful!');
    console.log('📋 Sample data:');
    sheetsData.slice(0, 3).forEach((book, index) => {
      console.log(`  ${index + 1}. "${book.title}" by ${book.author}`);
      console.log(`     Cover: ${book.coverUrl}`);
    });
    return true;
  } else {
    console.log('❌ Google Sheets connection failed or no data found');
    return false;
  }
}

// Основная функция
async function main() {
  console.log('🚀 Starting book covers update process...\n');
  
  // Сначала тестируем подключение
  const connectionOk = await testGoogleSheetsConnection();
  
  if (connectionOk) {
    console.log('\n' + '='.repeat(50));
    await updateBookCovers();
  } else {
    console.log('\n💡 Please check your Google Sheets configuration:');
    console.log('1. Make sure GOOGLE_SHEETS_ID is correct');
    console.log('2. Make sure GOOGLE_API_KEY is set (if using API key)');
    console.log('3. Make sure the sheet is publicly accessible (if not using API key)');
    console.log('4. Check that the range A:C contains: Title | Author | Cover URL');
  }
}

main().then(() => {
  console.log('\n🎉 Process completed!');
  process.exit(0);
}).catch(error => {
  console.error('❌ Process failed:', error.message);
  process.exit(1);
});
