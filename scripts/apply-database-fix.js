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

async function applyDatabaseFix() {
  try {
    console.log('🔧 Применение исправления структуры базы данных...');
    
    // Читаем SQL файл
    const sqlContent = fs.readFileSync('scripts/fix-database-structure.sql', 'utf8');
    
    // Выполняем SQL
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: sqlContent
    });
    
    if (error) {
      console.error('❌ Ошибка выполнения SQL:', error);
      return;
    }
    
    console.log('✅ Исправление структуры базы данных применено успешно');
    
    // Проверяем результат
    console.log('\n🔍 Проверка структуры таблицы users...');
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

    console.log('📋 Колонки таблицы users:');
    columns.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type}`);
    });

    // Проверяем данные
    console.log('\n📊 Данные в таблице users:');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, name, email, role, subscription_type, status')
      .limit(5);

    if (usersError) {
      console.error('❌ Ошибка при получении данных:', usersError);
    } else {
      users.forEach(user => {
        console.log(`  - ${user.name} (${user.email}) - ${user.role}`);
      });
    }

  } catch (error) {
    console.error('❌ Общая ошибка:', error);
  }
}

applyDatabaseFix();
