import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { logger } from '@/lib/logger'

// GET /api/books - получение всех книг
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const author = searchParams.get('author')
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    const available = searchParams.get('available')

    logger.info('📚 Fetching books', { category, author, search, limit, offset, available })

    // Используем прямые запросы к таблицам
    let query = supabase
      .from('books')
      .select(`
        *,
        categories:category_id (
          id,
          name,
          slug
        ),
        authors:author_id (
          id,
          name
        )
      `, { count: 'exact' })

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
      logger.error('Error fetching books', error)
      return NextResponse.json(
        { success: false, data: [], error: error.message },
        { status: 500 }
      )
    }

    logger.info(`✅ Fetched ${data?.length || 0} books`)
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
    logger.error('Unexpected error in books GET', { error: message })
    return NextResponse.json(
      { success: false, data: [], error: message },
      { status: 500 }
    )
  }
}

// POST /api/books - создание новой книги (только для админов)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, author, category, cover_url, isbn, pages, language, is_active } = body

    logger.info('📚 Creating new book', { title, author, category })
    
    // Валидация обязательных полей
    if (!title || !author || !category) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: title, author, category' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('books')
      .insert({
        title,
        description: description || null,
        author,
        category,
        cover_url: cover_url || null,
        isbn: isbn || null,
        pages: pages || null,
        language: language || 'uk',
        is_active: is_active !== false // по умолчанию активна
      })
      .select()
      .single()

    if (error) {
      logger.error('Error creating book', error)
      return NextResponse.json(
        { success: false, data: null, error: error.message },
        { status: 500 }
      )
    }

    logger.info(`✅ Created book: ${data?.title || 'unknown'}`)
    return NextResponse.json({
      success: true,
      data
    })

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    logger.error('Unexpected error in books POST', { error: message })
    return NextResponse.json(
      { success: false, data: null, error: message },
      { status: 500 }
    )
  }
}