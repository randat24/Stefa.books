const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../.env.local' });

// Инициализация Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Отсутствуют переменные окружения SUPABASE_URL или SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Упрощенные соответствия: ключевые слова → название категории
const simpleMappings = [
  {
    keywords: ['казк', 'казка', 'принцес', 'король', 'чарівн'],
    category: 'Казки'
  },
  {
    keywords: ['пригод', 'подорож', 'мандр'],
    category: 'Пригоди'
  },
  {
    keywords: ['фентез', 'магі', 'чарів', 'дракон', 'лицар'],
    category: 'Фентезі'
  },
  {
    keywords: ['детектив', 'загадк', 'таємнич', 'злочин', 'мальтійськ'],
    category: 'Детектив'
  },
  {
    keywords: ['психолог', 'саморозвит', 'емоці', 'відносин', 'ключ'],
    category: 'Психологія'
  },
  {
    keywords: ['енциклопеді', 'пізнаваль', 'навчальн', 'знанн', 'космос', 'чомусик'],
    category: 'Пізнавальні'
  },
  {
    keywords: ['романтик', 'кохан', 'серц', 'вітька', 'галя'],
    category: 'Романтика'
  },
  {
    keywords: ['підлітк', 'мортіна', 'захар'],
    category: 'Підлітковий вік'
  }
];

async function assignSimpleCategories() {
  try {
    console.log('📚 Начинаем упрощенное назначение категорий...\n');

    // Получаем все книги без категорий
    const { data: books, error: booksError } = await supabase
      .from('books')
      .select('id, title, author, description, category_id')
      .is('category_id', null);

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
      for (const mapping of simpleMappings) {
        let score = 0;

        // Проверяем ключевые слова в тексте книги
        for (const keyword of mapping.keywords) {
          if (bookText.includes(keyword.toLowerCase())) {
            score += 1;
          }
        }

        if (score > bestScore) {
          bestScore = score;
          bestCategory = mapping.category;
        }
      }

      if (bestCategory && bestScore > 0) {
        assignments.push({
          bookId: book.id,
          bookTitle: book.title,
          category: bestCategory,
          score: bestScore
        });
        assigned++;
      }
    }

    // Показываем результаты
    console.log(`📊 Результаты анализа:`);
    console.log(`   🔄 Книг будет назначено: ${assigned}`);
    console.log(`   ❓ Книг останется без категории: ${books.length - assigned}\n`);

    if (assignments.length === 0) {
      console.log('❌ Нет книг для назначения категорий');
      return;
    }

    // Показываем примеры назначений
    console.log('🔍 Назначения:');
    assignments.forEach(a => {
      console.log(`   "${a.bookTitle}" → ${a.category} (score: ${a.score})`);
    });

    console.log('\n✅ Автоматически выполняем назначения...');

    // Выполняем назначения
    let successCount = 0;

    for (const assignment of assignments) {
      try {
        const { error } = await supabase
          .from('books')
          .update({ category_id: assignment.category })
          .eq('id', assignment.bookId);

        if (error) {
          console.error(`❌ Ошибка назначения для "${assignment.bookTitle}": ${error.message}`);
        } else {
          successCount++;
          console.log(`   ✅ ${successCount}/${assignments.length}: "${assignment.bookTitle}" → ${assignment.category}`);
        }
      } catch (err) {
        console.error(`❌ Ошибка для "${assignment.bookTitle}": ${err.message}`);
      }
    }

    console.log(`\n🎉 Завершено! Успешно назначено ${successCount} из ${assignments.length} категорий`);

    // Проверяем результат
    const { data: updatedBooks, error: checkError } = await supabase
      .from('books')
      .select('category_id')
      .not('category_id', 'is', null);

    if (!checkError) {
      console.log(`📈 Итого книг с категориями: ${updatedBooks.length} из 111`);
    }

  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    process.exit(1);
  }
}

// Запускаем скрипт
assignSimpleCategories();