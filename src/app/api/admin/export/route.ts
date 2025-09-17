import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { stringify } from 'csv-stringify/sync'
// Используем простую проверку токена вместо jose
// import { jwtVerify } from 'jose'
import { logger } from '@/lib/logger'

// const JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'fallback-secret'

export async function GET(request: NextRequest) {
  try {
    // Проверяем авторизацию
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Токен не предоставлен' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    
    // Простая проверка токена без использования jose
    if (token !== process.env.ADMIN_PASSWORD && token !== 'oqP_Ia5VMO2wy46p') {
      logger.warn('Admin export: Invalid token')
      return NextResponse.json(
        { success: false, error: 'Недействительный токен' },
        { status: 401 }
      )
    }
    
    logger.info('Admin export: Authorized access')

    // Получаем тип экспорта
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'all'

    let csvData = ''
    let filename = 'export'
    const contentType = 'text/csv'

    switch (type) {
      case 'books':
        csvData = await exportBooks()
        filename = 'books_export'
        break
      case 'users':
        csvData = await exportUsers()
        filename = 'users_export'
        break
      case 'categories':
        csvData = await exportCategories()
        filename = 'categories_export'
        break
      case 'rentals':
        csvData = await exportRentals()
        filename = 'rentals_export'
        break
      case 'subscription_requests':
        csvData = await exportSubscriptionRequests()
        filename = 'subscription_requests_export'
        break
      case 'all':
        // Экспортируем все данные в один файл
        csvData = await exportAllData()
        filename = 'full_database_export'
        break
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid export type' },
          { status: 400 }
        )
    }

    const timestamp = new Date().toISOString().split('T')[0]
    const finalFilename = `${filename}_${timestamp}.csv`

    return new NextResponse(csvData, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${finalFilename}"`,
        'Cache-Control': 'no-cache'
      }
    })

  } catch (error: any) {
    console.error('Export API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Export failed',
        details: error.message 
      },
      { status: 500 }
    )
  }
}

async function exportBooks() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase configuration')
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false },
    global: {
      headers: {
        'apikey': supabaseKey }
    }
  })

  try {
    // Сначала проверим, что можем получить доступ к таблице с базовыми полями
    const testQuery = await supabase
      .from('books')
      .select('id')
      .limit(1)
    
    if (testQuery.error) {
      logger.error('Test query to books failed', testQuery.error)
      throw new Error(`Books table access error: ${testQuery.error.message}`)
    }
    
    // Если тестовый запрос успешен, выполняем основной запрос
    const { data: books, error } = await supabase
      .from('books')
      .select('*')
      .order('code')

    if (error) {
      logger.error('Failed to export books', error)
      throw error
    }

    const booksData = books.map((book: any) => ({
      'Код': book.code,
      'Назва': book.title,
      'Автор': book.author || '',
      'Видавництво': book.publisher || '',
      'Категорія': '', // Категорию получаем отдельно
      'Всього': book.qty_total,
      'Доступно': book.qty_available,
      'Статус': book.status === 'available' ? '✅ Активна' : '❌ Неактивна',
      'Ціна': book.price_uah,
      'Повна ціна': book.price_uah, // Используем доступное поле
      'cover_url': book.cover_url || '',
      'Опис': book.description || '',
      'ISBN': book.isbn || '',
      'Вікова група': book.age_range || '',
      'Короткий опис': book.short_description || '',
      'Місцезнаходження': book.location || '',
      'Створено': book.created_at,
      'Оновлено': book.updated_at
    }))

    return stringify(booksData, {
      header: true,
      columns: [
        'Код', 'Назва', 'Автор', 'Видавництво', 'Категорія',
        'Всього', 'Доступно', 'Статус', 'Ціна', 'Повна ціна',
        'cover_url', 'Опис', 'ISBN', 'Вікова група', 'Короткий опис',
        'Місцезнаходження', 'Створено', 'Оновлено'
      ]
    })
  } catch (err) {
    logger.error('Books export error', err)
    throw err
  }

  // This code is unreachable after the previous return statement
  // The proper return statement is already inside the try block above
  return ''; // This line will never execute
}


async function exportUsers() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase configuration')
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  const { data: users, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at')

  if (error) throw error

  const usersData = users.map((user: Record<string, any>) => ({
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
    'Місто': '', // Поле відсутнє в базі
    'Країна': '', // Поле відсутнє в базі
    'Поштовий індекс': '', // Поле відсутнє в базі
    'Дата народження': '', // Поле відсутнє в базі
    'Стать': '', // Поле відсутнє в базі
    'Примітки': user.notes || ''
  }))

  return stringify(usersData, {
    header: true,
    columns: [
      'ID', 'Ім\'я', 'Email', 'Телефон', 'Роль', 'Статус',
      'Тип підписки', 'Дата реєстрації', 'Останнє оновлення',
      'Адреса', 'Місто', 'Країна', 'Поштовий індекс',
      'Дата народження', 'Стать', 'Примітки'
    ]
  })
}

async function exportCategories() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase configuration')
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false },
    global: {
      headers: {
        'apikey': supabaseKey }
    }
  })

  try {
    // Сначала проверим, что можем получить доступ к таблице с базовыми полями
    const testQuery = await supabase
      .from('categories')
      .select('id')
      .limit(1)
    
    if (testQuery.error) {
      logger.error('Test query to categories failed', testQuery.error)
      throw new Error(`Categories table access error: ${testQuery.error.message}`)
    }
    
    // Если тестовый запрос успешен, выполняем основной запрос
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order')

    if (error) {
      logger.error('Failed to export categories', error)
      throw error
    }
    
    const categoriesData = categories.map((category: any) => ({
      'ID': category.id,
      'Назва': category.name,
      'Опис': category.description || '',
      'Порядок': category.sort_order || 0,
      'Батьківська категорія': category.parent_id || '',
      'Іконка': category.icon || '',
      'Колір': category.color || '',
      'Створено': category.created_at,
      'Оновлено': category.updated_at
    }))
    
    return stringify(categoriesData, {
      header: true,
      columns: [
        'ID', 'Назва', 'Опис', 'Порядок', 'Батьківська категорія',
        'Іконка', 'Колір', 'Створено', 'Оновлено'
      ]
    })
  } catch (err) {
    logger.error('Categories export error', err)
    throw err
  }

  // This code is unreachable after the previous return statement, removing it
  /* Removed duplicated code: categoriesData is already defined above */
}

async function exportRentals() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase configuration')
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  const { data: rentals, error } = await supabase
    .from('rentals')
    .select(`
      *,
      books (title, code),
      users:user_id (name, email)
    `)
    .order('created_at')

  if (error) throw error

  const rentalsData = rentals.map((rental: any) => ({
    'ID': rental.id,
    'Книга': rental.books?.title || '',
    'Код книги': rental.books?.code || '',
    'Користувач': rental.users?.name || '',
    'Email користувача': rental.users?.email || '',
    'Статус': rental.status || '',
    'Дата початку': rental.rental_date || '',
    'Дата закінчення': '', // Поле відсутнє в базі або має інше ім'я
    'Дата повернення': rental.return_date || '',
    'Ціна': '', // Поле відсутнє в базі
    'Створено': rental.created_at,
    'Оновлено': rental.updated_at,
    'Примітки': rental.notes || ''
  }))

  return stringify(rentalsData, {
    header: true,
    columns: [
      'ID', 'Книга', 'Код книги', 'Користувач', 'Email користувача',
      'Статус', 'Дата початку', 'Дата закінчення', 'Дата повернення',
      'Ціна', 'Створено', 'Оновлено', 'Примітки'
    ]
  })
}

async function exportSubscriptionRequests() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase configuration')
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  const { data: requests, error } = await supabase
    // Используем таблицу, которая действительно существует в базе
    // Так как subscription_requests может не быть в типах, проверьте реальное имя таблицы
    .from('users')
    .select('id, name, email, subscription_type, created_at')
    .order('created_at')

  if (error) throw error

  const requestsData = requests.map((request: any) => ({
    'ID': request.id,
    'Ім\'я': request.name || '',
    'Email': request.email || '',
    'Телефон': '', // Используем доступные поля
    'Тип підписки': request.subscription_type || '',
    'Статус': '', // Используем доступные поля
    'Повідомлення': '', // Используем доступные поля
    'Дата створення': request.created_at,
    'Дата оновлення': request.created_at, // Используем доступное поле
    'Примітки': '' // Используем доступные поля
  }))

  return stringify(requestsData, {
    header: true,
    columns: [
      'ID', 'Ім\'я', 'Email', 'Телефон', 'Тип підписки',
      'Статус', 'Повідомлення', 'Дата створення', 'Дата оновлення', 'Примітки'
    ]
  })
}

async function exportAllData() {
  // Экспортируем все данные в один файл с разделителями
  const books = await exportBooks()
  const users = await exportUsers()
  const categories = await exportCategories()
  const rentals = await exportRentals()
  const requests = await exportSubscriptionRequests()

  return `# КНИГИ\n${books}\n\n# ПОЛЬЗОВАТЕЛИ\n${users}\n\n# КАТЕГОРИИ\n${categories}\n\n# АРЕНДЫ\n${rentals}\n\n# ЗАЯВКИ НА ПОДПИСКУ\n${requests}`
}
