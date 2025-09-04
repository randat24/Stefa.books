#!/usr/bin/env node

/**
 * Получение данных из Google таблицы
 * Экспорт в SQL формат для импорта в базу данных
 */

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// Конфигурация Google Sheets API
const auth = new google.auth.GoogleAuth({
  keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
});

const sheets = google.sheets({ version: 'v4', auth });

/**
 * Получает данные из Google таблицы
 */
async function fetchGoogleSheetsData(spreadsheetId, range) {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: spreadsheetId,
      range: range,
    });
    
    return response.data.values;
  } catch (error) {
    console.error('Ошибка получения данных из Google Sheets:', error.message);
    return null;
  }
}

/**
 * Конвертирует данные в SQL INSERT
 */
function convertToSQL(data, startIndex = 1) {
  if (!data || data.length < 2) {
    console.log('❌ Недостаточно данных для конвертации');
    return '';
  }
  
  const headers = data[0];
  const rows = data.slice(1);
  
  let sql = '-- ============================================================================\n';
  sql += '-- IMPORT FROM GOOGLE SHEETS\n';
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
  
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (row.length === 0) continue;
    
    // Создаем объект с данными
    const book = {};
    headers.forEach((header, index) => {
      book[header] = row[index] || null;
    });
    
    // Генерируем SQL для одной книги
    const value = generateBookSQL(book, i + startIndex);
    values.push(value);
  }
  
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
  sql += '    \'Import from Google Sheets completed!\' as status,\n';
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
  const code = book['Код книги'] || `'BOOK${index}'`;
  const title = book['Название'] || `'Книга ${index}'`;
  const author = book['Автор'] || 'Невідомий автор';
  const category = book['Категорія'] || 'Без категорії';
  const description = book['Опис'] || null;
  const isbn = book['ISBN'] || null;
  const pages = book['Сторінки'] || null;
  const ageRange = book['Вік'] || null;
  const language = book['Мова'] || 'uk';
  const publisher = book['Видавництво'] || null;
  const year = book['Рік'] || null;
  const coverUrl = book['Фото (URL)'] || null;
  const status = 'available';
  const available = true;
  const qtyTotal = 1;
  const qtyAvailable = 1;
  const price = book['Ціна'] || null;
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
async function main() {
  console.log('🚀 Начинаем получение данных из Google таблицы...');
  
  // ЗАМЕНИТЕ НА ВАШИ ДАННЫЕ
  const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID || 'your_spreadsheet_id';
  const range = process.env.GOOGLE_RANGE || 'Sheet1!A:Z';
  
  try {
    // Получаем данные
    const data = await fetchGoogleSheetsData(spreadsheetId, range);
    
    if (!data) {
      console.log('❌ Не удалось получить данные из Google таблицы');
      return;
    }
    
    console.log(`📊 Получено ${data.length} строк данных`);
    
    // Конвертируем в SQL
    const sql = convertToSQL(data);
    
    // Сохраняем в файл
    const outputPath = path.join(__dirname, 'import-from-google-sheets-generated.sql');
    fs.writeFileSync(outputPath, sql, 'utf8');
    
    console.log(`✅ SQL файл создан: ${outputPath}`);
    console.log(`📚 Готово к импорту в базу данных`);
    
  } catch (error) {
    console.error('Критическая ошибка:', error.message);
  }
}

// Запуск скрипта
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main, fetchGoogleSheetsData, convertToSQL };
