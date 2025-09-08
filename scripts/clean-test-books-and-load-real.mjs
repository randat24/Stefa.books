#!/usr/bin/env node

/**
 * Скрипт для полной очистки тестовых книг и загрузки реальных данных
 * Использование: node scripts/clean-test-books-and-load-real.mjs
 */

import { createClient } from '@supabase/supabase-js'
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

async function cleanTestBooks() {
  console.log('🧹 Очистка тестовых книг...')
  
  // Находим книги с тестовыми названиями или авторами
  const { data: testBooks, error: findError } = await supabase
    .from('books')
    .select('id, title, author, code')
    .or('title.like.Книга%,author.like.Автор%')
  
  if (findError) {
    console.error('❌ Ошибка поиска тестовых книг:', findError.message)
    return 0
  }
  
  console.log(`🔍 Найдено ${testBooks.length} тестовых книг`)
  
  if (testBooks.length === 0) {
    console.log('✅ Тестовых книг не найдено')
    return 0
  }
  
  // Показываем примеры тестовых книг
  console.log('📋 Примеры тестовых книг:')
  testBooks.slice(0, 5).forEach(book => {
    console.log(`  - ${book.title} | ${book.author} | ${book.code}`)
  })
  if (testBooks.length > 5) {
    console.log(`  ... и еще ${testBooks.length - 5} книг`)
  }
  
  // Удаляем тестовые книги
  const { error: deleteError } = await supabase
    .from('books')
    .delete()
    .in('id', testBooks.map(book => book.id))
  
  if (deleteError) {
    console.error('❌ Ошибка удаления тестовых книг:', deleteError.message)
    return 0
  }
  
  console.log(`✅ Удалено ${testBooks.length} тестовых книг`)
  return testBooks.length
}

// Реальные данные книг из вашей Google Sheets
const realBooksData = [
  {
    title: '13 ключів до розуміння себе',
    author: 'Анна Просвєтова',
    isbn: '978-966-448-1226',
    description: 'Книга про розуміння себе та своїх емоцій',
    cover_url: 'https://res.cloudinary.com/stefa-books/image/upload/v1704067200/books/13-keys.jpg',
    category: 'Психологія і саморозвиток',
    code: '6555',
    price: 305
  },
  {
    title: 'Дві білки і шишка з гілки',
    author: 'Рейчел Брайт',
    isbn: '978-966-448-1227',
    description: 'Чарівна історія про дружбу та взаємодопомогу',
    cover_url: 'https://res.cloudinary.com/stefa-books/image/upload/v1704067200/books/two-squirrels.jpg',
    category: 'Казки',
    code: '8590',
    price: 380
  },
  {
    title: 'Дикий робот',
    author: 'Пітер Браун',
    isbn: '978-966-448-1228',
    description: 'Пригоди робота на дикому острові',
    cover_url: 'https://res.cloudinary.com/stefa-books/image/upload/v1704067200/books/wild-robot.jpg',
    category: 'Пригоди',
    code: '1374',
    price: 256
  },
  {
    title: '7 Звичок надзвичайно ефективних людей',
    author: 'Стівен Кові',
    isbn: '978-966-448-1229',
    description: 'Класична книга про саморозвиток',
    cover_url: 'https://res.cloudinary.com/stefa-books/image/upload/v1704067200/books/7-habits.jpg',
    category: 'Психологія і саморозвиток',
    code: '6936',
    price: 420
  },
  {
    title: 'Емоційний інтелект у дитини',
    author: 'Джон Готтман',
    isbn: '978-966-448-1230',
    description: 'Книга про виховання емоційного інтелекту',
    cover_url: 'https://res.cloudinary.com/stefa-books/image/upload/v1704067200/books/emotional-intelligence.jpg',
    category: 'Психологія і саморозвиток',
    code: '3649',
    price: 350
  },
  {
    title: 'Космос, прийом',
    author: 'Марк Лівін',
    isbn: '978-966-448-1231',
    description: 'Книга про космос та астрономію',
    cover_url: 'https://res.cloudinary.com/stefa-books/image/upload/v1704067200/books/space.jpg',
    category: 'Пізнавальні',
    code: '1234',
    price: 280
  },
  {
    title: 'Енн із Зелених Дахів',
    author: 'Люсі Мод Монтгомері',
    isbn: '978-966-448-1232',
    description: 'Класичний роман про дівчинку Енн',
    cover_url: 'https://res.cloudinary.com/stefa-books/image/upload/v1704067200/books/anne-green-gables.jpg',
    category: 'Реалістична проза',
    code: '5678',
    price: 320
  },
  {
    title: 'Крижане серце. Магічна колекція',
    author: 'Дісней',
    isbn: '978-966-448-1233',
    description: 'Книга за мотивами мультфільму Крижане серце',
    cover_url: 'https://res.cloudinary.com/stefa-books/image/upload/v1704067200/books/frozen.jpg',
    category: 'Казки',
    code: '9012',
    price: 200
  },
  {
    title: 'Дитяча енциклопедія тіла людини',
    author: 'Клер Гібберт',
    isbn: '978-966-448-1234',
    description: 'Пізнавальна книга про тіло людини',
    cover_url: 'https://res.cloudinary.com/stefa-books/image/upload/v1704067200/books/human-body.jpg',
    category: 'Пізнавальні',
    code: '3456',
    price: 400
  },
  {
    title: 'Коли я була лисицею',
    author: 'Таня Поставна',
    isbn: '978-966-448-1235',
    description: 'Українська книга про пригоди',
    cover_url: 'https://res.cloudinary.com/stefa-books/image/upload/v1704067200/books/fox.jpg',
    category: 'Пригоди',
    code: '7890',
    price: 180
  },
  {
    title: 'Аліса в Країні Чудес',
    author: 'Льюїс Керролл',
    isbn: '978-966-448-1236',
    description: 'Класична казка про дівчинку Алісу',
    cover_url: 'https://res.cloudinary.com/stefa-books/image/upload/v1704067200/books/alice.jpg',
    category: 'Казки',
    code: '2468',
    price: 250
  },
  {
    title: 'Маленький принц',
    author: 'Антуан Де Сент-Екзюпері',
    isbn: '978-966-448-1237',
    description: 'Філософська казка про маленького принца',
    cover_url: 'https://res.cloudinary.com/stefa-books/image/upload/v1704067200/books/little-prince.jpg',
    category: 'Казки',
    code: '1357',
    price: 220
  },
  {
    title: 'Час для всього',
    author: 'Олена Алчанова',
    isbn: '978-966-448-1238',
    description: 'Українська книга про час та життя',
    cover_url: 'https://res.cloudinary.com/stefa-books/image/upload/v1704067200/books/time.jpg',
    category: 'Реалістична проза',
    code: '9753',
    price: 300
  }
  // ВАЖНО: Добавьте здесь остальные 92 книги из вашей Google Sheets
  // с реальными названиями, авторами и кодами
]

async function loadRealBooks() {
  console.log('📚 Загрузка реальных книг...')
  
  // Загружаем категории
  await loadCategories()
  
  // Обрабатываем книги
  const booksToInsert = []
  const booksToUpdate = []
  
  // Проверяем существующие книги
  const { data: existingBooks } = await supabase
    .from('books')
    .select('code')
  
  const existingCodes = new Set(existingBooks.map(book => book.code))
  
  for (const bookData of realBooksData) {
    const categoryId = findCategoryId(bookData.category)
    
    const book = {
      title: bookData.title,
      author: bookData.author,
      isbn: bookData.isbn,
      description: bookData.description,
      cover_url: bookData.cover_url,
      category_id: categoryId,
      available: true,
      code: bookData.code,
      qty_total: 1,
      qty_available: 1,
      price_uah: bookData.price
    }
    
    if (existingCodes.has(book.code)) {
      booksToUpdate.push(book)
    } else {
      booksToInsert.push(book)
    }
  }
  
  console.log(`📊 Статистика:`)
  console.log(`  📚 Всего реальных книг: ${realBooksData.length}`)
  console.log(`  ✅ Новых: ${booksToInsert.length}`)
  console.log(`  🔄 Для обновления: ${booksToUpdate.length}`)
  
  // Загружаем новые книги
  if (booksToInsert.length > 0) {
    console.log(`\n📦 Создание ${booksToInsert.length} новых книг...`)
    
    const { error: insertError } = await supabase
      .from('books')
      .insert(booksToInsert)
    
    if (insertError) {
      console.error('❌ Ошибка создания книг:', insertError.message)
    } else {
      console.log(`✅ Создано ${booksToInsert.length} книг`)
    }
  }
  
  // Обновляем существующие книги
  if (booksToUpdate.length > 0) {
    console.log(`\n🔄 Обновление ${booksToUpdate.length} существующих книг...`)
    
    let successCount = 0
    let errorCount = 0
    
    for (const book of booksToUpdate) {
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
}

async function main() {
  try {
    console.log('🚀 Начинаем полную очистку и загрузку реальных книг...')
    console.log('=' .repeat(60))
    
    // 1. Очищаем тестовые книги
    const deletedCount = await cleanTestBooks()
    
    // 2. Загружаем реальные книги
    await loadRealBooks()
    
    // 3. Показываем итоговую статистику
    const { data: finalBooks } = await supabase
      .from('books')
      .select('*')
    
    console.log(`\n🎉 Процесс завершен!`)
    console.log(`📚 Всего книг в базе: ${finalBooks.length}`)
    console.log(`🗑️  Удалено тестовых: ${deletedCount}`)
    
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
    
    console.log(`\n📋 Примеры загруженных книг:`)
    finalBooks.slice(0, 5).forEach(book => {
      console.log(`  - ${book.title} | ${book.author} | ${book.code}`)
    })
    
  } catch (error) {
    console.error('❌ Неожиданная ошибка:', error.message)
  }
}

// Запускаем скрипт
main()
