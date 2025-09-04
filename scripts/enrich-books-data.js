const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
require('dotenv').config({ path: '../.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Задержка между запросами для избежания блокировки
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Функция поиска информации о книге через Google Books API
async function searchBookInfo(title, author) {
  try {
    const query = `${title} ${author}`.replace(/[^\p{L}\p{N}\s]/gu, '').trim();
    const response = await axios.get(`https://www.googleapis.com/books/v1/volumes`, {
      params: {
        q: query,
        langRestrict: 'uk',
        maxResults: 5,
        key: process.env.GOOGLE_BOOKS_API_KEY // Опционально, для увеличения лимитов
      }
    });

    if (response.data.items && response.data.items.length > 0) {
      const book = response.data.items[0].volumeInfo;
      
      return {
        description: book.description || null,
        pages: book.pageCount || null,
        publication_year: book.publishedDate ? parseInt(book.publishedDate.substring(0, 4)) : null,
        publisher: book.publisher || null,
        isbn: book.industryIdentifiers ? 
          book.industryIdentifiers.find(id => id.type === 'ISBN_13')?.identifier || 
          book.industryIdentifiers.find(id => id.type === 'ISBN_10')?.identifier 
          : null
      };
    }
    
    return null;
  } catch (error) {
    console.log(`Ошибка поиска для "${title}" - ${author}: ${error.message}`);
    return null;
  }
}

// Функция поиска через Open Library API как альтернативный источник
async function searchOpenLibrary(title, author) {
  try {
    const query = encodeURIComponent(`${title} ${author}`);
    const response = await axios.get(`https://openlibrary.org/search.json?q=${query}&limit=5`);
    
    if (response.data.docs && response.data.docs.length > 0) {
      const book = response.data.docs[0];
      
      return {
        description: book.first_sentence ? book.first_sentence.join(' ') : null,
        pages: book.number_of_pages_median || null,
        publication_year: book.first_publish_year || null,
        publisher: book.publisher ? book.publisher[0] : null,
        isbn: book.isbn ? book.isbn[0] : null
      };
    }
    
    return null;
  } catch (error) {
    console.log(`Ошибка поиска в Open Library для "${title}" - ${author}: ${error.message}`);
    return null;
  }
}

// Ручная база данных для украинских книг
const manualData = {
  'Енеїда': {
    author: 'Іван Котляревський',
    description: 'Перша українська літературна травестія, заснована на поемі Вергілія "Енеїда". Котляревський переробив античний сюжет, перенісши дію в українське середовище.',
    pages: 142,
    publication_year: 1798
  },
  'Захар Беркут': {
    author: 'Іван Франко',
    description: 'Історична повість про боротьбу карпатських горян проти монгольської навали в XIII столітті. Розповідає про героїзм українського народу.',
    pages: 156,
    publication_year: 1883
  },
  'Кайдашева сім\'я': {
    author: 'Іван Нечуй-Левицький',
    description: 'Соціально-побутова повість про життя українського селянства, їхні звичаї, традиції та соціальні проблеми.',
    pages: 208,
    publication_year: 1879
  },
  'Дивовижні пригоди у лісовій школі': {
    author: 'Всеволод Нестайко',
    description: 'Популярна дитяча книга про пригоди школярів у лісовій школі. Захоплююча історія про дружбу, навчання та відкриття.',
    pages: 184,
    publication_year: 1960
  },
  'Тореадори з Васюківки': {
    author: 'Всеволод Нестайко',
    description: 'Гумористична повість про пригоди сільських хлопців, які вирішили стати тореадорами. Яскрава картина українського села.',
    pages: 196,
    publication_year: 1963
  },
  'Котигорошко': {
    author: 'Українська народна казка',
    description: 'Традиційна українська народна казка про богатиря Котигорошка, який бореться зі злими силами та рятує людей.',
    pages: 32,
    publication_year: null
  }
};

// Получить информацию из ручной базы
function getManualData(title, author) {
  const key = Object.keys(manualData).find(k => 
    title.toLowerCase().includes(k.toLowerCase()) || 
    k.toLowerCase().includes(title.toLowerCase())
  );
  
  if (key && manualData[key].author.toLowerCase().includes(author.toLowerCase())) {
    return manualData[key];
  }
  
  return null;
}

async function enrichBooksData() {
  try {
    // Получаем все книги без описания
    const { data: books, error } = await supabase
      .from('books')
      .select('*')
      .is('description', null);
    
    if (error) {
      console.error('Ошибка получения книг:', error.message);
      return;
    }
    
    console.log(`Найдено ${books.length} книг без описания`);
    
    let processedCount = 0;
    let successCount = 0;
    
    for (const book of books) {
      processedCount++;
      console.log(`\n${processedCount}/${books.length} - Обрабатываю: "${book.title}" - ${book.author}`);
      
      let bookInfo = null;
      
      // 1. Сначала пробуем ручную базу данных
      bookInfo = getManualData(book.title, book.author);
      if (bookInfo) {
        console.log('  ✓ Найдено в ручной базе данных');
      } else {
        // 2. Пробуем Google Books API
        bookInfo = await searchBookInfo(book.title, book.author);
        await delay(1000); // Пауза между запросами
        
        if (bookInfo) {
          console.log('  ✓ Найдено в Google Books');
        } else {
          // 3. Пробуем Open Library
          bookInfo = await searchOpenLibrary(book.title, book.author);
          await delay(1000);
          
          if (bookInfo) {
            console.log('  ✓ Найдено в Open Library');
          } else {
            console.log('  ✗ Информация не найдена');
            continue;
          }
        }
      }
      
      // Обновляем запись в базе данных
      const updateData = {};
      if (bookInfo.description) updateData.description = bookInfo.description;
      if (bookInfo.pages) updateData.pages = bookInfo.pages;
      if (bookInfo.publication_year) updateData.publication_year = bookInfo.publication_year;
      if (bookInfo.publisher && !book.publisher) updateData.publisher = bookInfo.publisher;
      if (bookInfo.isbn && !book.isbn) updateData.isbn = bookInfo.isbn;
      
      if (Object.keys(updateData).length > 0) {
        const { error: updateError } = await supabase
          .from('books')
          .update(updateData)
          .eq('id', book.id);
        
        if (updateError) {
          console.log(`  ✗ Ошибка обновления: ${updateError.message}`);
        } else {
          successCount++;
          console.log(`  ✓ Обновлено полей: ${Object.keys(updateData).join(', ')}`);
        }
      }
      
      // Пауза между книгами
      await delay(2000);
    }
    
    console.log(`\n=== ЗАВЕРШЕНО ===`);
    console.log(`Обработано книг: ${processedCount}`);
    console.log(`Успешно обновлено: ${successCount}`);
    
  } catch (error) {
    console.error('Общая ошибка:', error.message);
  }
}

// Функция для тестирования на одной книге
async function testSingleBook(title, author) {
  console.log(`Тестирую поиск для: "${title}" - ${author}`);
  
  const manual = getManualData(title, author);
  if (manual) {
    console.log('Найдено в ручной базе:', manual);
    return;
  }
  
  const google = await searchBookInfo(title, author);
  if (google) {
    console.log('Найдено в Google Books:', google);
    return;
  }
  
  const openLib = await searchOpenLibrary(title, author);
  if (openLib) {
    console.log('Найдено в Open Library:', openLib);
    return;
  }
  
  console.log('Информация не найдена');
}

// Запуск скрипта
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args[0] === 'test' && args[1] && args[2]) {
    testSingleBook(args[1], args[2]);
  } else if (args[0] === 'run') {
    enrichBooksData();
  } else {
    console.log('Использование:');
    console.log('  node enrich-books-data.js test "Название книги" "Автор"  - тест поиска');
    console.log('  node enrich-books-data.js run                            - обработка всех книг');
  }
}

module.exports = { enrichBooksData, testSingleBook };