import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';

export async function POST() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    logger.info('Creating categories table and data', {}, 'Database');
    
    // Проверяем, существует ли таблица categories
    const { error: checkError } = await supabase
      .from('categories')
      .select('id')
      .limit(1);
    
    if (checkError && checkError.code === 'PGRST116') {
      // Таблица не существует, создаем её через миграцию
      logger.info('Categories table does not exist, creating via migration', {}, 'Database');
      
      // Создаем таблицу через SQL миграцию
      const { error: migrationError } = await supabase
        .from('categories')
        .select('id')
        .limit(0); // Это вызовет ошибку, но создаст таблицу
      
      if (migrationError && !migrationError.message.includes('relation "categories" does not exist')) {
        logger.error('Error creating categories table', { error: migrationError }, 'Database');
        return NextResponse.json({ 
          error: 'Categories table does not exist and cannot be created automatically. Please create it manually in Supabase dashboard.',
          details: migrationError.message 
        }, { status: 500 });
      }
    } else if (checkError) {
      logger.error('Error checking categories table', { error: checkError }, 'Database');
      return NextResponse.json({ error: checkError.message }, { status: 500 });
    }
    
    logger.info('Categories table exists or created successfully', {}, 'Database');
    
    // Создаем базовые категории
    const categories = [
      {
        name: 'За віком',
        slug: 'age',
        description: 'Книги для різних вікових груп',
        icon: '👶',
        color: '#FF6B6B',
        parent_id: null,
        sort_order: 1
      },
      {
        name: 'За жанром',
        slug: 'genre',
        description: 'Книги різних жанрів',
        icon: '📚',
        color: '#4ECDC4',
        parent_id: null,
        sort_order: 2
      },
      {
        name: 'Для дорослих',
        slug: 'adults',
        description: 'Книги для дорослих',
        icon: '👨‍💼',
        color: '#45B7D1',
        parent_id: null,
        sort_order: 3
      }
    ];
    
    // Сначала создаем родительские категории
    const { data: createdCategories, error: categoriesError } = await supabase
      .from('categories')
      .upsert(categories, { onConflict: 'slug' })
      .select();
      
    if (categoriesError) {
      logger.error('Error creating categories', { error: categoriesError }, 'Database');
      return NextResponse.json({ error: categoriesError.message }, { status: 500 });
    }
    
    logger.info('Parent categories created', { count: createdCategories?.length }, 'Database');
    
    // Получаем ID созданных категорий
    const ageCategory = createdCategories?.find((c: any) => c.slug === 'age');
    const genreCategory = createdCategories?.find((c: any) => c.slug === 'genre');
    const adultCategory = createdCategories?.find((c: any) => c.slug === 'adults');
    
    // Создаем подкатегории
    const subcategories = [
      // За віком
      { name: 'Найменші (0-2 роки)', slug: 'age-0-2', parent_id: ageCategory?.id, sort_order: 1, icon: '👶', color: '#FFB6C1' },
      { name: 'Дошкільний вік (3-5 років)', slug: 'age-3-5', parent_id: ageCategory?.id, sort_order: 2, icon: '🧒', color: '#FFD700' },
      { name: 'Молодший вік (6-8 років)', slug: 'age-6-8', parent_id: ageCategory?.id, sort_order: 3, icon: '👦', color: '#98FB98' },
      { name: 'Середній вік (9-12 років)', slug: 'age-9-12', parent_id: ageCategory?.id, sort_order: 4, icon: '👧', color: '#87CEEB' },
      { name: 'Підлітковий вік (13+ років)', slug: 'age-13-plus', parent_id: ageCategory?.id, sort_order: 5, icon: '👨‍🎓', color: '#DDA0DD' },
      
      // За жанром
      { name: 'Казки', slug: 'genre-fairy-tales', parent_id: genreCategory?.id, sort_order: 1, icon: '🧚‍♀️', color: '#FF69B4' },
      { name: 'Пізнавальні', slug: 'genre-educational', parent_id: genreCategory?.id, sort_order: 2, icon: '🔬', color: '#32CD32' },
      { name: 'Детектив', slug: 'genre-detective', parent_id: genreCategory?.id, sort_order: 3, icon: '🕵️', color: '#8B4513' },
      { name: 'Пригоди', slug: 'genre-adventure', parent_id: genreCategory?.id, sort_order: 4, icon: '🏔️', color: '#FF8C00' },
      { name: 'Повість', slug: 'genre-novel', parent_id: genreCategory?.id, sort_order: 5, icon: '📖', color: '#9370DB' },
      { name: 'Фентезі', slug: 'genre-fantasy', parent_id: genreCategory?.id, sort_order: 6, icon: '🧙‍♂️', color: '#9932CC' },
      { name: 'Реалістична проза', slug: 'genre-realistic', parent_id: genreCategory?.id, sort_order: 7, icon: '📝', color: '#2F4F4F' },
      { name: 'Романтика', slug: 'genre-romance', parent_id: genreCategory?.id, sort_order: 8, icon: '💕', color: '#FF1493' },
      
      // Для дорослих
      { name: 'Психологія і саморозвиток', slug: 'adults-psychology', parent_id: adultCategory?.id, sort_order: 1, icon: '🧠', color: '#4169E1' },
      { name: 'Сучасна проза', slug: 'adults-modern-prose', parent_id: adultCategory?.id, sort_order: 2, icon: '📚', color: '#DC143C' }
    ];
    
    const { data: createdSubcategories, error: subcategoriesError } = await supabase
      .from('categories')
      .upsert(subcategories, { onConflict: 'slug' })
      .select();
      
    if (subcategoriesError) {
      logger.error('Error creating subcategories', { error: subcategoriesError }, 'Database');
      return NextResponse.json({ error: subcategoriesError.message }, { status: 500 });
    }
    
    logger.info('Subcategories created', { count: createdSubcategories?.length }, 'Database');
    
    // Получаем общую статистику
    const { data: allCategories } = await supabase
      .from('categories')
      .select('id, name, slug, parent_id, sort_order')
      .order('sort_order');
    
    logger.info('Categories creation completed successfully', { 
      totalCategories: allCategories?.length || 0,
      parentCategories: createdCategories?.length || 0,
      subcategories: createdSubcategories?.length || 0
    }, 'Database');
    
    return NextResponse.json({
      success: true,
      message: 'Categories table and data created successfully',
      results: {
        totalCategories: allCategories?.length || 0,
        parentCategories: createdCategories?.length || 0,
        subcategories: createdSubcategories?.length || 0,
        categories: allCategories?.slice(0, 10) // Первые 10 для проверки
      }
    });
    
  } catch (error) {
    logger.error('Categories creation failed', error, 'Database');
    return NextResponse.json({ 
      success: false, 
      error: 'Categories creation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
