import { createClient } from '@supabase/supabase-js';
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

// URL публичной Google таблицы (замените на ваш)
const GOOGLE_SHEETS_URL = process.env.GOOGLE_SHEETS_URL || 'https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/export?format=csv&gid=0';

async function fetchGoogleSheetsData() {
  try {
    console.log('📥 Fetching data from Google Sheets...');
    
    const response = await fetch(GOOGLE_SHEETS_URL);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const csvText = await response.text();
    const lines = csvText.split('\n');
    
    // Парсим CSV (простой парсер)
    const data = [];
    for (let i = 1; i < lines.length; i++) { // Пропускаем заголовок
      const line = lines[i].trim();
      if (!line) continue;
      
      // Простой CSV парсер (может не работать с запятыми в кавычках)
      const columns = line.split(',').map(col => col.trim().replace(/^"|"$/g, ''));
      
      if (columns.length >= 3) {
        data.push({
          title: columns[0],
          author: columns[1],
          coverUrl: columns[2]
        });
      }
    }
    
    console.log(`📊 Parsed ${data.length} books from Google Sheets`);
    return data.filter(book => book.title && book.coverUrl);
    
  } catch (error) {
    console.error('❌ Error fetching Google Sheets data:', error.message);
    console.log('💡 Make sure GOOGLE_SHEETS_URL is set correctly in .env.local');
    return [];
  }
}

async function updateBookCovers() {
  console.log('🔄 Updating book covers from Google Sheets...');
  
  try {
    // Получаем данные из Google таблицы
    const sheetsData = await fetchGoogleSheetsData();
    
    if (sheetsData.length === 0) {
      console.log('❌ No data to process');
      return;
    }

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
    let alreadyUpdatedCount = 0;

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
            console.log(`   Old: ${matchingBook.cover_url}`);
            console.log(`   New: ${sheetBook.coverUrl}`);
            updatedCount++;
          }
        } else {
          console.log(`⏭️ Cover for "${matchingBook.title}" is already up to date`);
          alreadyUpdatedCount++;
        }
      } else {
        console.log(`❓ Book not found in database: "${sheetBook.title}" by ${sheetBook.author}`);
        notFoundCount++;
      }
    }

    console.log('\n📈 Summary:');
    console.log(`✅ Updated: ${updatedCount} books`);
    console.log(`⏭️ Already up to date: ${alreadyUpdatedCount} books`);
    console.log(`❓ Not found: ${notFoundCount} books`);
    console.log(`📊 Total processed: ${sheetsData.length} books from Google Sheets`);

  } catch (error) {
    console.error('❌ An unexpected error occurred:', error.message);
  }
}

// Функция для тестирования подключения
async function testConnection() {
  console.log('🔍 Testing Google Sheets connection...');
  
  const sheetsData = await fetchGoogleSheetsData();
  
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
  const connectionOk = await testConnection();
  
  if (connectionOk) {
    console.log('\n' + '='.repeat(50));
    await updateBookCovers();
  } else {
    console.log('\n💡 Please check your Google Sheets configuration:');
    console.log('1. Make sure GOOGLE_SHEETS_URL is set correctly in .env.local');
    console.log('2. Make sure the sheet is publicly accessible');
    console.log('3. Check that the CSV format has columns: Title, Author, Cover URL');
    console.log('4. Example URL format: https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/export?format=csv&gid=0');
  }
}

main().then(() => {
  console.log('\n🎉 Process completed!');
  process.exit(0);
}).catch(error => {
  console.error('❌ Process failed:', error.message);
  process.exit(1);
});
