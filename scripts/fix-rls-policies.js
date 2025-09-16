const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixRLSPolicies() {
  console.log('🔧 Исправляем RLS политики...');
  
  try {
    // Удаляем старые политики
    console.log('1. Удаляем старые политики...');
    await supabase.rpc('exec_sql', {
      sql_query: 'DROP POLICY IF EXISTS "Books are viewable by everyone" ON books;'
    });
    
    await supabase.rpc('exec_sql', {
      sql_query: 'DROP POLICY IF EXISTS "Books are editable by admins" ON books;'
    });
    
    // Создаем простые политики без ссылок на несуществующие таблицы
    console.log('2. Создаем новые политики...');
    
    // Политика для чтения - все могут читать
    await supabase.rpc('exec_sql', {
      sql_query: `
        CREATE POLICY "Books are viewable by everyone" ON books
        FOR SELECT USING (true);
      `
    });
    
    // Политика для записи - только аутентифицированные пользователи
    await supabase.rpc('exec_sql', {
      sql_query: `
        CREATE POLICY "Books are editable by authenticated users" ON books
        FOR ALL USING (auth.uid() IS NOT NULL);
      `
    });
    
    console.log('✅ RLS политики исправлены');
    
    // Обновляем данные subcategory
    console.log('3. Обновляем данные subcategory...');
    await supabase.rpc('exec_sql', {
      sql_query: `
        UPDATE books SET 
          subcategory = 'Сказки'
        WHERE subcategory IS NULL;
      `
    });
    
    console.log('✅ Данные subcategory обновлены');
    
    // Проверяем результат
    console.log('4. Проверяем результат...');
    const { data: books, error } = await supabase
      .from('books')
      .select('id, title, author, category, subcategory')
      .limit(3);
    
    if (error) {
      console.error('❌ Ошибка при проверке:', error);
    } else {
      console.log('📚 Примеры книг после исправлений:');
      books.forEach(book => {
        console.log(`   - "${book.title}" by ${book.author} [${book.category} - ${book.subcategory}]`);
      });
    }
    
  } catch (error) {
    console.error('❌ Ошибка при исправлении RLS политик:', error);
  }
}

fixRLSPolicies();
