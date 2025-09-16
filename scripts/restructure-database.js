const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function restructureDatabase() {
  console.log('🔄 Начинаем реструктуризацию базы данных...');
  
  try {
    // 1. Сначала проверим дубли
    console.log('\n1️⃣ Проверка дублей...');
    await checkDuplicates();
    
    // 2. Создаем резервную копию данных
    console.log('\n2️⃣ Создание резервной копии...');
    await createBackup();
    
    // 3. Удаляем внешние ключи из таблицы books
    console.log('\n3️⃣ Удаление внешних ключей из таблицы books...');
    await removeForeignKeys();
    
    // 4. Удаляем ненужные таблицы
    console.log('\n4️⃣ Удаление ненужных таблиц...');
    await dropTables();
    
    // 5. Обновляем структуру таблицы books
    console.log('\n5️⃣ Обновление структуры таблицы books...');
    await updateBooksTable();
    
    console.log('\n✅ Реструктуризация завершена!');
    
  } catch (error) {
    console.error('❌ Ошибка при реструктуризации:', error);
  }
}

async function checkDuplicates() {
  const { data: books, error } = await supabase
    .from('books')
    .select('*');
  
  if (error) {
    console.error('❌ Ошибка при получении книг:', error);
    return;
  }
  
  const duplicates = {};
  books.forEach(book => {
    const key = `${book.title.toLowerCase().trim()}_${book.author.toLowerCase().trim()}`;
    if (!duplicates[key]) {
      duplicates[key] = [];
    }
    duplicates[key].push(book);
  });
  
  const actualDuplicates = Object.values(duplicates).filter(group => group.length > 1);
  
  if (actualDuplicates.length > 0) {
    console.log(`⚠️  Найдено ${actualDuplicates.length} групп дублей`);
    
    for (const group of actualDuplicates) {
      const toKeep = group[0];
      const toDelete = group.slice(1);
      
      console.log(`📖 Оставляем: "${toKeep.title}" (ID: ${toKeep.id})`);
      
      for (const book of toDelete) {
        console.log(`🗑️  Удаляем: "${book.title}" (ID: ${book.id})`);
        
        const { error } = await supabase
          .from('books')
          .delete()
          .eq('id', book.id);
        
        if (error) {
          console.error(`❌ Ошибка при удалении книги ${book.id}:`, error);
        }
      }
    }
  } else {
    console.log('✅ Дублей не найдено');
  }
}

async function createBackup() {
  // Создаем резервную копию данных из таблицы books
  const { data: books, error } = await supabase
    .from('books')
    .select('*');
  
  if (error) {
    console.error('❌ Ошибка при создании резервной копии:', error);
    return;
  }
  
  // Сохраняем в файл
  const fs = require('fs');
  const backupData = {
    timestamp: new Date().toISOString(),
    books: books
  };
  
  fs.writeFileSync('backup-books.json', JSON.stringify(backupData, null, 2));
  console.log(`✅ Резервная копия сохранена в backup-books.json (${books.length} книг)`);
}

async function removeForeignKeys() {
  // Удаляем поля category_id, author_id, subcategory_id из таблицы books
  const { error } = await supabase.rpc('exec_sql', {
    sql: `
      ALTER TABLE books 
      DROP COLUMN IF EXISTS category_id,
      DROP COLUMN IF EXISTS author_id,
      DROP COLUMN IF EXISTS subcategory_id;
    `
  });
  
  if (error) {
    console.error('❌ Ошибка при удалении внешних ключей:', error);
  } else {
    console.log('✅ Внешние ключи удалены');
  }
}

async function dropTables() {
  const tablesToDrop = ['books_with_authors', 'book_authors', 'authors', 'categories'];
  
  for (const table of tablesToDrop) {
    console.log(`🗑️  Удаляем таблицу ${table}...`);
    
    const { error } = await supabase.rpc('exec_sql', {
      sql: `DROP TABLE IF EXISTS ${table} CASCADE;`
    });
    
    if (error) {
      console.error(`❌ Ошибка при удалении таблицы ${table}:`, error);
    } else {
      console.log(`✅ Таблица ${table} удалена`);
    }
  }
}

async function updateBooksTable() {
  // Добавляем поля для категории и подкатегории как строки
  const { error } = await supabase.rpc('exec_sql', {
    sql: `
      ALTER TABLE books 
      ADD COLUMN IF NOT EXISTS category VARCHAR(255),
      ADD COLUMN IF NOT EXISTS subcategory VARCHAR(255);
      
      -- Обновляем существующие записи
      UPDATE books 
      SET category = 'Детская литература', 
          subcategory = 'Сказки'
      WHERE category IS NULL;
    `
  });
  
  if (error) {
    console.error('❌ Ошибка при обновлении таблицы books:', error);
  } else {
    console.log('✅ Таблица books обновлена');
  }
}

// Запускаем реструктуризацию
restructureDatabase();