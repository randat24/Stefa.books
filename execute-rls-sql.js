const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Загружаем переменные окружения
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Переменные окружения не найдены!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function executeRLSSQL() {
  try {
    console.log('🔧 Выполняем SQL для включения RLS...');
    
    // Читаем SQL файл
    const sqlContent = fs.readFileSync('./enable-rls-secure.sql', 'utf8');
    const sqlStatements = sqlContent.split(';').filter(stmt => stmt.trim());
    
    for (const statement of sqlStatements) {
      const trimmedStatement = statement.trim();
      if (trimmedStatement) {
        console.log(`\n📝 Выполняем: ${trimmedStatement.substring(0, 50)}...`);
        
        const { data, error } = await supabase.rpc('exec_sql', {
          sql: trimmedStatement
        });
        
        if (error) {
          console.error('❌ Ошибка:', error.message);
        } else {
          console.log('✅ Успешно');
          if (data) {
            console.log('📊 Результат:', data);
          }
        }
      }
    }
    
    console.log('\n🎉 RLS настроен!');
    
    // Тестируем доступ
    console.log('\n🧪 Тестируем доступ...');
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'admin@stefabooks.com.ua');
    
    if (testError) {
      console.error('❌ Ошибка тестирования:', testError.message);
    } else {
      console.log('✅ Тест успешен:', testData);
    }
    
  } catch (error) {
    console.error('❌ Ошибка:', error);
  }
}

executeRLSSQL();
