const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function executeSQL() {
  console.log('🔄 Выполняем реструктуризацию базы данных через Edge Function...');
  
  try {
    // Читаем SQL файл
    const sqlContent = fs.readFileSync('scripts/restructure-database-fixed.sql', 'utf8');
    
    // Разбиваем на отдельные запросы
    const queries = sqlContent
      .split(';')
      .map(q => q.trim())
      .filter(q => q.length > 0 && !q.startsWith('--'));
    
    console.log(`📝 Найдено ${queries.length} SQL запросов`);
    
    // Выполняем каждый запрос через Edge Function
    for (let i = 0; i < queries.length; i++) {
      const query = queries[i];
      console.log(`\n${i + 1}. Выполняем запрос...`);
      console.log(`   ${query.substring(0, 100)}${query.length > 100 ? '...' : ''}`);
      
      try {
        const { data, error } = await supabase.functions.invoke('execute-sql', {
          body: { sql: query }
        });
        
        if (error) {
          console.error(`❌ Ошибка в запросе ${i + 1}:`, error);
          // Продолжаем выполнение других запросов
        } else {
          console.log(`✅ Запрос ${i + 1} выполнен успешно`);
          if (data && data.data) {
            console.log(`   Результат:`, data.data);
          }
        }
      } catch (err) {
        console.error(`❌ Исключение в запросе ${i + 1}:`, err.message);
      }
      
      // Небольшая пауза между запросами
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('\n✅ Реструктуризация завершена!');
    
    // Проверяем результат
    console.log('\n📊 Проверяем результат...');
    const { data: books, error } = await supabase
      .from('books')
      .select('id, title, author, category, subcategory')
      .limit(5);
    
    if (error) {
      console.error('❌ Ошибка при проверке:', error);
    } else {
      console.log('📚 Примеры книг после реструктуризации:');
      books.forEach(book => {
        console.log(`   - "${book.title}" by ${book.author} [${book.category}]`);
      });
    }
    
  } catch (error) {
    console.error('❌ Ошибка при выполнении SQL:', error);
  }
}

executeSQL();
