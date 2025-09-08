#!/usr/bin/env node

/**
 * Скрипт для загрузки 105 книг из SQL файла
 * Использование: node scripts/load-105-books-from-sql.mjs
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
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

async function loadBooksFromSQL() {
  try {
    console.log('📚 Загрузка 105 книг из SQL файла...')
    console.log('=' .repeat(60))
    
    // Читаем SQL файл
    console.log('📖 Чтение SQL файла...')
    const sqlContent = readFileSync('load_all_105_books.sql', 'utf-8')
    
    // Выполняем SQL
    console.log('🔄 Выполнение SQL...')
    const { data, error } = await supabase.rpc('exec_sql', { sql: sqlContent })
    
    if (error) {
      console.error('❌ Ошибка выполнения SQL:', error.message)
      return
    }
    
    console.log('✅ SQL выполнен успешно!')
    
    // Проверяем результат
    console.log('🔍 Проверка результата...')
    const { data: books, error: booksError } = await supabase
      .from('books')
      .select('*')
    
    if (booksError) {
      console.error('❌ Ошибка проверки книг:', booksError.message)
      return
    }
    
    console.log(`\n🎉 Загрузка завершена!`)
    console.log(`📚 Всего книг в базе: ${books.length}`)
    
    // Показываем статистику по категориям
    const categoryStats = {}
    books.forEach(book => {
      if (book.category_id) {
        categoryStats[book.category_id] = (categoryStats[book.category_id] || 0) + 1
      }
    })
    
    console.log(`\n📊 Статистика по категориям:`)
    Object.entries(categoryStats).forEach(([categoryId, count]) => {
      console.log(`  ${categoryId}: ${count} книг`)
    })
    
    // Показываем книги без категорий
    const booksWithoutCategory = books.filter(book => !book.category_id)
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
loadBooksFromSQL()
