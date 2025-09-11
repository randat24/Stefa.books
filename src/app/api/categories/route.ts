import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { logger } from '@/lib/logger'

export async function GET() {
  try {
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

    // Загружаем уникальные категории из таблицы books
    const { data: books, error } = await supabase
      .from('books')
      .select('category')
      .not('category', 'is', null)
      .eq('is_active', true)

    if (error) {
      logger.error('Categories API: Database error when fetching categories', error)
      return NextResponse.json(
        { error: 'Ошибка при получении категорий' },
        { status: 500 }
      )
    }

    // Извлекаем уникальные категории
    const uniqueCategories = Array.from(
      new Set(books?.map(book => book.category).filter(Boolean))
    ).map((category, index) => ({
      id: `cat-${index + 1}`,
      name: category,
      slug: category.toLowerCase().replace(/\s+/g, '-'),
      parent_id: null,
      icon: '📚',
      color: '#3B82F6',
      sort_order: index + 1
    }))

    logger.info('Categories API: Categories fetched successfully', { 
      count: uniqueCategories?.length || 0
    })

    return NextResponse.json({
      success: true,
      data: uniqueCategories || []
    })

  } catch (error) {
    logger.error('Categories API: Unexpected error in GET /api/categories', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}