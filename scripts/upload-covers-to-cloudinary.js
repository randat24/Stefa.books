#!/usr/bin/env node

/**
 * ЗАГРУЗКА ОБЛОЖЕК В CLOUDINARY
 * Получает книги из базы данных и загружает обложки в Cloudinary
 */

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { createClient } = require('@supabase/supabase-js');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { v2: cloudinary } = require('cloudinary');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const https = require('https');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config({ path: '.env.local' });

// Конфигурация Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Конфигурация Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Извлекает file ID из Google Drive URL
 */
function extractFileId(url) {
  if (!url) return null;
  
  const patterns = [
    /drive\.google\.com\/file\/d\/([^\/]+)/,
    /drive\.google\.com\/open\?id=([^\/]+)/,
    /drive\.google\.com\/uc\?export=view&id=([^&]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  
  return null;
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
    
    request.on('error', reject);
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
  } catch (error) {
    console.log(`   ⚠️  Не удалось удалить временный файл: ${filePath}`);
  }
}

/**
 * Обновляет URL обложки в базе данных
 */
async function updateCoverUrl(bookId, newUrl) {
  try {
    const { error } = await supabase
      .from('books')
      .update({ cover_url: newUrl })
      .eq('id', bookId);
    
    if (error) {
      console.error(`❌ Ошибка обновления URL для книги ${bookId}:`, error.message);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error(`❌ Ошибка обновления URL для книги ${bookId}:`, error.message);
    return false;
  }
}

/**
 * Обрабатывает обложку книги
 */
async function processBookCover(book, index, total) {
  console.log(`\n📖 [${index + 1}/${total}] ${book.title}`);
  console.log(`   Код: ${book.code}`);
  
  if (!book.cover_url) {
    console.log('   ⚠️  Нет URL для обложки');
    return null;
  }
  
  // Проверяем, не загружена ли уже обложка в Cloudinary
  if (book.cover_url.includes('cloudinary.com')) {
    console.log(`   ⏭️  Уже в Cloudinary: ${book.cover_url}`);
    return book.cover_url;
  }
  
  try {
    // 1. Извлекаем file ID из Google Drive URL
    const fileId = extractFileId(book.cover_url);
    if (!fileId) {
      console.log('   ❌ Не удалось извлечь file ID из Google Drive URL');
      return null;
    }
    
    // 2. Создаем прямую ссылку для скачивания
    const directUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
    
    console.log(`   📥 Скачиваем с Google Drive...`);
    
    // 3. Определяем временный путь для файла
    const tempDir = path.join(__dirname, 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    const fileExtension = '.jpg';
    const tempFilePath = path.join(tempDir, `${book.code}${fileExtension}`);
    
    // 4. Скачиваем файл
    await downloadFile(directUrl, tempFilePath);
    
    // Проверяем размер файла
    const stats = fs.statSync(tempFilePath);
    if (stats.size < 1000) {
      console.log('   ❌ Файл слишком маленький, возможно ошибка скачивания');
      cleanupTempFile(tempFilePath);
      return null;
    }
    
    console.log(`   📤 Загружаем на Cloudinary...`);
    
    // 5. Загружаем на Cloudinary
    const cloudinaryUrl = await uploadToCloudinary(tempFilePath, book.code.toLowerCase());
    
    if (cloudinaryUrl) {
      console.log(`   ✅ Загружено: ${cloudinaryUrl}`);
      
      // 6. Обновляем URL в базе данных
      const updated = await updateCoverUrl(book.id, cloudinaryUrl);
      if (updated) {
        console.log(`   ✅ URL обновлен в базе данных`);
      }
    }
    
    // 7. Удаляем временный файл
    cleanupTempFile(tempFilePath);
    
    return cloudinaryUrl;
    
  } catch (error) {
    console.log(`   ❌ Ошибка: ${error.message}`);
    return null;
  }
}

/**
 * Основная функция
 */
async function main() {
  console.log('🚀 ЗАГРУЗКА ОБЛОЖЕК В CLOUDINARY');
  console.log('=' .repeat(60));
  
  try {
    // Проверяем конфигурацию
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('❌ Отсутствуют переменные окружения для Supabase');
      process.exit(1);
    }
    
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error('❌ Отсутствуют переменные окружения для Cloudinary');
      process.exit(1);
    }
    
    console.log(`✅ Supabase: ${process.env.SUPABASE_URL}`);
    console.log(`✅ Cloudinary: ${process.env.CLOUDINARY_CLOUD_NAME}`);
    
    // Получаем все книги с обложками из базы данных
    const { data: books, error } = await supabase
      .from('books')
      .select('id, code, title, cover_url')
      .not('cover_url', 'is', null);
    
    if (error) {
      console.error('❌ Ошибка получения книг:', error.message);
      return;
    }
    
    if (!books || books.length === 0) {
      console.log('❌ Книги с обложками не найдены в базе данных');
      return;
    }
    
    console.log(`📚 Найдено ${books.length} книг с обложками`);
    
    let successCount = 0;
    let errorCount = 0;
    let skipCount = 0;
    
    // Обрабатываем книги по одной
    for (let i = 0; i < books.length; i++) {
      const book = books[i];
      const result = await processBookCover(book, i, books.length);
      
      if (result) {
        if (result.includes('cloudinary.com')) {
          successCount++;
        } else {
          skipCount++;
        }
      } else {
        errorCount++;
      }
      
      // Небольшая пауза между запросами
      if (i < books.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    // Сохраняем результаты
    const resultData = {
      timestamp: new Date().toISOString(),
      totalBooks: books.length,
      successful: successCount,
      skipped: skipCount,
      failed: errorCount,
      books: books.map(book => ({
        id: book.id,
        code: book.code,
        title: book.title,
        originalUrl: book.cover_url,
        processed: true
      }))
    };
    
    fs.writeFileSync('cloudinary-upload-results.json', JSON.stringify(resultData, null, 2));
    
    console.log('\n🎉 ЗАГРУЗКА ЗАВЕРШЕНА!');
    console.log('=' .repeat(60));
    console.log(`✅ Успешно загружено: ${successCount}`);
    console.log(`⏭️  Пропущено: ${skipCount}`);
    console.log(`❌ Ошибок: ${errorCount}`);
    console.log(`📚 Всего обработано: ${books.length}`);
    console.log(`📁 Результаты сохранены: cloudinary-upload-results.json`);
    
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