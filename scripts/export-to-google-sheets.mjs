#!/usr/bin/env node

/**
 * Скрипт для экспорта всех данных из БД в Google Sheets
 * Использование: node scripts/export-to-google-sheets.mjs
 */

import { createClient } from '@supabase/supabase-js'
import { writeFileSync } from 'fs'
import { stringify } from 'csv-stringify/sync'
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

async function exportBooksToCSV() {
  console.log('📚 Экспорт книг...')
  
  const { data: books, error } = await supabase
    .from('books')
    .select(`
      *,
      categories:category_id (
        name,
        parent_id
      )
    `)
    .order('code')
  
  if (error) {
    console.error('❌ Ошибка загрузки книг:', error.message)
    return null
  }
  
  // Преобразуем данные для CSV
  const booksData = books.map(book => ({
    'Код': book.code,
    'Назва': book.title,
    'Автор': book.author || '',
    'Видавництво': book.publisher || '',
    'Категорія': book.categories?.name || '',
    'Всього': book.qty_total,
    'Доступно': book.qty_available,
    'Статус': book.available ? '✅ Активна' : '❌ Неактивна',
    'Ціна': book.price_uah,
    'Повна ціна': book.full_price_uah || book.price_uah,
    'cover_url': book.cover_url || '',
    'Опис': book.description || '',
    'ISBN': book.isbn || '',
    'Вікова група': book.age_range || '',
    'Короткий опис': book.short_description || '',
    'Місцезнаходження': book.location || '',
    'Створено': book.created_at,
    'Оновлено': book.updated_at
  }))
  
  // Создаем CSV
  const csvContent = stringify(booksData, {
    header: true,
    columns: [
      'Код', 'Назва', 'Автор', 'Видавництво', 'Категорія',
      'Всього', 'Доступно', 'Статус', 'Ціна', 'Повна ціна',
      'cover_url', 'Опис', 'ISBN', 'Вікова група', 'Короткий опис',
      'Місцезнаходження', 'Створено', 'Оновлено'
    ]
  })
  
  writeFileSync('export_books.csv', csvContent, 'utf8')
  console.log(`✅ Экспортировано ${books.length} книг в export_books.csv`)
  return books.length
}

async function exportUsersToCSV() {
  console.log('👥 Экспорт пользователей...')
  
  const { data: users, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at')
  
  if (error) {
    console.error('❌ Ошибка загрузки пользователей:', error.message)
    return null
  }
  
  // Преобразуем данные для CSV
  const usersData = users.map(user => ({
    'ID': user.id,
    'Ім\'я': user.name || '',
    'Email': user.email || '',
    'Телефон': user.phone || '',
    'Роль': user.role || '',
    'Статус': user.status || '',
    'Тип підписки': user.subscription_type || '',
    'Дата реєстрації': user.created_at,
    'Останнє оновлення': user.updated_at,
    'Адреса': user.address || '',
    'Місто': user.city || '',
    'Країна': user.country || '',
    'Поштовий індекс': user.postal_code || '',
    'Дата народження': user.date_of_birth || '',
    'Стать': user.gender || '',
    'Примітки': user.notes || ''
  }))
  
  // Создаем CSV
  const csvContent = stringify(usersData, {
    header: true,
    columns: [
      'ID', 'Ім\'я', 'Email', 'Телефон', 'Роль', 'Статус',
      'Тип підписки', 'Дата реєстрації', 'Останнє оновлення',
      'Адреса', 'Місто', 'Країна', 'Поштовий індекс',
      'Дата народження', 'Стать', 'Примітки'
    ]
  })
  
  writeFileSync('export_users.csv', csvContent, 'utf8')
  console.log(`✅ Экспортировано ${users.length} пользователей в export_users.csv`)
  return users.length
}

async function exportCategoriesToCSV() {
  console.log('🏷️  Экспорт категорий...')
  
  const { data: categories, error } = await supabase
    .from('categories')
    .select('*')
    .order('display_order')
  
  if (error) {
    console.error('❌ Ошибка загрузки категорий:', error.message)
    return null
  }
  
  // Преобразуем данные для CSV
  const categoriesData = categories.map(category => ({
    'ID': category.id,
    'Назва': category.name,
    'Опис': category.description || '',
    'Порядок': category.display_order,
    'Батьківська категорія': category.parent_id || '',
    'Іконка': category.icon || '',
    'Колір': category.color || '',
    'Створено': category.created_at,
    'Оновлено': category.updated_at
  }))
  
  // Создаем CSV
  const csvContent = stringify(categoriesData, {
    header: true,
    columns: [
      'ID', 'Назва', 'Опис', 'Порядок', 'Батьківська категорія',
      'Іконка', 'Колір', 'Створено', 'Оновлено'
    ]
  })
  
  writeFileSync('export_categories.csv', csvContent, 'utf8')
  console.log(`✅ Экспортировано ${categories.length} категорий в export_categories.csv`)
  return categories.length
}

async function exportRentalsToCSV() {
  console.log('📖 Экспорт аренд...')
  
  const { data: rentals, error } = await supabase
    .from('rentals')
    .select(`
      *,
      books:book_id (title, code),
      users:user_id (name, email)
    `)
    .order('created_at')
  
  if (error) {
    console.error('❌ Ошибка загрузки аренд:', error.message)
    return null
  }
  
  // Преобразуем данные для CSV
  const rentalsData = rentals.map(rental => ({
    'ID': rental.id,
    'Книга': rental.books?.title || '',
    'Код книги': rental.books?.code || '',
    'Користувач': rental.users?.name || '',
    'Email користувача': rental.users?.email || '',
    'Статус': rental.status || '',
    'Дата початку': rental.start_date,
    'Дата закінчення': rental.end_date,
    'Дата повернення': rental.return_date || '',
    'Ціна': rental.price || '',
    'Створено': rental.created_at,
    'Оновлено': rental.updated_at,
    'Примітки': rental.notes || ''
  }))
  
  // Создаем CSV
  const csvContent = stringify(rentalsData, {
    header: true,
    columns: [
      'ID', 'Книга', 'Код книги', 'Користувач', 'Email користувача',
      'Статус', 'Дата початку', 'Дата закінчення', 'Дата повернення',
      'Ціна', 'Створено', 'Оновлено', 'Примітки'
    ]
  })
  
  writeFileSync('export_rentals.csv', csvContent, 'utf8')
  console.log(`✅ Экспортировано ${rentals.length} аренд в export_rentals.csv`)
  return rentals.length
}

async function exportSubscriptionRequestsToCSV() {
  console.log('📋 Экспорт заявок на подписку...')
  
  const { data: requests, error } = await supabase
    .from('subscription_requests')
    .select('*')
    .order('created_at')
  
  if (error) {
    console.error('❌ Ошибка загрузки заявок:', error.message)
    return null
  }
  
  // Преобразуем данные для CSV
  const requestsData = requests.map(request => ({
    'ID': request.id,
    'Ім\'я': request.name || '',
    'Email': request.email || '',
    'Телефон': request.phone || '',
    'Тип підписки': request.subscription_type || '',
    'Статус': request.status || '',
    'Повідомлення': request.message || '',
    'Дата створення': request.created_at,
    'Дата оновлення': request.updated_at,
    'Примітки': request.notes || ''
  }))
  
  // Создаем CSV
  const csvContent = stringify(requestsData, {
    header: true,
    columns: [
      'ID', 'Ім\'я', 'Email', 'Телефон', 'Тип підписки',
      'Статус', 'Повідомлення', 'Дата створення', 'Дата оновлення', 'Примітки'
    ]
  })
  
  writeFileSync('export_subscription_requests.csv', csvContent, 'utf8')
  console.log(`✅ Экспортировано ${requests.length} заявок в export_subscription_requests.csv`)
  return requests.length
}

async function createSummaryReport() {
  console.log('📊 Создание сводного отчета...')
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const reportContent = `# 📊 Отчет об экспорте данных - ${new Date().toLocaleString('uk-UA')}

## 📈 Статистика экспорта:

### 📚 Книги:
- **Файл:** export_books.csv
- **Количество:** ${await getBooksCount()} книг
- **Поля:** Код, Название, Автор, Издательство, Категория, Цены, Количество, Статус

### 👥 Пользователи:
- **Файл:** export_users.csv  
- **Количество:** ${await getUsersCount()} пользователей
- **Поля:** ID, Имя, Email, Роль, Статус, Подписка, Адрес

### 🏷️ Категории:
- **Файл:** export_categories.csv
- **Количество:** ${await getCategoriesCount()} категорий
- **Поля:** ID, Название, Описание, Порядок, Родительская категория

### 📖 Аренды:
- **Файл:** export_rentals.csv
- **Количество:** ${await getRentalsCount()} аренд
- **Поля:** ID, Книга, Пользователь, Статус, Даты, Цена

### 📋 Заявки на подписку:
- **Файл:** export_subscription_requests.csv
- **Количество:** ${await getSubscriptionRequestsCount()} заявок
- **Поля:** ID, Имя, Email, Тип подписки, Статус

## 🎯 Итого экспортировано:
- **Книги:** ${await getBooksCount()}
- **Пользователи:** ${await getUsersCount()}
- **Категории:** ${await getCategoriesCount()}
- **Аренды:** ${await getRentalsCount()}
- **Заявки:** ${await getSubscriptionRequestsCount()}

## 📁 Файлы для загрузки в Google Sheets:
1. export_books.csv - Каталог книг
2. export_users.csv - База пользователей
3. export_categories.csv - Категории книг
4. export_rentals.csv - История аренд
5. export_subscription_requests.csv - Заявки на подписку

## 🔄 Инструкция по загрузке в Google Sheets:
1. Откройте Google Sheets
2. Создайте новую таблицу
3. Файл → Импорт → Загрузить
4. Выберите CSV файл
5. Настройте разделители (запятая)
6. Импортируйте данные

## ⚠️ Важно:
- Все данные экспортированы в формате CSV
- Кодировка: UTF-8
- Разделитель: запятая
- Первая строка содержит заголовки

---
*Экспорт выполнен: ${new Date().toLocaleString('uk-UA')}*
`

  writeFileSync(`export_report_${timestamp}.md`, reportContent, 'utf8')
  console.log(`✅ Создан отчет: export_report_${timestamp}.md`)
}

async function getBooksCount() {
  const { count } = await supabase.from('books').select('*', { count: 'exact', head: true })
  return count || 0
}

async function getUsersCount() {
  const { count } = await supabase.from('users').select('*', { count: 'exact', head: true })
  return count || 0
}

async function getCategoriesCount() {
  const { count } = await supabase.from('categories').select('*', { count: 'exact', head: true })
  return count || 0
}

async function getRentalsCount() {
  const { count } = await supabase.from('rentals').select('*', { count: 'exact', head: true })
  return count || 0
}

async function getSubscriptionRequestsCount() {
  const { count } = await supabase.from('subscription_requests').select('*', { count: 'exact', head: true })
  return count || 0
}

async function main() {
  try {
    console.log('🚀 Начинаем экспорт всех данных в CSV...')
    console.log('=' .repeat(60))
    
    const timestamp = new Date().toISOString().split('T')[0]
    console.log(`📅 Дата экспорта: ${timestamp}`)
    
    // Экспортируем все таблицы
    const booksCount = await exportBooksToCSV()
    const usersCount = await exportUsersToCSV()
    const categoriesCount = await exportCategoriesToCSV()
    const rentalsCount = await exportRentalsToCSV()
    const requestsCount = await exportSubscriptionRequestsToCSV()
    
    // Создаем сводный отчет
    await createSummaryReport()
    
    console.log('\n🎉 Экспорт завершен!')
    console.log('=' .repeat(60))
    console.log(`📚 Книги: ${booksCount}`)
    console.log(`👥 Пользователи: ${usersCount}`)
    console.log(`🏷️  Категории: ${categoriesCount}`)
    console.log(`📖 Аренды: ${rentalsCount}`)
    console.log(`📋 Заявки: ${requestsCount}`)
    
    console.log('\n📁 Созданные файлы:')
    console.log('  - export_books.csv')
    console.log('  - export_users.csv')
    console.log('  - export_categories.csv')
    console.log('  - export_rentals.csv')
    console.log('  - export_subscription_requests.csv')
    console.log('  - export_report_*.md')
    
    console.log('\n🔄 Следующие шаги:')
    console.log('1. Откройте Google Sheets')
    console.log('2. Создайте новую таблицу')
    console.log('3. Импортируйте CSV файлы')
    console.log('4. Настройте форматирование')
    
  } catch (error) {
    console.error('❌ Неожиданная ошибка:', error.message)
  }
}

// Запускаем скрипт
main()
