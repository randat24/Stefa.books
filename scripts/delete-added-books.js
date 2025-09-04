#!/usr/bin/env node

/**
 * Скрипт для удаления книг, которые мы добавили
 * Удаляет книги с кодами PL-001, DL-001, KP-001 и т.д.
 */

const fs = require('fs');
const path = require('path');

// Загружаем переменные окружения
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Ошибка: Отсутствуют переменные окружения Supabase');
  process.exit(1);
}

// Коды книг, которые мы добавили
const addedBookCodes = [
  'PL-001', 'PL-002', 'PL-003', 'NP-001', 'KL-001', 'DL-001', 'DL-002', 
  'KP-001', 'DL-003', 'KP-002', 'KP-003', 'DL-004', 'DL-005', 'IL-001', 
  'DL-006', 'DL-007', 'KL-002', 'DL-008', 'NP-002', 'PD-001', 'DL-009'
];

async function deleteBook(code) {
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/books?code=eq.${encodeURIComponent(code)}`, {
      method: 'DELETE',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'return=minimal'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function getBooksCount() {
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/books?select=*&limit=1`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'count=exact'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const count = response.headers.get('content-range');
    return count ? parseInt(count.split('/')[1]) : 0;
  } catch (error) {
    console.error('❌ Ошибка при подсчете книг:', error.message);
    return 0;
  }
}

async function getBooksByCodes(codes) {
  try {
    const codesParam = codes.map(code => `code.eq.${encodeURIComponent(code)}`).join(',');
    const response = await fetch(`${supabaseUrl}/rest/v1/books?select=code,title,author&or=(${codesParam})`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const books = await response.json();
    return books;
  } catch (error) {
    console.error('❌ Ошибка при получении книг:', error.message);
    return [];
  }
}

async function deleteBooks() {
  console.log('🗑️  Начинаем удаление добавленных книг...\n');
  
  // Сначала проверим, какие книги есть в базе
  console.log('🔍 Проверяем какие книги нужно удалить...');
  const existingBooks = await getBooksByCodes(addedBookCodes);
  
  if (existingBooks.length === 0) {
    console.log('✅ Книги с нашими кодами не найдены в базе данных');
    return { successCount: 0, errorCount: 0 };
  }
  
  console.log(`📚 Найдено книг для удаления: ${existingBooks.length}\n`);
  
  // Показываем список книг, которые будут удалены
  existingBooks.forEach(book => {
    console.log(`  ${book.code} - ${book.title} (${book.author})`);
  });
  
  console.log('\n🚀 Начинаем удаление...\n');
  
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < existingBooks.length; i++) {
    const book = existingBooks[i];
    
    try {
      console.log(`🗑️  Удаляем книгу ${i + 1}/${existingBooks.length}: "${book.title}" (${book.code})`);
      
      const result = await deleteBook(book.code);
      
      if (result.success) {
        console.log(`✅ Книга "${book.title}" успешно удалена`);
        successCount++;
      } else {
        console.error(`❌ Ошибка при удалении книги "${book.title}":`, result.error);
        errorCount++;
      }
      
      // Небольшая пауза между удалениями
      await new Promise(resolve => setTimeout(resolve, 200));
      
    } catch (err) {
      console.error(`❌ Критическая ошибка при удалении книги "${book.title}":`, err.message);
      errorCount++;
    }
  }
  
  console.log('\n📊 Результат удаления:');
  console.log(`✅ Успешно удалено: ${successCount}`);
  console.log(`❌ Ошибок: ${errorCount}`);
  
  return { successCount, errorCount };
}

async function main() {
  console.log('🗑️  Скрипт удаления добавленных книг из Stefa.Books\n');
  
  // Получаем текущее количество книг
  const initialCount = await getBooksCount();
  console.log(`📚 Текущее количество книг: ${initialCount}\n`);
  
  // Удаляем книги
  const result = await deleteBooks();
  
  // Получаем финальное количество книг
  const finalCount = await getBooksCount();
  const deletedBooks = initialCount - finalCount;
  
  console.log('\n🎉 Итоговый результат:');
  console.log(`📚 Книг было: ${initialCount}`);
  console.log(`📚 Книг стало: ${finalCount}`);
  console.log(`➖ Удалено: ${deletedBooks}`);
  console.log(`✅ Успешных операций: ${result.successCount}`);
  console.log(`❌ Ошибок: ${result.errorCount}`);
  
  if (result.errorCount === 0) {
    console.log('\n🎊 Все добавленные книги успешно удалены!');
    console.log(`📊 Осталось книг: ${finalCount} (должно быть ~105 как в Google Sheets)`);
  } else {
    console.log('\n⚠️  Некоторые книги не удалось удалить. Проверьте логи выше.');
  }
}

// Запускаем скрипт
if (require.main === module) {
  main().catch(error => {
    console.error('💥 Критическая ошибка:', error);
    process.exit(1);
  });
}

module.exports = { deleteBooks, getBooksCount, getBooksByCodes };
