#!/usr/bin/env node

/**
 * Простой скрипт для замены "Невідомий автор" на артикулы
 * PL-001, PL-002, PL-003 (Підліткова література)
 * DL-001 - DL-009 (Дитяча література)
 * KP-001 - KP-003 (Книжки-картинки)
 * KL-001, KL-002 (Класична література)
 * NP-001, NP-002 (Науково-популярна література)
 * IL-001 (Історична література)
 * PD-001 (Психологія та розвиток)
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Отсутствуют переменные окружения SUPABASE_URL или SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Маппинг категорий на префиксы артикулов
const CATEGORY_ARTICLE_PREFIXES = {
  'Підліткова література': 'PL',
  'Дитяча література': 'DL', 
  'Книжки-картинки': 'KP',
  'Класична література': 'KL',
  'Науково-популярна література': 'NP',
  'Історична література': 'IL',
  'Психологія та розвиток': 'PD'
}

/**
 * Генерирует артикул по префиксу и номеру
 */
function generateArticle(prefix, number) {
  return `${prefix}-${number.toString().padStart(3, '0')}`
}

/**
 * Получает префикс артикула для категории
 */
function getArticlePrefixForCategory(categoryName) {
  return CATEGORY_ARTICLE_PREFIXES[categoryName] || null
}

/**
 * Исправляет пустые категории на основе анализа названий
 */
async function fixEmptyCategories() {
  try {
    console.log('🔧 Исправляем пустые категории...')

    // Получаем книги с пустыми категориями
    const { data: booksWithoutCategory, error: fetchError } = await supabase
      .from('books')
      .select('id, title, author, category')
      .or('category.is.null,category.eq.')

    if (fetchError) {
      throw new Error(`Ошибка получения книг: ${fetchError.message}`)
    }

    if (!booksWithoutCategory || booksWithoutCategory.length === 0) {
      console.log('✅ Все книги уже имеют категории')
      return
    }

    console.log(`📚 Найдено ${booksWithoutCategory.length} книг без категорий`)

    const updates = []
    
    // Анализируем каждую книгу и определяем категорию
    booksWithoutCategory.forEach(book => {
      let suggestedCategory = 'Дитяча література' // По умолчанию
      
      const title = book.title.toLowerCase()
      
      // Логика определения категории на основе названия
      if (title.includes('казк') || title.includes('дитяч') || title.includes('малюк') || 
          title.includes('найменш') || title.includes('дошкільн') || title.includes('молодш') ||
          title.includes('енциклопед') || title.includes('пізнавальн')) {
        suggestedCategory = 'Дитяча література'
      } else if (title.includes('підлітков') || title.includes('романт') || 
                 title.includes('кохан') || title.includes('любов') || 
                 title.includes('мрі') || title.includes('космос')) {
        suggestedCategory = 'Підліткова література'
      } else if (title.includes('лама') || title.includes('бодьо') || 
                 title.includes('яйце') || title.includes('дві білки') || 
                 title.includes('панда') || title.includes('тигр') || 
                 title.includes('грушк')) {
        suggestedCategory = 'Книжки-картинки'
      } else if (title.includes('маленький принц') || title.includes('мауглі') || 
                 title.includes('рікі-тікі') || title.includes('захар беркут') || 
                 title.includes('кайдашева') || title.includes('енейіда') || 
                 title.includes('аліса')) {
        suggestedCategory = 'Класична література'
      } else if (title.includes('енциклопед') || title.includes('пізнавальн') || 
                 title.includes('школа') || title.includes('емоційн') || 
                 title.includes('тіло') || title.includes('смартфон') || 
                 title.includes('пластик')) {
        suggestedCategory = 'Науково-популярна література'
      } else if (title.includes('україн') || title.includes('істор') || 
                 title.includes('читаємо про')) {
        suggestedCategory = 'Історична література'
      } else if (title.includes('психолог') || title.includes('саморозвит') || 
                 title.includes('емоційн') || title.includes('ефективн') || 
                 title.includes('спати') || title.includes('смисл') || 
                 title.includes('інтелект') || title.includes('ессенціал')) {
        suggestedCategory = 'Психологія та розвиток'
      }

      updates.push({
        id: book.id,
        category: suggestedCategory,
        title: book.title
      })
    })

    console.log(`\n📋 Предварительный просмотр исправлений категорий:`)
    updates.slice(0, 10).forEach(update => {
      console.log(`  ${update.title} → ${update.category}`)
    })
    
    if (updates.length > 10) {
      console.log(`  ... и еще ${updates.length - 10} книг`)
    }

    // Выполняем обновления
    let successCount = 0
    let errorCount = 0

    for (const update of updates) {
      try {
        const { error } = await supabase
          .from('books')
          .update({ category: update.category })
          .eq('id', update.id)

        if (error) {
          console.error(`❌ Ошибка обновления категории для ${update.title}: ${error.message}`)
          errorCount++
        } else {
          console.log(`✅ ${update.title} → ${update.category}`)
          successCount++
        }
      } catch (err) {
        console.error(`❌ Ошибка обновления категории для ${update.title}: ${err.message}`)
        errorCount++
      }
    }

    console.log(`\n📊 Результаты исправления категорий:`)
    console.log(`  ✅ Успешно обновлено: ${successCount}`)
    console.log(`  ❌ Ошибок: ${errorCount}`)

  } catch (error) {
    console.error('❌ Ошибка исправления категорий:', error.message)
    throw error
  }
}

/**
 * Заменяет "Невідомий автор" на артикулы
 */
async function replaceAuthorsWithArticles() {
  try {
    console.log('🔄 Заменяем "Невідомий автор" на артикулы...')

    // Получаем все книги с "Невідомий автор", отсортированные по категории и дате создания
    const { data: books, error: fetchError } = await supabase
      .from('books')
      .select('id, title, author, category, created_at')
      .eq('author', 'Невідомий автор')
      .order('category')
      .order('created_at')

    if (fetchError) {
      throw new Error(`Ошибка получения книг: ${fetchError.message}`)
    }

    console.log(`📚 Найдено ${books.length} книг с "Невідомий автор" для обновления`)

    // Группируем книги по категориям
    const booksByCategory = {}
    books.forEach(book => {
      if (!booksByCategory[book.category]) {
        booksByCategory[book.category] = []
      }
      booksByCategory[book.category].push(book)
    })

    const updates = []
    let totalUpdated = 0

    // Обрабатываем каждую категорию
    for (const [categoryName, categoryBooks] of Object.entries(booksByCategory)) {
      const prefix = getArticlePrefixForCategory(categoryName)
      
      if (!prefix) {
        console.log(`⚠️  Категория "${categoryName}" не поддерживается, пропускаем`)
        continue
      }

      console.log(`\n📂 Обрабатываем категорию: ${categoryName} (${categoryBooks.length} книг)`)
      
      // Сортируем книги по дате создания для стабильного порядка
      categoryBooks.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
      
      // Генерируем артикулы
      categoryBooks.forEach((book, index) => {
        const articleNumber = index + 1
        const newArticle = generateArticle(prefix, articleNumber)
        
        updates.push({
          id: book.id,
          author: newArticle,
          title: book.title,
          category: categoryName
        })
        totalUpdated++
      })
    }

    console.log(`\n🔄 Найдено ${updates.length} книг для замены автора на артикул`)

    if (updates.length === 0) {
      console.log('✅ Все книги уже имеют артикулы')
      return
    }

    // Показываем предварительный просмотр
    console.log('\n📋 Предварительный просмотр замен:')
    updates.slice(0, 10).forEach(update => {
      console.log(`  ${update.title} (${update.category}) → ${update.author}`)
    })
    
    if (updates.length > 10) {
      console.log(`  ... и еще ${updates.length - 10} книг`)
    }

    // Подтверждение от пользователя
    const readline = require('readline')
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })

    const answer = await new Promise(resolve => {
      rl.question('\n❓ Продолжить замену? (y/N): ', resolve)
    })
    
    rl.close()

    if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
      console.log('❌ Замена отменена')
      return
    }

    // Выполняем обновления
    let successCount = 0
    let errorCount = 0

    for (const update of updates) {
      try {
        const { error } = await supabase
          .from('books')
          .update({ author: update.author })
          .eq('id', update.id)

        if (error) {
          console.error(`❌ Ошибка обновления ${update.title}: ${error.message}`)
          errorCount++
        } else {
          console.log(`✅ ${update.title} → ${update.author}`)
          successCount++
        }
      } catch (err) {
        console.error(`❌ Ошибка обновления ${update.title}: ${err.message}`)
        errorCount++
      }
    }

    console.log(`\n📊 Результаты замены:`)
    console.log(`  ✅ Успешно обновлено: ${successCount}`)
    console.log(`  ❌ Ошибок: ${errorCount}`)
    console.log(`  📚 Всего обработано: ${successCount + errorCount}`)

    if (successCount > 0) {
      console.log('\n🎉 Замена "Невідомий автор" на артикулы завершена успешно!')
    }

  } catch (error) {
    console.error('❌ Критическая ошибка:', error.message)
    process.exit(1)
  }
}

/**
 * Показывает статистику по артикулам
 */
async function showArticleStats() {
  try {
    console.log('📊 Статистика по артикулам книг:\n')

    const { data: books, error } = await supabase
      .from('books')
      .select('category, author')
      .like('author', '%-%') // Артикулы содержат дефис

    if (error) {
      throw new Error(`Ошибка получения статистики: ${error.message}`)
    }

    // Группируем по категориям
    const stats = {}
    books.forEach(book => {
      if (!stats[book.category]) {
        stats[book.category] = {
          total: 0,
          articles: []
        }
      }
      stats[book.category].total++
      stats[book.category].articles.push(book.author)
    })

    // Показываем статистику
    Object.entries(stats).forEach(([category, data]) => {
      const prefix = getArticlePrefixForCategory(category)
      console.log(`📂 ${category}:`)
      console.log(`   Всего книг: ${data.total}`)
      console.log(`   Префикс: ${prefix || 'не поддерживается'}`)
      
      if (prefix) {
        const articles = data.articles.sort()
        console.log(`   Артикулы: ${articles.slice(0, 5).join(', ')}${articles.length > 5 ? '...' : ''}`)
      }
      console.log('')
    })

    // Показываем книги с "Невідомий автор"
    const { data: unknownAuthors, error: unknownError } = await supabase
      .from('books')
      .select('id, title, category, author')
      .eq('author', 'Невідомий автор')

    if (!unknownError && unknownAuthors && unknownAuthors.length > 0) {
      console.log(`⚠️  Книги с "Невідомий автор": ${unknownAuthors.length}`)
      unknownAuthors.slice(0, 5).forEach(book => {
        console.log(`   ${book.title} (${book.category})`)
      })
      if (unknownAuthors.length > 5) {
        console.log(`   ... и еще ${unknownAuthors.length - 5} книг`)
      }
    }

  } catch (error) {
    console.error('❌ Ошибка получения статистики:', error.message)
  }
}

// Главная функция
async function main() {
  const command = process.argv[2]

  switch (command) {
    case 'stats':
      await showArticleStats()
      break
    case 'fix-categories':
      await fixEmptyCategories()
      break
    case 'replace':
      await replaceAuthorsWithArticles()
      break
    case 'full':
      await fixEmptyCategories()
      await replaceAuthorsWithArticles()
      break
    default:
      console.log('Использование:')
      console.log('  node simple-fix-authors.js stats           - показать статистику')
      console.log('  node simple-fix-authors.js fix-categories  - исправить пустые категории')
      console.log('  node simple-fix-authors.js replace         - заменить "Невідомий автор" на артикулы')
      console.log('  node simple-fix-authors.js full            - полное обновление (категории + артикулы)')
      break
  }
}

main().catch(console.error)
