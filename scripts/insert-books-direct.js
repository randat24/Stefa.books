#!/usr/bin/env node

/**
 * Прямая вставка книг в базу данных через Supabase API
 * Альтернативный подход без использования SQL файлов
 */

const { createClient } = require('@supabase/supabase-js');
const path = require('path');

// Загружаем переменные окружения
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Ошибка: Отсутствуют переменные окружения Supabase');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Функция для генерации уникальных кодов книг
function generateBookCode(category, index) {
  const categoryPrefixes = {
    'Підліткова література': 'PL',
    'Дитяча література': 'DL', 
    'Книжки-картинки': 'KP',
    'Класична література': 'KL',
    'Науково-популярна література': 'NP',
    'Фентезі та пригоди': 'FP',
    'Психологія та розвиток': 'PD',
    'Історична література': 'IL'
  };
  
  const prefix = categoryPrefixes[category] || 'BK';
  return `${prefix}-${String(index).padStart(3, '0')}`;
}

// Данные о книгах из вашего списка
const booksData = [
  {
    code: 'PL-001',
    title: 'Статистична імовірність любові з першого погляду',
    author: 'Дженніфер Е. Сміт',
    category: 'Підліткова література',
    description: 'Підлітковий роман про випадкову зустріч в аеропорту, що змінює все. Історія про кохання, випадковість та те, як одне мить може змінити все життя.',
    short_description: 'Підлітковий роман про випадкову зустріч в аеропорту, що змінює все.',
    isbn: '978-966-448-410-4',
    pages: 248,
    age_range: '14+',
    publisher: 'Видавництво Старого Лева',
    publication_year: 2025,
    status: 'available',
    available: true,
    rating: 0,
    rating_count: 0,
    badges: ['Нове', 'Популярне'],
    tags: ['роман', 'підлітки', 'кохання', 'пригоди']
  },
  {
    code: 'PL-002',
    title: 'Космос, прийом',
    author: 'Марк Лівін',
    category: 'Підліткова література',
    description: 'Камінг-оф-ейдж про пошуки батька й власного голосу. Історія про дорослішання, самопізнання та пошук своєї ідентичності.',
    short_description: 'Камінг-оф-ейдж про пошуки батька й власного голосу.',
    isbn: '9789669827630',
    pages: 240,
    age_range: '14+',
    publisher: 'Vivat',
    publication_year: 2023,
    status: 'available',
    available: true,
    rating: 0,
    rating_count: 0,
    badges: ['Популярне'],
    tags: ['роман', 'підлітки', 'дорослішання', 'сім\'я']
  },
  {
    title: 'Нездатні',
    author: 'Мартін Р. Роше',
    category: 'Підліткова література',
    description: 'Психологічна проза про «право на помилку» в сучасному суспільстві. Глибокий розгляд проблем сучасної молоді та їх боротьби з очікуваннями.',
    short_description: 'Психологічна проза про «право на помилку» в сучасному суспільстві.',
    isbn: '9789669826992',
    pages: 272,
    age_range: '16+',
    publisher: 'Vivat',
    publication_year: 2023,
    status: 'available',
    available: true,
    rating: 0,
    rating_count: 0,
    badges: ['Серйозне'],
    tags: ['психологія', 'підлітки', 'суспільство', 'помилки']
  },
  {
    title: 'Знамениті також закохуються',
    author: 'Кірсті Крістофферсен',
    category: 'Науково-популярна література',
    description: 'Популярний нон-фікшн про приватне життя відомих постатей у форматі коротких замальовок. Цікаві факти про особисте життя знаменитостей.',
    short_description: 'Популярний нон-фікшн про приватне життя відомих постатей у форматі коротких замальовок.',
    isbn: null,
    pages: 96,
    age_range: '12+',
    publisher: 'ВСЛ',
    publication_year: 2022,
    status: 'available',
    available: true,
    rating: 0,
    rating_count: 0,
    badges: ['Цікаве'],
    tags: ['біографії', 'знаменитості', 'історії', 'факти']
  },
  {
    title: 'Південь',
    author: 'Леа Коен',
    category: 'Класична література',
    description: 'Сімейна сага на тлі історичних зламів. Епічна історія сім\'ї через покоління, що показує як історичні події впливають на долі людей.',
    short_description: 'Сімейна сага на тлі історичних зламів.',
    isbn: '9786178111776',
    pages: 336,
    age_range: '16+',
    publisher: 'Наш Формат',
    publication_year: 2024,
    status: 'available',
    available: true,
    rating: 0,
    rating_count: 0,
    badges: ['Серйозне', 'Класика'],
    tags: ['сага', 'сім\'я', 'історія', 'покоління']
  },
  {
    title: 'Лицар-дракон. Вогонь! (кн. 1)',
    author: 'Кайл Мʼюбьорн',
    category: 'Дитяча література',
    description: 'Кумедне фентезі для молодших читачів. Пригоди юного лицаря-дракона, який навчається бути героєм.',
    short_description: 'Кумедне фентезі для молодших читачів.',
    isbn: '9786177682239',
    pages: 96,
    age_range: '6-10',
    publisher: 'Vivat',
    publication_year: 2019,
    status: 'available',
    available: true,
    rating: 0,
    rating_count: 0,
    badges: ['Веселе', 'Серія'],
    tags: ['фентезі', 'пригоди', 'лицар', 'дракон', 'діти']
  },
  {
    title: 'Лицар-дракон. Турнір (кн. 2)',
    author: 'Кайл Мʼюбьорн',
    category: 'Дитяча література',
    description: 'Продовження пригод юного «лицаря-дракона». Друга частина серії про смішні пригоди героя.',
    short_description: 'Продовження пригод юного «лицаря-дракона».',
    isbn: '9786177685315',
    pages: 96,
    age_range: '6-10',
    publisher: 'Vivat',
    publication_year: 2019,
    status: 'available',
    available: true,
    rating: 0,
    rating_count: 0,
    badges: ['Веселе', 'Серія'],
    tags: ['фентезі', 'пригоди', 'лицар', 'дракон', 'діти']
  },
  {
    title: 'Загубився тигр! (серія «Я вже читаю»)',
    author: 'Катажина Шестак',
    category: 'Книжки-картинки',
    description: 'Перший самостійний читач: яскрава історія-пригода. Книга для початківців читання з великими буквами та цікавими пригодами.',
    short_description: 'Перший самостійний читач: яскрава історія-пригода.',
    isbn: '9786170982421',
    pages: 48,
    age_range: '5-8',
    publisher: 'Ранок',
    publication_year: 2023,
    status: 'available',
    available: true,
    rating: 0,
    rating_count: 0,
    badges: ['Для початківців', 'Серія'],
    tags: ['читання', 'пригоди', 'тигр', 'діти', 'навчання']
  },
  {
    title: 'Неймовірна історія про велет-грушку',
    author: 'Якоб Мартін Стрід',
    category: 'Дитяча література',
    description: 'Авантюрна казка з упізнаваною графікою. Весела історія про величезну грушу та її пригоди.',
    short_description: 'Авантюрна казка з упізнаваною графікою.',
    isbn: '9786170963253',
    pages: 160,
    age_range: '6-10',
    publisher: 'Ранок',
    publication_year: 2019,
    status: 'available',
    available: true,
    rating: 0,
    rating_count: 0,
    badges: ['Веселе', 'Казка'],
    tags: ['казка', 'пригоди', 'груша', 'діти', 'фантазія']
  },
  {
    title: 'Лама Лама і його мама',
    author: 'Анна Д\'юдні',
    category: 'Книжки-картинки',
    description: 'Теплі історії про маму й ламеня. Серія книг про сімейні стосунки та любов між мамою та дитиною.',
    short_description: 'Теплі історії про маму й ламеня.',
    isbn: '9786178253875',
    pages: 96,
    age_range: '3-6',
    publisher: 'Vivat',
    publication_year: 2022,
    status: 'available',
    available: true,
    rating: 0,
    rating_count: 0,
    badges: ['Тепле', 'Серія'],
    tags: ['сім\'я', 'мама', 'дитина', 'любов', 'малята']
  },
  {
    title: 'Дві білки і шишка з гілки',
    author: 'Рейчел Брайт',
    category: 'Книжки-картинки',
    description: 'Кумедна притча про співпрацю замість змагання. Історія про те, як краще працювати разом, ніж змагатися.',
    short_description: 'Кумедна притча про співпрацю замість змагання.',
    isbn: '9789669821973',
    pages: 32,
    age_range: '3-6',
    publisher: 'Vivat',
    publication_year: 2021,
    status: 'available',
    available: true,
    rating: 0,
    rating_count: 0,
    badges: ['Повчальне', 'Веселе'],
    tags: ['притча', 'співпраця', 'білки', 'дружба', 'малята']
  },
  {
    title: 'Яйце. Друзяки-динозаврики',
    author: 'Ларс Меле',
    category: 'Дитяча література',
    description: 'Подорож друзів-динозавриків до великої події. Пригоди милих динозавриків, які разом вирушають у подорож.',
    short_description: 'Подорож друзів-динозавриків до великої події.',
    isbn: '9786170977014',
    pages: 48,
    age_range: '4-8',
    publisher: 'Ранок',
    publication_year: 2022,
    status: 'available',
    available: true,
    rating: 0,
    rating_count: 0,
    badges: ['Веселе', 'Дружба'],
    tags: ['динозаври', 'дружба', 'подорож', 'діти', 'пригоди']
  },
  {
    title: 'Чудове Чудовисько. В країні жаховиськ (кн. 2)',
    author: 'Сашко Дерманський',
    category: 'Дитяча література',
    description: 'Друга частина шаленої трилогії про Соню і Чу. Продовження пригод дівчинки та її незвичайного друга.',
    short_description: 'Друга частина шаленої трилогії про Соню і Чу.',
    isbn: '9786175850015',
    pages: 288,
    age_range: '7-12',
    publisher: 'А-ба-ба-га-ла-ма-га',
    publication_year: 2021,
    status: 'available',
    available: true,
    rating: 0,
    rating_count: 0,
    badges: ['Серія', 'Фентезі'],
    tags: ['фентезі', 'пригоди', 'дружба', 'діти', 'трилогія']
  },
  {
    title: 'Українознавці: Україна. Від первісних часів до сьогодення',
    author: 'Сергій Жуков, Марія Тахтаулова',
    category: 'Історична література',
    description: 'Ілюстрований гід з історії України для дітей. Повна історія нашої країни у зрозумілому для дітей форматі.',
    short_description: 'Ілюстрований гід з історії України для дітей.',
    isbn: '978-617-09-8655-9',
    pages: 104,
    age_range: '8-14',
    publisher: 'Ранок',
    publication_year: 2024,
    status: 'available',
    available: true,
    rating: 0,
    rating_count: 0,
    badges: ['Освітнє', 'Історія'],
    tags: ['історія', 'Україна', 'освіта', 'діти', 'пізнавальне']
  },
  {
    title: 'Мортіна і Таємниче озеро',
    author: 'Барбара Кантіні',
    category: 'Дитяча література',
    description: 'Готично-кумедні канікули Мортіни. Пригоди маленької дівчинки-скелета у таємничому озері.',
    short_description: 'Готично-кумедні канікули Мортіни.',
    isbn: '9789669178060',
    pages: 80,
    age_range: '6-10',
    publisher: 'Рідна Мова',
    publication_year: 2024,
    status: 'available',
    available: true,
    rating: 0,
    rating_count: 0,
    badges: ['Веселе', 'Готика'],
    tags: ['пригоди', 'скелет', 'озеро', 'діти', 'таємниця']
  },
  {
    title: 'Роб і Джонні. Книга 1',
    author: 'Елізабет Метіс',
    category: 'Дитяча література',
    description: 'Дружба, пригоди й трошки шаленства. Історія про двох друзів та їх неймовірні пригоди.',
    short_description: 'Дружба, пригоди й трошки шаленства.',
    isbn: '9786178071018',
    pages: 96,
    age_range: '6-10',
    publisher: 'Talantbooks',
    publication_year: 2024,
    status: 'available',
    available: true,
    rating: 0,
    rating_count: 0,
    badges: ['Дружба', 'Пригоди'],
    tags: ['дружба', 'пригоди', 'діти', 'шаленство', 'веселощі']
  },
  {
    title: 'Притчі. Мудрість поколінь',
    author: 'упоряд. ІРІО (IPIO)',
    category: 'Класична література',
    description: 'Збірка повчальних історій для дорослих і підлітків. Мудрі притчі, які передають мудрість поколінь.',
    short_description: 'Збірка повчальних історій для дорослих і підлітків.',
    isbn: '978-617-7754-52-6',
    pages: 240,
    age_range: '12+',
    publisher: 'ІРІО',
    publication_year: 2023,
    status: 'available',
    available: true,
    rating: 0,
    rating_count: 0,
    badges: ['Мудрість', 'Класика'],
    tags: ['притчі', 'мудрість', 'повчання', 'покоління', 'філософія']
  },
  {
    title: 'Осінь на Бузиновій вулиці',
    author: 'Чорні Вівці',
    category: 'Дитяча література',
    description: 'Теплі дворикові історії про дружбу та будні. Серія оповідань про життя дітей на одній вулиці.',
    short_description: 'Теплі дворикові історії про дружбу та будні.',
    isbn: '9789669820549',
    pages: 64,
    age_range: '6-10',
    publisher: 'Чорні Вівці',
    publication_year: 2019,
    status: 'available',
    available: true,
    rating: 0,
    rating_count: 0,
    badges: ['Тепле', 'Серія'],
    tags: ['дружба', 'дворик', 'діти', 'будні', 'тепло']
  },
  {
    title: 'Швидка допомога для дітей',
    author: 'Масахіко Сакамото',
    category: 'Науково-популярна література',
    description: 'Проста енциклопедія першої допомоги для дітей і батьків. Навчальна книга про те, як надати першу допомогу.',
    short_description: 'Проста енциклопедія першої допомоги для дітей і батьків.',
    isbn: '978-617-7913-23-7',
    pages: 48,
    age_range: '7+',
    publisher: 'Mamino',
    publication_year: 2024,
    status: 'available',
    available: true,
    rating: 0,
    rating_count: 0,
    badges: ['Освітнє', 'Корисне'],
    tags: ['перша допомога', 'освіта', 'безпека', 'діти', 'корисне']
  },
  {
    title: 'У нас завівся невидимий тигр',
    author: 'Катерина Єгорукіна',
    category: 'Психологія та розвиток',
    description: 'Історія про тривогу переїзду та «уявного друга». Книга допомагає дітям розуміти та подолати тривожність.',
    short_description: 'Історія про тривогу переїзду та «уявного друга».',
    isbn: '9786171709157',
    pages: 48,
    age_range: '5-8',
    publisher: 'Vivat',
    publication_year: 2025,
    status: 'available',
    available: true,
    rating: 0,
    rating_count: 0,
    badges: ['Психологія', 'Допомога'],
    tags: ['тривога', 'переїзд', 'психологія', 'діти', 'емоції']
  },
  {
    title: 'Клуб нових робінзонів',
    author: 'Ґійом Деланной',
    category: 'Дитяча література',
    description: 'Сучасний «робінзонад» для юних дослідників. Пригоди сучасних дітей, які навчаються виживати в природі.',
    short_description: 'Сучасний «робінзонад» для юних дослідників.',
    isbn: null,
    pages: null,
    age_range: '8-12',
    publisher: 'ВСЛ',
    publication_year: 2025,
    status: 'available',
    available: true,
    rating: 0,
    rating_count: 0,
    badges: ['Пригоди', 'Навчання'],
    tags: ['робінзонад', 'природа', 'виживання', 'дослідження', 'діти']
  }
];

async function insertBooks() {
  console.log('🚀 Начинаем вставку книг в базу данных...\n');
  
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < booksData.length; i++) {
    const book = booksData[i];
    
    try {
      console.log(`📖 Вставляем книгу ${i + 1}/${booksData.length}: "${book.title}"`);
      
      const { data, error } = await supabase
        .from('books')
        .insert([book])
        .select();
      
      if (error) {
        console.error(`❌ Ошибка при вставке книги "${book.title}":`, error.message);
        errorCount++;
      } else {
        console.log(`✅ Книга "${book.title}" успешно добавлена`);
        successCount++;
      }
      
      // Небольшая пауза между вставками
      await new Promise(resolve => setTimeout(resolve, 200));
      
    } catch (err) {
      console.error(`❌ Критическая ошибка при вставке книги "${book.title}":`, err.message);
      errorCount++;
    }
  }
  
  console.log('\n📊 Результат вставки:');
  console.log(`✅ Успешно добавлено: ${successCount}`);
  console.log(`❌ Ошибок: ${errorCount}`);
  
  return { successCount, errorCount };
}

async function checkConnection() {
  try {
    console.log('🔌 Проверяем подключение к базе данных...');
    
    const { data, error } = await supabase
      .from('books')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Ошибка подключения:', error.message);
      return false;
    }
    
    console.log('✅ Подключение успешно');
    return true;
  } catch (error) {
    console.error('❌ Ошибка подключения:', error.message);
    return false;
  }
}

async function getBooksCount() {
  try {
    const { count, error } = await supabase
      .from('books')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error('❌ Ошибка при подсчете книг:', error.message);
      return 0;
    }
    
    return count || 0;
  } catch (error) {
    console.error('❌ Ошибка при подсчете книг:', error.message);
    return 0;
  }
}

async function main() {
  console.log('📚 Скрипт вставки книг в Stefa.Books\n');
  
  // Проверяем подключение
  const isConnected = await checkConnection();
  if (!isConnected) {
    process.exit(1);
  }
  
  // Получаем текущее количество книг
  const initialCount = await getBooksCount();
  console.log(`📚 Текущее количество книг: ${initialCount}\n`);
  
  // Вставляем книги
  const result = await insertBooks();
  
  // Получаем финальное количество книг
  const finalCount = await getBooksCount();
  const addedBooks = finalCount - initialCount;
  
  console.log('\n🎉 Итоговый результат:');
  console.log(`📚 Книг было: ${initialCount}`);
  console.log(`📚 Книг стало: ${finalCount}`);
  console.log(`➕ Добавлено: ${addedBooks}`);
  console.log(`✅ Успешных операций: ${result.successCount}`);
  console.log(`❌ Ошибок: ${result.errorCount}`);
  
  if (result.errorCount === 0) {
    console.log('\n🎊 Все книги успешно добавлены!');
  } else {
    console.log('\n⚠️  Некоторые книги не удалось добавить. Проверьте логи выше.');
  }
}

// Запускаем скрипт
if (require.main === module) {
  main().catch(error => {
    console.error('💥 Критическая ошибка:', error);
    process.exit(1);
  });
}

module.exports = { insertBooks, checkConnection, getBooksCount };
