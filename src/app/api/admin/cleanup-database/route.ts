import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';

export async function POST() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    logger.info('Starting database cleanup', {}, 'Database');
    
    const results: any = {
      oldCategoriesRemoved: 0,
      duplicatesFound: 0,
      orphanedRecords: 0,
      errors: []
    };

    // 1. Проверяем и удаляем старую таблицу categories (если она не используется)
    logger.info('Checking old categories table', {}, 'Database');
    
    try {
      // Проверяем есть ли books которые ссылаются на старые categories
      const { data: booksWithOldCategories, error: checkError } = await supabase
        .from('books')
        .select('id')
        .not('category_id', 'is', null)
        .limit(1);

      if (checkError && !checkError.message.includes('does not exist')) {
        logger.warn('Cannot check old category references', { error: checkError }, 'Database');
      }

      // Если нет книг со старыми ссылками, удаляем старые категории
      if (!booksWithOldCategories || booksWithOldCategories.length === 0) {
        const { data: oldCategories, error: oldCatError } = await supabase
          .from('categories')
          .select('id');
          
        if (!oldCatError && oldCategories) {
          // Удаляем все записи из старой таблицы categories
          const { error: deleteError } = await supabase
            .from('categories')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000'); // удаляем все записи
            
          if (!deleteError) {
            results.oldCategoriesRemoved = oldCategories.length;
            logger.info('Old categories cleaned up', { count: oldCategories.length }, 'Database');
          } else {
            results.errors.push(`Failed to delete old categories: ${deleteError.message}`);
          }
        }
      }
    } catch (err: any) {
      logger.warn('Old categories table may not exist', { error: err.message }, 'Database');
    }

    // 2. Проверяем дублирующиеся подкатегории (упрощенная проверка)
    logger.info('Checking for duplicate subcategories', {}, 'Database');
    
    const { data: allSubcategories, error: subError } = await supabase
      .from('subcategories')
      .select('id, name, main_category_id');
      
    if (!subError && allSubcategories) {
      const seen = new Map();
      let duplicates = 0;
      
      allSubcategories.forEach(sub => {
        const key = `${sub.name}-${sub.main_category_id}`;
        if (seen.has(key)) {
          duplicates++;
        } else {
          seen.set(key, sub);
        }
      });
      
      results.duplicatesFound = duplicates;
      if (duplicates > 0) {
        logger.warn('Found duplicate subcategories', { count: duplicates }, 'Database');
      }
    }

    // 3. Проверяем orphaned записи в subcategories
    const { data: mainCategoryIds, error: mainError } = await supabase
      .from('main_categories')
      .select('id');
      
    if (!mainError && mainCategoryIds) {
      const validIds = mainCategoryIds.map(cat => cat.id);
      
      const { data: orphanedSubs, error: orphanError } = await supabase
        .from('subcategories')
        .select('id, name')
        .not('main_category_id', 'in', `(${validIds.join(',')})`);
        
      if (!orphanError && orphanedSubs && orphanedSubs.length > 0) {
        results.orphanedRecords = orphanedSubs.length;
        logger.warn('Found orphaned subcategories', { orphaned: orphanedSubs }, 'Database');
      }
    }

    // 4. Очищаем поисковые запросы старше 30 дней
    logger.info('Cleaning old search queries', {}, 'Database');
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { data: oldSearches, error: searchDeleteError } = await supabase
      .from('search_queries')
      .delete()
      .lt('created_at', thirtyDaysAgo.toISOString())
      .select();
      
    if (!searchDeleteError) {
      results.oldSearchesRemoved = oldSearches?.length || 0;
      logger.info('Old search queries cleaned', { count: oldSearches?.length || 0 }, 'Database');
    }

    // 5. Проверяем целостность связей книги -> категории
    logger.info('Checking book-category integrity', {}, 'Database');
    
    const { data: booksWithoutCategories, error: integrityError } = await supabase
      .from('books')
      .select('id, title')
      .or('main_category_id.is.null,subcategory_id.is.null')
      .limit(5);
      
    if (!integrityError && booksWithoutCategories && booksWithoutCategories.length > 0) {
      results.booksWithoutCategories = booksWithoutCategories.length;
      results.sampleBooksWithoutCategories = booksWithoutCategories;
      logger.warn('Found books without categories', { count: booksWithoutCategories.length }, 'Database');
    }

    logger.info('Database cleanup completed', results, 'Database');
    
    return NextResponse.json({
      success: true,
      message: 'Database cleanup completed successfully',
      results
    });
    
  } catch (error: any) {
    logger.error('Database cleanup failed', error, 'Database');
    return NextResponse.json({ 
      success: false, 
      error: 'Database cleanup failed',
      details: error.message 
    }, { status: 500 });
  }
}