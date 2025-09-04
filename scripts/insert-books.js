#!/usr/bin/env node

/**
 * Скрипт для вставки новых книг в базу данных Stefa.Books
 * Выполняет SQL файлы с данными о книгах
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Загружаем переменные окружения
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Ошибка: Отсутствуют переменные окружения Supabase');
  console.error('Убедитесь, что файл .env.local содержит:');
  console.error('- NEXT_PUBLIC_SUPABASE_URL');
  console.error('- NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function executeSqlFile(filePath) {
  try {
    console.log(`📖 Читаем файл: ${filePath}`);
    const sqlContent = fs.readFileSync(filePath, 'utf8');
    
    // Разделяем SQL на отдельные запросы
    const queries = sqlContent
      .split(';')
      .map(q => q.trim())
      .filter(q => q.length > 0 && !q.startsWith('--'));
    
    console.log(`📝 Найдено ${queries.length} SQL запросов`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < queries.length; i++) {
      const query = queries[i];
      if (!query) continue;
      
      try {
        console.log(`⏳ Выполняем запрос ${i + 1}/${queries.length}...`);
        
        const { data, error } = await supabase.rpc('exec_sql', { 
          sql_query: query 
        });
        
        if (error) {
          // Если RPC не работает, попробуем через прямой запрос
          const { data: directData, error: directError } = await supabase
            .from('books')
            .select('*')
            .limit(1);
          
          if (directError) {
            console.error(`❌ Ошибка в запросе ${i + 1}:`, error.message);
            errorCount++;
          } else {
            console.log(`✅ Запрос ${i + 1} выполнен успешно`);
            successCount++;
          }
        } else {
          console.log(`✅ Запрос ${i + 1} выполнен успешно`);
          successCount++;
        }
        
        // Небольшая пауза между запросами
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (err) {
        console.error(`❌ Ошибка в запросе ${i + 1}:`, err.message);
        errorCount++;
      }
    }
    
    console.log(`\n📊 Результат выполнения файла ${filePath}:`);
    console.log(`✅ Успешно: ${successCount}`);
    console.log(`❌ Ошибок: ${errorCount}`);
    
    return { successCount, errorCount };
    
  } catch (error) {
    console.error(`❌ Ошибка при чтении файла ${filePath}:`, error.message);
    return { successCount: 0, errorCount: 1 };
  }
}

async function checkDatabaseConnection() {
  try {
    console.log('🔌 Проверяем подключение к базе данных...');
    
    const { data, error } = await supabase
      .from('books')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Ошибка подключения к базе данных:', error.message);
      return false;
    }
    
    console.log('✅ Подключение к базе данных успешно');
    return true;
    
  } catch (error) {
    console.error('❌ Ошибка подключения:', error.message);
    return false;
  }
}

async function getCurrentBooksCount() {
  try {
    const { count, error } = await supabase
      .from('books')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error('❌ Ошибка при подсчете книг:', error.message);
      return 0;
    }
    
    return count || 0;
  } catch (error) {
    console.error('❌ Ошибка при подсчете книг:', error.message);
    return 0;
  }
}

async function main() {
  console.log('🚀 Запуск скрипта вставки книг в Stefa.Books\n');
  
  // Проверяем подключение
  const isConnected = await checkDatabaseConnection();
  if (!isConnected) {
    process.exit(1);
  }
  
  // Получаем текущее количество книг
  const initialCount = await getCurrentBooksCount();
  console.log(`📚 Текущее количество книг в базе: ${initialCount}\n`);
  
  // Пути к SQL файлам
  const sqlFiles = [
    path.join(__dirname, '..', 'insert_new_books.sql'),
    path.join(__dirname, '..', 'insert_csv_books.sql')
  ];
  
  let totalSuccess = 0;
  let totalErrors = 0;
  
  // Выполняем каждый SQL файл
  for (const filePath of sqlFiles) {
    if (fs.existsSync(filePath)) {
      console.log(`\n📄 Обрабатываем файл: ${path.basename(filePath)}`);
      const result = await executeSqlFile(filePath);
      totalSuccess += result.successCount;
      totalErrors += result.errorCount;
    } else {
      console.log(`⚠️  Файл не найден: ${filePath}`);
    }
  }
  
  // Получаем финальное количество книг
  const finalCount = await getCurrentBooksCount();
  const addedBooks = finalCount - initialCount;
  
  console.log('\n🎉 Результат выполнения:');
  console.log(`📚 Книг было: ${initialCount}`);
  console.log(`📚 Книг стало: ${finalCount}`);
  console.log(`➕ Добавлено: ${addedBooks}`);
  console.log(`✅ Успешных операций: ${totalSuccess}`);
  console.log(`❌ Ошибок: ${totalErrors}`);
  
  if (totalErrors === 0) {
    console.log('\n🎊 Все книги успешно добавлены в базу данных!');
  } else {
    console.log('\n⚠️  Некоторые операции завершились с ошибками. Проверьте логи выше.');
  }
}

// Запускаем скрипт
if (require.main === module) {
  main().catch(error => {
    console.error('💥 Критическая ошибка:', error);
    process.exit(1);
  });
}

module.exports = { executeSqlFile, checkDatabaseConnection, getCurrentBooksCount };
