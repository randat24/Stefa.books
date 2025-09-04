#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-var-requires */

/**
 * ПОЛНЫЙ ИМПОРТ КНИГ ИЗ GOOGLE SHEETS
 * 
 * Этот скрипт:
 * 1. Получает данные из Google Sheets
 * 2. Импортирует книги в базу данных Supabase
 * 3. Загружает обложки с Google Drive в Cloudinary
 * 4. Обновляет ссылки на обложки в базе данных
 */
const { google } = require('googleapis');
const { createClient } = require('@supabase/supabase-js');
const { v2: cloudinary } = require('cloudinary');
const fs = require('fs');
const path = require('path');
const https = require('https');
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
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
);

// Конфигурация Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Получает данные из Google таблицы
 */
async function fetchGoogleSheetsData(spreadsheetId, range) {
  try {
    console.log(`📊 Получаем данные из Google Sheets...`);
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: spreadsheetId,
      range: range,
    });
    
    return response.data.values;
  } catch (error) {
    console.error('❌ Ошибка получения данных из Google Sheets:', error.message);
    return null;
  }
}

/**
 * Конвертирует Google Drive URL в прямую ссылку для скачивания
 */
function convertGoogleDriveUrl(url) {
  if (!url || !url.includes('drive.google.com')) {
    return null;
  }
  
  // Извлекаем file ID из URL
  const fileIdMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (!fileIdMatch) {
    return null;
  }
  
  const fileId = fileIdMatch[1];
  return `https://drive.google.com/uc?export=download&id=${fileId}`;
}

/**
 * Скачивает файл с Google Drive
 */
function downloadFile(url, destination) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destination);
    
    const request = https.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        const redirectUrl = response.headers.location;
        console.log(`   Следуем редиректу: ${redirectUrl}`);
        
        const redirectRequest = https.get(redirectUrl, (redirectResponse) => {
          redirectResponse.pipe(file);
          
          file.on('finish', () => {
            file.close();
            resolve(destination);
          });
        });
        
        redirectRequest.on('error', reject);
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        resolve(destination);
      });
    });
    
    request.on('error', (error) => {
      reject(error);
    });
  });
}

/**
 * Загружает изображение в Cloudinary
 */
async function uploadToCloudinary(filePath, publicId) {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      public_id: `stefa-books/${publicId}`,
      folder: 'stefa-books',
      resource_type: 'image',
      transformation: [
        { width: 300, height: 400, crop: 'fill', quality: 'auto' }
      ]
    });
    
    return result.secure_url;
  } catch (error) {
    console.error(`❌ Ошибка загрузки в Cloudinary:`, error.message);
    return null;
  }
}

/**
 * Очищает временные файлы
 */
function cleanupTempFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch {
    console.log(`   ⚠️  Не удалось удалить временный файл: ${filePath}`);
  }
}

/**
 * Обрабатывает обложку книги
 */
async function processBookCover(book, index, total) {
  console.log(`\n📖 [${index + 1}/${total}] ${book.title}`);
  console.log(`   Код: ${book.code}`);
  
  if (!book.coverUrl) {
    console.log('   ⚠️  Нет URL для обложки');
    return null;
  }
  
  try {
    // 1. Конвертируем Google Drive URL
    const downloadUrl = convertGoogleDriveUrl(book.coverUrl);
    if (!downloadUrl) {
      console.log('   ❌ Не удалось извлечь ID файла из Google Drive URL');
      return null;
    }
    
    console.log(`   📥 Скачиваем с Google Drive...`);
    
    // 2. Определяем временный путь для файла
    const tempDir = path.join(__dirname, 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    const fileExtension = '.jpg';
    const tempFilePath = path.join(tempDir, `${book.code}${fileExtension}`);
    
    // 3. Скачиваем файл
    await downloadFile(downloadUrl, tempFilePath);
    
    // Проверяем размер файла
    const stats = fs.statSync(tempFilePath);
    if (stats.size < 1000) {
      console.log('   ❌ Файл слишком маленький, возможно ошибка скачивания');
      cleanupTempFile(tempFilePath);
      return null;
    }
    
    console.log(`   📤 Загружаем на Cloudinary...`);
    
    // 4. Загружаем на Cloudinary
    const cloudinaryUrl = await uploadToCloudinary(tempFilePath, book.code.toLowerCase());
    
    if (cloudinaryUrl) {
      console.log(`   ✅ Загружено: ${cloudinaryUrl}`);
    }
    
    // 5. Удаляем временный файл
    cleanupTempFile(tempFilePath);
    
    return cloudinaryUrl;
    
  } catch (error) {
    console.log(`   ❌ Ошибка: ${error.message}`);
    return null;
  }
}

/**
 * Импортирует книги в базу данных
 */
async function importBooksToDatabase(books) {
  console.log(`\n📚 Импортируем ${books.length} книг в базу данных...`);
  
  try {
    // Очищаем существующие данные
    console.log('   🧹 Очищаем существующие данные...');
    await supabase.from('book_authors').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('books').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('authors').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    // Импортируем книги
    const booksToInsert = books.map(book => {
      // Очищаем и валидируем данные
      const cleanBook = {
        code: String(book.code || `BOOK${Math.random().toString(36).substr(2, 9)}`),
        title: String(book.title || 'Без назви'),
        author: String(book.author || 'Невідомий автор'),
        category: String(book.category || 'Без категорії'),
        description: book.description ? String(book.description) : null,
        isbn: book.isbn ? String(book.isbn) : null,
        pages: book.pages && !isNaN(parseInt(book.pages)) ? parseInt(book.pages) : null,
        age_range: book.ageRange ? String(book.ageRange) : null,
        language: String(book.language || 'uk'),
        publisher: book.publisher ? String(book.publisher) : null,
        publication_year: book.year && !isNaN(parseInt(book.year)) ? parseInt(book.year) : null,
        cover_url: book.coverUrl ? String(book.coverUrl) : null,
        status: book.status === '✅ Активна' ? 'available' : 'unavailable',
        available: book.status === '✅ Активна',
        qty_total: book.qtyTotal && !isNaN(parseInt(book.qtyTotal)) ? parseInt(book.qtyTotal) : 1,
        qty_available: book.qtyAvailable && !isNaN(parseInt(book.qtyAvailable)) ? parseInt(book.qtyAvailable) : 1,
        price_uah: book.price && !isNaN(parseFloat(book.price)) ? parseFloat(book.price) : null,
        location: 'вул. Маріупольська 13/2, Миколаїв',
        rating: null,
        rating_count: 0,
        badges: [],
        tags: null,
        search_text: `${book.title} ${book.author} ${book.category}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      return cleanBook;
    });
    
    console.log(`   📝 Готовим к вставке ${booksToInsert.length} книг`);
    
    const { data: insertedBooks, error: booksError } = await supabase
      .from('books')
      .insert(booksToInsert)
      .select('id, code, title, author');
    
    if (booksError) {
      console.error('❌ Ошибка импорта книг:', booksError.message);
      return null;
    }
    
    console.log(`   ✅ Импортировано ${insertedBooks.length} книг`);
    
    // Создаем авторов
    const uniqueAuthors = [...new Set(books.map(book => book.author).filter(Boolean))];
    const authorsToInsert = uniqueAuthors.map(name => ({
      name: name,
      created_at: new Date().toISOString()
    }));
    
    const { data: insertedAuthors, error: authorsError } = await supabase
      .from('authors')
      .insert(authorsToInsert)
      .select('id, name');
    
    if (authorsError) {
      console.error('❌ Ошибка импорта авторов:', authorsError.message);
      return null;
    }
    
    console.log(`   ✅ Импортировано ${insertedAuthors.length} авторов`);
    
    // Связываем книги с авторами
    const bookAuthorsToInsert = [];
    for (const book of insertedBooks) {
      const author = insertedAuthors.find(a => a.name === book.author);
      if (author) {
        bookAuthorsToInsert.push({
          book_id: book.id,
          author_id: author.id,
          role: 'author'
        });
      }
    }
    
    const { error: bookAuthorsError } = await supabase
      .from('book_authors')
      .insert(bookAuthorsToInsert);
    
    if (bookAuthorsError) {
      console.error('❌ Ошибка связывания книг с авторами:', bookAuthorsError.message);
      return null;
    }
    
    console.log(`   ✅ Связано ${bookAuthorsToInsert.length} книг с авторами`);
    
    return insertedBooks;
    
  } catch (error) {
    console.error('❌ Критическая ошибка импорта:', error.message);
    return null;
  }
}

/**
 * Обновляет URL обложки в базе данных
 */
async function updateCoverUrl(bookCode, newUrl) {
  try {
    const { error } = await supabase
      .from('books')
      .update({ cover_url: newUrl })
      .eq('code', bookCode);
    
    if (error) {
      console.error(`❌ Ошибка обновления URL для книги ${bookCode}:`, error.message);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error(`❌ Ошибка обновления URL для книги ${bookCode}:`, error.message);
    return false;
  }
}

/**
 * Основная функция
 */
async function main() {
  console.log('🚀 ПОЛНЫЙ ИМПОРТ КНИГ ИЗ GOOGLE SHEETS');
  console.log('=' .repeat(60));
  
  try {
    // Проверяем конфигурацию
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
      console.error('❌ Отсутствуют переменные окружения для Supabase');
      process.exit(1);
    }
    
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error('❌ Отсутствуют переменные окружения для Cloudinary');
      process.exit(1);
    }
    
    if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      console.error('❌ Отсутствует GOOGLE_APPLICATION_CREDENTIALS');
      process.exit(1);
    }
    
    console.log(`✅ Supabase: ${process.env.SUPABASE_URL}`);
    console.log(`✅ Cloudinary: ${process.env.CLOUDINARY_CLOUD_NAME}`);
    
    // Получаем данные из Google Sheets
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
    const range = process.env.GOOGLE_RANGE || 'Sheet1!A:Z';
    
    if (!spreadsheetId) {
      console.error('❌ Отсутствует GOOGLE_SPREADSHEET_ID');
      process.exit(1);
    }
    
    const data = await fetchGoogleSheetsData(spreadsheetId, range);
    
    if (!data || data.length < 2) {
      console.log('❌ Недостаточно данных для импорта');
      return;
    }
    
    console.log(`📊 Получено ${data.length} строк данных`);
    
    // Конвертируем данные в объекты книг
    const headers = data[0];
    const rows = data.slice(1);
    
    const books = rows.map((row, index) => {
      const book = {};
      headers.forEach((header, headerIndex) => {
        book[header] = row[headerIndex] || null;
      });
      
      // Маппинг колонок (согласно структуре Google таблицы)
      return {
        code: book['Код'] || `BOOK${index + 1}`,
        title: book['Назва'] || `Книга ${index + 1}`,
        author: book['Автор'] || 'Невідомий автор',
        category: book['Категорія'] || 'Без категорії',
        description: book['Опис'] || null,
        isbn: book['ISBN'] || null,
        pages: book['Сторінки'] || null,
        ageRange: book['Вік'] || null,
        language: book['Мова'] || 'uk',
        publisher: book['Видавництво'] || null,
        year: book['Рік'] || null,
        coverUrl: book['Фото (URL)'] || null,
        price: book['Ціна'] || null,
        qtyTotal: book['Всього'] || 1,
        qtyAvailable: book['Доступно'] || 1,
        status: book['Статус'] || '✅ Активна'
      };
    });
    
    // Удаляем дубликаты по коду
    const uniqueBooks = [];
    const seenCodes = new Set();
    
    books.forEach(book => {
      if (!seenCodes.has(book.code)) {
        seenCodes.add(book.code);
        uniqueBooks.push(book);
      } else {
        console.log(`⚠️  Пропускаем дубликат: ${book.code} - ${book.title}`);
      }
    });
    
    console.log(`📚 После удаления дубликатов: ${uniqueBooks.length} книг`);
    
    // Импортируем книги в базу данных
    const importedBooks = await importBooksToDatabase(uniqueBooks);
    
    if (!importedBooks) {
      console.log('❌ Не удалось импортировать книги');
      return;
    }
    
    // Обрабатываем обложки
    const booksWithCovers = uniqueBooks.filter(book => book.coverUrl);
    console.log(`\n🖼️  Обрабатываем ${booksWithCovers.length} обложек...`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < booksWithCovers.length; i++) {
      const book = booksWithCovers[i];
      const cloudinaryUrl = await processBookCover(book, i, booksWithCovers.length);
      
      if (cloudinaryUrl) {
        const updated = await updateCoverUrl(book.code, cloudinaryUrl);
        if (updated) {
          successCount++;
        } else {
          errorCount++;
        }
      } else {
        errorCount++;
      }
      
      // Небольшая пауза между запросами
      if (i < booksWithCovers.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    // Сохраняем результаты
    const resultData = {
      timestamp: new Date().toISOString(),
      totalBooks: uniqueBooks.length,
      importedBooks: importedBooks.length,
      totalCovers: booksWithCovers.length,
      successfulCovers: successCount,
      failedCovers: errorCount,
      books: uniqueBooks.map(book => ({
        code: book.code,
        title: book.title,
        author: book.author,
        hasCover: !!book.coverUrl
      }))
    };
    
    fs.writeFileSync('import-results.json', JSON.stringify(resultData, null, 2));
    
    console.log('\n🎉 ИМПОРТ ЗАВЕРШЕН!');
    console.log('=' .repeat(60));
    console.log(`📚 Книг импортировано: ${importedBooks.length}`);
    console.log(`🖼️  Обложек обработано: ${booksWithCovers.length}`);
    console.log(`✅ Успешно загружено: ${successCount}`);
    console.log(`❌ Ошибок: ${errorCount}`);
    console.log(`📁 Результаты сохранены: import-results.json`);
    
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

/* eslint-enable @typescript-eslint/no-var-requires */
