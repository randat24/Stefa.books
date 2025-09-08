import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';

// ============================================================================
// ОЧИСТКА ВСЕХ КНИГ ИЗ БАЗЫ ДАННЫХ
// ============================================================================

export async function DELETE(): Promise<Response> {
  try {
    logger.info('Starting to clear all books from database', undefined, 'Admin');
    
    // Получаем текущее количество книг
    const { count: currentCount } = await supabase
      .from('books')
      .select('*', { count: 'exact', head: true });

    logger.info(`Current books count: ${currentCount}`, undefined, 'Admin');

    // Удаляем все книги
    const { error } = await supabase
      .from('books')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Удаляем все записи

    if (error) {
      throw new Error(`Ошибка удаления книг: ${error.message}`);
    }

    // Проверяем, что книги удалены
    const { count: afterCount } = await supabase
      .from('books')
      .select('*', { count: 'exact', head: true });

    logger.info(`Books cleared. Before: ${currentCount}, After: ${afterCount}`, undefined, 'Admin');

    return NextResponse.json({
      success: true,
      message: `Успешно удалено ${currentCount || 0} книг из базы данных`,
      deleted_count: currentCount || 0,
      remaining_count: afterCount || 0
    });

  } catch (error) {
    logger.error('Error clearing books', error, 'Admin');
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Неизвестная ошибка при очистке базы'
    }, { status: 500 });
  }
}

// ============================================================================
// ИНФОРМАЦИЯ О КОЛИЧЕСТВЕ КНИГ
// ============================================================================

export async function GET(): Promise<Response> {
  try {
    const { count } = await supabase
      .from('books')
      .select('*', { count: 'exact', head: true });

    return NextResponse.json({
      success: true,
      count: count || 0,
      message: `В базе данных ${count || 0} книг`
    });

  } catch (error) {
    logger.error('Error getting books count', error, 'Admin');
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Ошибка получения количества книг'
    }, { status: 500 });
  }
}