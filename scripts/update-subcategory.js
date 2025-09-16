const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function updateSubcategory() {
  console.log('🔄 Обновляем subcategory...');
  
  try {
    // Обновляем subcategory для всех книг
    const { data, error } = await supabase.rpc('exec_sql', {
      sql_query: `
        UPDATE books SET 
          subcategory = 'Сказки'
        WHERE subcategory IS NULL OR subcategory = '';
      `
    });
    
    if (error) {
      console.error('❌ Ошибка при обновлении subcategory:', error);
    } else {
      console.log('✅ Subcategory обновлен');
    }
    
    // Проверяем результат
    const { data: books, error: checkError } = await supabase
      .from('books')
      .select('id, title, author, category, subcategory')
      .limit(5);
    
    if (checkError) {
      console.error('❌ Ошибка при проверке:', checkError);
    } else {
      console.log('📚 Результат обновления:');
      books.forEach(book => {
        console.log(`   - "${book.title}" by ${book.author} [${book.category} - ${book.subcategory}]`);
      });
    }
    
  } catch (error) {
    console.error('❌ Ошибка:', error);
  }
}

updateSubcategory();
