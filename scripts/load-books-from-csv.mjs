#!/usr/bin/env node

/**
 * Скрипт для загрузки книг из CSV файла (экспортированного из Google Sheets)
 * Использование: node scripts/load-books-from-csv.mjs path/to/books.csv
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { parse } from 'csv-parse/sync'
import dotenv from 'dotenv'

// Загружаем переменные окружения
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Ошибка: Не найдены переменные окружения')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

function processCategories(categoriesString) {
  if (!categoriesString) return []
  return categoriesString.split(',').map(cat => cat.trim()).filter(cat => cat.length > 0)
}

function processBookData(row) {
  return {
    title: row.title || row['Название'] || '',
    author: row.author || row['Автор'] || '',
    isbn: row.isbn || row['ISBN'] || null,
    description: row.description || row['Описание'] || null,
    cover_url: row.cover_url || row['Обложка'] || row['URL обложки'] || null,
    category: processCategories(row.category || row['Категория'] || ''),
    age_range: row.age_range || row['Возраст'] || row['Возрастная группа'] || null,
    short_description: row.short_description || row['Краткое описание'] || null,
    qty_total: parseInt(row.qty_total || row['Количество'] || row['Общее количество'] || '1'),
    qty_available: parseInt(row.qty_available || row['Доступно'] || row['Доступное количество'] || '1'),
    price_uah: parseFloat(row.price_uah || row['Цена'] || row['Цена в гривнах'] || '0'),
    location: row.location || row['Местоположение'] || null,
    code: row.code || row['Код'] || row['Код книги'] || '',
    available: (row.available || row['Доступна'] || 'true').toLowerCase() === 'true'
  }
}

async function loadBooksFromCSV(csvFilePath) {
  try {
    console.log(`📚 Загрузка книг из CSV файла: ${csvFilePath}`)
    
    // Читаем CSV файл
    console.log('📖 Чтение CSV файла...')
    const csvContent = readFileSync(csvFilePath, 'utf-8')
    
    // Парсим CSV
    console.log('🔍 Парсинг CSV данных...')
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    })
    
    console.log(`📊 Найдено ${records.length} записей в CSV`)
    
    // Обрабатываем каждую запись
    console.log('🔄 Обработка данных...')
    const books = records.map(processBookData)
    
    // Показываем примеры
    console.log('\n📋 Примеры обработанных данных:')
    books.slice(0, 3).forEach((book, index) => {
      console.log(`\nКнига ${index + 1}:`)
      console.log(`  Название: ${book.title}`)
      console.log(`  Автор: ${book.author}`)
      console.log(`  Категории: ${book.category.join(', ')}`)
      console.log(`  Цена: ${book.price_uah} ₴`)
      console.log(`  Код: ${book.code}`)
    })
    
    // Спрашиваем подтверждение
    console.log(`\n⚠️  Готово загрузить ${books.length} книг в базу данных?`)
    console.log('Это действие:')
    console.log('- Добавит новые книги')
    console.log('- Обновит существующие (по коду)')
    console.log('- Не удалит существующие книги')
    
    // В реальном скрипте здесь был бы prompt, но для автоматизации пропускаем
    console.log('✅ Продолжаем загрузку...')
    
    // Загружаем книги по частям
    const batchSize = 10
    let successCount = 0
    let errorCount = 0
    
    for (let i = 0; i < books.length; i += batchSize) {
      const batch = books.slice(i, i + batchSize)
      console.log(`📦 Обработка партии ${Math.floor(i / batchSize) + 1}/${Math.ceil(books.length / batchSize)} (${batch.length} книг)`)
      
      for (const book of batch) {
        try {
          // Проверяем, существует ли книга с таким кодом
          const { data: existingBook } = await supabase
            .from('books')
            .select('id')
            .eq('code', book.code)
            .single()
          
          if (existingBook) {
            // Обновляем существующую книгу
            const { error: updateError } = await supabase
              .from('books')
              .update(book)
              .eq('code', book.code)
            
            if (updateError) {
              console.error(`❌ Ошибка обновления книги ${book.title}:`, updateError.message)
              errorCount++
            } else {
              console.log(`✅ Обновлена: ${book.title}`)
              successCount++
            }
          } else {
            // Создаем новую книгу
            const { error: insertError } = await supabase
              .from('books')
              .insert(book)
            
            if (insertError) {
              console.error(`❌ Ошибка создания книги ${book.title}:`, insertError.message)
              errorCount++
            } else {
              console.log(`✅ Создана: ${book.title}`)
              successCount++
            }
          }
        } catch (error) {
          console.error(`❌ Ошибка обработки книги ${book.title}:`, error.message)
          errorCount++
        }
      }
    }
    
    console.log('\n🎉 Загрузка завершена!')
    console.log(`✅ Успешно обработано: ${successCount} книг`)
    console.log(`❌ Ошибок: ${errorCount} книг`)
    
    // Показываем итоговую статистику
    const { data: finalBooks } = await supabase
      .from('books')
      .select('*')
    
    console.log(`\n📊 Итого книг в базе: ${finalBooks.length}`)
    
  } catch (error) {
    console.error('❌ Неожиданная ошибка:', error.message)
  }
}

// Получаем путь к CSV файлу из аргументов командной строки
const csvFilePath = process.argv[2]

if (!csvFilePath) {
  console.error('❌ Ошибка: Не указан путь к CSV файлу')
  console.error('Использование: node scripts/load-books-from-csv.mjs path/to/books.csv')
  console.error('\n📝 Инструкция:')
  console.error('1. Экспортируйте Google Sheets в CSV')
  console.error('2. Сохраните файл как books.csv')
  console.error('3. Запустите: node scripts/load-books-from-csv.mjs books.csv')
  process.exit(1)
}

// Запускаем скрипт
loadBooksFromCSV(csvFilePath)
