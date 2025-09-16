const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Отсутствуют переменные окружения');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Мапинг ключевых слов на UUID категорий
const categoryMappings = [
  {
    keywords: ['казк', 'казка', 'принцес', 'король', 'чарівн'],
    categoryId: 'd265df66-d674-4dbd-bdcf-00f6de62868e', // Казки
    categoryName: 'Казки'
  },
  {
    keywords: ['пригод', 'подорож', 'мандр'],
    categoryId: '4bad1750-0724-4967-8228-6cb2167a7c1b', // Пригоди
    categoryName: 'Пригоди'
  },
  {
    keywords: ['фентез', 'магі', 'чарів', 'дракон', 'лицар'],
    categoryId: 'acfd8e90-277d-493d-9948-3a61cf4ed654', // Фентезі
    categoryName: 'Фентезі'
  },
  {
    keywords: ['детектив', 'загадк', 'таємнич', 'злочин', 'мальтійськ'],
    categoryId: 'a6dded07-680e-4156-b991-1b56f2185f0f', // Повість (близко к детективу)
    categoryName: 'Повість'
  },
  {
    keywords: ['енциклопеді', 'пізнаваль', 'навчальн', 'знанн', 'космос', 'чомусик'],
    categoryId: 'c977cf09-bb47-4707-ab8d-292b54107051', // Пізнавальні
    categoryName: 'Пізнавальні'
  }
];

async function assignCategories() {
  try {
    console.log('📚 Начинаем назначение категорий с UUID...\n');

    // Получаем все книги
    const { data: books, error: booksError } = await supabase
      .from('books')
      .select('id, title, author, description, category_id')
      .is('category_id', null)
      .limit(20); // Ограничиваем для теста

    if (booksError) {
      throw new Error(`Ошибка загрузки книг: ${booksError.message}`);
    }

    console.log(`📖 Загружено ${books.length} книг без категорий\n`);

    let assigned = 0;
    const assignments = [];

    // Обрабатываем каждую книгу
    for (const book of books) {
      const bookText = `${book.title} ${book.author} ${book.description || ''}`.toLowerCase();
      let bestCategory = null;
      let bestScore = 0;

      // Ищем наилучшее соответствие
      for (const mapping of categoryMappings) {
        let score = 0;

        // Проверяем ключевые слова в тексте книги
        for (const keyword of mapping.keywords) {
          if (bookText.includes(keyword.toLowerCase())) {
            score += 1;
          }
        }

        if (score > bestScore) {
          bestScore = score;
          bestCategory = mapping;
        }
      }

      if (bestCategory && bestScore > 0) {
        assignments.push({
          bookId: book.id,
          bookTitle: book.title,
          categoryId: bestCategory.categoryId,
          categoryName: bestCategory.categoryName,
          score: bestScore
        });
        assigned++;
      }
    }

    console.log(`📊 Найдено ${assigned} соответствий:\n`);
    assignments.forEach(a => {
      console.log(`   "${a.bookTitle}" → ${a.categoryName} (score: ${a.score})`);
    });

    if (assignments.length === 0) {
      console.log('❌ Нет книг для назначения категорий');
      return;
    }

    console.log('\n✅ Начинаем назначения через SQL...');

    // Выполняем назначения через SQL, чтобы обойти триггеры
    let successCount = 0;

    for (const assignment of assignments.slice(0, 5)) { // Только первые 5 для теста
      try {
        console.log(`\n🔄 Обновляем "${assignment.bookTitle}"...`);

        // Используем SQL напрямую
        const { data, error } = await supabase.rpc('update_book_category', {
          book_id: assignment.bookId,
          new_category_id: assignment.categoryId
        });

        if (error) {
          console.error(`❌ Ошибка RPC для "${assignment.bookTitle}": ${error.message}`);

          // Попробуем обычный update только с category_id
          const { error: updateError } = await supabase
            .from('books')
            .update({ category_id: assignment.categoryId })
            .eq('id', assignment.bookId);

          if (updateError) {
            console.error(`❌ Ошибка обычного update: ${updateError.message}`);
          } else {
            successCount++;
            console.log(`   ✅ Успешно через обычный update`);
          }
        } else {
          successCount++;
          console.log(`   ✅ Успешно через RPC`);
        }
      } catch (err) {
        console.error(`❌ Исключение для "${assignment.bookTitle}": ${err.message}`);
      }
    }

    console.log(`\n🎉 Обработано ${assignments.slice(0, 5).length} из ${assignments.length} книг`);
    console.log(`✅ Успешно назначено: ${successCount}`);

    // Проверяем результат
    const { data: updatedBooks, error: checkError } = await supabase
      .from('books')
      .select('id, title, category_id')
      .not('category_id', 'is', null)
      .limit(10);

    if (!checkError && updatedBooks) {
      console.log(`\n📈 Примеры книг с категориями:`);
      updatedBooks.forEach(book => {
        console.log(`   "${book.title}" → ${book.category_id}`);
      });
    }

  } catch (error) {
    console.error('❌ Общая ошибка:', error.message);
  }
}

assignCategories();