#!/usr/bin/env node

/**
 * Скрипт для проверки и исправления структуры таблицы users
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Загружаем переменные окружения из .env.local
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

async function checkUsersTable() {
  console.log('🔍 Проверка структуры таблицы users...\n');

  try {
    // 1. Проверить, существует ли таблица users
    console.log('1. Проверка существования таблицы users...');
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'users');

    if (tablesError) {
      console.error('❌ Ошибка при проверке таблиц:', tablesError);
      return;
    }

    if (tables.length === 0) {
      console.error('❌ Таблица users не найдена!');
      return;
    }

    console.log('✅ Таблица users существует');

    // 2. Проверить колонки таблицы users
    console.log('\n2. Проверка колонок таблицы users...');
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_schema', 'public')
      .eq('table_name', 'users')
      .order('ordinal_position');

    if (columnsError) {
      console.error('❌ Ошибка при проверке колонок:', columnsError);
      return;
    }

    console.log('📋 Колонки таблицы users:');
    columns.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'} ${col.column_default ? `DEFAULT ${col.column_default}` : ''}`);
    });

    // 3. Проверить наличие колонки role
    const hasRoleColumn = columns.some(col => col.column_name === 'role');
    console.log(`\n3. Колонка 'role': ${hasRoleColumn ? '✅ Найдена' : '❌ Отсутствует'}`);

    // 4. Проверить наличие колонки email
    const hasEmailColumn = columns.some(col => col.column_name === 'email');
    console.log(`4. Колонка 'email': ${hasEmailColumn ? '✅ Найдена' : '❌ Отсутствует'}`);

    // 5. Проверить данные в таблице
    console.log('\n5. Проверка данных в таблице users...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(5);

    if (usersError) {
      console.error('❌ Ошибка при получении данных:', usersError);
      return;
    }

    console.log(`📊 Найдено ${users.length} пользователей (показаны первые 5):`);
    users.forEach((user, index) => {
      console.log(`  ${index + 1}. ${user.name} (${user.email}) - роль: ${user.role || 'не указана'}`);
    });

    // 6. Если нет колонки role, предложить добавить
    if (!hasRoleColumn) {
      console.log('\n🔧 Рекомендации:');
      console.log('1. Добавить колонку role в таблицу users:');
      console.log('   ALTER TABLE users ADD COLUMN role TEXT DEFAULT \'user\' CHECK (role IN (\'user\', \'admin\', \'moderator\'));');
      console.log('2. Создать индекс для ролей:');
      console.log('   CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);');
    }

    // 7. Проверить, есть ли админ пользователь
    console.log('\n6. Проверка админ пользователей...');
    const { data: adminUsers, error: adminError } = await supabase
      .from('users')
      .select('*')
      .or('email.eq.admin@stefa-books.com.ua,email.eq.admin@stefabooks.com.ua');

    if (adminError) {
      console.error('❌ Ошибка при поиске админов:', adminError);
    } else {
      console.log(`👑 Найдено ${adminUsers.length} админ пользователей:`);
      adminUsers.forEach(admin => {
        console.log(`  - ${admin.name} (${admin.email}) - роль: ${admin.role || 'не указана'}`);
      });
    }

  } catch (error) {
    console.error('❌ Общая ошибка:', error);
  }
}

// Запуск проверки
checkUsersTable().then(() => {
  console.log('\n✅ Проверка завершена');
  process.exit(0);
}).catch(error => {
  console.error('❌ Критическая ошибка:', error);
  process.exit(1);
});
