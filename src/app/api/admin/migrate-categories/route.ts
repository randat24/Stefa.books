import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';

export async function POST() {
  try {
    // Проверяем что это admin запрос (в продакшене нужно добавить авторизацию)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    logger.info('Starting category migration', {}, 'Migration');
    
    // 1. Создаем основные категории
    const mainCategories = [
      { name: 'За віком', display_order: 1 },
      { name: 'За жанром', display_order: 2 },
      { name: 'Для дорослих', display_order: 3 }
    ];
    
    const { data: createdMainCategories, error: mainError } = await supabase
      .from('main_categories')
      .upsert(mainCategories, { onConflict: 'name' })
      .select();
      
    if (mainError) {
      logger.error('Error creating main categories', { error: mainError }, 'Migration');
      return NextResponse.json({ error: mainError.message }, { status: 500 });
    }
    
    logger.info('Main categories created', { count: createdMainCategories?.length }, 'Migration');
    
    // Получаем ID категорий
    const ageCategory = createdMainCategories.find(c => c.name === 'За віком');
    const genreCategory = createdMainCategories.find(c => c.name === 'За жанром');  
    const adultCategory = createdMainCategories.find(c => c.name === 'Для дорослих');
    
    // 2. Создаем подкатегории
    const subcategories = [
      // За віком
      { name: 'Найменші', main_category_id: ageCategory?.id, display_order: 1 },
      { name: 'Дошкільний вік', main_category_id: ageCategory?.id, display_order: 2 },
      { name: 'Молодший вік', main_category_id: ageCategory?.id, display_order: 3 },
      { name: 'Середній вік', main_category_id: ageCategory?.id, display_order: 4 },
      { name: 'Підлітковий вік', main_category_id: ageCategory?.id, display_order: 5 },
      
      // За жанром
      { name: 'Казки', main_category_id: genreCategory?.id, display_order: 1 },
      { name: 'Пізнавальні', main_category_id: genreCategory?.id, display_order: 2 },
      { name: 'Детектив', main_category_id: genreCategory?.id, display_order: 3 },
      { name: 'Пригоди', main_category_id: genreCategory?.id, display_order: 4 },
      { name: 'Повість', main_category_id: genreCategory?.id, display_order: 5 },
      { name: 'Фентезі', main_category_id: genreCategory?.id, display_order: 6 },
      { name: 'Реалістична проза', main_category_id: genreCategory?.id, display_order: 7 },
      { name: 'Романтика', main_category_id: genreCategory?.id, display_order: 8 },
      
      // Для дорослих
      { name: 'Психологія і саморозвиток', main_category_id: adultCategory?.id, display_order: 1 },
      { name: 'Сучасна проза', main_category_id: adultCategory?.id, display_order: 2 }
    ];
    
    const { data: createdSubcategories, error: subError } = await supabase
      .from('subcategories')
      .upsert(subcategories, { onConflict: 'main_category_id,name' })
      .select();
      
    if (subError) {
      logger.error('Error creating subcategories', { error: subError }, 'Migration');
      return NextResponse.json({ error: subError.message }, { status: 500 });
    }
    
    logger.info('Subcategories created', { count: createdSubcategories?.length }, 'Migration');
    
    // 3. Мигрируем книги
    const { data: books, error: booksError } = await supabase
      .from('books')
      .select('id, category, title');
      
    if (booksError) {
      logger.error('Error fetching books', { error: booksError }, 'Migration');
      return NextResponse.json({ error: booksError.message }, { status: 500 });
    }
    
    logger.info('Starting book migration', { totalBooks: books?.length }, 'Migration');
    
    const updates = [];
    
    for (const book of books || []) {
      const category = book.category_id?.toLowerCase() || '';
      let subcategory = null;
      
      // Логика определения подкатегории
      if (category.includes('найменші')) {
        subcategory = createdSubcategories?.find(s => s.name === 'Найменші');
      } else if (category.includes('дошкільний')) {
        subcategory = createdSubcategories?.find(s => s.name === 'Дошкільний вік');
      } else if (category.includes('молодший')) {
        subcategory = createdSubcategories?.find(s => s.name === 'Молодший вік');
      } else if (category.includes('середній')) {
        subcategory = createdSubcategories?.find(s => s.name === 'Середній вік');
      } else if (category.includes('підлітковий')) {
        subcategory = createdSubcategories?.find(s => s.name === 'Підлітковий вік');
      } else if (category.includes('казк')) {
        subcategory = createdSubcategories?.find(s => s.name === 'Казки');
      } else if (category.includes('пізнавальн')) {
        subcategory = createdSubcategories?.find(s => s.name === 'Пізнавальні');
      } else if (category.includes('детектив')) {
        subcategory = createdSubcategories?.find(s => s.name === 'Детектив');
      } else if (category.includes('пригод')) {
        subcategory = createdSubcategories?.find(s => s.name === 'Пригоди');
      } else if (category.includes('повіст')) {
        subcategory = createdSubcategories?.find(s => s.name === 'Повість');
      } else if (category.includes('фентез')) {
        subcategory = createdSubcategories?.find(s => s.name === 'Фентезі');
      } else if (category.includes('реалістичн')) {
        subcategory = createdSubcategories?.find(s => s.name === 'Реалістична проза');
      } else if (category.includes('романтик')) {
        subcategory = createdSubcategories?.find(s => s.name === 'Романтика');
      } else if (category.includes('психологі') || category.includes('саморозвит')) {
        subcategory = createdSubcategories?.find(s => s.name === 'Психологія і саморозвиток');
      } else if (category.includes('сучасн')) {
        subcategory = createdSubcategories?.find(s => s.name === 'Сучасна проза');
      } else {
        // По умолчанию - Пізнавальні (За жанром)
        subcategory = createdSubcategories?.find(s => s.name === 'Пізнавальні');
      }
      
      if (subcategory) {
        updates.push({
          id: book.id,
          main_category_id: subcategory.main_category_id,
          subcategory_id: subcategory.id
        });
      }
    }
    
    logger.info('Updating books with new categories', { updateCount: updates.length }, 'Migration');
    
    // Обновляем книги батчами
    const batchSize = 50;
    let updatedCount = 0;
    
    for (let i = 0; i < updates.length; i += batchSize) {
      const batch = updates.slice(i, i + batchSize);
      
      // Обновляем по одной книге, чтобы избежать проблем с NOT NULL полями
      for (const update of batch) {
        const { error: updateError } = await supabase
          .from('books')
          .update({
            main_category_id: update.main_category_id,
            subcategory_id: update.subcategory_id
          })
          .eq('id', update.id);
          
        if (updateError) {
          logger.error('Error updating book', { error: updateError, bookId: update.id }, 'Migration');
          return NextResponse.json({ error: updateError.message }, { status: 500 });
        }
      }
      
      updatedCount += batch.length;
      logger.info('Updated books batch', { updated: updatedCount, total: updates.length }, 'Migration');
    }
    
    // 4. Проверяем результаты
    const { data: stats } = await supabase
      .from('main_categories')
      .select(`
        name,
        subcategories!inner (
          name,
          books!inner (count)
        )
      `);
    
    logger.info('Migration completed successfully', { 
      mainCategories: createdMainCategories?.length,
      subcategories: createdSubcategories?.length,
      booksUpdated: updatedCount
    }, 'Migration');
    
    return NextResponse.json({
      success: true,
      message: 'Migration completed successfully',
      results: {
        mainCategories: createdMainCategories?.length || 0,
        subcategories: createdSubcategories?.length || 0,
        booksUpdated: updatedCount,
        statistics: stats || []
      }
    });
    
  } catch (error) {
    logger.error('Migration failed', { error }, 'Migration');
    return NextResponse.json({ error: 'Migration failed' }, { status: 500 });
  }
}