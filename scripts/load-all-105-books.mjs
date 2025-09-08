#!/usr/bin/env node

/**
 * Скрипт для загрузки всех 105 книг из Google Sheets
 * Использование: node scripts/load-all-105-books.mjs
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
  console.error('Убедитесь, что файл .env.local содержит:')
  console.error('NEXT_PUBLIC_SUPABASE_URL=...')
  console.error('SUPABASE_SERVICE_ROLE_KEY=...')
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

function processBookData(row, index) {
  const categoryName = row.category || row['Категория'] || row['Category'] || ''
  const categoryId = findCategoryId(categoryName)
  
  if (categoryName && !categoryId) {
    console.warn(`⚠️  Строка ${index + 1}: Категория "${categoryName}" не найдена в базе данных`)
  }
  
  // Генерируем уникальный код если его нет
  const code = row.code || row['Код'] || row['Code'] || `SB-2025-${String(index + 1).padStart(4, '0')}`
  
  return {
    title: row.title || row['Название'] || row['Title'] || `Книга ${index + 1}`,
    author: row.author || row['Автор'] || row['Author'] || 'Неизвестный автор',
    isbn: row.isbn || row['ISBN'] || null,
    description: row.description || row['Описание'] || row['Description'] || null,
    cover_url: row.cover_url || row['Обложка'] || row['Cover'] || row['URL обложки'] || null,
    category_id: categoryId,
    age_range: row.age_range || row['Возраст'] || row['Age'] || row['Возрастная группа'] || null,
    short_description: row.short_description || row['Краткое описание'] || row['Short Description'] || null,
    qty_total: parseInt(row.qty_total || row['Количество'] || row['Quantity'] || row['Общее количество'] || '1'),
    qty_available: parseInt(row.qty_available || row['Доступно'] || row['Available'] || row['Доступное количество'] || '1'),
    price_uah: parseFloat(row.price_uah || row['Цена'] || row['Price'] || row['Цена в гривнах'] || '0'),
    location: row.location || row['Местоположение'] || row['Location'] || null,
    code: code,
    available: (row.available || row['Доступна'] || row['Available'] || 'true').toLowerCase() === 'true'
  }
}

async function checkExistingBooks() {
  console.log('🔍 Проверка существующих книг...')
  
  const { data: existingBooks, error } = await supabase
    .from('books')
    .select('id, title, code')
  
  if (error) {
    console.error('❌ Ошибка проверки существующих книг:', error.message)
    return []
  }
  
  console.log(`📚 В базе уже есть ${existingBooks.length} книг`)
  return existingBooks
}

async function loadBooksFromCSV(csvFilePath) {
  try {
    console.log(`📚 Загрузка книг из CSV файла: ${csvFilePath}`)
    console.log('=' .repeat(60))
    
    // Сначала загружаем категории
    await loadCategories()
    
    // Проверяем существующие книги
    const existingBooks = await checkExistingBooks()
    const existingCodes = new Set(existingBooks.map(book => book.code))
    
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
    const books = records.map((row, index) => processBookData(row, index))
    
    // Разделяем на новые и существующие
    const newBooks = books.filter(book => !existingCodes.has(book.code))
    const updateBooks = books.filter(book => existingCodes.has(book.code))
    
    console.log(`\n📋 Статистика:`)
    console.log(`  📚 Всего в CSV: ${books.length}`)
    console.log(`  ✅ Новых книг: ${newBooks.length}`)
    console.log(`  🔄 Для обновления: ${updateBooks.length}`)
    console.log(`  📚 Уже в базе: ${existingBooks.length}`)
    
    // Показываем примеры
    console.log('\n📋 Примеры обработанных данных:')
    books.slice(0, 3).forEach((book, index) => {
      console.log(`\nКнига ${index + 1}:`)
      console.log(`  Название: ${book.title}`)
      console.log(`  Автор: ${book.author}`)
      console.log(`  Категория: ${book.category_id ? '✅ Найдена' : '❌ НЕ найдена'}`)
      console.log(`  Цена: ${book.price_uah} ₴`)
      console.log(`  Код: ${book.code}`)
    })
    
    // Спрашиваем подтверждение
    console.log(`\n⚠️  Готово загрузить ${books.length} книг в базу данных?`)
    console.log('Это действие:')
    console.log(`- Добавит ${newBooks.length} новых книг`)
    console.log(`- Обновит ${updateBooks.length} существующих книг`)
    console.log('- Не удалит существующие книги')
    
    // В реальном скрипте здесь был бы prompt, но для автоматизации пропускаем
    console.log('✅ Продолжаем загрузку...')
    
    // Загружаем новые книги
    if (newBooks.length > 0) {
      console.log(`\n📦 Создание ${newBooks.length} новых книг...`)
      
      const batchSize = 10
      let successCount = 0
      let errorCount = 0
      
      for (let i = 0; i < newBooks.length; i += batchSize) {
        const batch = newBooks.slice(i, i + batchSize)
        console.log(`📦 Партия ${Math.floor(i / batchSize) + 1}/${Math.ceil(newBooks.length / batchSize)} (${batch.length} книг)`)
        
        try {
          const { error: insertError } = await supabase
            .from('books')
            .insert(batch)
          
          if (insertError) {
            console.error(`❌ Ошибка создания партии:`, insertError.message)
            errorCount += batch.length
          } else {
            console.log(`✅ Создано ${batch.length} книг`)
            successCount += batch.length
          }
        } catch (error) {
          console.error(`❌ Ошибка создания партии:`, error.message)
          errorCount += batch.length
        }
      }
      
      console.log(`\n📚 Новые книги: ✅ ${successCount} успешно, ❌ ${errorCount} ошибок`)
    }
    
    // Обновляем существующие книги
    if (updateBooks.length > 0) {
      console.log(`\n🔄 Обновление ${updateBooks.length} существующих книг...`)
      
      let successCount = 0
      let errorCount = 0
      
      for (const book of updateBooks) {
        try {
          const { error: updateError } = await supabase
            .from('books')
            .update(book)
            .eq('code', book.code)
          
          if (updateError) {
            console.error(`❌ Ошибка обновления ${book.title}:`, updateError.message)
            errorCount++
          } else {
            console.log(`✅ Обновлена: ${book.title}`)
            successCount++
          }
        } catch (error) {
          console.error(`❌ Ошибка обновления ${book.title}:`, error.message)
          errorCount++
        }
      }
      
      console.log(`\n🔄 Обновления: ✅ ${successCount} успешно, ❌ ${errorCount} ошибок`)
    }
    
    // Показываем итоговую статистику
    console.log('\n🎉 Загрузка завершена!')
    
    const { data: finalBooks } = await supabase
      .from('books')
      .select('*')
    
    console.log(`\n📊 Итоговая статистика:`)
    console.log(`  📚 Всего книг в базе: ${finalBooks.length}`)
    console.log(`  📈 Добавлено: ${newBooks.length}`)
    console.log(`  🔄 Обновлено: ${updateBooks.length}`)
    
    // Показываем книги без категорий
    const booksWithoutCategory = finalBooks.filter(book => !book.category_id)
    if (booksWithoutCategory.length > 0) {
      console.log(`\n⚠️  Книги без категории (${booksWithoutCategory.length}):`)
      booksWithoutCategory.slice(0, 5).forEach(book => {
        console.log(`  - ${book.title} (${book.code})`)
      })
      if (booksWithoutCategory.length > 5) {
        console.log(`  ... и еще ${booksWithoutCategory.length - 5} книг`)
      }
    }
    
  } catch (error) {
    console.error('❌ Неожиданная ошибка:', error.message)
  }
}

// Получаем путь к CSV файлу из аргументов командной строки
const csvFilePath = process.argv[2]

if (!csvFilePath) {
  console.error('❌ Ошибка: Не указан путь к CSV файлу')
  console.error('Использование: node scripts/load-all-105-books.mjs path/to/books.csv')
  console.error('\n📝 Инструкция:')
  console.error('1. Откройте вашу Google Sheets с 105 книгами')
  console.error('2. Файл → Скачать → CSV')
  console.error('3. Сохраните как books.csv')
  console.error('4. Запустите: node scripts/load-all-105-books.mjs books.csv')
  process.exit(1)
}

// Запускаем скрипт
loadBooksFromCSV(csvFilePath)
