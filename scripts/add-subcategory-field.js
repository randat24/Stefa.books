const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function addSubcategoryField() {
  console.log('🔧 Добавляем поле subcategory...');
  
  try {
    // 1. Отключаем RLS
    console.log('1. Отключаем RLS...');
    await supabase.rpc('exec_sql', {
      sql_query: 'ALTER TABLE books DISABLE ROW LEVEL SECURITY;'
    });
    
    // 2. Удаляем поле если существует
    console.log('2. Удаляем старое поле subcategory...');
    await supabase.rpc('exec_sql', {
      sql_query: 'ALTER TABLE books DROP COLUMN IF EXISTS subcategory;'
    });
    
    // 3. Добавляем поле заново
    console.log('3. Добавляем новое поле subcategory...');
    await supabase.rpc('exec_sql', {
      sql_query: 'ALTER TABLE books ADD COLUMN subcategory VARCHAR(255) DEFAULT \'Сказки\';'
    });
    
    // 4. Обновляем все записи
    console.log('4. Обновляем все записи...');
    await supabase.rpc('exec_sql', {
      sql_query: `
        UPDATE books SET 
          subcategory = 'Сказки'
        WHERE subcategory IS NULL;
      `
    });
    
    // 5. Включаем RLS
    console.log('5. Включаем RLS...');
    await supabase.rpc('exec_sql', {
      sql_query: 'ALTER TABLE books ENABLE ROW LEVEL SECURITY;'
    });
    
    // 6. Проверяем результат
    console.log('6. Проверяем результат...');
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
    
  } catch (error) {
    console.error('❌ Ошибка:', error);
  }
}

addSubcategoryField();
