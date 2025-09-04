#!/usr/bin/env node

/**
 * ЗАГРУЗКА ОБЛОЖЕК НАПРЯМУЮ В CLOUDINARY
 * Использует Google Drive API для получения прямых ссылок
 */

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { createClient } = require('@supabase/supabase-js');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { v2: cloudinary } = require('cloudinary');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { google } = require('googleapis');
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config({ path: '.env.local' });

// Конфигурация Google Drive API
const auth = new google.auth.GoogleAuth({
  keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  scopes: ['https://www.googleapis.com/auth/drive.readonly']
});

const drive = google.drive({ version: 'v3', auth });

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

// ID папки с обложками
const FOLDER_ID = '18nsWMLPb6i0ZRb2r_aRuROSuaE2fZAtx';

/**
 * Получает список файлов из папки Google Drive
 */
async function getFilesFromFolder(folderId) {
  try {
    const response = await drive.files.list({
      q: `'${folderId}' in parents`,
      fields: 'files(id, name, mimeType, size)',
      orderBy: 'name'
    });
    
    return response.data.files;
  } catch (error) {
    console.error('❌ Ошибка получения файлов из папки:', error.message);
    return [];
  }
}

/**
 * Загружает изображение напрямую в Cloudinary по URL
 */
async function uploadToCloudinaryFromUrl(imageUrl, publicId) {
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
    console.error(`❌ Ошибка загрузки в Cloudinary:`, error.message);
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
 * Извлекает код книги из имени файла
 */
function extractBookCodeFromFilename(filename) {
  // Убираем расширение файла
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
  
  // Ищем числовой код в начале имени файла
  const match = nameWithoutExt.match(/^(\d+)/);
  if (match) {
    return match[1];
  }
  
  // Если нет числового кода, возвращаем имя файла без расширения
  return nameWithoutExt;
}

/**
 * Создает прямую ссылку на файл Google Drive
 */
function createDirectGoogleDriveUrl(fileId) {
  return `https://drive.google.com/uc?export=view&id=${fileId}`;
}

/**
 * Обрабатывает файл обложки
 */
async function processCoverFile(file, index, total) {
  console.log(`\n📖 [${index + 1}/${total}] ${file.name}`);
  console.log(`   ID: ${file.id}`);
  
  try {
    // 1. Извлекаем код книги из имени файла
    const bookCode = extractBookCodeFromFilename(file.name);
    console.log(`   Код книги: ${bookCode}`);
    
    // 2. Создаем прямую ссылку на файл
    const directUrl = createDirectGoogleDriveUrl(file.id);
    console.log(`   📤 Загружаем на Cloudinary...`);
    
    // 3. Загружаем на Cloudinary
    const cloudinaryUrl = await uploadToCloudinaryFromUrl(directUrl, bookCode.toLowerCase());
    
    if (cloudinaryUrl) {
      console.log(`   ✅ Загружено: ${cloudinaryUrl}`);
      
      // 4. Обновляем URL в базе данных
      const updated = await updateCoverUrl(bookCode, cloudinaryUrl);
      if (updated) {
        console.log(`   ✅ URL обновлен в базе данных`);
      }
    }
    
    return {
      filename: file.name,
      bookCode: bookCode,
      cloudinaryUrl: cloudinaryUrl,
      success: !!cloudinaryUrl
    };
    
  } catch (error) {
    console.log(`   ❌ Ошибка: ${error.message}`);
    return {
      filename: file.name,
      bookCode: extractBookCodeFromFilename(file.name),
      cloudinaryUrl: null,
      success: false,
      error: error.message
    };
  }
}

/**
 * Основная функция
 */
async function main() {
  console.log('🚀 ЗАГРУЗКА ОБЛОЖЕК НАПРЯМУЮ В CLOUDINARY');
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
    console.log(`✅ Google Drive папка: ${FOLDER_ID}`);
    
    // Получаем список файлов из папки
    console.log(`\n📁 Получаем список файлов из папки...`);
    const files = await getFilesFromFolder(FOLDER_ID);
    
    if (!files || files.length === 0) {
      console.log('❌ Файлы не найдены в папке');
      return;
    }
    
    console.log(`📚 Найдено ${files.length} файлов в папке`);
    
    let successCount = 0;
    let errorCount = 0;
    const results = [];
    
    // Обрабатываем файлы по одному
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const result = await processCoverFile(file, i, files.length);
      
      if (result) {
        results.push(result);
        if (result.success) {
          successCount++;
        } else {
          errorCount++;
        }
      }
      
      // Небольшая пауза между запросами
      if (i < files.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    // Сохраняем результаты
    const resultData = {
      timestamp: new Date().toISOString(),
      folderId: FOLDER_ID,
      totalFiles: files.length,
      successful: successCount,
      failed: errorCount,
      results: results
    };
    
    require('fs').writeFileSync('direct-upload-results.json', JSON.stringify(resultData, null, 2));
    
    console.log('\n🎉 ЗАГРУЗКА ЗАВЕРШЕНА!');
    console.log('=' .repeat(60));
    console.log(`✅ Успешно загружено: ${successCount}`);
    console.log(`❌ Ошибок: ${errorCount}`);
    console.log(`📚 Всего обработано: ${files.length}`);
    console.log(`📁 Результаты сохранены: direct-upload-results.json`);
    
    // Показываем примеры успешных загрузок
    const successful = results.filter(r => r.success);
    if (successful.length > 0) {
      console.log(`\n📋 Примеры успешных загрузок:`);
      successful.slice(0, 5).forEach(result => {
        console.log(`   ${result.filename} → ${result.cloudinaryUrl}`);
      });
    }
    
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
