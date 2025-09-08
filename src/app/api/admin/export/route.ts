import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { stringify } from 'csv-stringify/sync'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET(request: NextRequest): Promise<Response> {
  try {
    // Проверяем авторизацию
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'No authentication token provided' },
        { status: 401 }
      )
    }

    // Проверяем права администратора
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Invalid authentication token' },
        { status: 401 }
      )
    }

    // Проверяем, является ли пользователь администратором
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('user_id', user.id)
      .single()

    const isAdminByEmail = user.email === 'admin@stefabooks.com.ua' || user.email === 'admin@stefa-books.com.ua'
    const isAdminByRole = profile?.role === 'admin'

    if (!isAdminByEmail && !isAdminByRole) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      )
    }

    // Получаем тип экспорта
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'all'

    let csvData = ''
    let filename = 'export'
    let contentType = 'text/csv'

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

  if (error) throw error

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

  return stringify(booksData, {
    header: true,
    columns: [
      'Код', 'Назва', 'Автор', 'Видавництво', 'Категорія',
      'Всього', 'Доступно', 'Статус', 'Ціна', 'Повна ціна',
      'cover_url', 'Опис', 'ISBN', 'Вікова група', 'Короткий опис',
      'Місцезнаходження', 'Створено', 'Оновлено'
    ]
  })
}

async function exportUsers() {
  const { data: users, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at')

  if (error) throw error

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
  const { data: categories, error } = await supabase
    .from('categories')
    .select('*')
    .order('display_order')

  if (error) throw error

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

  return stringify(categoriesData, {
    header: true,
    columns: [
      'ID', 'Назва', 'Опис', 'Порядок', 'Батьківська категорія',
      'Іконка', 'Колір', 'Створено', 'Оновлено'
    ]
  })
}

async function exportRentals() {
  const { data: rentals, error } = await supabase
    .from('rentals')
    .select(`
      *,
      books:book_id (title, code),
      users:user_id (name, email)
    `)
    .order('created_at')

  if (error) throw error

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
  const { data: requests, error } = await supabase
    .from('subscription_requests')
    .select('*')
    .order('created_at')

  if (error) throw error

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
