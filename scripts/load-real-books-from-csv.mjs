#!/usr/bin/env node

/**
 * Скрипт для загрузки реальных книг из CSV файла с полной поддержкой админ панели
 * Использование: node scripts/load-real-books-from-csv.mjs
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

// Карта категорий
let categoriesMap = new Map()

async function loadCategories() {
  console.log('📚 Загрузка категорий...')
  
  const { data: categories, error } = await supabase
    .from('categories')
    .select('*')
  
  if (error) {
    console.error('❌ Ошибка загрузки категорий:', error.message)
    return
  }
  
  // Создаем карту для быстрого поиска
  categories.forEach(category => {
    categoriesMap.set(category.name.toLowerCase(), category.id)
    
    if (category.subcategories) {
      category.subcategories.forEach(sub => {
        categoriesMap.set(sub.name.toLowerCase(), sub.id)
      })
    }
  })
  
  console.log(`✅ Загружено ${categoriesMap.size} категорий`)
}

function findCategoryId(categoryString) {
  if (!categoryString) return null
  
  // Разделяем по запятой и ищем каждую часть
  const parts = categoryString.split(',').map(part => part.trim().toLowerCase())
  
  for (const part of parts) {
    for (const [name, id] of categoriesMap) {
      if (name.includes(part) || part.includes(name)) {
        return id
      }
    }
  }
  
  return null
}

function processBookData(row) {
  // Обрабатываем данные из CSV
  const code = row['Код'] || ''
  const title = row['Назва'] || ''
  const author = row['Автор'] || ''
  const publisher = row['Видавництво'] || ''
  const category = row['Категорія'] || ''
  const totalQty = parseInt(row['Всього'] || '1')
  const availableQty = parseInt(row['Доступно'] || '1')
  const status = row['Статус'] || ''
  const price = parseFloat(row['Ціна'] || '0')
  const fullPrice = parseFloat(row['Повна ціна'] || '0')
  const coverUrl = row['cover_url'] || ''
  const description = row['Опис'] || ''
  
  // Определяем статус доступности
  const isActive = status.includes('✅ Активна') || status.includes('Активна')
  const isAvailable = availableQty > 0 && isActive
  
  // Находим категорию
  const categoryId = findCategoryId(category)
  
  return {
    code: code,
    title: title,
    author: author,
    category_id: categoryId,
    qty_total: totalQty,
    qty_available: availableQty,
    available: isAvailable,
    price_uah: price,
    cover_url: coverUrl,
    description: description,
    isbn: null, // В CSV нет ISBN, можно добавить позже
    age_range: null, // Можно добавить позже
    short_description: description ? description.substring(0, 200) + '...' : null,
    location: null // Можно добавить позже
  }
}

async function cleanExistingBooks() {
  console.log('🧹 Очистка существующих книг...')
  
  // Удаляем все существующие книги
  const { error: deleteError } = await supabase
    .from('books')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000') // Удаляем все записи
  
  if (deleteError) {
    console.error('❌ Ошибка удаления существующих книг:', deleteError.message)
    return false
  }
  
  console.log('✅ Существующие книги удалены')
  return true
}

async function loadBooksFromCSV() {
  try {
    console.log('📚 Загрузка реальных книг из CSV файла...')
    console.log('=' .repeat(60))
    
    const csvFilePath = '/Users/fantomas/Downloads/Stefa.books - Каталог книг.csv'
    
    // Загружаем категории
    await loadCategories()
    
    // Очищаем существующие книги
    const cleaned = await cleanExistingBooks()
    if (!cleaned) {
      console.error('❌ Не удалось очистить существующие книги')
      return
    }
    
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
    
    // Фильтруем книги с пустыми кодами или названиями
    const validBooks = books.filter(book => book.code && book.title)
    
    console.log(`📋 Валидных книг: ${validBooks.length}`)
    
    // Показываем примеры
    console.log('\n📋 Примеры обработанных данных:')
    validBooks.slice(0, 5).forEach((book, index) => {
      console.log(`\nКнига ${index + 1}:`)
      console.log(`  Код: ${book.code}`)
      console.log(`  Название: ${book.title}`)
      console.log(`  Автор: ${book.author}`)
      console.log(`  Категория: ${book.category_id ? '✅ Найдена' : '❌ НЕ найдена'}`)
      console.log(`  Цена: ${book.price_uah} ₴`)
      console.log(`  Полная цена: ${book.full_price_uah} ₴`)
      console.log(`  Всего: ${book.qty_total}`)
      console.log(`  Доступно: ${book.qty_available}`)
      console.log(`  Статус: ${book.status}`)
    })
    
    // Загружаем книги по частям
    console.log(`\n📦 Загрузка ${validBooks.length} книг...`)
    
    const batchSize = 20
    let successCount = 0
    let errorCount = 0
    
    for (let i = 0; i < validBooks.length; i += batchSize) {
      const batch = validBooks.slice(i, i + batchSize)
      console.log(`📦 Партия ${Math.floor(i / batchSize) + 1}/${Math.ceil(validBooks.length / batchSize)} (${batch.length} книг)`)
      
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
    
    console.log(`\n📚 Результат загрузки: ✅ ${successCount} успешно, ❌ ${errorCount} ошибок`)
    
    // Показываем итоговую статистику
    const { data: finalBooks } = await supabase
      .from('books')
      .select('*')
    
    console.log(`\n🎉 Загрузка завершена!`)
    console.log(`📚 Всего книг в базе: ${finalBooks.length}`)
    
    // Статистика по статусам
    const activeBooks = finalBooks.filter(book => book.status === 'active').length
    const availableBooks = finalBooks.filter(book => book.available).length
    const booksWithCategory = finalBooks.filter(book => book.category_id).length
    
    console.log(`\n📊 Статистика:`)
    console.log(`  ✅ Активных книг: ${activeBooks}`)
    console.log(`  📖 Доступных книг: ${availableBooks}`)
    console.log(`  🏷️  С категориями: ${booksWithCategory}`)
    console.log(`  ❌ Без категорий: ${finalBooks.length - booksWithCategory}`)
    
    // Статистика по ценам
    const booksWithPrice = finalBooks.filter(book => book.price_uah > 0).length
    const totalValue = finalBooks.reduce((sum, book) => sum + (book.price_uah || 0), 0)
    const avgPrice = booksWithPrice > 0 ? totalValue / booksWithPrice : 0
    
    console.log(`\n💰 Финансовая статистика:`)
    console.log(`  💵 Книг с ценой: ${booksWithPrice}`)
    console.log(`  💰 Общая стоимость: ${totalValue.toLocaleString('uk-UA')} ₴`)
    console.log(`  📈 Средняя цена: ${avgPrice.toFixed(2)} ₴`)
    
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

// Запускаем скрипт
loadBooksFromCSV()
