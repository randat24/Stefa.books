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

// URL Google таблицы (замените на ваш)
const GOOGLE_SHEETS_URL = process.env.GOOGLE_SHEETS_URL;

if (!GOOGLE_SHEETS_URL) {
  console.error('❌ Missing GOOGLE_SHEETS_URL environment variable');
  console.log('💡 Please set GOOGLE_SHEETS_URL in your .env.local file');
  console.log('Example: GOOGLE_SHEETS_URL=https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/export?format=csv&gid=0');
  process.exit(1);
}

async function fetchGoogleSheetsData() {
  try {
    console.log('📥 Fetching data from Google Sheets...');
    console.log(`🔗 URL: ${GOOGLE_SHEETS_URL}`);
    
    const response = await fetch(GOOGLE_SHEETS_URL);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const csvText = await response.text();
    const lines = csvText.split('\n');
    
    console.log(`📊 Raw CSV has ${lines.length} lines`);
    
    // Парсим CSV
    const data = [];
    for (let i = 1; i < lines.length; i++) { // Пропускаем заголовок
      const line = lines[i].trim();
      if (!line) continue;
      
      // Более надежный CSV парсер
      const columns = [];
      let current = '';
      let inQuotes = false;
      
      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          columns.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      columns.push(current.trim());
      
      if (columns.length >= 3) {
        data.push({
          title: columns[0].replace(/^"|"$/g, '').trim(),
          author: columns[1].replace(/^"|"$/g, '').trim(),
          coverUrl: columns[2].replace(/^"|"$/g, '').trim()
        });
      }
    }
    
    console.log(`📊 Parsed ${data.length} books from Google Sheets`);
    
    // Фильтруем только книги с Cloudinary URL
    const cloudinaryBooks = data.filter(book => 
      book.title && 
      book.author && 
      book.coverUrl && 
      book.coverUrl.includes('cloudinary.com')
    );
    
    console.log(`☁️ Found ${cloudinaryBooks.length} books with Cloudinary URLs`);
    
    return cloudinaryBooks;
    
  } catch (error) {
    console.error('❌ Error fetching Google Sheets data:', error.message);
    return [];
  }
}

// Функция для проверки доступности Cloudinary изображения
async function checkCloudinaryImage(url) {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    return false;
  }
}

// Функция для оптимизации Cloudinary URL
function optimizeCloudinaryUrl(url) {
  if (!url.includes('cloudinary.com')) {
    return url;
  }
  
  // Если URL уже содержит параметры, возвращаем как есть
  if (url.includes('?')) {
    return url;
  }
  
  // Добавляем параметры для оптимизации
  return `${url}?f_auto,q_auto,w_400,h_600,c_fill`;
}

async function importBookCovers() {
  console.log('🚀 Starting book covers import from Google Sheets...\n');
  
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

    console.log(`📚 Found ${books.length} books in database\n`);

    let updatedCount = 0;
    let notFoundCount = 0;
    let alreadyUpdatedCount = 0;
    let invalidUrlCount = 0;
    let errorCount = 0;

    // Показываем первые несколько записей для проверки
    console.log('📋 Sample data from Google Sheets:');
    sheetsData.slice(0, 3).forEach((book, index) => {
      console.log(`  ${index + 1}. "${book.title}" by ${book.author}`);
      console.log(`     Cover: ${book.coverUrl}`);
    });
    console.log('');

    // Обновляем обложки
    for (const sheetBook of sheetsData) {
      try {
        console.log(`📖 Processing: "${sheetBook.title}" by ${sheetBook.author}`);
        
        // Проверяем, что URL Cloudinary валидный
        const isValidUrl = await checkCloudinaryImage(sheetBook.coverUrl);
        if (!isValidUrl) {
          console.log(`❌ Invalid Cloudinary URL: ${sheetBook.coverUrl}`);
          invalidUrlCount++;
          continue;
        }
        
        // Оптимизируем URL
        const optimizedUrl = optimizeCloudinaryUrl(sheetBook.coverUrl);
        console.log(`🔗 Using optimized URL: ${optimizedUrl}`);
        
        // Ищем книгу в базе данных по названию и автору
        const matchingBook = books.find(dbBook => 
          dbBook.title.toLowerCase().trim() === sheetBook.title.toLowerCase().trim() &&
          dbBook.author.toLowerCase().trim() === sheetBook.author.toLowerCase().trim()
        );

        if (matchingBook) {
          // Проверяем, нужно ли обновлять обложку
          if (matchingBook.cover_url !== optimizedUrl) {
            const { error: updateError } = await supabase
              .from('books')
              .update({ cover_url: optimizedUrl })
              .eq('id', matchingBook.id);

            if (updateError) {
              console.error(`❌ Error updating book "${matchingBook.title}":`, updateError.message);
              errorCount++;
            } else {
              console.log(`✅ Updated cover for "${matchingBook.title}"`);
              console.log(`   Old: ${matchingBook.cover_url}`);
              console.log(`   New: ${optimizedUrl}`);
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
        
        // Небольшая пауза между запросами
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.error(`❌ Error processing book "${sheetBook.title}": ${error.message}`);
        errorCount++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📈 IMPORT SUMMARY:');
    console.log(`✅ Updated: ${updatedCount} books`);
    console.log(`⏭️ Already up to date: ${alreadyUpdatedCount} books`);
    console.log(`❓ Not found in database: ${notFoundCount} books`);
    console.log(`❌ Invalid URLs: ${invalidUrlCount} books`);
    console.log(`❌ Errors: ${errorCount} books`);
    console.log(`📊 Total processed: ${sheetsData.length} books from Google Sheets`);
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ An unexpected error occurred:', error.message);
  }
}

// Функция для тестирования подключения
async function testConnection() {
  console.log('🔍 Testing Google Sheets connection...\n');
  
  const sheetsData = await fetchGoogleSheetsData();
  
  if (sheetsData.length > 0) {
    console.log('✅ Google Sheets connection successful!');
    console.log(`📊 Found ${sheetsData.length} books with Cloudinary URLs`);
    
    console.log('\n📋 Sample data:');
    for (let i = 0; i < Math.min(3, sheetsData.length); i++) {
      const book = sheetsData[i];
      console.log(`  ${i + 1}. "${book.title}" by ${book.author}`);
      console.log(`     Cloudinary URL: ${book.coverUrl}`);
      
      // Проверяем доступность URL
      const isValid = await checkCloudinaryImage(book.coverUrl);
      console.log(`     Status: ${isValid ? '✅ Valid' : '❌ Invalid'}`);
    }
    return true;
  } else {
    console.log('❌ Google Sheets connection failed or no data found');
    return false;
  }
}

// Основная функция
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--test')) {
    console.log('🧪 Running test mode...\n');
    await testConnection();
  } else {
    console.log('🚀 Starting book covers import...\n');
    
    // Сначала тестируем подключение
    const connectionOk = await testConnection();
    
    if (connectionOk) {
      console.log('\n' + '='.repeat(60));
      console.log('Proceeding with import...');
      console.log('='.repeat(60));
      await importBookCovers();
    } else {
      console.log('\n💡 Please check your Google Sheets configuration:');
      console.log('1. Make sure GOOGLE_SHEETS_URL is set correctly in .env.local');
      console.log('2. Make sure the sheet is publicly accessible');
      console.log('3. Check that the CSV format has columns: Title, Author, Cloudinary URL');
      console.log('4. Example URL format: https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/export?format=csv&gid=0');
    }
  }
}

main().then(() => {
  console.log('\n🎉 Process completed!');
  process.exit(0);
}).catch(error => {
  console.error('❌ Process failed:', error.message);
  process.exit(1);
});
