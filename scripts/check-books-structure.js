const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkBooksStructure() {
  console.log('🔍 Проверяем структуру таблицы books...');
  
  try {
    // Получаем одну книгу чтобы увидеть структуру
    const { data: books, error } = await supabase
      .from('books')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Ошибка при получении книг:', error);
    } else {
      console.log('📚 Структура таблицы books:');
      if (books && books.length > 0) {
        const book = books[0];
        Object.keys(book).forEach(key => {
          console.log(`   - ${key}: ${typeof book[key]} (${book[key] === null ? 'null' : 'not null'})`);
        });
      } else {
        console.log('   Книги не найдены');
      }
    }
    
    // Проверим, есть ли поля category и subcategory
    console.log('\n🔍 Проверяем новые поля...');
    const { data: testBook, error: testError } = await supabase
      .from('books')
      .select('id, title, author, category, subcategory')
      .limit(1);
    
    if (testError) {
      console.error('❌ Ошибка при проверке новых полей:', testError);
    } else {
      console.log('✅ Новые поля работают:', testBook);
    }
    
  } catch (error) {
    console.error('❌ Ошибка:', error);
  }
}

checkBooksStructure();
