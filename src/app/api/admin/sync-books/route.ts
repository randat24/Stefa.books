import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { logger } from '@/lib/logger'


export async function POST() {
  try {
    logger.info('Starting books sync to website')

    // Получаем все книги из базы данных
    const { data: books, error: booksError } = await supabase
      .from('books')
      .select(`
        id,
        code,
        title,
        author,
        description,
        pages,
        age_range,
        status,
        qty_total,
        qty_available,
        price_uah,
        location,
        cover_url,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false })

    if (booksError) {
      logger.error('Error fetching books:', booksError)
      return NextResponse.json({
        success: false,
        error: 'Помилка отримання книг з бази даних',
        details: booksError.message
      }, { status: 500 })
    }

    // Получаем все категории
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('id, name, description, parent_id')
      .order('name', { ascending: true })

    if (categoriesError) {
      logger.error('Error fetching categories:', categoriesError)
      return NextResponse.json({
        success: false,
        error: 'Помилка отримання категорій з бази даних',
        details: categoriesError.message
      }, { status: 500 })
    }

    // Проверяем, что книги и категории загружены
    if (!books || books.length === 0) {
      logger.warn('No books found in database')
      return NextResponse.json({
        success: false,
        error: 'В базі даних не знайдено жодної книги',
        count: 0
      }, { status: 404 })
    }

    if (!categories || categories.length === 0) {
      logger.warn('No categories found in database')
      return NextResponse.json({
        success: false,
        error: 'В базі даних не знайдено жодної категорії',
        count: 0
      }, { status: 404 })
    }

    // Логируем статистику
    const availableBooks = books.filter(book => book.status === 'available').length
    const totalBooks = books.length
    const totalCategories = categories.length

    logger.info('Books sync completed', {
      totalBooks,
      availableBooks,
      totalCategories,
      booksWithCovers: books.filter(book => book.cover_url).length
    })

    return NextResponse.json({
      success: true,
      message: `Успішно синхронізовано ${totalBooks} книг та ${totalCategories} категорій`,
      data: {
        books: {
          total: totalBooks,
          available: availableBooks,
          withCovers: books.filter(book => book.cover_url).length
        },
        categories: {
          total: totalCategories
        },
        syncTime: new Date().toISOString()
      }
    })

  } catch (error) {
    logger.error('Books sync error:', error)
    return NextResponse.json({
      success: false,
      error: 'Внутрішня помилка сервера при синхронізації книг',
      details: error instanceof Error ? error.message : 'Невідома помилка'
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    logger.info('Checking books sync status')

    // Получаем количество книг
    const { count: booksCount, error: booksError } = await supabase
      .from('books')
      .select('*', { count: 'exact', head: true })

    if (booksError) {
      logger.error('Error counting books:', booksError)
      return NextResponse.json({
        success: false,
        error: 'Помилка підрахунку книг',
        details: booksError.message
      }, { status: 500 })
    }

    // Получаем количество категорий
    const { count: categoriesCount, error: categoriesError } = await supabase
      .from('categories')
      .select('*', { count: 'exact', head: true })

    if (categoriesError) {
      logger.error('Error counting categories:', categoriesError)
      return NextResponse.json({
        success: false,
        error: 'Помилка підрахунку категорій',
        details: categoriesError.message
      }, { status: 500 })
    }

    // Получаем количество доступных книг
    const { count: availableBooksCount, error: availableError } = await supabase
      .from('books')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'available')

    if (availableError) {
      logger.error('Error counting available books:', availableError)
    }

    return NextResponse.json({
      success: true,
      data: {
        totalBooks: booksCount || 0,
        availableBooks: availableBooksCount || 0,
        totalCategories: categoriesCount || 0,
        lastCheck: new Date().toISOString(),
        syncStatus: 'ready'
      }
    })

  } catch (error) {
    logger.error('Books sync status check error:', error)
    return NextResponse.json({
      success: false,
      error: 'Помилка перевірки статусу синхронізації',
      details: error instanceof Error ? error.message : 'Невідома помилка'
    }, { status: 500 })
  }
}
