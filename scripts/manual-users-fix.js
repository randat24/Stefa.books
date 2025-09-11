const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Загружаем переменные окружения
const envPath = '.env.local';
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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Отсутствуют переменные окружения Supabase');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAndFixUsersTable() {
  try {
    console.log('🔍 Проверка структуры таблицы users...');
    
    // Проверить колонки
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_schema', 'public')
      .eq('table_name', 'users')
      .order('ordinal_position');

    if (columnsError) {
      console.error('❌ Ошибка при проверке колонок:', columnsError);
      return;
    }

    console.log('📋 Текущие колонки таблицы users:');
    columns.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type}`);
    });

    // Проверить наличие необходимых колонок
    const hasEmailColumn = columns.some(col => col.column_name === 'email');
    const hasRoleColumn = columns.some(col => col.column_name === 'role');
    const hasSubscriptionTypeColumn = columns.some(col => col.column_name === 'subscription_type');
    const hasStatusColumn = columns.some(col => col.column_name === 'status');
    const hasNameColumn = columns.some(col => col.column_name === 'name');
    const hasPhoneColumn = columns.some(col => col.column_name === 'phone');

    console.log('\n📊 Статус колонок:');
    console.log(`  - email: ${hasEmailColumn ? '✅' : '❌'}`);
    console.log(`  - role: ${hasRoleColumn ? '✅' : '❌'}`);
    console.log(`  - subscription_type: ${hasSubscriptionTypeColumn ? '✅' : '❌'}`);
    console.log(`  - status: ${hasStatusColumn ? '✅' : '❌'}`);
    console.log(`  - name: ${hasNameColumn ? '✅' : '❌'}`);
    console.log(`  - phone: ${hasPhoneColumn ? '✅' : '❌'}`);

    if (!hasEmailColumn || !hasRoleColumn || !hasSubscriptionTypeColumn || !hasStatusColumn || !hasNameColumn || !hasPhoneColumn) {
      console.log('\n⚠️  Некоторые колонки отсутствуют в таблице users.');
      console.log('📝 Рекомендации:');
      console.log('1. Выполните SQL в Supabase Dashboard > SQL Editor:');
      console.log('   - Откройте файл scripts/simple-users-fix.sql');
      console.log('   - Скопируйте содержимое');
      console.log('   - Вставьте в SQL Editor и выполните');
      console.log('\n2. Или используйте fallback-login API:');
      console.log('   - Измените AuthContext.tsx чтобы использовать /api/auth/fallback-login');
      console.log('   - Этот API работает только с user_profiles таблицей');
    } else {
      console.log('\n✅ Все необходимые колонки присутствуют в таблице users');
      
      // Проверить данные
      console.log('\n📊 Данные в таблице users:');
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('*')
        .limit(5);

      if (usersError) {
        console.error('❌ Ошибка при получении данных:', usersError);
      } else {
        if (users.length === 0) {
          console.log('  - Таблица users пуста');
        } else {
          users.forEach(user => {
            console.log(`  - ${user.name || 'N/A'} (${user.email || 'N/A'}) - ${user.role || 'N/A'}`);
          });
        }
      }
    }

  } catch (error) {
    console.error('❌ Общая ошибка:', error);
  }
}

checkAndFixUsersTable();
