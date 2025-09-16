const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testSQLExecution() {
  console.log('🧪 Тестируем выполнение SQL через Supabase...');
  
  try {
    // Простой тест - создаем временную таблицу
    const { data, error } = await supabase.rpc('exec_sql', {
      sql_query: 'SELECT 1 as test'
    });
    
    if (error) {
      console.error('❌ Ошибка при выполнении SQL:', error);
      console.log('Попробуем другой подход...');
      
      // Попробуем через прямой запрос
      const { data: directData, error: directError } = await supabase
        .from('books')
        .select('id, title, author')
        .limit(1);
      
      if (directError) {
        console.error('❌ Ошибка при прямом запросе:', directError);
      } else {
        console.log('✅ Прямой запрос работает:', directData);
      }
    } else {
      console.log('✅ SQL выполнение работает:', data);
    }
    
  } catch (error) {
    console.error('❌ Ошибка:', error);
  }
}

testSQLExecution();
