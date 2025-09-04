#!/usr/bin/env node

/**
 * РУЧНОЕ ОБНОВЛЕНИЕ ОБЛОЖЕК В БАЗЕ ДАННЫХ
 * Сопоставляет загруженные обложки с книгами в базе данных
 */

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { createClient } = require('@supabase/supabase-js');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs');
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config({ path: '.env.local' });

// Конфигурация Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Загружает результаты загрузки обложек
 */
function loadUploadResults() {
  try {
    const data = fs.readFileSync('direct-upload-results.json', 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('❌ Ошибка загрузки результатов:', error.message);
    return null;
  }
}

/**
 * Получает все книги из базы данных
 */
async function getAllBooks() {
  try {
    const { data, error } = await supabase
      .from('books')
      .select('id, code, title, cover_url')
      .order('code');
    
    if (error) {
      console.error('❌ Ошибка получения книг:', error.message);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('❌ Ошибка получения книг:', error.message);
    return [];
  }
}

/**
 * Обновляет URL обложки для книги
 */
async function updateBookCover(bookId, newCoverUrl) {
  try {
    const { error } = await supabase
      .from('books')
      .update({ cover_url: newCoverUrl })
      .eq('id', bookId);
    
    if (error) {
      console.error(`❌ Ошибка обновления обложки для книги ${bookId}:`, error.message);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error(`❌ Ошибка обновления обложки для книги ${bookId}:`, error.message);
    return false;
  }
}

/**
 * Создает сопоставление обложек с книгами
 */
function createCoverMapping(uploadResults, books) {
  const mapping = [];
  
  // Создаем мапу книг по коду для быстрого поиска
  const booksByCode = {};
  books.forEach(book => {
    booksByCode[book.code] = book;
  });
  
  // Пытаемся сопоставить обложки с книгами
  uploadResults.results.forEach(result => {
    if (!result.success) return;
    
    const bookCode = result.bookCode;
    const book = booksByCode[bookCode];
    
    if (book) {
      mapping.push({
        bookId: book.id,
        bookCode: book.code,
        bookTitle: book.title,
        filename: result.filename,
        cloudinaryUrl: result.cloudinaryUrl,
        currentCoverUrl: book.cover_url
      });
    } else {
      console.log(`⚠️  Книга с кодом ${bookCode} не найдена в базе данных`);
    }
  });
  
  return mapping;
}

/**
 * Основная функция
 */
async function main() {
  console.log('🚀 ОБНОВЛЕНИЕ ОБЛОЖЕК В БАЗЕ ДАННЫХ');
  console.log('=' .repeat(60));
  
  try {
    // Загружаем результаты загрузки обложек
    console.log('📁 Загружаем результаты загрузки обложек...');
    const uploadResults = loadUploadResults();
    if (!uploadResults) {
      console.error('❌ Не удалось загрузить результаты');
      return;
    }
    
    console.log(`✅ Загружено ${uploadResults.successful} обложек`);
    
    // Получаем все книги из базы данных
    console.log('📚 Получаем книги из базы данных...');
    const books = await getAllBooks();
    console.log(`✅ Найдено ${books.length} книг в базе данных`);
    
    // Создаем сопоставление
    console.log('🔗 Создаем сопоставление обложек с книгами...');
    const mapping = createCoverMapping(uploadResults, books);
    console.log(`✅ Создано ${mapping.length} сопоставлений`);
    
    if (mapping.length === 0) {
      console.log('❌ Не найдено сопоставлений между обложками и книгами');
      return;
    }
    
    // Показываем примеры сопоставлений
    console.log('\n📋 Примеры сопоставлений:');
    mapping.slice(0, 5).forEach(item => {
      console.log(`📖 ${item.bookCode}: ${item.bookTitle}`);
      console.log(`   Файл: ${item.filename}`);
      console.log(`   Новая обложка: ${item.cloudinaryUrl}`);
      console.log(`   Текущая обложка: ${item.currentCoverUrl ? 'Есть' : 'Нет'}`);
      console.log('');
    });
    
    // Обновляем обложки
    console.log('🔄 Обновляем обложки в базе данных...');
    let successCount = 0;
    let errorCount = 0;
    
    for (const item of mapping) {
      console.log(`📖 Обновляем обложку для ${item.bookCode}: ${item.bookTitle}`);
      
      const success = await updateBookCover(item.bookId, item.cloudinaryUrl);
      if (success) {
        console.log(`   ✅ Обложка обновлена`);
        successCount++;
      } else {
        console.log(`   ❌ Ошибка обновления`);
        errorCount++;
      }
      
      // Небольшая пауза между запросами
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Сохраняем результаты
    const resultData = {
      timestamp: new Date().toISOString(),
      totalMappings: mapping.length,
      successful: successCount,
      failed: errorCount,
      mappings: mapping
    };
    
    fs.writeFileSync('cover-update-results.json', JSON.stringify(resultData, null, 2));
    
    console.log('\n🎉 ОБНОВЛЕНИЕ ЗАВЕРШЕНО!');
    console.log('=' .repeat(60));
    console.log(`✅ Успешно обновлено: ${successCount}`);
    console.log(`❌ Ошибок: ${errorCount}`);
    console.log(`📚 Всего сопоставлений: ${mapping.length}`);
    console.log(`📁 Результаты сохранены: cover-update-results.json`);
    
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
