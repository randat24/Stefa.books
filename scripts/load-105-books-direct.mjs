#!/usr/bin/env node

/**
 * Скрипт для прямой загрузки 105 книг в базу данных
 * Использование: node scripts/load-105-books-direct.mjs
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

// Данные 105 книг
const booksData = [
  {
    title: 'Пригоди Тома Сойєра',
    author: 'Марк Твен',
    isbn: '978-617-12-3456-7',
    description: 'Класичний роман про пригоди хлопчика Тома Сойєра',
    cover_url: 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/tom-sawyer.jpg',
    category: 'Пригоди, молодший вік',
    available: true,
    code: 'SB-2025-0001'
  },
  {
    title: 'Аліса в Країні Чудес',
    author: 'Льюїс Керролл',
    isbn: '978-617-12-3457-4',
    description: 'Казкова історія про дівчинку Алісу',
    cover_url: 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/alice.jpg',
    category: 'Казки, дошкільний вік',
    available: true,
    code: 'SB-2025-0002'
  },
  {
    title: 'Гаррі Поттер і філософський камінь',
    author: 'Джоан Роулінг',
    isbn: '978-617-12-3458-1',
    description: 'Перша книга про пригоди Гаррі Поттера',
    cover_url: 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/harry-potter.jpg',
    category: 'Фентезі, підлітковий вік',
    available: true,
    code: 'SB-2025-0003'
  },
  {
    title: 'Детективна історія',
    author: 'Автор Детектив',
    isbn: '978-617-12-3459-8',
    description: 'Захоплюючий детектив',
    cover_url: 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/detective.jpg',
    category: 'Детектив, середній вік',
    available: true,
    code: 'SB-2025-0004'
  },
  {
    title: 'Казки про звірів',
    author: 'Автор Казки',
    isbn: '978-617-12-3460-4',
    description: 'Чарівні казки про тварин',
    cover_url: 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/animal-tales.jpg',
    category: 'Казки, найменші',
    available: true,
    code: 'SB-2025-0005'
  }
  // Добавим еще 100 книг...
]

// Генерируем остальные 100 книг
for (let i = 6; i <= 105; i++) {
  const bookNumber = String(i).padStart(3, '0')
  booksData.push({
    title: `Книга ${bookNumber}`,
    author: `Автор ${bookNumber}`,
    isbn: `978-617-12-${bookNumber}-${i % 10}`,
    description: `Опис книги ${bookNumber}`,
    cover_url: `https://res.cloudinary.com/your-cloud/image/upload/v1234567890/book-${bookNumber}.jpg`,
    category: i % 2 === 0 ? 'Казки, дошкільний вік' : 'Пригоди, молодший вік',
    available: true,
    code: `SB-2025-${bookNumber}`
  })
}

async function loadBooks() {
  try {
    console.log('📚 Загрузка 105 книг в базу данных...')
    console.log('=' .repeat(60))
    
    // Загружаем категории
    await loadCategories()
    
    // Проверяем существующие книги
    const { data: existingBooks } = await supabase
      .from('books')
      .select('code')
    
    const existingCodes = new Set(existingBooks.map(book => book.code))
    
    // Обрабатываем книги
    const booksToInsert = []
    const booksToUpdate = []
    
    for (const bookData of booksData) {
      const categoryId = findCategoryId(bookData.category)
      
      const book = {
        title: bookData.title,
        author: bookData.author,
        isbn: bookData.isbn,
        description: bookData.description,
        cover_url: bookData.cover_url,
        category_id: categoryId,
        available: bookData.available,
        code: bookData.code,
        qty_total: 1,
        qty_available: 1,
        price_uah: 100 + Math.floor(Math.random() * 400)
      }
      
      if (existingCodes.has(book.code)) {
        booksToUpdate.push(book)
      } else {
        booksToInsert.push(book)
      }
    }
    
    console.log(`📊 Статистика:`)
    console.log(`  📚 Всего книг: ${booksData.length}`)
    console.log(`  ✅ Новых: ${booksToInsert.length}`)
    console.log(`  🔄 Для обновления: ${booksToUpdate.length}`)
    console.log(`  📚 Уже в базе: ${existingBooks.length}`)
    
    // Загружаем новые книги
    if (booksToInsert.length > 0) {
      console.log(`\n📦 Создание ${booksToInsert.length} новых книг...`)
      
      const batchSize = 20
      let successCount = 0
      let errorCount = 0
      
      for (let i = 0; i < booksToInsert.length; i += batchSize) {
        const batch = booksToInsert.slice(i, i + batchSize)
        console.log(`📦 Партия ${Math.floor(i / batchSize) + 1}/${Math.ceil(booksToInsert.length / batchSize)} (${batch.length} книг)`)
        
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
    
    // Показываем итоговую статистику
    const { data: finalBooks } = await supabase
      .from('books')
      .select('*')
    
    console.log(`\n🎉 Загрузка завершена!`)
    console.log(`📚 Всего книг в базе: ${finalBooks.length}`)
    
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
loadBooks()
