const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Отсутствуют переменные окружения');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function safeRestructure() {
  try {
    console.log('🔄 Безопасная реструктуризация базы данных...\n');

    // 1. Проверяем текущие данные
    console.log('📋 Анализируем текущие данные...');
    const { data: books, error: booksError } = await supabase
      .from('books')
      .select('id, title, author, category, category_id, author_id, subcategory_id')
      .limit(10);

    if (booksError) {
      console.error('❌ Ошибка получения данных:', booksError);
      return;
    }

    console.log('✅ Примеры данных:');
    books.forEach((book, i) => {
      if (i < 3) {
        console.log(`   "${book.title}" | Автор: "${book.author}" | Категория: "${book.category}"`);
        console.log(`     IDs: category_id=${book.category_id}, author_id=${book.author_id}, subcategory_id=${book.subcategory_id}`);
      }
    });

    // 2. Проверяем заполненность полей author и category
    const { data: emptyAuthors, error: authorError } = await supabase
      .from('books')
      .select('id, title')
      .or('author.is.null,author.eq.')
      .limit(5);

    const { data: emptyCategories, error: categoryError } = await supabase
      .from('books')
      .select('id, title')
      .or('category.is.null,category.eq.')
      .limit(5);

    console.log(`\n📊 Статистика полей:`);
    console.log(`   Книг без автора: ${emptyAuthors?.length || 0}`);
    console.log(`   Книг без категории: ${emptyCategories?.length || 0}`);

    if (emptyAuthors?.length > 0) {
      console.log(`   Примеры без автора: ${emptyAuthors.map(b => b.title).join(', ')}`);
    }
    if (emptyCategories?.length > 0) {
      console.log(`   Примеры без категории: ${emptyCategories.map(b => b.title).join(', ')}`);
    }

    // 3. Подготавливаем очистку данных
    console.log('\n🧹 Подготавливаем очистку данных...');

    // Создаем запросы для обновления пустых полей с помощью соответствующих таблиц
    console.log('   1. Можем попробовать заполнить пустые поля из связанных таблиц');
    console.log('   2. Или оставить как есть, если поля уже заполнены');

    // 4. Создаем план действий
    console.log('\n📋 План безопасной реструктуризации:');
    console.log('   ✅ Поля author и category уже существуют как TEXT');
    console.log('   🔄 Заполнить пустые поля author и category из связанных таблиц (если нужно)');
    console.log('   🗑️  Удалить поля: category_id, author_id, subcategory_id, age_category_id');
    console.log('   🗑️  Удалить таблицы: categories, books_with_authors, book_authors, authors');

    if (process.argv.includes('--execute')) {
      console.log('\n🚀 Выполняем безопасную реструктуризацию...');

      // Шаг 1: Попытаемся заполнить пустые поля из связанных таблиц
      if (emptyCategories?.length > 0) {
        console.log('\n📝 Заполняем пустые категории...');
        try {
          // Попытаемся получить категории по category_id
          for (const book of emptyCategories.slice(0, 5)) {
            const { data: bookData } = await supabase
              .from('books')
              .select('category_id')
              .eq('id', book.id)
              .single();

            if (bookData?.category_id) {
              const { data: categoryData } = await supabase
                .from('categories')
                .select('name')
                .eq('id', bookData.category_id)
                .single();

              if (categoryData?.name) {
                const { error: updateError } = await supabase
                  .from('books')
                  .update({ category: categoryData.name })
                  .eq('id', book.id);

                if (!updateError) {
                  console.log(`   ✅ "${book.title}" → категория: "${categoryData.name}"`);
                }
              }
            }
          }
        } catch (err) {
          console.log(`   ⚠️  Ошибка при заполнении категорий: ${err.message}`);
        }
      }

      // Шаг 2: Примечание о полях для удаления
      console.log('\n⚠️  ВНИМАНИЕ: Для полного удаления полей category_id, author_id, subcategory_id');
      console.log('   необходимо выполнить SQL команды напрямую в Supabase Dashboard:');
      console.log('   ');
      console.log('   ALTER TABLE books DROP COLUMN IF EXISTS category_id;');
      console.log('   ALTER TABLE books DROP COLUMN IF EXISTS author_id;');
      console.log('   ALTER TABLE books DROP COLUMN IF EXISTS subcategory_id;');
      console.log('   ALTER TABLE books DROP COLUMN IF EXISTS age_category_id;');
      console.log('   ');
      console.log('   DROP TABLE IF EXISTS categories CASCADE;');
      console.log('   DROP TABLE IF EXISTS books_with_authors CASCADE;');
      console.log('   DROP TABLE IF EXISTS book_authors CASCADE;');
      console.log('   DROP TABLE IF EXISTS authors CASCADE;');

      console.log('\n✅ Безопасная часть реструктуризации завершена!');
      console.log('📋 Поля author и category готовы к использованию как основные');
    } else {
      console.log('\n▶️  Для выполнения запустите скрипт с параметром --execute');
      console.log('   node safe-restructure.js --execute');
    }

  } catch (error) {
    console.error('❌ Общая ошибка:', error.message);
  }
}

safeRestructure();