#!/usr/bin/env node

/**
 * Скрипт для проверки существующих книг в базе данных
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

async function getBooks() {
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/books?select=code,title,author,category&order=code`, {
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

async function main() {
  console.log('📚 Проверка существующих книг в базе данных\n');
  
  const count = await getBooksCount();
  console.log(`📊 Общее количество книг: ${count}\n`);
  
  const books = await getBooks();
  
  if (books.length === 0) {
    console.log('❌ Не удалось получить список книг');
    return;
  }
  
  console.log('📖 Список книг в базе данных:\n');
  
  // Группируем по категориям
  const booksByCategory = {};
  books.forEach(book => {
    if (!booksByCategory[book.category]) {
      booksByCategory[book.category] = [];
    }
    booksByCategory[book.category].push(book);
  });
  
  // Выводим по категориям
  Object.keys(booksByCategory).sort().forEach(category => {
    console.log(`\n📂 ${category} (${booksByCategory[category].length} книг):`);
    booksByCategory[category].forEach(book => {
      console.log(`  ${book.code} - ${book.title} (${book.author})`);
    });
  });
  
  console.log(`\n📊 Итого: ${books.length} книг в ${Object.keys(booksByCategory).length} категориях`);
  
  // Проверяем коды из нашего списка
  const ourCodes = [
    'PL-001', 'PL-002', 'PL-003', 'NP-001', 'KL-001', 'DL-001', 'DL-002', 
    'KP-001', 'DL-003', 'KP-002', 'KP-003', 'DL-004', 'DL-005', 'IL-001', 
    'DL-006', 'DL-007', 'KL-002', 'DL-008', 'NP-002', 'PD-001', 'DL-009'
  ];
  
  console.log('\n🔍 Проверка наших кодов:');
  const existingCodes = books.map(book => book.code);
  const missingCodes = ourCodes.filter(code => !existingCodes.includes(code));
  const existingOurCodes = ourCodes.filter(code => existingCodes.includes(code));
  
  console.log(`✅ Найдено наших кодов: ${existingOurCodes.length}/${ourCodes.length}`);
  if (existingOurCodes.length > 0) {
    console.log('   Существующие:', existingOurCodes.join(', '));
  }
  
  if (missingCodes.length > 0) {
    console.log(`❌ Отсутствующие коды: ${missingCodes.length}`);
    console.log('   Отсутствующие:', missingCodes.join(', '));
  } else {
    console.log('🎉 Все наши книги уже есть в базе данных!');
  }
}

// Запускаем скрипт
if (require.main === module) {
  main().catch(error => {
    console.error('💥 Критическая ошибка:', error);
    process.exit(1);
  });
}

module.exports = { getBooks, getBooksCount };
