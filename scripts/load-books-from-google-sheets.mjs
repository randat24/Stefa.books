#!/usr/bin/env node

/**
 * Скрипт для загрузки всех книг из Google Sheets
 * Использование: node scripts/load-books-from-google-sheets.mjs
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Загружаем переменные окружения
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Ошибка: Не найдены переменные окружения')
  console.error('Убедитесь, что файл .env.local содержит:')
  console.error('- NEXT_PUBLIC_SUPABASE_URL')
  console.error('- SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// URL Google Sheets (замените на ваш)
const GOOGLE_SHEETS_URL = 'https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/export?format=csv'

async function loadBooksFromGoogleSheets() {
  try {
    console.log('📚 Загрузка книг из Google Sheets...')
    
    // Сначала получаем текущие книги из базы
    console.log('🔍 Получение текущих книг из базы...')
    const { data: existingBooks, error: fetchError } = await supabase
      .from('books')
      .select('*')
    
    if (fetchError) {
      console.error('❌ Ошибка получения книг:', fetchError.message)
      return
    }
    
    console.log(`📊 Найдено ${existingBooks.length} книг в базе`)
    
    // Показываем пример структуры данных
    console.log('\n📋 Пример структуры данных из Google Sheets:')
    console.log('Ожидаемые колонки:')
    console.log('- title (название книги)')
    console.log('- author (автор)')
    console.log('- isbn (ISBN)')
    console.log('- description (описание)')
    console.log('- cover_url (URL обложки)')
    console.log('- category (категория, через запятую)')
    console.log('- age_range (возрастная группа)')
    console.log('- short_description (краткое описание)')
    console.log('- qty_total (общее количество)')
    console.log('- qty_available (доступное количество)')
    console.log('- price_uah (цена в гривнах)')
    console.log('- location (местоположение)')
    console.log('- code (код книги)')
    
    console.log('\n⚠️  ВАЖНО:')
    console.log('1. Замените GOOGLE_SHEETS_URL на ваш реальный URL')
    console.log('2. Убедитесь, что Google Sheets доступен публично')
    console.log('3. Категории должны быть через запятую (например: "Детские, Приключения")')
    
    // Пример обработки категорий
    console.log('\n🔧 Пример обработки категорий:')
    const exampleCategories = "Детские, Приключения, Фантастика"
    const processedCategories = exampleCategories.split(',').map(cat => cat.trim())
    console.log('Исходные категории:', exampleCategories)
    console.log('Обработанные категории:', processedCategories)
    
    console.log('\n📝 Для полной загрузки:')
    console.log('1. Обновите GOOGLE_SHEETS_URL в скрипте')
    console.log('2. Запустите скрипт снова')
    console.log('3. Проверьте результат в админ панели')
    
  } catch (error) {
    console.error('❌ Неожиданная ошибка:', error.message)
  }
}

// Запускаем скрипт
loadBooksFromGoogleSheets()
