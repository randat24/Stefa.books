const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixSubcategoryFinal() {
  console.log('🔧 Финальное исправление subcategory...');
  
  try {
    // 1. Временно отключаем RLS
    console.log('1. Отключаем RLS...');
    await supabase.rpc('exec_sql', {
      sql_query: 'ALTER TABLE books DISABLE ROW LEVEL SECURITY;'
    });
    
    // 2. Обновляем subcategory
    console.log('2. Обновляем subcategory...');
    await supabase.rpc('exec_sql', {
      sql_query: `
        UPDATE books SET 
          subcategory = 'Сказки'
        WHERE subcategory IS NULL;
      `
    });
    
    // 3. Включаем RLS обратно
    console.log('3. Включаем RLS...');
    await supabase.rpc('exec_sql', {
      sql_query: 'ALTER TABLE books ENABLE ROW LEVEL SECURITY;'
    });
    
    // 4. Проверяем результат
    console.log('4. Проверяем результат...');
    const { data: books, error: checkError } = await supabase
      .from('books')
      .select('id, title, author, category, subcategory')
      .limit(5);
    
    if (checkError) {
      console.error('❌ Ошибка при проверке:', checkError);
    } else {
      console.log('📚 Результат:');
      books.forEach(book => {
        console.log(`   - "${book.title}" by ${book.author} [${book.category} - ${book.subcategory}]`);
      });
    }
    
    // 5. Проверяем статистику
    console.log('\n📊 Статистика:');
    const { data: stats, error: statsError } = await supabase.rpc('exec_sql', {
      sql_query: `
        SELECT 
          COUNT(*) as total_books,
          COUNT(DISTINCT category) as unique_categories,
          COUNT(DISTINCT author) as unique_authors,
          COUNT(CASE WHEN subcategory IS NOT NULL THEN 1 END) as books_with_subcategory
        FROM books;
      `
    });
    
    console.log('Статистика:', stats);
    
  } catch (error) {
    console.error('❌ Ошибка:', error);
  }
}

fixSubcategoryFinal();
