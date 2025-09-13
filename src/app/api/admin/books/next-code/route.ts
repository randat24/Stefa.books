import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { logger } from '@/lib/logger'
import { generateNextBookCode } from '@/lib/book-codes'

// ============================================================================
// API ДЛЯ ПОЛУЧЕНИЯ СЛЕДУЮЩЕГО КОДА КНИГИ
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

    logger.info(`Admin: Getting next code for category: ${categoryName}`, undefined, 'API')

    // Получаем все существующие коды книг
    const { data: books, error } = await supabase
      .from('books')
      .select('code')
      .not('code', 'is', null)

    if (error) {
      logger.error('Admin API: Database error when fetching book codes', { error }, 'API')
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    // Извлекаем коды из результатов
    const existingCodes = books?.map(book => book.code).filter(Boolean) || []

    // Генерируем следующий код
    const nextCode = generateNextBookCode(existingCodes, categoryName)

    if (!nextCode) {
      return NextResponse.json(
        { success: false, error: 'Категория не поддерживает автоматическую генерацию кодов' },
        { status: 400 }
      )
    }

    logger.info(`Admin: Generated next code: ${nextCode} for category: ${categoryName}`, undefined, 'API')

    return NextResponse.json({
      success: true,
      code: nextCode,
      category: categoryName
    })

  } catch (error) {
    logger.error('Admin API: Unexpected error when generating next code', error, 'API')
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Неизвестная ошибка'
      },
      { status: 500 }
    )
  }
}
