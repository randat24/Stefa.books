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

// Ключевые слова для сопоставления категорий с книгами
const categoryMappings = [
  {
    keywords: ['казк', 'казка', 'принцес', 'король', 'чарівн'],
    categoryNames: ['Казка', 'казки'],
    preferredCategory: 'cat-7' // "Казка, дошкільний вік"
  },
  {
    keywords: ['пригод', 'подорож', 'мандр'],
    categoryNames: ['Пригоди'],
    preferredCategory: 'cat-4' // "Пригоди, середній вік"
  },
  {
    keywords: ['фентез', 'магі', 'чарів', 'дракон'],
    categoryNames: ['Фентезі'],
    preferredCategory: 'cat-5' // "Фентезі, підлітковий вік"
  },
  {
    keywords: ['детектив', 'загадк', 'таємнич', 'злочин'],
    categoryNames: ['детектив'],
    preferredCategory: 'cat-8' // "Пригоди, детектив, молодший вік"
  },
  {
    keywords: ['психолог', 'саморозвит', 'емоці', 'відносин'],
    categoryNames: ['психолог'],
    preferredCategory: 'cat-3' // "Підлітковий вік" (близько к психологии)
  },
  {
    keywords: ['енциклопеді', 'пізнаваль', 'навчальн', 'знанн'],
    categoryNames: ['Пізнавальні'],
    preferredCategory: 'cat-2' // "Пізнавальні, молодший вік"
  },
  {
    keywords: ['романтик', 'кохан', 'серц'],
    categoryNames: ['романтика'],
    preferredCategory: 'cat-6' // "Підлітковий вік, романтика"
  }
];

async function assignBookCategories() {
  try {
    console.log('📚 Начинаем сопоставление книг с категориями...\n');

    // Получаем все книги
    const { data: books, error: booksError } = await supabase
      .from('books')
      .select('id, title, author, description, category_id');

    if (booksError) {
      throw new Error(`Ошибка загрузки книг: ${booksError.message}`);
    }

    // Получаем все категории
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('id, name');

    if (categoriesError) {
      throw new Error(`Ошибка загрузки категорий: ${categoriesError.message}`);
    }

    console.log(`📖 Загружено ${books.length} книг`);
    console.log(`📂 Загружено ${categories.length} категорий\n`);

    let assigned = 0;
    let alreadyAssigned = 0;
    const assignments = [];

    // Обрабатываем каждую книгу
    for (const book of books) {
      if (book.category_id) {
        alreadyAssigned++;
        continue;
      }

      const bookText = `${book.title} ${book.author} ${book.description || ''}`.toLowerCase();
      let bestCategory = null;
      let bestScore = 0;

      // Ищем наилучшее соответствие
      for (const mapping of categoryMappings) {
        let score = 0;

        // Проверяем ключевые слова в тексте книги
        for (const keyword of mapping.keywords) {
          if (bookText.includes(keyword.toLowerCase())) {
            score += 2; // Высокий приоритет для ключевых слов
          }
        }

        // Проверяем точные совпадения категорий в названии
        for (const categoryName of mapping.categoryNames) {
          if (bookText.includes(categoryName.toLowerCase())) {
            score += 3; // Еще выше приоритет для точных совпадений
          }
        }

        if (score > bestScore) {
          bestScore = score;
          bestCategory = mapping.preferredCategory;
        }
      }

      if (bestCategory && bestScore > 0) {
        assignments.push({
          bookId: book.id,
          bookTitle: book.title,
          categoryId: bestCategory,
          categoryName: categories.find(c => c.id === bestCategory)?.name || 'Unknown',
          score: bestScore
        });
        assigned++;
      }
    }

    // Показываем предварительные результаты
    console.log(`📊 Результаты анализа:`);
    console.log(`   ✅ Книг уже имеют категории: ${alreadyAssigned}`);
    console.log(`   🔄 Книг будет назначено: ${assigned}`);
    console.log(`   ❓ Книг без категории: ${books.length - alreadyAssigned - assigned}\n`);

    if (assignments.length === 0) {
      console.log('❌ Нет книг для назначения категорий');
      return;
    }

    // Показываем примеры назначений
    console.log('🔍 Примеры назначений:');
    assignments.slice(0, 10).forEach(a => {
      console.log(`   "${a.bookTitle}" → ${a.categoryName} (score: ${a.score})`);
    });

    if (assignments.length > 10) {
      console.log(`   ... и еще ${assignments.length - 10} назначений\n`);
    }

    // Автоматически продолжаем (для автоматизации)
    console.log('✅ Автоматически продолжаем назначение категорий...');

    // Выполняем назначения
    console.log('\n🚀 Выполняем назначения...');
    let successCount = 0;

    for (const assignment of assignments) {
      try {
        const { error } = await supabase
          .from('books')
          .update({ category_id: assignment.categoryId })
          .eq('id', assignment.bookId);

        if (error) {
          console.error(`❌ Ошибка назначения для "${assignment.bookTitle}": ${error.message}`);
        } else {
          successCount++;
          if (successCount % 10 === 0) {
            console.log(`   ✅ Назначено ${successCount}/${assignments.length} категорий...`);
          }
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
      console.log(`📈 Итого книг с категориями: ${updatedBooks.length}`);
    }

  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    process.exit(1);
  }
}

// Запускаем скрипт
assignBookCategories();