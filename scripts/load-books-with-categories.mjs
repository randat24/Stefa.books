#!/usr/bin/env node

/**
 * Скрипт для загрузки книг с правильными категориями
 * Использование: node scripts/load-books-with-categories.mjs path/to/books.csv
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

// Карта категорий для быстрого поиска
let categoriesMap = new Map()

async function loadCategories() {
  console.log('📚 Загрузка категорий из базы данных...')
  
  const { data: categories, error } = await supabase
    .from('categories')
    .select('*')
  
  if (error) {
    console.error('❌ Ошибка загрузки категорий:', error.message)
    return
  }
  
  // Создаем карту для быстрого поиска
  categories.forEach(category => {
    // Добавляем основную категорию
    categoriesMap.set(category.name.toLowerCase(), category.id)
    
    // Добавляем подкатегории
    if (category.subcategories) {
      category.subcategories.forEach(sub => {
        categoriesMap.set(sub.name.toLowerCase(), sub.id)
      })
    }
  })
  
  console.log(`✅ Загружено ${categories.length} категорий`)
  console.log('📋 Доступные категории:')
  categories.forEach(cat => {
    console.log(`  ${cat.name} (${cat.id})`)
    if (cat.subcategories) {
      cat.subcategories.forEach(sub => {
        console.log(`    └─ ${sub.name} (${sub.id})`)
      })
    }
  })
}

function findCategoryId(categoryName) {
  if (!categoryName) return null
  
  // Пробуем найти точное совпадение
  let categoryId = categoriesMap.get(categoryName.toLowerCase().trim())
  
  if (categoryId) return categoryId
  
  // Пробуем найти частичное совпадение
  for (const [name, id] of categoriesMap) {
    if (name.includes(categoryName.toLowerCase().trim()) || 
        categoryName.toLowerCase().trim().includes(name)) {
      return id
    }
  }
  
  return null
}

function processBookData(row) {
  const categoryName = row.category || row['Категория'] || ''
  const categoryId = findCategoryId(categoryName)
  
  if (categoryName && !categoryId) {
    console.warn(`⚠️  Категория "${categoryName}" не найдена в базе данных`)
  }
  
  return {
    title: row.title || row['Название'] || '',
    author: row.author || row['Автор'] || '',
    isbn: row.isbn || row['ISBN'] || null,
    description: row.description || row['Описание'] || null,
    cover_url: row.cover_url || row['Обложка'] || row['URL обложки'] || null,
    category_id: categoryId, // Используем ID категории, а не строку
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
    
    // Сначала загружаем категории
    await loadCategories()
    
    // Читаем CSV файл
    console.log('\n📖 Чтение CSV файла...')
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
      console.log(`  Категория ID: ${book.category_id || 'НЕ НАЙДЕНА'}`)
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
  console.error('Использование: node scripts/load-books-with-categories.mjs path/to/books.csv')
  console.error('\n📝 Инструкция:')
  console.error('1. Экспортируйте Google Sheets в CSV')
  console.error('2. В колонке "Категория" укажите название категории (например: "Казки", "Пригоди")')
  console.error('3. Сохраните файл как books.csv')
  console.error('4. Запустите: node scripts/load-books-with-categories.mjs books.csv')
  process.exit(1)
}

// Запускаем скрипт
loadBooksFromCSV(csvFilePath)
