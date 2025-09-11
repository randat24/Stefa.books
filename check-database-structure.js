const { createClient } = require('@supabase/supabase-js');

// Загружаем переменные окружения
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Переменные окружения не найдены!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkDatabaseStructure() {
  try {
    console.log('🔍 Проверяем структуру базы данных...');
    
    // Проверяем таблицу users
    console.log('\n📋 Проверяем таблицу users:');
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (usersError) {
      console.error('❌ Ошибка доступа к таблице users:', usersError.message);
    } else {
      console.log('✅ Таблица users доступна');
      console.log('📊 Количество записей:', usersData.length);
      if (usersData.length > 0) {
        console.log('📝 Пример записи:', usersData[0]);
      }
    }
    
    // Проверяем таблицу user_profiles
    console.log('\n📋 Проверяем таблицу user_profiles:');
    const { data: profilesData, error: profilesError } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(1);
    
    if (profilesError) {
      console.error('❌ Ошибка доступа к таблице user_profiles:', profilesError.message);
    } else {
      console.log('✅ Таблица user_profiles доступна');
      console.log('📊 Количество записей:', profilesData.length);
      if (profilesData.length > 0) {
        console.log('📝 Пример записи:', profilesData[0]);
      }
    }
    
    // Проверяем существующего пользователя
    console.log('\n👤 Проверяем пользователя admin@stefabooks.com.ua:');
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'admin@stefabooks.com.ua');
    
    if (userError) {
      console.error('❌ Ошибка поиска пользователя:', userError.message);
    } else {
      console.log('📊 Найдено записей:', userData.length);
      if (userData.length > 0) {
        console.log('📝 Данные пользователя:', userData[0]);
      }
    }
    
  } catch (error) {
    console.error('❌ Ошибка:', error);
  }
}

checkDatabaseStructure();