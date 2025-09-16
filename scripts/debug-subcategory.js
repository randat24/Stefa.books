const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debugSubcategory() {
  console.log('🔍 Отладка subcategory...');
  
  try {
    // Проверим, есть ли поле subcategory
    const { data: test, error: testError } = await supabase.rpc('exec_sql', {
      sql_query: `
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'books' AND column_name = 'subcategory';
      `
    });
    
    console.log('Поле subcategory:', test);
    
    // Попробуем обновить напрямую через API
    console.log('\n🔄 Обновляем через API...');
    const { data: updateResult, error: updateError } = await supabase
      .from('books')
      .update({ subcategory: 'Сказки' })
      .eq('id', '9ac958f3-54e2-42cf-ba72-889fe792e5f3')
      .select();
    
    if (updateError) {
      console.error('❌ Ошибка при обновлении через API:', updateError);
    } else {
      console.log('✅ Обновление через API:', updateResult);
    }
    
    // Проверим результат
    const { data: books, error: checkError } = await supabase
      .from('books')
      .select('id, title, subcategory')
      .limit(3);
    
    if (checkError) {
      console.error('❌ Ошибка при проверке:', checkError);
    } else {
      console.log('📚 Результат:');
      books.forEach(book => {
        console.log(`   - "${book.title}" subcategory: ${book.subcategory}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Ошибка:', error);
  }
}

debugSubcategory();
