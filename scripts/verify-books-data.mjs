#!/usr/bin/env node

/**
 * Скрипт для проверки соответствия данных между CSV и БД
 * Использование: node scripts/verify-books-data.mjs
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

async function verifyBooksData() {
  try {
    console.log('🔍 Проверка соответствия данных между CSV и БД...')
    console.log('=' .repeat(60))
    
    // 1. Загружаем данные из CSV
    console.log('📖 Загрузка данных из CSV...')
    const csvFilePath = '/Users/fantomas/Downloads/Stefa.books - Каталог книг.csv'
    const csvContent = readFileSync(csvFilePath, 'utf-8')
    
    const csvRecords = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    })
    
    console.log(`📊 CSV: ${csvRecords.length} записей`)
    
    // 2. Загружаем данные из БД
    console.log('🗄️  Загрузка данных из БД...')
    const { data: dbBooks, error } = await supabase
      .from('books')
      .select('*')
    
    if (error) {
      console.error('❌ Ошибка загрузки из БД:', error.message)
      return
    }
    
    console.log(`📊 БД: ${dbBooks.length} записей`)
    
    // 3. Создаем карты для сравнения
    const csvMap = new Map()
    const dbMap = new Map()
    
    // Обрабатываем CSV данные
    csvRecords.forEach(record => {
      const code = record['Код']
      if (code) {
        csvMap.set(code, {
          code: code,
          title: record['Назва'] || '',
          author: record['Автор'] || '',
          publisher: record['Видавництво'] || '',
          category: record['Категорія'] || '',
          totalQty: parseInt(record['Всього'] || '1'),
          availableQty: parseInt(record['Доступно'] || '1'),
          status: record['Статус'] || '',
          price: parseFloat(record['Ціна'] || '0'),
          fullPrice: parseFloat(record['Повна ціна'] || '0'),
          coverUrl: record['cover_url'] || '',
          description: record['Опис'] || ''
        })
      }
    })
    
    // Обрабатываем БД данные
    dbBooks.forEach(book => {
      dbMap.set(book.code, book)
    })
    
    console.log(`\n📋 Сравнение по кодам:`)
    console.log(`  CSV уникальных кодов: ${csvMap.size}`)
    console.log(`  БД уникальных кодов: ${dbMap.size}`)
    
    // 4. Проверяем соответствие
    let perfectMatch = 0
    let titleMismatch = 0
    let authorMismatch = 0
    let priceMismatch = 0
    let missingInDB = 0
    let missingInCSV = 0
    let missingCover = 0
    let missingAuthor = 0
    let missingPublisher = 0
    let missingCategory = 0
    
    const issues = []
    
    // Проверяем книги из CSV
    for (const [code, csvBook] of csvMap) {
      const dbBook = dbMap.get(code)
      
      if (!dbBook) {
        missingInDB++
        issues.push(`❌ Код ${code} (${csvBook.title}) - есть в CSV, нет в БД`)
        continue
      }
      
      // Проверяем соответствие полей
      if (csvBook.title !== dbBook.title) {
        titleMismatch++
        issues.push(`⚠️  Код ${code}: название не совпадает`)
      }
      
      if (csvBook.author !== dbBook.author) {
        authorMismatch++
        issues.push(`⚠️  Код ${code}: автор не совпадает`)
      }
      
      if (Math.abs(csvBook.price - (dbBook.price_uah || 0)) > 0.01) {
        priceMismatch++
        issues.push(`⚠️  Код ${code}: цена не совпадает`)
      }
      
      // Проверяем отсутствующие данные
      if (!dbBook.cover_url) {
        missingCover++
      }
      
      if (!dbBook.author) {
        missingAuthor++
      }
      
      if (!dbBook.category_id) {
        missingCategory++
      }
      
      if (csvBook.title === dbBook.title && 
          csvBook.author === dbBook.author && 
          Math.abs(csvBook.price - (dbBook.price_uah || 0)) <= 0.01) {
        perfectMatch++
      }
    }
    
    // Проверяем книги из БД
    for (const [code, dbBook] of dbMap) {
      if (!csvMap.has(code)) {
        missingInCSV++
        issues.push(`❌ Код ${code} (${dbBook.title}) - есть в БД, нет в CSV`)
      }
    }
    
    // 5. Выводим результаты
    console.log(`\n📊 Результаты проверки:`)
    console.log(`  ✅ Идеальное соответствие: ${perfectMatch}`)
    console.log(`  ⚠️  Несоответствие названий: ${titleMismatch}`)
    console.log(`  ⚠️  Несоответствие авторов: ${authorMismatch}`)
    console.log(`  ⚠️  Несоответствие цен: ${priceMismatch}`)
    console.log(`  ❌ Отсутствует в БД: ${missingInDB}`)
    console.log(`  ❌ Отсутствует в CSV: ${missingInCSV}`)
    
    console.log(`\n📋 Проблемы с данными:`)
    console.log(`  🖼️  Без обложки: ${missingCover}`)
    console.log(`  👤 Без автора: ${missingAuthor}`)
    console.log(`  🏢 Без издательства: ${missingPublisher}`)
    console.log(`  🏷️  Без категории: ${missingCategory}`)
    
    // 6. Показываем примеры проблем
    if (issues.length > 0) {
      console.log(`\n⚠️  Примеры проблем:`)
      issues.slice(0, 10).forEach(issue => {
        console.log(`  ${issue}`)
      })
      if (issues.length > 10) {
        console.log(`  ... и еще ${issues.length - 10} проблем`)
      }
    }
    
    // 7. Показываем примеры книг без обложки
    const booksWithoutCover = dbBooks.filter(book => !book.cover_url)
    if (booksWithoutCover.length > 0) {
      console.log(`\n🖼️  Книги без обложки (${booksWithoutCover.length}):`)
      booksWithoutCover.slice(0, 5).forEach(book => {
        console.log(`  - ${book.title} (${book.code})`)
      })
      if (booksWithoutCover.length > 5) {
        console.log(`  ... и еще ${booksWithoutCover.length - 5} книг`)
      }
    }
    
    // 8. Показываем примеры книг без автора
    const booksWithoutAuthor = dbBooks.filter(book => !book.author)
    if (booksWithoutAuthor.length > 0) {
      console.log(`\n👤 Книги без автора (${booksWithoutAuthor.length}):`)
      booksWithoutAuthor.slice(0, 5).forEach(book => {
        console.log(`  - ${book.title} (${book.code})`)
      })
      if (booksWithoutAuthor.length > 5) {
        console.log(`  ... и еще ${booksWithoutAuthor.length - 5} книг`)
      }
    }
    
    // 9. Показываем примеры книг без категории
    const booksWithoutCategory = dbBooks.filter(book => !book.category_id)
    if (booksWithoutCategory.length > 0) {
      console.log(`\n🏷️  Книги без категории (${booksWithoutCategory.length}):`)
      booksWithoutCategory.slice(0, 5).forEach(book => {
        console.log(`  - ${book.title} (${book.code})`)
      })
      if (booksWithoutCategory.length > 5) {
        console.log(`  ... и еще ${booksWithoutCategory.length - 5} книг`)
      }
    }
    
    console.log(`\n🎯 Итог:`)
    if (perfectMatch === csvMap.size && missingInDB === 0 && missingInCSV === 0) {
      console.log(`✅ Все данные из CSV правильно загружены в БД!`)
    } else {
      console.log(`⚠️  Есть несоответствия, требуется проверка`)
    }
    
  } catch (error) {
    console.error('❌ Неожиданная ошибка:', error.message)
  }
}

// Запускаем скрипт
verifyBooksData()
