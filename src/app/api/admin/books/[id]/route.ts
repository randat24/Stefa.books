import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { logger } from '@/lib/logger'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const bookId = params.id
    const body = await request.json()

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

    // Подготавливаем данные для обновления
    const updateData = {
      code: body.code,
      title: body.title,
      author: body.author,
      category_id: body.category_id,
      subcategory: body.subcategory,
      description: body.description,
      short_description: body.short_description,
      isbn: body.isbn,
      pages: body.pages,
      age_range: body.age_range,
      language: body.language,
      publisher: body.publisher,
      publication_year: body.publication_year,
      cover_url: body.cover_url,
      status: body.status,
      qty_total: body.qty_total,
      qty_available: body.qty_available,
      price_uah: body.price_uah,
      location: body.location,
      rating: body.rating,
      badges: body.badges,
      tags: body.tags,
      updated_at: new Date().toISOString()
    }

    // Обновляем книгу
    const { data, error } = await supabase
      .from('books')
      .update(updateData)
      .eq('id', bookId)
      .select()

    if (error) {
      logger.error('Admin API: Database error when updating book', error)
      return NextResponse.json(
        { error: 'Ошибка при обновлении книги' },
        { status: 500 }
      )
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'Книга не найдена' },
        { status: 404 }
      )
    }

    logger.info('Admin API: Book updated successfully', { 
      bookId,
      title: data[0].title
    })

    return NextResponse.json({
      success: true,
      data: data[0],
      message: 'Книга успешно обновлена'
    })

  } catch (error) {
    logger.error('Admin API: Unexpected error in PUT /api/admin/books/[id]', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const bookId = params.id

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

    // Удаляем книгу
    const { error } = await supabase
      .from('books')
      .delete()
      .eq('id', bookId)

    if (error) {
      logger.error('Admin API: Database error when deleting book', error)
      return NextResponse.json(
        { error: 'Ошибка при удалении книги' },
        { status: 500 }
      )
    }

    logger.info('Admin API: Book deleted successfully', { bookId })

    return NextResponse.json({
      success: true,
      message: 'Книга успешно удалена'
    })

  } catch (error) {
    logger.error('Admin API: Unexpected error in DELETE /api/admin/books/[id]', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
