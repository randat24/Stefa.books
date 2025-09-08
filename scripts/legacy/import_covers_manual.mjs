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

// Функция для проверки доступности Cloudinary изображения
async function checkCloudinaryImage(url) {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    return false;
  }
}

// Функция для обновления обложки книги
async function updateBookCover(bookId, coverUrl) {
  try {
    const { error } = await supabase
      .from('books')
      .update({ cover_url: coverUrl })
      .eq('id', bookId);

    if (error) {
      console.error(`❌ Error updating book ${bookId}:`, error.message);
      return false;
    }

    return true;
  } catch (error) {
    console.error(`❌ Error updating book ${bookId}:`, error.message);
    return false;
  }
}

// Функция для получения всех книг из базы данных
async function getAllBooks() {
  try {
    const { data: books, error } = await supabase
      .from('books')
      .select('id, title, author, cover_url');

    if (error) {
      console.error('❌ Error fetching books:', error.message);
      return [];
    }

    return books;
  } catch (error) {
    console.error('❌ Error fetching books:', error.message);
    return [];
  }
}

// Функция для поиска книги по названию и автору
function findBook(books, title, author) {
  return books.find(book => 
    book.title.toLowerCase().trim() === title.toLowerCase().trim() &&
    book.author.toLowerCase().trim() === author.toLowerCase().trim()
  );
}

// Функция для импорта обложек из массива данных
async function importCoversFromData(coverData) {
  console.log('🚀 Starting Cloudinary covers import...\n');
  
  try {
    // Получаем все книги из базы данных
    const books = await getAllBooks();
    
    if (books.length === 0) {
      console.log('❌ No books found in database');
      return;
    }

    console.log(`📚 Found ${books.length} books in database\n`);

    let updatedCount = 0;
    let notFoundCount = 0;
    let invalidUrlCount = 0;
    let errorCount = 0;

    // Показываем данные для импорта
    console.log('📋 Cover data to import:');
    coverData.forEach((item, index) => {
      console.log(`  ${index + 1}. "${item.title}" by ${item.author}`);
      console.log(`     Cloudinary URL: ${item.coverUrl}`);
    });
    console.log('');

    // Обновляем обложки
    for (const item of coverData) {
      try {
        console.log(`📖 Processing: "${item.title}" by ${item.author}`);
        
        // Проверяем, что URL Cloudinary валидный
        const isValidUrl = await checkCloudinaryImage(item.coverUrl);
        if (!isValidUrl) {
          console.log(`❌ Invalid Cloudinary URL: ${item.coverUrl}`);
          invalidUrlCount++;
          continue;
        }
        
        // Оптимизируем URL
        const optimizedUrl = optimizeCloudinaryUrl(item.coverUrl);
        console.log(`🔗 Using optimized URL: ${optimizedUrl}`);
        
        // Ищем книгу в базе данных
        const matchingBook = findBook(books, item.title, item.author);

        if (matchingBook) {
          // Обновляем обложку
          const success = await updateBookCover(matchingBook.id, optimizedUrl);
          
          if (success) {
            console.log(`✅ Updated cover for "${matchingBook.title}"`);
            console.log(`   Old: ${matchingBook.cover_url}`);
            console.log(`   New: ${optimizedUrl}`);
            updatedCount++;
          } else {
            errorCount++;
          }
        } else {
          console.log(`❓ Book not found in database: "${item.title}" by ${item.author}`);
          notFoundCount++;
        }
        
        // Небольшая пауза между запросами
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.error(`❌ Error processing book "${item.title}": ${error.message}`);
        errorCount++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📈 CLOUDINARY IMPORT SUMMARY:');
    console.log(`✅ Updated: ${updatedCount} books`);
    console.log(`❓ Not found in database: ${notFoundCount} books`);
    console.log(`❌ Invalid Cloudinary URLs: ${invalidUrlCount} books`);
    console.log(`❌ Errors: ${errorCount} books`);
    console.log(`📊 Total processed: ${coverData.length} books`);
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ An unexpected error occurred:', error.message);
  }
}

// Функция для показа текущих обложек
async function showCurrentCovers() {
  try {
    console.log('\n📚 Current book covers in database:');
    const books = await getAllBooks();
    
    books.forEach((book, index) => {
      const isCloudinary = book.cover_url && book.cover_url.includes('cloudinary.com');
      const isPlaceholder = book.cover_url === '/images/book-placeholder.svg';
      
      console.log(`  ${index + 1}. "${book.title}" by ${book.author}`);
      console.log(`     Cover: ${book.cover_url}`);
      console.log(`     Type: ${isCloudinary ? '☁️ Cloudinary' : isPlaceholder ? '📄 Placeholder' : '🔗 Other'}`);
    });
    
    console.log(`\n📊 Total books in database: ${books.length}`);
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
}

// Основная функция
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--show')) {
    console.log('📚 Showing current covers...\n');
    await showCurrentCovers();
  } else {
    console.log('🚀 Cloudinary Covers Import Tool\n');
    
    // ВАШИ ДАННЫЕ ИЗ GOOGLE ТАБЛИЦЫ
    // Замените этот массив на ваши данные из Google таблицы
    const coverData = [
      {
        title: "Сапієнс",
        author: "Юваль Ноа Харарі",
        coverUrl: "https://res.cloudinary.com/dchx7vd97/image/upload/v1234567890/sapiens.jpg"
      },
      {
        title: "Космос",
        author: "Карл Саган",
        coverUrl: "https://res.cloudinary.com/dchx7vd97/image/upload/v1234567890/cosmos.jpg"
      },
      {
        title: "Геній",
        author: "Вальтер Айзексон",
        coverUrl: "https://res.cloudinary.com/dchx7vd97/image/upload/v1234567890/genius.jpg"
      }
      // Добавьте сюда все ваши книги из Google таблицы
    ];
    
    console.log('💡 To use this script:');
    console.log('1. Copy your data from Google Sheets');
    console.log('2. Replace the coverData array in this file with your actual data');
    console.log('3. Make sure Cloudinary URLs are complete and valid');
    console.log('4. Run: node import_covers_manual.mjs');
    console.log('5. Or show current covers: node import_covers_manual.mjs --show\n');
    
    console.log('📋 Current sample data:');
    coverData.forEach((item, index) => {
      console.log(`  ${index + 1}. "${item.title}" by ${item.author}`);
      console.log(`     URL: ${item.coverUrl}`);
    });
    
    console.log('\n🔧 To import your data:');
    console.log('1. Replace the coverData array with your actual data');
    console.log('2. Make sure Cloudinary URLs are complete and valid');
    console.log('3. Run the script again');
  }
}

main().then(() => {
  console.log('\n🎉 Process completed!');
  process.exit(0);
}).catch(error => {
  console.error('❌ Process failed:', error.message);
  process.exit(1);
});
