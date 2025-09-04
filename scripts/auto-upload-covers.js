#!/usr/bin/env node

/**
 * Автоматическая загрузка обложек в Cloudinary
 * Получает данные из базы данных и загружает обложки
 */

const cloudinary = require('cloudinary').v2;
const { createClient } = require('@supabase/supabase-js');

// Конфигурация
const supabase = createClient(
  process.env.SUPABASE_URL || 'your_supabase_url',
  process.env.SUPABASE_ANON_KEY || 'your_supabase_anon_key'
);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dchx7vd97',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Извлекает file_id из Google Drive URL
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
 * Загружает изображение в Cloudinary
 */
async function uploadToCloudinary(imageUrl, publicId) {
  try {
    const result = await cloudinary.uploader.upload(imageUrl, {
      public_id: `stefa-books/${publicId}`,
      folder: 'stefa-books',
      resource_type: 'image',
      transformation: [
        { width: 300, height: 400, crop: 'fill', quality: 'auto' }
      ]
    });
    
    return result.secure_url;
  } catch (error) {
    console.error(`Ошибка загрузки ${publicId}:`, error.message);
    return null;
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
      console.error(`Ошибка обновления URL для книги ${bookId}:`, error.message);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error(`Ошибка обновления URL для книги ${bookId}:`, error.message);
    return false;
  }
}

/**
 * Основная функция
 */
async function main() {
  console.log('🚀 Начинаем автоматическую загрузку обложек...');
  
  try {
    // Получаем все книги из базы данных
    const { data: books, error } = await supabase
      .from('books')
      .select('id, code, title, cover_url')
      .not('cover_url', 'is', null);
    
    if (error) {
      console.error('Ошибка получения книг:', error.message);
      return;
    }
    
    if (!books || books.length === 0) {
      console.log('❌ Книги не найдены в базе данных');
      return;
    }
    
    console.log(`📚 Найдено ${books.length} книг для обработки`);
    
    let successCount = 0;
    let errorCount = 0;
    let skipCount = 0;
    
    for (const book of books) {
      try {
        console.log(`📖 Обрабатываем: ${book.title} (${book.code})`);
        
        // Проверяем, не загружена ли уже обложка в Cloudinary
        if (book.cover_url && book.cover_url.includes('cloudinary.com')) {
          console.log(`⏭️  Пропускаем (уже в Cloudinary): ${book.cover_url}`);
          skipCount++;
          continue;
        }
        
        // Извлекаем file_id из Google Drive URL
        const fileId = extractFileId(book.cover_url);
        if (!fileId) {
          console.log(`❌ Не удалось извлечь file_id из URL: ${book.cover_url}`);
          errorCount++;
          continue;
        }
        
        // Создаем прямую ссылку для загрузки
        const directUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
        
        // Загружаем в Cloudinary
        const cloudinaryUrl = await uploadToCloudinary(directUrl, book.code);
        
        if (cloudinaryUrl) {
          // Обновляем URL в базе данных
          const updated = await updateCoverUrl(book.id, cloudinaryUrl);
          
          if (updated) {
            console.log(`✅ Успешно загружено: ${cloudinaryUrl}`);
            successCount++;
          } else {
            errorCount++;
          }
        } else {
          errorCount++;
        }
        
        // Небольшая пауза между загрузками
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`❌ Ошибка обработки книги ${book.code}:`, error.message);
        errorCount++;
      }
    }
    
    console.log(`\n📊 Результат:`);
    console.log(`✅ Успешно загружено: ${successCount}`);
    console.log(`⏭️  Пропущено: ${skipCount}`);
    console.log(`❌ Ошибок: ${errorCount}`);
    console.log(`📚 Всего обработано: ${books.length}`);
    
  } catch (error) {
    console.error('Критическая ошибка:', error.message);
  }
}

// Запуск скрипта
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main, extractFileId, uploadToCloudinary, updateCoverUrl };
