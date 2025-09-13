const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Загружаем переменные окружения
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Отсутствуют переменные окружения SUPABASE_URL или SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
  try {
    console.log('🚀 Применяем миграцию subscription_requests...');
    
    // Читаем SQL файл
    const sqlPath = path.join(__dirname, 'supabase/migrations/20250912214333_fix_subscription_requests_table.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // Применяем SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql: sqlContent });
    
    if (error) {
      console.error('❌ Ошибка при применении миграции:', error);
      return false;
    }
    
    console.log('✅ Миграция успешно применена!');
    return true;
  } catch (err) {
    console.error('❌ Ошибка:', err.message);
    return false;
  }
}

// Проверяем, есть ли функция exec_sql
async function checkExecSqlFunction() {
  try {
    const { data, error } = await supabase
      .from('pg_proc')
      .select('proname')
      .eq('proname', 'exec_sql')
      .limit(1);
    
    if (error) {
      console.log('⚠️  Функция exec_sql не найдена, попробуем другой подход...');
      return false;
    }
    
    return data && data.length > 0;
  } catch (err) {
    console.log('⚠️  Не удалось проверить функцию exec_sql:', err.message);
    return false;
  }
}

// Альтернативный способ - через прямой SQL запрос
async function applyMigrationDirect() {
  try {
    console.log('🚀 Применяем миграцию через прямой SQL запрос...');
    
    // Читаем SQL файл
    const sqlPath = path.join(__dirname, 'supabase/migrations/20250912214333_fix_subscription_requests_table.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // Разбиваем SQL на отдельные запросы
    const queries = sqlContent
      .split(';')
      .map(q => q.trim())
      .filter(q => q.length > 0 && !q.startsWith('--'));
    
    for (const query of queries) {
      if (query.trim()) {
        console.log(`📝 Выполняем запрос: ${query.substring(0, 50)}...`);
        
        const { data, error } = await supabase
          .from('_sql')
          .select('*')
          .limit(1);
        
        if (error) {
          console.error('❌ Ошибка при выполнении запроса:', error);
          return false;
        }
      }
    }
    
    console.log('✅ Миграция успешно применена!');
    return true;
  } catch (err) {
    console.error('❌ Ошибка:', err.message);
    return false;
  }
}

async function main() {
  console.log('🔍 Проверяем доступ к Supabase...');
  
  // Проверяем подключение
  const { data: testData, error: testError } = await supabase
    .from('books')
    .select('id')
    .limit(1);
  
  if (testError) {
    console.error('❌ Не удалось подключиться к Supabase:', testError.message);
    process.exit(1);
  }
  
  console.log('✅ Подключение к Supabase успешно!');
  
  // Пробуем применить миграцию
  const success = await applyMigration();
  
  if (!success) {
    console.log('🔄 Пробуем альтернативный способ...');
    await applyMigrationDirect();
  }
}

main().catch(console.error);
