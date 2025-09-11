#!/usr/bin/env node

/**
 * Скрипт для применения исправлений таблицы users
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Загружаем переменные окружения
function loadEnv() {
  const envPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    lines.forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) {
        process.env[key.trim()] = value.trim();
      }
    });
  }
}

loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Отсутствуют переменные окружения Supabase');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyUsersFix() {
  console.log('🔧 Применение исправлений таблицы users...\n');

  try {
    // 1. Добавить колонку role
    console.log('1. Добавление колонки role...');
    const { error: roleError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator'));
      `
    });

    if (roleError) {
      console.log('⚠️  Колонка role уже существует или ошибка:', roleError.message);
    } else {
      console.log('✅ Колонка role добавлена');
    }

    // 2. Создать индекс для ролей
    console.log('\n2. Создание индекса для ролей...');
    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql: 'CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);'
    });

    if (indexError) {
      console.log('⚠️  Индекс уже существует или ошибка:', indexError.message);
    } else {
      console.log('✅ Индекс для ролей создан');
    }

    // 3. Обновить админов
    console.log('\n3. Обновление админ пользователей...');
    const { error: adminError } = await supabase
      .from('users')
      .update({ role: 'admin' })
      .in('email', ['admin@stefa-books.com.ua', 'admin@stefabooks.com.ua']);

    if (adminError) {
      console.log('⚠️  Ошибка обновления админов:', adminError.message);
    } else {
      console.log('✅ Админ пользователи обновлены');
    }

    // 4. Установить роль user для остальных
    console.log('\n4. Установка роли user для остальных...');
    const { error: userError } = await supabase
      .from('users')
      .update({ role: 'user' })
      .is('role', null);

    if (userError) {
      console.log('⚠️  Ошибка установки роли user:', userError.message);
    } else {
      console.log('✅ Роль user установлена для остальных');
    }

    // 5. Проверить результат
    console.log('\n5. Проверка результата...');
    const { data: users, error: checkError } = await supabase
      .from('users')
      .select('id, name, email, role, subscription_type, status')
      .order('created_at', { ascending: false })
      .limit(5);

    if (checkError) {
      console.error('❌ Ошибка проверки:', checkError);
    } else {
      console.log('📊 Пользователи после исправления:');
      users.forEach((user, index) => {
        console.log(`  ${index + 1}. ${user.name} (${user.email}) - роль: ${user.role || 'не указана'}`);
      });
    }

  } catch (error) {
    console.error('❌ Общая ошибка:', error);
  }
}

// Запуск исправления
applyUsersFix().then(() => {
  console.log('\n✅ Исправления применены');
  process.exit(0);
}).catch(error => {
  console.error('❌ Критическая ошибка:', error);
  process.exit(1);
});
