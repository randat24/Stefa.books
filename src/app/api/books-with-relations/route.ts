import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { logger } from '@/lib/logger'

// GET /api/books-with-relations - получение книг с отношениями через функцию
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const author = searchParams.get('author')
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    const available = searchParams.get('available')

    logger.info('📚 Fetching books with relations via function', { category, author, search, limit, offset, available })

    // Используем функцию вместо представления
    let query = supabase
      .rpc('get_books_with_relations')
      .select('*', { count: 'exact' })

    // Фильтрация по категории
    if (category) {
      query = query.eq('category_id', category)
    }

    // Фильтрация по автору
    if (author) {
      query = query.eq('author_id', author)
    }

    // Поиск по названию и описанию
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }

    // Фильтрация по доступности
    if (available !== null) {
      query = query.eq('is_active', available === 'true')
    }

    // Сортировка и пагинация
    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      logger.error('Error fetching books with relations', error)
      return NextResponse.json(
        { success: false, data: [], error: error.message },
        { status: 500 }
      )
    }

    logger.info(`✅ Fetched ${data?.length || 0} books with relations`)
    return NextResponse.json({
      success: true,
      data: data || [],
      count: count || 0,
      pagination: {
        limit,
        offset,
        total: count || 0
      }
    })

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    logger.error('Unexpected error in books-with-relations GET', { error: message })
    return NextResponse.json(
      { success: false, data: [], error: message },
      { status: 500 }
    )
  }
}
