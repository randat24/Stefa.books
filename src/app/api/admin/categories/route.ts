import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';

// ============================================================================
// API ДЛЯ УПРАВЛЕНИЯ КАТЕГОРИЯМИ (АДМИН)
// ============================================================================

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const { name, type, main_category_id } = body;

    if (!name?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Название категории обязательно' },
        { status: 400 }
      );
    }

    if (!type || !['main', 'sub'].includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Тип категории должен быть main или sub' },
        { status: 400 }
      );
    }

    if (type === 'sub' && !main_category_id) {
      return NextResponse.json(
        { success: false, error: 'Для подкатегории требуется main_category_id' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (type === 'main') {
      // Создание основной категории
      logger.info(`Creating main category: ${name}`, { name }, 'Admin');

      // Получаем максимальный display_order
      const { data: maxOrderData } = await supabase
        .from('main_categories')
        .select('display_order')
        .order('display_order', { ascending: false })
        .limit(1);

      const nextOrder = (maxOrderData?.[0]?.display_order || 0) + 1;

      const { data: category, error } = await supabase
        .from('main_categories')
        .insert({
          name: name.trim(),
          display_order: nextOrder
        })
        .select()
        .single();

      if (error) {
        logger.error('Failed to create main category', { error }, 'Admin');
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 500 }
        );
      }

      logger.info(`Main category created successfully: ${category.name}`, { categoryId: category.id }, 'Admin');

      return NextResponse.json({
        success: true,
        data: category
      });

    } else {
      // Создание подкатегории
      logger.info(`Creating subcategory: ${name} in main category: ${main_category_id}`, { name, main_category_id }, 'Admin');

      // Получаем максимальный display_order для данной основной категории
      const { data: maxOrderData } = await supabase
        .from('subcategories')
        .select('display_order')
        .eq('main_category_id', main_category_id)
        .order('display_order', { ascending: false })
        .limit(1);

      const nextOrder = (maxOrderData?.[0]?.display_order || 0) + 1;

      const { data: subcategory, error } = await supabase
        .from('subcategories')
        .insert({
          name: name.trim(),
          main_category_id: main_category_id,
          display_order: nextOrder
        })
        .select()
        .single();

      if (error) {
        logger.error('Failed to create subcategory', { error }, 'Admin');
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 500 }
        );
      }

      logger.info(`Subcategory created successfully: ${subcategory.name}`, { subcategoryId: subcategory.id }, 'Admin');

      return NextResponse.json({
        success: true,
        data: subcategory
      });
    }

  } catch (error: any) {
    logger.error('API error', { error }, 'Admin');
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Неизвестная ошибка'
      },
      { status: 500 }
    );
  }
}