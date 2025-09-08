import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Получаем путь к директории проекта
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Создаем директорию для обложек, если её нет
const coversDir = path.join(__dirname, 'public', 'images', 'book-covers');
if (!fs.existsSync(coversDir)) {
  fs.mkdirSync(coversDir, { recursive: true });
}

// Функция для поиска обложки книги в интернете
async function findBookCover(title, author) {
  try {
    // Используем Open Library API для поиска обложек
    const searchQuery = `${title} ${author}`.replace(/\s+/g, '+');
    const openLibraryUrl = `https://openlibrary.org/search.json?q=${encodeURIComponent(searchQuery)}&limit=1`;
    
    console.log(`🔍 Searching for cover: "${title}" by ${author}`);
    
    const response = await fetch(openLibraryUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.docs && data.docs.length > 0) {
      const book = data.docs[0];
      
      // Ищем обложку в разных форматах
      let coverUrl = null;
      
      if (book.cover_i) {
        // Open Library cover ID
        coverUrl = `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg`;
      } else if (book.isbn && book.isbn.length > 0) {
        // Попробуем по ISBN
        const isbn = book.isbn[0];
        coverUrl = `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;
      }
      
      if (coverUrl) {
        // Проверяем, что изображение доступно
        const coverResponse = await fetch(coverUrl, { method: 'HEAD' });
        if (coverResponse.ok) {
          console.log(`✅ Found cover: ${coverUrl}`);
          return coverUrl;
        }
      }
    }
    
    console.log(`❌ No cover found for "${title}"`);
    return null;
    
  } catch (error) {
    console.error(`❌ Error searching for cover: ${error.message}`);
    return null;
  }
}

// Функция для загрузки и сохранения обложки
async function downloadAndSaveCover(coverUrl, bookId, title) {
  try {
    const response = await fetch(coverUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const buffer = await response.arrayBuffer();
    const fileName = `${bookId}.jpg`;
    const filePath = path.join(coversDir, fileName);
    
    fs.writeFileSync(filePath, Buffer.from(buffer));
    
    const publicUrl = `/images/book-covers/${fileName}`;
    console.log(`💾 Saved cover: ${publicUrl}`);
    
    return publicUrl;
    
  } catch (error) {
    console.error(`❌ Error downloading cover: ${error.message}`);
    return null;
  }
}

// Функция для обновления обложек книг
async function updateBookCovers() {
  console.log('🔄 Updating book covers from internet...');
  
  try {
    // Получаем все книги из базы данных
    const { data: books, error: fetchError } = await supabase
      .from('books')
      .select('id, title, author, cover_url')
      .or('cover_url.is.null,cover_url.eq./images/book-placeholder.svg');

    if (fetchError) {
      console.error('❌ Error fetching books:', fetchError.message);
      return;
    }

    console.log(`📚 Found ${books.length} books without covers`);

    let updatedCount = 0;
    let notFoundCount = 0;
    let errorCount = 0;

    // Обновляем обложки
    for (const book of books) {
      try {
        console.log(`\n📖 Processing: "${book.title}" by ${book.author}`);
        
        // Ищем обложку в интернете
        const coverUrl = await findBookCover(book.title, book.author);
        
        if (coverUrl) {
          // Загружаем и сохраняем обложку
          const localUrl = await downloadAndSaveCover(coverUrl, book.id, book.title);
          
          if (localUrl) {
            // Обновляем в базе данных
            const { error: updateError } = await supabase
              .from('books')
              .update({ cover_url: localUrl })
              .eq('id', book.id);

            if (updateError) {
              console.error(`❌ Error updating database: ${updateError.message}`);
              errorCount++;
            } else {
              console.log(`✅ Updated cover for "${book.title}"`);
              updatedCount++;
            }
          } else {
            console.log(`❌ Failed to download cover for "${book.title}"`);
            errorCount++;
          }
        } else {
          console.log(`❓ No cover found for "${book.title}"`);
          notFoundCount++;
        }
        
        // Небольшая пауза между запросами, чтобы не перегружать API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`❌ Error processing book "${book.title}": ${error.message}`);
        errorCount++;
      }
    }

    console.log('\n📈 Summary:');
    console.log(`✅ Updated: ${updatedCount} books`);
    console.log(`❓ Not found: ${notFoundCount} books`);
    console.log(`❌ Errors: ${errorCount} books`);
    console.log(`📊 Total processed: ${books.length} books`);

  } catch (error) {
    console.error('❌ An unexpected error occurred:', error.message);
  }
}

// Функция для тестирования поиска обложек
async function testCoverSearch() {
  console.log('🔍 Testing cover search...');
  
  const testBooks = [
    { title: '1984', author: 'George Orwell' },
    { title: 'Alice in Wonderland', author: 'Lewis Carroll' },
    { title: 'The Great Gatsby', author: 'F. Scott Fitzgerald' }
  ];
  
  for (const book of testBooks) {
    const coverUrl = await findBookCover(book.title, book.author);
    if (coverUrl) {
      console.log(`✅ Found: ${book.title} - ${coverUrl}`);
    } else {
      console.log(`❌ Not found: ${book.title}`);
    }
  }
}

// Основная функция
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--test')) {
    console.log('🧪 Running test mode...\n');
    await testCoverSearch();
  } else {
    console.log('🚀 Starting book covers update process...\n');
    await updateBookCovers();
  }
}

main().then(() => {
  console.log('\n🎉 Process completed!');
  process.exit(0);
}).catch(error => {
  console.error('❌ Process failed:', error.message);
  process.exit(1);
});
