import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { logger } from '@/lib/logger'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '1000') // Показываем все книги в админ панели
    const offset = parseInt(searchParams.get('offset') || '0')
    const query = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const available = searchParams.get('available') === 'true'
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      logger.error('Missing Supabase configuration')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // АДМИНСКИЙ запрос - загружаем все поля из таблицы books
    let queryBuilder = supabase
      .from('books')
      .select('*')
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1)

    // Применяем фильтры
    if (query) {
      queryBuilder = queryBuilder.or(`title.ilike.%${query}%,author.ilike.%${query}%,category.ilike.%${query}%`)
    }

    if (category) {
      queryBuilder = queryBuilder.eq('category', category)
    }

    if (available) {
      queryBuilder = queryBuilder.eq('available', true)
    }

    // Выполняем запрос
    const { data: books, error, count } = await queryBuilder

    if (error) {
      logger.error('Admin API: Database error when fetching books', error)
      return NextResponse.json(
        { error: 'Ошибка при получении книг' },
        { status: 500 }
      )
    }

    // Получаем общее количество для пагинации
    let totalCount = count
    if (!count) {
      const { count: total } = await supabase
        .from('books')
        .select('*', { count: 'exact', head: true })
      totalCount = total
    }

    // Обрабатываем данные для соответствия ожидаемой структуре
    const processedBooks = books?.map((book: any) => ({
      ...book,
      // Генерируем код книги на основе ID (первые 8 символов)
      code: book.id ? book.id.substring(0, 8).toUpperCase() : 'N/A',
      // Используем поле category как category_name
      category_name: book.category || 'No category',
      category_id: null, // В текущей структуре нет связи с таблицей категорий
      // Добавляем поля, которые ожидает админ панель
      qty_total: 1, // По умолчанию 1 экземпляр
      qty_available: book.is_active ? 1 : 0, // Доступно если активно
      price_uah: null, // Цена не указана в текущей структуре
      status: book.is_active ? 'available' : 'lost', // Статус на основе is_active
      available: book.is_active || false,
      // Дополнительные поля
      subcategory: null,
      short_description: null,
      isbn: null,
      pages: book.pages || null,
      age_range: null,
      language: 'uk',
      publisher: null,
      publication_year: null,
      location: null,
      rating: null,
      rating_count: null,
      badges: null,
      tags: null
    })) || []

    logger.info('Admin API: Books fetched successfully', { 
      count: processedBooks?.length || 0,
      total: totalCount,
      query,
      category 
    })

    return NextResponse.json({
      success: true,
      data: processedBooks,
      count: processedBooks?.length || 0,
      total: totalCount || 0,
      hasMore: (offset + limit) < (totalCount || 0)
    })

  } catch (error) {
    logger.error('Admin API: Unexpected error in GET /api/admin/books', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}