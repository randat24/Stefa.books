import { NextRequest, NextResponse } from 'next/server'
import { supabase, type BookUpdate } from '@/lib/supabase'
import { logger } from '@/lib/logger'

// ============================================================================
// API ДЛЯ ПОЛУЧЕНИЯ ОДНОЙ КНИГИ ПО ID
// ============================================================================

export async function GET(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID книги не указан' },
        { status: 400 }
      )
    }

    logger.info(`Fetching book with ID: ${id}`, undefined, 'API')

    // Проверяем, есть ли подключение к Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      logger.warn('Missing Supabase environment variables, returning mock data');
      
      // Fallback: возвращаем моковую книгу
      const mockBook = {
        id: id,
        code: `MOCK${id.padStart(3, '0')}`,
        title: 'Казка про принцесу',
        author: 'Анна Іванова',
        category: 'Казки',
        subcategory: 'Дитячі казки',
        pages: 32,
        status: 'available',
        available: true,
        rating: 4.5,
        rating_count: 12,
        badges: ['Популярна', 'Новинка'],
        description: 'Чарівна казка про принцесу, яка навчилася бути доброю та мудрою.',
        short_description: 'Казка про принцесу',
        age_range: '3-6',
        cover_url: '/images/book-placeholder.svg',
        language: 'uk',
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z'
      };

      return NextResponse.json({
        success: true,
        data: mockBook
      });
    }

    const { data: book, error } = await supabase
      .from('books')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      logger.error('Supabase error', error, 'API')
      
      // Если книга не найдена
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Книга не найдена' },
          { status: 404 }
        )
      }
      
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    logger.info(`Found book: ${(book as any)?.title || 'Unknown'}`, undefined, 'API')

    return NextResponse.json({
      success: true,
      data: book
    })

  } catch (error) {
    logger.error('API error', error, 'API')
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Неизвестная ошибка'
      },
      { status: 500 }
    )
  }
}

// ============================================================================
// API ДЛЯ ОБНОВЛЕНИЯ КНИГИ ПО ID
// ============================================================================

export async function PUT(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID книги не указан' },
        { status: 400 }
      )
    }

    const body = await request.json() as Partial<BookUpdate>
    
    if (!body || Object.keys(body).length === 0) {
      return NextResponse.json(
        { success: false, error: 'Данные для обновления не предоставлены' },
        { status: 400 }
      )
    }

    logger.info(`Updating book with ID: ${id}`, undefined, 'API')

    const updateData = {
      ...body,
      updated_at: new Date().toISOString()
    }

    const { data: book, error } = await (supabase as any)
      .from('books')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      logger.error('Supabase error', error, 'API')
      
      // Если книга не найдена
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Книга не найдена' },
          { status: 404 }
        )
      }
      
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    logger.info(`Updated book: ${(book as any)?.title || 'Unknown'}`, undefined, 'API')

    return NextResponse.json({
      success: true,
      data: book
    })

  } catch (error) {
    logger.error('API error', error, 'API')
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Неизвестная ошибка'
      },
      { status: 500 }
    )
  }
}