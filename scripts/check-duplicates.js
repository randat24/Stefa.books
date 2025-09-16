const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkDuplicates() {
  console.log('🔍 Проверка дублей в таблице books...');
  
  try {
    // Получаем все книги
    const { data: books, error } = await supabase
      .from('books')
      .select('*')
      .order('title');
    
    if (error) {
      console.error('❌ Ошибка при получении книг:', error);
      return;
    }
    
    console.log(`📚 Всего книг: ${books.length}`);
    
    // Ищем дубли по title + author
    const duplicates = {};
    books.forEach(book => {
      const key = `${book.title.toLowerCase().trim()}_${book.author.toLowerCase().trim()}`;
      if (!duplicates[key]) {
        duplicates[key] = [];
      }
      duplicates[key].push(book);
    });
    
    // Фильтруем только дубли
    const actualDuplicates = Object.values(duplicates).filter(group => group.length > 1);
    
    if (actualDuplicates.length === 0) {
      console.log('✅ Дублей не найдено!');
      return;
    }
    
    console.log(`⚠️  Найдено ${actualDuplicates.length} групп дублей:`);
    
    actualDuplicates.forEach((group, index) => {
      console.log(`\n${index + 1}. "${group[0].title}" - ${group[0].author}`);
      group.forEach((book, bookIndex) => {
        console.log(`   ${bookIndex + 1}. ID: ${book.id}, ISBN: ${book.isbn || 'нет'}, Создано: ${book.created_at}`);
      });
    });
    
    // Предлагаем удалить дубли
    console.log('\n🗑️  Хотите удалить дубли? (y/n)');
    process.stdin.once('data', async (data) => {
      const answer = data.toString().trim().toLowerCase();
      if (answer === 'y' || answer === 'yes') {
        await removeDuplicates(actualDuplicates);
      } else {
        console.log('❌ Удаление отменено');
        process.exit(0);
      }
    });
    
  } catch (error) {
    console.error('❌ Ошибка:', error);
  }
}

async function removeDuplicates(duplicates) {
  console.log('\n🗑️  Удаление дублей...');
  
  for (const group of duplicates) {
    // Оставляем первую книгу, удаляем остальные
    const toKeep = group[0];
    const toDelete = group.slice(1);
    
    console.log(`\n📖 Оставляем: "${toKeep.title}" (ID: ${toKeep.id})`);
    
    for (const book of toDelete) {
      console.log(`🗑️  Удаляем: "${book.title}" (ID: ${book.id})`);
      
      const { error } = await supabase
        .from('books')
        .delete()
        .eq('id', book.id);
      
      if (error) {
        console.error(`❌ Ошибка при удалении книги ${book.id}:`, error);
      } else {
        console.log(`✅ Книга ${book.id} удалена`);
      }
    }
  }
  
  console.log('\n✅ Удаление дублей завершено!');
  process.exit(0);
}

checkDuplicates();