#!/usr/bin/env node

/**
 * Проверка подключения базы данных к сайту через Supabase
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Загружаем переменные окружения
config({ path: '.env.local' });

// Конфигурация
const CONFIG = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
};

// Инициализация клиентов
const supabaseAnon = createClient(CONFIG.supabaseUrl, CONFIG.supabaseAnonKey);
const supabaseService = createClient(CONFIG.supabaseUrl, CONFIG.supabaseServiceKey);

// Функция для проверки подключения
async function checkConnection() {
  try {
    console.log('🔍 Проверка подключения к базе данных...');
    console.log(`📊 Supabase URL: ${CONFIG.supabaseUrl}`);
    console.log(`🔑 Anon Key: ${CONFIG.supabaseAnonKey ? '✅ Установлен' : '❌ Отсутствует'}`);
    console.log(`🔑 Service Key: ${CONFIG.supabaseServiceKey ? '✅ Установлен' : '❌ Отсутствует'}`);
    
    // Проверяем подключение через anon key
    const { error: anonError } = await supabaseAnon
      .from('books')
      .select('count')
      .limit(1);
    
    if (anonError) {
      console.error('❌ Ошибка подключения через anon key:', anonError.message);
      return false;
    }
    
    console.log('✅ Подключение через anon key: OK');
    
    // Проверяем подключение через service key
    const { error: serviceError } = await supabaseService
      .from('books')
      .select('count')
      .limit(1);
    
    if (serviceError) {
      console.error('❌ Ошибка подключения через service key:', serviceError.message);
      return false;
    }
    
    console.log('✅ Подключение через service key: OK');
    return true;
    
  } catch (error) {
    console.error('❌ Критическая ошибка подключения:', error.message);
    return false;
  }
}

// Функция для проверки структуры базы данных
async function checkDatabaseStructure() {
  try {
    console.log('\n📋 Проверка структуры базы данных...');
    
    // Проверяем таблицу books
    const { error: booksError } = await supabaseService
      .from('books')
      .select('*')
      .limit(1);
    
    if (booksError) {
      console.error('❌ Ошибка доступа к таблице books:', booksError.message);
    } else {
      console.log('✅ Таблица books: OK');
    }
    
    // Проверяем таблицу categories
    const { error: categoriesError } = await supabaseService
      .from('categories')
      .select('*')
      .limit(1);
    
    if (categoriesError) {
      console.error('❌ Ошибка доступа к таблице categories:', categoriesError.message);
    } else {
      console.log('✅ Таблица categories: OK');
    }
    
    // Проверяем таблицу users
    const { error: usersError } = await supabaseService
      .from('users')
      .select('*')
      .limit(1);
    
    if (usersError) {
      console.error('❌ Ошибка доступа к таблице users:', usersError.message);
    } else {
      console.log('✅ Таблица users: OK');
    }
    
  } catch (error) {
    console.error('❌ Ошибка проверки структуры:', error.message);
  }
}

// Функция для проверки данных
async function checkData() {
  try {
    console.log('\n📊 Проверка данных в базе...');
    
    // Проверяем количество книг
    const { count: booksCount, error: booksCountError } = await supabaseService
      .from('books')
      .select('*', { count: 'exact', head: true });
    
    if (booksCountError) {
      console.error('❌ Ошибка подсчета книг:', booksCountError.message);
    } else {
      console.log(`📚 Количество книг: ${booksCount}`);
    }
    
    // Проверяем доступные книги
    const { count: availableBooksCount, error: availableBooksError } = await supabaseService
      .from('books')
      .select('*', { count: 'exact', head: true })
      .eq('available', true);
    
    if (availableBooksError) {
      console.error('❌ Ошибка подсчета доступных книг:', availableBooksError.message);
    } else {
      console.log(`✅ Доступных книг: ${availableBooksCount}`);
    }
    
    // Проверяем категории
    const { count: categoriesCount, error: categoriesCountError } = await supabaseService
      .from('categories')
      .select('*', { count: 'exact', head: true });
    
    if (categoriesCountError) {
      console.error('❌ Ошибка подсчета категорий:', categoriesCountError.message);
    } else {
      console.log(`📂 Количество категорий: ${categoriesCount}`);
    }
    
    // Проверяем пользователей
    const { count: usersCount, error: usersCountError } = await supabaseService
      .from('users')
      .select('*', { count: 'exact', head: true });
    
    if (usersCountError) {
      console.error('❌ Ошибка подсчета пользователей:', usersCountError.message);
    } else {
      console.log(`👥 Количество пользователей: ${usersCount}`);
    }
    
  } catch (error) {
    console.error('❌ Ошибка проверки данных:', error.message);
  }
}

// Функция для проверки последних книг
async function checkRecentBooks() {
  try {
    console.log('\n📖 Последние загруженные книги:');
    
    const { data: recentBooks, error: recentBooksError } = await supabaseService
      .from('books')
      .select('title, author, code, available, created_at')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (recentBooksError) {
      console.error('❌ Ошибка получения последних книг:', recentBooksError.message);
    } else {
      recentBooks.forEach((book, index) => {
        console.log(`   ${index + 1}. ${book.title} - ${book.author} (${book.code})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Ошибка проверки последних книг:', error.message);
  }
}

// Функция для проверки RLS (Row Level Security)
async function checkRLS() {
  try {
    console.log('\n🔒 Проверка Row Level Security...');
    
    // Пытаемся получить данные через anon key (должно работать для публичных данных)
    const { error: publicBooksError } = await supabaseAnon
      .from('books')
      .select('title, author, available')
      .limit(1);
    
    if (publicBooksError) {
      console.error('❌ RLS блокирует доступ к книгам через anon key:', publicBooksError.message);
    } else {
      console.log('✅ RLS настроен правильно - публичные данные доступны');
    }
    
  } catch (error) {
    console.error('❌ Ошибка проверки RLS:', error.message);
  }
}

// Основная функция
async function main() {
  try {
    console.log('🚀 Проверка подключения базы данных к сайту...\n');
    
    // Проверяем переменные окружения
    if (!CONFIG.supabaseUrl || !CONFIG.supabaseAnonKey) {
      console.error('❌ Отсутствуют переменные окружения:');
      console.error('   NEXT_PUBLIC_SUPABASE_URL:', CONFIG.supabaseUrl ? '✅' : '❌');
      console.error('   NEXT_PUBLIC_SUPABASE_ANON_KEY:', CONFIG.supabaseAnonKey ? '✅' : '❌');
      return;
    }
    
    // Выполняем проверки
    const connectionOk = await checkConnection();
    if (!connectionOk) {
      console.error('❌ Подключение к базе данных не работает!');
      return;
    }
    
    await checkDatabaseStructure();
    await checkData();
    await checkRecentBooks();
    await checkRLS();
    
    console.log('\n🎉 Проверка завершена!');
    console.log('📊 Если все проверки прошли успешно, база данных правильно подключена к сайту.');
    
  } catch (error) {
    console.error('💥 Критическая ошибка:', error.message);
    process.exit(1);
  }
}

// Запуск скрипта
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export {
  checkConnection,
  checkDatabaseStructure,
  checkData,
  checkRecentBooks,
  checkRLS
};
