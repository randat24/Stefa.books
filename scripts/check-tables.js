const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkTables() {
  console.log('🔍 Проверяем существующие таблицы...');
  
  try {
    const { data, error } = await supabase.rpc('exec_sql', {
      sql_query: `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name;
      `
    });
    
    if (error) {
      console.error('❌ Ошибка при получении списка таблиц:', error);
    } else {
      console.log('📋 Существующие таблицы:');
      console.log(data);
    }
    
    // Проверим структуру таблицы books
    console.log('\n🔍 Структура таблицы books:');
    const { data: booksStructure, error: booksError } = await supabase.rpc('exec_sql', {
      sql_query: `
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'books' 
        ORDER BY ordinal_position;
      `
    });
    
    if (booksError) {
      console.error('❌ Ошибка при получении структуры books:', booksError);
    } else {
      console.log('📚 Структура таблицы books:');
      if (Array.isArray(booksStructure)) {
        booksStructure.forEach(col => {
          console.log(`   - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
        });
      } else {
        console.log('   Результат:', booksStructure);
      }
    }
    
  } catch (error) {
    console.error('❌ Ошибка:', error);
  }
}

checkTables();
