const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createExecSQLFunction() {
  console.log('🔧 Создаем функцию exec_sql...');
  
  try {
    // Создаем функцию exec_sql
    const { data, error } = await supabase.rpc('exec_sql', {
      sql_query: `
        CREATE OR REPLACE FUNCTION exec_sql(sql_query text)
        RETURNS text
        LANGUAGE plpgsql
        SECURITY DEFINER
        AS $$
        DECLARE
          result text;
        BEGIN
          EXECUTE sql_query;
          RETURN 'Query executed successfully';
        EXCEPTION
          WHEN OTHERS THEN
            RETURN 'Error: ' || SQLERRM;
        END;
        $$;
      `
    });
    
    if (error) {
      console.error('❌ Ошибка при создании функции:', error);
    } else {
      console.log('✅ Функция exec_sql создана успешно');
    }
    
  } catch (error) {
    console.error('❌ Ошибка:', error);
  }
}

createExecSQLFunction();
