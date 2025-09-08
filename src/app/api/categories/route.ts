import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const includeStats = searchParams.get('stats') === 'true';
    
    // Создаем Supabase клиент
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    
    if (!supabaseUrl || !supabaseKey) {
      logger.warn('Missing Supabase environment variables, returning mock categories');
      
      // Fallback: возвращаем моковые категории
      const mockCategories = [
        {
          id: '1',
          name: 'Казки',
          display_order: 1,
          parent_id: null,
          description: 'Чарівні історії для дітей',
          icon: 'crown',
          color: 'yellow',
          subcategories: [
            {
              id: '1-1',
              name: 'Дитячі казки',
              display_order: 1,
              description: 'Казки для найменших',
              icon: 'baby',
              color: 'pink'
            },
            {
              id: '1-2',
              name: 'Казки про тварин',
              display_order: 2,
              description: 'Казки з тваринами',
              icon: 'heart',
              color: 'green'
            }
          ]
        },
        {
          id: '2',
          name: 'Психологія і саморозвиток',
          display_order: 2,
          parent_id: null,
          description: 'Розвиток особистості та самопізнання',
          icon: 'brain',
          color: 'purple',
          subcategories: [
            {
              id: '2-1',
              name: 'Дитяча психологія',
              display_order: 1,
              description: 'Психологія для дітей',
              icon: 'users',
              color: 'blue'
            }
          ]
        },
        {
          id: '3',
          name: 'Найменші',
          display_order: 3,
          parent_id: null,
          description: 'Книги для найменших читачів',
          icon: 'baby',
          color: 'pink',
          subcategories: []
        },
        {
          id: '4',
          name: 'Дошкільний вік',
          display_order: 4,
          parent_id: null,
          description: 'Книги для дошкільнят',
          icon: 'graduation-cap',
          color: 'orange',
          subcategories: []
        },
        {
          id: '5',
          name: 'Пригоди',
          display_order: 5,
          parent_id: null,
          description: 'Захоплюючі пригодницькі історії',
          icon: 'compass',
          color: 'amber',
          subcategories: []
        },
        {
          id: '6',
          name: 'Фентезі',
          display_order: 6,
          parent_id: null,
          description: 'Подорожі у неймовірні світи',
          icon: 'sparkles',
          color: 'fuchsia',
          subcategories: []
        }
      ];

      return NextResponse.json({
        success: true,
        data: mockCategories,
        count: mockCategories.length,
        type: 'structured'
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    if (includeStats) {
      // Получаем категории
      const { data: categories, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true });

      if (categoriesError) {
        logger.error('Database error when fetching categories', { error: categoriesError });
        return NextResponse.json(
          { error: 'Ошибка при получении категорий' },
          { status: 500 }
        );
      }

      // Получаем статистику книг по категориям
      const { data: booksStats, error: booksError } = await supabase
        .from('books')
        .select('category_id, category_name, available');

      if (booksError) {
        logger.error('Database error when fetching books stats', { error: booksError });
        return NextResponse.json(
          { error: 'Ошибка при получении статистики книг' },
          { status: 500 }
        );
      }

      // Формируем статистику по названиям категорий
      const statsMap = new Map();
      const availableStatsMap = new Map();
      
      booksStats?.forEach(book => {
        const categoryName = book.category_name || 'Без категорії';
        
        // Общее количество книг
        statsMap.set(categoryName, (statsMap.get(categoryName) || 0) + 1);
        
        // Доступные книги
        if (book.available) {
          availableStatsMap.set(categoryName, (availableStatsMap.get(categoryName) || 0) + 1);
        }
      });

      // Обогащаем данные статистикой
      const categoriesWithStats = categories?.map(category => ({
        ...category,
        total_books: statsMap.get(category.name) || 0,
        available_books: availableStatsMap.get(category.name) || 0
      })) || [];

      return NextResponse.json({
        categories: categoriesWithStats
      });

    } else {
      // Получаем структурированную систему категорий из таблицы categories
      const { data: categories, error } = await supabase
        .from('categories')
        .select(`
          id,
          name,
          display_order,
          parent_id,
          description,
          icon,
          color
        `)
        .order('display_order');

      if (error) {
        logger.error('Database error when fetching categories', { error });
        return NextResponse.json(
          { success: false, error: 'Помилка отримання категорій з бази даних' },
          { status: 500 }
        );
      }

      // Структурируем категории в иерархию
      const mainCategories = categories?.filter(cat => !cat.parent_id) || [];
      const subcategories = categories?.filter(cat => cat.parent_id) || [];

      // Добавляем подкатегории к основным категориям
      const structuredCategories = mainCategories.map(mainCat => ({
        ...mainCat,
        subcategories: subcategories
          .filter(sub => sub.parent_id === mainCat.id)
          .map(sub => ({
            id: sub.id,
            name: sub.name,
            display_order: sub.display_order,
            description: sub.description,
            icon: sub.icon,
            color: sub.color
          }))
          .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
      }));

      logger.info('Structured categories fetched successfully', { 
        mainCategories: structuredCategories.length,
        totalSubcategories: structuredCategories.reduce((acc, cat) => acc + (cat.subcategories?.length || 0), 0)
      }, 'API');

      return NextResponse.json({
        success: true,
        data: structuredCategories,
        count: structuredCategories.length,
        type: 'structured'
      });
    }

  } catch (error) {
    logger.error('Unexpected error in categories API', { error });
    return NextResponse.json(
      { error: 'Внутрішня помилка сервера' },
      { status: 500 }
    );
  }
}

// Получение подкатегорий для родительской категории
export async function POST(request: NextRequest): Promise<Response> {
  try {
    const { parentId } = await request.json();
    
    if (!parentId) {
      return NextResponse.json(
        { error: 'ID родительской категории обязателен' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: subcategories, error } = await supabase
      .from('categories')
      .select('*')
      .eq('parent_id', parentId)
      .order('display_order', { ascending: true });

    if (error) {
      logger.error('Database error when fetching subcategories', { error, parentId });
      return NextResponse.json(
        { error: 'Ошибка при получении подкатегорий' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      subcategories: subcategories || []
    });

  } catch (error) {
    logger.error('Unexpected error in subcategories API', { error });
    return NextResponse.json(
      { error: 'Внутрішня помилка сервера' },
      { status: 500 }
    );
  }
}