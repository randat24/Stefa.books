import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';

export async function POST(): Promise<Response> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    logger.info('Starting category synchronization', {}, 'Database');
    
    // Получаем все книги с их новыми категориями
    const { data: books, error: booksError } = await supabase
      .from('books')
      .select(`
        id, title, category, subcategory,
        main_categories(name),
        subcategories(name)
      `);
      
    if (booksError) {
      logger.error('Failed to fetch books for sync', { error: booksError }, 'Database');
      return NextResponse.json({ error: booksError.message }, { status: 500 });
    }

    logger.info('Processing books for category sync', { count: books?.length }, 'Database');
    
    const updates = [];
    let processedCount = 0;
    
    for (const book of books || []) {
      const mainCategory = (book as any).main_categories?.name || '';
      const subcategory = (book as any).subcategories?.name || '';
      
      // Формируем новое значение для поля category и subcategory
      let newCategory = '';
      let newSubcategory = '';
      
      if (mainCategory && subcategory) {
        // category = основная категория, subcategory = подкатегория
        newCategory = mainCategory;
        newSubcategory = subcategory;
      } else if (mainCategory) {
        // Если есть только основная категория
        newCategory = mainCategory;
        newSubcategory = '';
      } else {
        // Если нет категорий
        newCategory = 'Без категорії';
        newSubcategory = '';
      }
      
      // Добавляем в список обновлений если есть изменения
      if (book.category !== newCategory || book.subcategory !== newSubcategory) {
        updates.push({
          id: book.id,
          category: newCategory,
          subcategory: newSubcategory
        });
        processedCount++;
      }
    }
    
    logger.info('Updating book categories', { updateCount: updates.length }, 'Database');
    
    // Обновляем книги батчами
    const batchSize = 20;
    let updatedCount = 0;
    
    for (let i = 0; i < updates.length; i += batchSize) {
      const batch = updates.slice(i, i + batchSize);
      
      // Обновляем каждую книгу индивидуально для точности
      for (const update of batch) {
        const { error: updateError } = await supabase
          .from('books')
          .update({
            category: update.category,
            subcategory: update.subcategory
          })
          .eq('id', update.id);
          
        if (updateError) {
          logger.error('Failed to update book category', { 
            error: updateError, 
            bookId: update.id 
          }, 'Database');
        } else {
          updatedCount++;
        }
      }
      
      logger.info('Updated batch', { 
        updated: i + batch.length, 
        total: updates.length 
      }, 'Database');
    }
    
    // Проверяем результаты синхронизации
    const { data: updatedBooks } = await supabase
      .from('books')
      .select(`
        category, subcategory,
        main_categories(name),
        subcategories(name)
      `)
      .limit(5);
      
    logger.info('Category synchronization completed', { 
      totalBooks: books?.length,
      needingUpdate: processedCount,
      actuallyUpdated: updatedCount,
      samples: updatedBooks?.map(book => ({
        old: book.category,
        new: `${(book as any).main_categories?.name} -> ${(book as any).subcategories?.name}`
      }))
    }, 'Database');
    
    return NextResponse.json({
      success: true,
      message: 'Category synchronization completed',
      results: {
        totalBooks: books?.length || 0,
        needingUpdate: processedCount,
        actuallyUpdated: updatedCount,
        samples: updatedBooks?.slice(0, 3).map(book => ({
          category: book.category,
          subcategory: book.subcategory,
          mainCategory: (book as any).main_categories?.name,
          subcategoryNew: (book as any).subcategories?.name
        }))
      }
    });
    
  } catch (error: any) {
    logger.error('Category synchronization failed', { error }, 'Database');
    return NextResponse.json({ 
      success: false, 
      error: 'Category synchronization failed',
      details: error.message 
    }, { status: 500 });
  }
}