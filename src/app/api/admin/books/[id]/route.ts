import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { logger } from '@/lib/logger'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseKey)

// ============================================================================
// ТИПЫ ДЛЯ ОБНОВЛЕНИЯ КНИГИ
// ============================================================================

interface BookUpdateData {
  code?: string
  title?: string
  author?: string
  author_id?: string | null
  category_id?: string | null
  category_name?: string
  subcategory?: string
  qty_total?: number
  price_uah?: number | null
  status?: 'available' | 'issued' | 'reserved' | 'lost'
  location?: string | null
  cover_url?: string | null
  description?: string | null
  short_description?: string | null
}

// ============================================================================
// API ДЛЯ ОБНОВЛЕНИЯ КНИГИ В АДМИН ПАНЕЛИ
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

    const body = await request.json() as BookUpdateData
    
    if (!body || Object.keys(body).length === 0) {
      return NextResponse.json(
        { success: false, error: 'Данные для обновления не предоставлены' },
        { status: 400 }
      )
    }

    logger.info(`Admin: Updating book with ID: ${id}`, { updateData: body }, 'API')

    // Подготавливаем данные для обновления
    const updateData = {
      ...body,
      updated_at: new Date().toISOString()
    }

    // Обновляем книгу в базе данных
    const { data: book, error } = await supabase
      .from('books')
      .update(updateData)
      .eq('id', id)
      .select(`
        id,
        code,
        title,
        author,
        author_id,
        category_id,
        category_name,
        subcategory,
        qty_total,
        price_uah,
        status,
        location,
        cover_url,
        description,
        short_description,
        created_at,
        updated_at
      `)
      .single()

    if (error) {
      logger.error('Admin API: Database error when updating book', { error, bookId: id }, 'API')
      
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

    logger.info(`Admin: Successfully updated book: ${book?.title || 'Unknown'}`, { bookId: id }, 'API')

    return NextResponse.json({
      success: true,
      data: book,
      message: 'Книга успешно обновлена'
    })

  } catch (error) {
    logger.error('Admin API: Unexpected error when updating book', error, 'API')
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
// API ДЛЯ ПОЛУЧЕНИЯ КНИГИ ПО ID В АДМИН ПАНЕЛИ
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

    logger.info(`Admin: Fetching book with ID: ${id}`, undefined, 'API')

    const { data: book, error } = await supabase
      .from('books')
      .select(`
        id,
        code,
        title,
        author,
        author_id,
        category_id,
        category_name,
        subcategory,
        qty_total,
        price_uah,
        status,
        location,
        cover_url,
        description,
        short_description,
        created_at,
        updated_at
      `)
      .eq('id', id)
      .single()

    if (error) {
      logger.error('Admin API: Database error when fetching book', { error, bookId: id }, 'API')
      
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

    return NextResponse.json({
      success: true,
      data: book
    })

  } catch (error) {
    logger.error('Admin API: Unexpected error when fetching book', error, 'API')
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
// API ДЛЯ УДАЛЕНИЯ КНИГИ В АДМИН ПАНЕЛИ
// ============================================================================

export async function DELETE(
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

    logger.info(`Admin: Deleting book with ID: ${id}`, undefined, 'API')

    // Сначала получаем информацию о книге для логирования
    const { data: bookToDelete } = await supabase
      .from('books')
      .select('title, cover_url')
      .eq('id', id)
      .single()

    // Удаляем книгу из базы данных
    const { error } = await supabase
      .from('books')
      .delete()
      .eq('id', id)

    if (error) {
      logger.error('Admin API: Database error when deleting book', { error, bookId: id }, 'API')
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    logger.info(`Admin: Successfully deleted book: ${bookToDelete?.title || 'Unknown'}`, { bookId: id }, 'API')

    return NextResponse.json({
      success: true,
      message: 'Книга успешно удалена'
    })

  } catch (error) {
    logger.error('Admin API: Unexpected error when deleting book', error, 'API')
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Неизвестная ошибка'
      },
      { status: 500 }
    )
  }
}