"use server"

import { supabase } from "@/lib/supabase"
import type { AdminDashboardData, BookRow, UserRow, RentalRow, PaymentRow } from "@/lib/types/admin"
import { logger } from "@/lib/logger"

// ============================================================================
// ЗАГРУЗКА ДАННЫХ АДМИН-ПАНЕЛИ
// ============================================================================

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  logger.info('Loading admin dashboard data from database', undefined, 'Admin')
  
  try {
    // Загружаем реальные данные из базы
    const [books, users, rentals, payments, stats] = await Promise.all([
      getBooks(),
      getUsers(),
      getRentals(),
      getPayments(),
      getBooksOnlyStats()
    ])

    const result = {
      stats,
      books,
      users,
      rentals,
      payments
    }
    
    logger.info('Database data loaded', {
      books: result.books.length,
      users: result.users.length,
      rentals: result.rentals.length,
      payments: result.payments.length,
      stats: result.stats
    }, 'Admin')
    
    return result
  } catch (error) {
    logger.error('Error loading admin dashboard data', error, 'Admin')
    
    // Fallback to static data if database fails
    const fallbackResult = {
      stats: {
        totalBooks: 0,
        availableBooks: 0,
        activeUsers: 0,
        totalRevenue: 0,
        totalBooksCost: 0
      },
      books: [],
      users: [],
      rentals: [],
      payments: []
    }
    
    return fallbackResult
  }
}

// ============================================================================
// КНИГИ
// ============================================================================

export async function getBooks(): Promise<BookRow[]> {
  try {
    logger.info('Loading books from database', undefined, 'Admin')
    
    // Query all available fields including publisher, price_uah and full_price_uah
    const { data, error } = await supabase
      .from('books')
      .select(`
        id, code, title, author, category, subcategory, description, short_description,
        pages, age_range, language, publisher, publication_year, isbn, cover_url, 
        status, available, qty_total, qty_available, price_uah, full_price_uah, location, rating, 
        rating_count, badges, tags, created_at, updated_at
      `)
      .order('created_at', { ascending: false })
      .limit(200)

    if (error) {
      logger.error('Error fetching books', error, 'Admin')
      return []
    }

    if (!data || data.length === 0) {
      logger.info('No books found in database', undefined, 'Admin')
      return []
    }

    logger.info('Books loaded successfully', { count: data.length }, 'Admin')

    return data.map((book: any) => ({
      id: book.id,
      code: book.code,
      title: book.title,
      author: book.author,
      author_id: undefined, // Field doesn't exist yet
      category_id: book.category,
      category_name: book.category_name,
      subcategory: book.subcategory,
      description: book.description,
      short_description: book.short_description,
      pages: book.pages,
      age_range: book.age_range,
      language: book.language,
      publisher: book.publisher,
      publication_year: book.publication_year,
      isbn: book.isbn,
      cover_url: book.cover_url,
      status: book.status as 'available' | 'issued' | 'reserved' | 'lost',
      available: book.available,
      qty_total: book.qty_total || 1,
      qty_available: book.qty_available || 1,
      price_uah: book.price_uah,
      full_price_uah: book.full_price_uah,
      location: book.location,
      rating: book.rating,
      rating_count: book.rating_count,
      badges: book.badges,
      tags: book.tags,
      created_at: book.created_at,
      updated_at: book.updated_at
    }))
  } catch (error) {
    logger.error('Error in getBooks', error, 'Admin')
    return []
  }
}

// ============================================================================
// ПОЛЬЗОВАТЕЛИ
// ============================================================================

export async function getUsers(): Promise<UserRow[]> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      logger.error('Error fetching users', error, 'Admin')
      return []
    }

    return data.map((user: any) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      subscription_type: user.subscription_type as 'mini' | 'maxi' | 'premium',
      subscription_start: user.subscription_start,
      subscription_end: user.subscription_end,
      status: user.status as 'active' | 'inactive' | 'suspended',
      address: user.address,
      notes: user.notes,
      created_at: user.created_at,
      updated_at: user.updated_at
    }))
  } catch (error) {
    logger.error('Error in getUsers', error, 'Admin')
    return []
  }
}

// ============================================================================
// АРЕНДЫ
// ============================================================================

export async function getRentals(): Promise<RentalRow[]> {
  try {
    const { data, error } = await supabase
      .from('rentals')
      .select(`
        *,
        users:user_id (name, email),
        books:book_id (title, code)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      logger.error('Error fetching rentals', error, 'Admin')
      return []
    }

    return data.map((rental: any) => ({
      id: rental.id,
      user_id: rental.user_id,
      book_id: rental.book_id,
      rental_date: rental.rental_date,
      due_date: rental.due_date || '',
      return_date: rental.return_date,
      status: rental.status as 'active' | 'overdue' | 'returned' | 'lost',
      notes: rental.notes,
      created_at: rental.created_at,
      updated_at: rental.updated_at,
      // Joined fields
      user_name: rental.users?.name,
      user_email: rental.users?.email,
      book_title: rental.books?.title,
      book_code: rental.books?.code
    }))
  } catch (error) {
    logger.error('Error in getRentals', error, 'Admin')
    return []
  }
}

// ============================================================================
// ПЛАТЕЖИ
// ============================================================================

export async function getPayments(): Promise<PaymentRow[]> {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        users:user_id (name, email)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      logger.error('Error fetching payments', error, 'Admin')
      return []
    }

    return data.map((payment: any) => ({
      id: payment.id,
      user_id: payment.user_id,
      amount_uah: payment.amount_uah,
      currency: 'UAH' as const,
      payment_method: payment.payment_method as 'monobank' | 'online' | 'cash',
      status: payment.status as 'pending' | 'completed' | 'failed' | 'refunded',
      transaction_id: payment.transaction_id,
      payment_date: payment.payment_date,
      description: payment.description,
      created_at: payment.created_at,
      updated_at: payment.updated_at,
      // Joined fields
      user_name: payment.users?.name,
      user_email: payment.users?.email
    }))
  } catch (error) {
    logger.error('Error in getPayments', error, 'Admin')
    return []
  }
}

// ============================================================================
// СТАТИСТИКА ДАШБОРДА
// ============================================================================

export async function getDashboardStats() {
  try {
    // Параллельно загружаем статистику
    const [
      booksStats,
      usersStats,
      paymentsStats,
      booksCostStats
    ] = await Promise.all([
      // Статистика книг
      supabase
        .from('books')
        .select('id, available')
        .then(({ data, error }: { data: { id: string; available: boolean }[] | null, error: any }) => {
          if (error) throw error
          const total = data?.length || 0
          const available = data?.filter((book) => book.available).length || 0
          return { total, available }
        }),

      // Статистика пользователей
      supabase
        .from('users')
        .select('id, status')
        .then(({ data, error }: { data: { id: string; status: string }[] | null, error: any }) => {
          if (error) throw error
          const active = data?.filter((user) => user.status === 'active').length || 0
          return { active }
        }),

      // Статистика платежей (доходы за текущий месяц)
      supabase
        .from('payments')
        .select('amount_uah, payment_date, status')
        .gte('payment_date', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
        .eq('status', 'completed')
        .then(({ data, error }) => {
          if (error) throw error
          const total = data?.reduce((sum: number, payment: any) => sum + (payment.amount_uah || 0), 0) || 0
          return { total }
        }),

      // Статистика затрат на книги (цена закупки)
      supabase
        .from('books')
        .select('price_uah, qty_total')
        .not('price_uah', 'is', null)
        .then(({ data, error }) => {
          if (error) throw error
          const totalCost = data?.reduce((sum: number, book: any) => sum + ((book.price_uah || 0) * (book.qty_total || 1)), 0) || 0
          return { totalCost }
        })
    ])

    return {
      totalBooks: booksStats.total,
      availableBooks: booksStats.available,
      activeUsers: usersStats.active,
      totalRevenue: paymentsStats.total,
      totalBooksCost: booksCostStats.totalCost
    }
  } catch (error) {
    logger.error('Error loading dashboard stats', error, 'Admin')
    return {
      totalBooks: 0,
      availableBooks: 0,
      activeUsers: 0,
      totalRevenue: 0,
      totalBooksCost: 0
    }
  }
}

// ============================================================================
// УПРОЩЕННАЯ СТАТИСТИКА (ТОЛЬКО КНИГИ)
// ============================================================================

export async function getBooksOnlyStats() {
  try {
    logger.info('Loading books stats', undefined, 'Admin')
    
    // Получаем статистику только по книгам
    const { data: booksData, error } = await supabase
      .from('books')
      .select('id, available, price_uah, qty_total')

    if (error) {
      logger.error('Error fetching books for stats', error, 'Admin')
      throw error
    }

    logger.info('Books data for stats', { count: booksData?.length || 0 }, 'Admin')

    const totalBooks = booksData?.length || 0
    const availableBooks = booksData?.filter((book: any) => book.available).length || 0
    const totalBooksCost = booksData?.reduce((sum: number, book: any) => 
      sum + ((book.price_uah || 0) * (book.qty_total || 1)), 0
    ) || 0

    const stats = {
      totalBooks,
      availableBooks,
      activeUsers: 0, // Пока 0, добавим позже
      totalRevenue: 0, // Пока 0, добавим позже  
      totalBooksCost
    }

    logger.info('Calculated stats', stats, 'Admin')
    return stats
  } catch (error) {
    logger.error('Error loading books stats', error, 'Admin')
    return {
      totalBooks: 0,
      availableBooks: 0,
      activeUsers: 0,
      totalRevenue: 0,
      totalBooksCost: 0
    }
  }
}

// ============================================================================
// ПОИСК КНИГ
// ============================================================================

export async function searchBooks(query: string, limit = 50) {
  try {
    if (!query.trim()) {
      return getBooks()
    }

    const { data, error } = await supabase.rpc('search_books', {
      query_text: query,
      limit_count: limit
    } as any)

    if (error) {
      logger.error('Error searching books', error, 'Admin')
      return []
    }

    return data || []
  } catch (error) {
    logger.error('Error in searchBooks', error, 'Admin')
    return []
  }
}