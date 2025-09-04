#!/usr/bin/env node

/**
 * Быстрый импорт книг из Google таблицы
 * Упрощенная версия без сложных зависимостей
 */

const fs = require('fs');
const path = require('path');

/**
 * Создает SQL файл для импорта книг
 */
function createImportSQL(books) {
  let sql = '-- ============================================================================\n';
  sql += '-- QUICK IMPORT FROM GOOGLE SHEETS\n';
  sql += '-- ============================================================================\n\n';
  
  sql += '-- Очистка существующих данных\n';
  sql += 'DELETE FROM public.book_authors;\n';
  sql += 'DELETE FROM public.books;\n';
  sql += 'DELETE FROM public.authors;\n\n';
  
  sql += '-- Импорт книг\n';
  sql += 'INSERT INTO "public"."books" (\n';
  sql += '    "id", "code", "title", "author", "category", "subcategory",\n';
  sql += '    "description", "short_description", "isbn", "pages", "age_range",\n';
  sql += '    "language", "publisher", "publication_year", "cover_url", "status",\n';
  sql += '    "available", "qty_total", "qty_available", "price_uah", "location",\n';
  sql += '    "rating", "rating_count", "badges", "tags", "search_vector",\n';
  sql += '    "search_text", "created_at", "updated_at"\n';
  sql += ') VALUES\n';
  
  const values = [];
  
  books.forEach((book, index) => {
    const value = generateBookSQL(book, index + 1);
    values.push(value);
  });
  
  sql += values.join(',\n') + ';\n\n';
  
  // Добавляем создание авторов
  sql += '-- Создание авторов\n';
  sql += 'INSERT INTO public.authors (name, created_at)\n';
  sql += 'SELECT DISTINCT\n';
  sql += '    author,\n';
  sql += '    NOW()\n';
  sql += 'FROM public.books\n';
  sql += 'WHERE author IS NOT NULL\n';
  sql += 'AND author NOT IN (SELECT name FROM public.authors);\n\n';
  
  // Добавляем связывание
  sql += '-- Связывание книг с авторами\n';
  sql += 'INSERT INTO public.book_authors (book_id, author_id, role)\n';
  sql += 'SELECT\n';
  sql += '    b.id,\n';
  sql += '    a.id,\n';
  sql += '    \'author\'\n';
  sql += 'FROM public.books b\n';
  sql += 'JOIN public.authors a ON b.author = a.name;\n\n';
  
  // Добавляем статистику
  sql += '-- Статистика\n';
  sql += 'SELECT\n';
  sql += '    \'Quick import completed!\' as status,\n';
  sql += '    (SELECT COUNT(*) FROM public.books) as books_count,\n';
  sql += '    (SELECT COUNT(*) FROM public.authors) as authors_count,\n';
  sql += '    (SELECT COUNT(*) FROM public.book_authors) as book_authors_count;\n';
  
  return sql;
}

/**
 * Генерирует SQL для одной книги
 */
function generateBookSQL(book, index) {
  const id = `gen_random_uuid()`;
  const code = book.code || `'BOOK${index}'`;
  const title = book.title || `'Книга ${index}'`;
  const author = book.author || 'Невідомий автор';
  const category = book.category || 'Без категорії';
  const description = book.description || null;
  const isbn = book.isbn || null;
  const pages = book.pages || null;
  const ageRange = book.ageRange || null;
  const language = book.language || 'uk';
  const publisher = book.publisher || null;
  const year = book.year || null;
  const coverUrl = book.coverUrl || null;
  const status = 'available';
  const available = true;
  const qtyTotal = 1;
  const qtyAvailable = 1;
  const price = book.price || null;
  const location = 'вул. Маріупольська 13/2, Миколаїв';
  const rating = null;
  const ratingCount = 0;
  const badges = '{}';
  const tags = null;
  
  // Создаем search_text
  const searchText = `${title} ${author} ${category}`;
  
  return `    (${id}, ${code}, ${escapeString(title)}, ${escapeString(author)}, ${escapeString(category)}, null, ${escapeString(description)}, null, ${escapeString(isbn)}, ${pages}, ${escapeString(ageRange)}, ${escapeString(language)}, ${escapeString(publisher)}, ${year}, ${escapeString(coverUrl)}, ${escapeString(status)}, ${available}, ${qtyTotal}, ${qtyAvailable}, ${price}, ${escapeString(location)}, ${rating}, ${ratingCount}, ${badges}, ${escapeString(tags)}, to_tsvector('simple', ${escapeString(searchText)}), ${escapeString(searchText)}, NOW(), NOW())`;
}

/**
 * Экранирует строку для SQL
 */
function escapeString(str) {
  if (str === null || str === undefined) return 'null';
  return `'${str.replace(/'/g, "''")}'`;
}

/**
 * Основная функция
 */
function main() {
  console.log('🚀 Создаем SQL файл для импорта книг...');
  
  // ТЕСТОВЫЕ ДАННЫЕ - ЗАМЕНИТЕ НА ВАШИ ДАННЫЕ ИЗ GOOGLE ТАБЛИЦЫ
  const books = [
    {
      code: '7873',
      title: 'Ким хотіла бути Панда?',
      author: 'Світлана Мирошниченко',
      category: 'Казка',
      description: 'Чарівна історія про панду, яка мріє стати кимось особливим. Книга для дітей дошкільного віку з красивими ілюстраціями.',
      isbn: '978-966-942-123-4',
      pages: 32,
      ageRange: '3-6 років',
      language: 'uk',
      publisher: 'Віват',
      year: 2023,
      coverUrl: 'https://drive.google.com/uc?export=view&id=1ABC123',
      price: 240.00
    },
    {
      code: '5560',
      title: 'Котигорошко',
      author: 'Невідомий автор',
      category: 'Казки',
      description: 'Українська народна казка про хороброго хлопчика Котигорошка, який перемагає змія.',
      isbn: '978-966-942-124-1',
      pages: 24,
      ageRange: '3-6 років',
      language: 'uk',
      publisher: 'Віват',
      year: 2023,
      coverUrl: 'https://drive.google.com/uc?export=view&id=1DEF456',
      price: 203.00
    },
    {
      code: '3365',
      title: 'Джуді Муді. Книга 1',
      author: 'МакДоналд Меган',
      category: 'Пригоди',
      description: 'Перша книга серії про веселу дівчинку Джуді Муді та її пригоди.',
      isbn: '978-966-942-125-8',
      pages: 160,
      ageRange: '6-9 років',
      language: 'uk',
      publisher: 'Видавництво Старого Лева',
      year: 2022,
      coverUrl: 'https://drive.google.com/uc?export=view&id=1GHI789',
      price: 158.00
    },
    {
      code: '5616',
      title: 'Маленький принц',
      author: 'Антуан Де Сент-Екзюпері',
      category: 'Казка',
      description: 'Відома казка-притча про маленького принца, яка вчить дітей цінностям дружби та любові.',
      isbn: '978-966-942-126-5',
      pages: 96,
      ageRange: '8-12 років',
      language: 'uk',
      publisher: 'КМ-Букс',
      year: 2021,
      coverUrl: 'https://drive.google.com/uc?export=view&id=1JKL012',
      price: 407.00
    },
    {
      code: '6528',
      title: 'Українські казки',
      author: 'Невідомий автор',
      category: 'Казки',
      description: 'Збірка найкращих українських народних казок для дітей різного віку.',
      isbn: '978-966-942-127-2',
      pages: 128,
      ageRange: '3-8 років',
      language: 'uk',
      publisher: 'Ранок',
      year: 2023,
      coverUrl: 'https://drive.google.com/uc?export=view&id=1MNO345',
      price: 300.00
    }
  ];
  
  // Создаем SQL
  const sql = createImportSQL(books);
  
  // Сохраняем в файл
  const outputPath = path.join(__dirname, 'quick-import-books.sql');
  fs.writeFileSync(outputPath, sql, 'utf8');
  
  console.log(`✅ SQL файл создан: ${outputPath}`);
  console.log(`📚 Готово к импорту в базу данных`);
  console.log(`📖 Книг для импорта: ${books.length}`);
  
  // Создаем скрипт для загрузки обложек
  const coverScript = createCoverUploadScript(books);
  const coverPath = path.join(__dirname, 'quick-upload-covers.js');
  fs.writeFileSync(coverPath, coverScript, 'utf8');
  
  console.log(`🖼️  Скрипт загрузки обложек: ${coverPath}`);
}

/**
 * Создает скрипт для загрузки обложек
 */
function createCoverUploadScript(books) {
  let script = `#!/usr/bin/env node

/**
 * Быстрая загрузка обложек в Cloudinary
 */

const cloudinary = require('cloudinary').v2;

// Конфигурация Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dchx7vd97',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const books = ${JSON.stringify(books, null, 2)};

async function uploadCovers() {
  console.log('🚀 Начинаем загрузку обложек...');
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const book of books) {
    try {
      console.log(\`📖 Обрабатываем: \${book.title} (\${book.code})\`);
      
      if (!book.coverUrl) {
        console.log('⏭️  Пропускаем (нет обложки)');
        continue;
      }
      
      const result = await cloudinary.uploader.upload(book.coverUrl, {
        public_id: \`stefa-books/\${book.code}\`,
        folder: 'stefa-books',
        resource_type: 'image',
        transformation: [
          { width: 300, height: 400, crop: 'fill', quality: 'auto' }
        ]
      });
      
      console.log(\`✅ Успешно загружено: \${result.secure_url}\`);
      console.log(\`UPDATE public.books SET cover_url = '\${result.secure_url}' WHERE code = '\${book.code}';\`);
      successCount++;
      
    } catch (error) {
      console.error(\`❌ Ошибка загрузки \${book.code}:\`, error.message);
      errorCount++;
    }
  }
  
  console.log(\`\\n📊 Результат:\`);
  console.log(\`✅ Успешно: \${successCount}\`);
  console.log(\`❌ Ошибок: \${errorCount}\`);
}

uploadCovers().catch(console.error);
`;
  
  return script;
}

// Запуск скрипта
if (require.main === module) {
  main();
}

module.exports = { main, createImportSQL, generateBookSQL };
