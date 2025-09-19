import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { logger } from '@/lib/logger'
import { generateNextBookArticle } from '@/lib/book-codes'

// ============================================================================
// API ДЛЯ ПОЛУЧЕНИЯ СЛЕДУЮЩЕГО АРТИКУЛА КНИГИ
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryName = searchParams.get('category')

    if (!categoryName) {
      return NextResponse.json(
        { success: false, error: 'Название категории не указано' },
        { status: 400 }
      )
    }

    logger.info(`Admin: Getting next article for category: ${categoryName}`, undefined, 'API')

    // Получаем все существующие артикулы книг
    const { data: books, error } = await supabase
      .from('books')
      .select('article')
      .not('article', 'is', null)

    if (error) {
      logger.error('Admin API: Database error when fetching book articles', { error }, 'API')
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    // Извлекаем артикулы из результатов
    const existingArticles = books?.map(book => book.article).filter(Boolean) || []

    // Генерируем следующий артикул
    const nextArticle = generateNextBookArticle(existingArticles, categoryName)

    if (!nextArticle) {
      return NextResponse.json(
        { success: false, error: 'Категория не поддерживает автоматическую генерацию артикулов' },
        { status: 400 }
      )
    }

    logger.info(`Admin: Generated next article: ${nextArticle} for category: ${categoryName}`, undefined, 'API')

    return NextResponse.json({
      success: true,
      article: nextArticle,
      category: categoryName
    })

  } catch (error) {
    logger.error('Admin API: Unexpected error when generating next article', error, 'API')
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Неизвестная ошибка'
      },
      { status: 500 }
    )
  }
}
