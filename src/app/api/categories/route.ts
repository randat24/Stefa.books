import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { logger } from '@/lib/logger'

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    // Моковые категории для разработки
    const mockCategories = [
      {
        id: 'cat-1',
        name: 'Казки',
        slug: 'kazky',
        parent_id: null,
        icon: '📚',
        color: '#FFD700',
        sort_order: 1,
        subcategories: []
      },
      {
        id: 'cat-2',
        name: 'Пригоди',
        slug: 'prygody',
        parent_id: null,
        icon: '🌍',
        color: '#3B82F6',
        sort_order: 2,
        subcategories: []
      },
      {
        id: 'cat-3',
        name: 'Пізнавальні',
        slug: 'piznavalni',
        parent_id: null,
        icon: '🧠',
        color: '#10B981',
        sort_order: 3,
        subcategories: []
      },
      {
        id: 'cat-4',
        name: 'Молодший вік',
        slug: 'molodshyj-vik',
        parent_id: null,
        icon: '👶',
        color: '#F472B6',
        sort_order: 4,
        subcategories: []
      },
      {
        id: 'cat-5',
        name: 'Середній вік',
        slug: 'serednij-vik',
        parent_id: null,
        icon: '🧒',
        color: '#8B5CF6',
        sort_order: 5,
        subcategories: []
      },
      {
        id: 'cat-6',
        name: 'Підлітковий вік',
        slug: 'pidlitkovyj-vik',
        parent_id: null,
        icon: '👦',
        color: '#EC4899',
        sort_order: 6,
        subcategories: []
      }
    ];

    // Проверяем, можем ли мы подключиться к Supabase
    if (!supabaseUrl || !supabaseKey || supabaseUrl === 'your_supabase_url_here') {
      logger.warn('Missing Supabase configuration, using mock data for categories')
      return NextResponse.json({
        success: true,
        data: mockCategories
      })
    }

    try {
      const supabase = createClient(supabaseUrl, supabaseKey)

      // Загружаем уникальные категории из таблицы books
      const { data: books, error } = await supabase
        .from('books')
        .select('category')
        .not('category', 'is', null)
        .eq('is_active', true)

      if (error) {
        logger.error('Categories API: Database error when fetching categories', error)
        logger.warn('Falling back to mock categories')
        return NextResponse.json({
          success: true,
          data: mockCategories
        })
      }

      // Извлекаем уникальные категории
      const uniqueCategories = Array.from(
        new Set(books?.map((book: any) => book.category).filter(Boolean))
      ).map((category, index) => ({
        id: `cat-${index + 1}`,
        name: category as string,
        slug: (category as string).toLowerCase().replace(/\s+/g, '-'),
        parent_id: null,
        icon: '📚',
        color: '#3B82F6',
        sort_order: index + 1,
        subcategories: []
      }))
      
      // Если не удалось получить категории из базы, возвращаем моковые данные
      if (!uniqueCategories || uniqueCategories.length === 0) {
        logger.warn('No categories found in database, returning mock data')
        return NextResponse.json({
          success: true,
          data: mockCategories
        })
      }

    logger.info('Categories API: Categories fetched successfully', { 
      count: uniqueCategories?.length || 0
    })

    return NextResponse.json({
      success: true,
      data: uniqueCategories || []
    })
    
    } catch (supabaseError) {
      logger.error('Categories API: Error connecting to Supabase', supabaseError)
      logger.warn('Falling back to mock categories')
      return NextResponse.json({
        success: true,
        data: mockCategories
      })
    }

  } catch (error) {
    logger.error('Categories API: Unexpected error in GET /api/categories', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}