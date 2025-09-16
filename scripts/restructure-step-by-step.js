const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function restructureStepByStep() {
  console.log('🔄 Начинаем пошаговую реструктуризацию...');
  
  const steps = [
    {
      name: 'Создание резервной копии',
      sql: 'CREATE TABLE books_backup AS SELECT * FROM books;'
    },
    {
      name: 'Удаление зависимых объектов',
      sql: 'DROP VIEW IF EXISTS books_with_authors CASCADE;'
    },
    {
      name: 'Удаление внешних ключей',
      sql: 'ALTER TABLE books DROP COLUMN IF EXISTS category_id CASCADE;'
    },
    {
      name: 'Удаление author_id',
      sql: 'ALTER TABLE books DROP COLUMN IF EXISTS author_id CASCADE;'
    },
    {
      name: 'Удаление subcategory_id',
      sql: 'ALTER TABLE books DROP COLUMN IF EXISTS subcategory_id CASCADE;'
    },
    {
      name: 'Удаление таблицы book_authors',
      sql: 'DROP TABLE IF EXISTS book_authors CASCADE;'
    },
    {
      name: 'Удаление таблицы authors',
      sql: 'DROP TABLE IF EXISTS authors CASCADE;'
    },
    {
      name: 'Удаление таблицы categories',
      sql: 'DROP TABLE IF EXISTS categories CASCADE;'
    },
    {
      name: 'Добавление поля category',
      sql: 'ALTER TABLE books ADD COLUMN IF NOT EXISTS category VARCHAR(255);'
    },
    {
      name: 'Добавление поля subcategory',
      sql: 'ALTER TABLE books ADD COLUMN IF NOT EXISTS subcategory VARCHAR(255);'
    },
    {
      name: 'Обновление данных',
      sql: `UPDATE books SET 
        category = 'Детская литература', 
        subcategory = 'Сказки'
      WHERE category IS NULL;`
    },
    {
      name: 'Создание индекса для category',
      sql: 'CREATE INDEX IF NOT EXISTS idx_books_category ON books(category);'
    },
    {
      name: 'Создание индекса для subcategory',
      sql: 'CREATE INDEX IF NOT EXISTS idx_books_subcategory ON books(subcategory);'
    },
    {
      name: 'Создание индекса для author',
      sql: 'CREATE INDEX IF NOT EXISTS idx_books_author ON books(author);'
    }
  ];
  
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    console.log(`\n${i + 1}. ${step.name}...`);
    
    try {
      const { data, error } = await supabase.rpc('exec_sql', {
        sql_query: step.sql
      });
      
      if (error) {
        console.error(`❌ Ошибка в шаге ${i + 1}:`, error);
        console.log('Продолжаем выполнение...');
      } else {
        console.log(`✅ Шаг ${i + 1} выполнен успешно`);
        if (data && data !== 'Query executed successfully') {
          console.log(`   Результат:`, data);
        }
      }
    } catch (err) {
      console.error(`❌ Исключение в шаге ${i + 1}:`, err.message);
    }
    
    // Пауза между шагами
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Проверяем результат
  console.log('\n📊 Проверяем результат...');
  try {
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
  } catch (err) {
    console.error('❌ Ошибка при проверке:', err.message);
  }
  
  console.log('\n✅ Реструктуризация завершена!');
}

restructureStepByStep();
