#!/usr/bin/env node

/**
 * Скрипт для конвертации CSV файла с книгами в SQL скрипт
 */

import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';

// Конфигурация
const CONFIG = {
  inputFile: process.argv[2] || './books.csv',
  outputFile: './generated_books_loader.sql',
  startCode: 1, // Начальный номер кода
};

// Функция для экранирования SQL строк
function escapeSqlString(str) {
  if (!str) return 'NULL';
  return `'${str.replace(/'/g, "''")}'`;
}

// Функция для определения категории
function getCategoryString(category) {
  if (!category) return 'NULL';
  return `find_category_by_parts(${escapeSqlString(category)})`;
}

// Функция для конвертации CSV в SQL
async function convertCsvToSql() {
  try {
    console.log('📊 Конвертация CSV в SQL...');
    console.log(`📁 Входной файл: ${CONFIG.inputFile}`);
    console.log(`📁 Выходной файл: ${CONFIG.outputFile}`);
    
    if (!fs.existsSync(CONFIG.inputFile)) {
      throw new Error(`Файл ${CONFIG.inputFile} не найден`);
    }
    
    const books = [];
    
    // Читаем CSV файл
    await new Promise((resolve, reject) => {
      fs.createReadStream(CONFIG.inputFile)
        .pipe(csv())
        .on('data', (row) => {
          // Очищаем данные
          const book = {
            title: row['Назва'] || row['title'] || '',
            author: row['Автор'] || row['author'] || '',
            isbn: row['ISBN'] || row['isbn'] || '',
            description: row['Опис'] || row['description'] || '',
            cover_url: row['Обкладинка'] || row['cover_url'] || '',
            category: row['Категорія'] || row['category'] || '',
            available: row['Доступна'] || row['available'] || 'true'
          };
          
          if (book.title && book.author) {
            books.push(book);
          }
        })
        .on('end', resolve)
        .on('error', reject);
    });
    
    console.log(`✅ Прочитано ${books.length} книг из CSV`);
    
    // Генерируем SQL скрипт
    let sql = `-- ============================================================================
-- АВТОМАТИЧЕСКИ СГЕНЕРИРОВАННЫЙ СКРИПТ ЗАГРУЗКИ КНИГ
-- ============================================================================
-- Создан: ${new Date().toISOString()}
-- Количество книг: ${books.length}

-- 1. Создаем необходимые функции
CREATE OR REPLACE FUNCTION find_category_by_parts(category_string TEXT)
RETURNS UUID AS $$
DECLARE
    category_parts TEXT[];
    part TEXT;
    found_category_id UUID;
BEGIN
    IF category_string IS NULL OR trim(category_string) = '' THEN
        RETURN NULL;
    END IF;
    
    category_parts := string_to_array(trim(category_string), ',');
    
    FOREACH part IN ARRAY category_parts
    LOOP
        part := trim(part);
        
        SELECT id INTO found_category_id 
        FROM public.categories 
        WHERE name ILIKE '%' || part || '%' 
        AND parent_id IS NOT NULL
        ORDER BY 
            CASE WHEN name ILIKE part THEN 1 ELSE 2 END
        LIMIT 1;
        
        IF found_category_id IS NOT NULL THEN
            RETURN found_category_id;
        END IF;
    END LOOP;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_book_code()
RETURNS TEXT AS $$
DECLARE
    year_part TEXT;
    sequence_part TEXT;
    new_code TEXT;
BEGIN
    year_part := EXTRACT(YEAR FROM NOW())::TEXT;
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(code FROM 8) AS INTEGER)), 0) + 1
    INTO sequence_part
    FROM public.books 
    WHERE code LIKE 'SB-' || year_part || '-%';
    
    sequence_part := LPAD(sequence_part::TEXT, 4, '0');
    new_code := 'SB-' || year_part || '-' || sequence_part;
    
    RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- 2. Загружаем книги
INSERT INTO public.books (
    title, 
    author, 
    isbn, 
    description, 
    cover_url, 
    category_id, 
    available, 
    code
) VALUES

`;

    // Добавляем книги
    books.forEach((book, index) => {
      const year = new Date().getFullYear();
      const sequence = String(index + CONFIG.startCode).padStart(4, '0');
      const code = `SB-${year}-${sequence}`;
      
      const available = book.available.toLowerCase() === 'так' || 
                       book.available.toLowerCase() === 'true' || 
                       book.available === '1' ? 'true' : 'false';
      
      sql += `(${escapeSqlString(book.title)}, ${escapeSqlString(book.author)}, ${escapeSqlString(book.isbn)}, ${escapeSqlString(book.description)}, ${escapeSqlString(book.cover_url)}, ${getCategoryString(book.category)}, ${available}, '${code}')`;
      
      if (index < books.length - 1) {
        sql += ',\n';
      } else {
        sql += '\n';
      }
    });
    
    sql += `
ON CONFLICT (code) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    isbn = EXCLUDED.isbn,
    description = EXCLUDED.description,
    cover_url = EXCLUDED.cover_url,
    category_id = EXCLUDED.category_id,
    updated_at = NOW();

-- 3. Проверяем результат
SELECT 
    'Книги загружены успешно!' as status,
    (SELECT COUNT(*) FROM public.books) as total_books,
    (SELECT COUNT(*) FROM public.books WHERE available = true) as available_books,
    (SELECT COUNT(DISTINCT category_id) FROM public.books WHERE category_id IS NOT NULL) as categories_with_books,
    (SELECT COUNT(DISTINCT author) FROM public.books) as unique_authors;

-- 4. Показываем загруженные книги
SELECT 
    b.title,
    b.author,
    b.code,
    c.name as category_name,
    b.available
FROM public.books b
LEFT JOIN public.categories c ON b.category_id = c.id
ORDER BY b.created_at DESC
LIMIT 20;
`;

    // Сохраняем SQL файл
    fs.writeFileSync(CONFIG.outputFile, sql);
    
    console.log(`✅ SQL скрипт создан: ${CONFIG.outputFile}`);
    console.log(`📚 Количество книг: ${books.length}`);
    console.log(`🔢 Коды: SB-${new Date().getFullYear()}-${String(CONFIG.startCode).padStart(4, '0')} - SB-${new Date().getFullYear()}-${String(books.length + CONFIG.startCode - 1).padStart(4, '0')}`);
    
    // Показываем примеры
    console.log('\n📖 Примеры книг:');
    books.slice(0, 3).forEach((book, index) => {
      console.log(`   ${index + 1}. ${book.title} - ${book.author}`);
    });
    
  } catch (error) {
    console.error('❌ Ошибка конвертации:', error.message);
    process.exit(1);
  }
}

// Запуск скрипта
if (import.meta.url === `file://${process.argv[1]}`) {
  convertCsvToSql();
}

export { convertCsvToSql };
