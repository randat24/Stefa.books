import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';

export async function POST(): Promise<Response> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    logger.info('Starting database normalization', {}, 'Database');
    
    const results: any = {
      authorsCreated: 0,
      booksUpdated: 0,
      errors: []
    };

    // 1. Проверяем существует ли уже таблица authors
    logger.info('Checking if authors table exists', {}, 'Database');
    
    try {
      const { error: checkError } = await supabase
        .from('authors')
        .select('id')
        .limit(1);
        
      if (checkError && !checkError.message.includes('relation "public.authors" does not exist')) {
        logger.error('Error checking authors table', { error: checkError }, 'Database');
        results.errors.push(`Error checking authors table: ${checkError.message}`);
      } else if (checkError && checkError.message.includes('does not exist')) {
        logger.info('Authors table does not exist, manual creation needed', {}, 'Database');
        results.errors.push('Authors table needs to be created manually via SQL. Please run scripts/normalize-database.sql');
      } else {
        logger.info('Authors table already exists', {}, 'Database');
      }
    } catch (err: any) {
      logger.warn('Could not check authors table', { error: err.message }, 'Database');
    }

    // 3. Получаем всех уникальных авторов из books
    logger.info('Extracting unique authors', {}, 'Database');
    
    const { data: books, error: booksError } = await supabase
      .from('books')
      .select('author')
      .not('author', 'is', null);
      
    if (booksError) {
      logger.error('Failed to fetch books for authors', { error: booksError }, 'Database');
      return NextResponse.json({ error: booksError.message }, { status: 500 });
    }

    // Извлекаем уникальных авторов
    const uniqueAuthors = [...new Set(books.map(book => book.author))].filter(Boolean);
    logger.info('Found unique authors', { count: uniqueAuthors.length }, 'Database');

    // 4. Вставляем авторов в таблицу authors
    const authorsToInsert = uniqueAuthors.map(authorName => ({
      name: authorName,
      biography: null,
      birth_year: null,
      nationality: null
    }));

    if (authorsToInsert.length > 0) {
      const { data: insertedAuthors, error: insertError } = await supabase
        .from('authors')
        .upsert(authorsToInsert, { onConflict: 'name' })
        .select();
        
      if (insertError) {
        logger.error('Failed to insert authors', { error: insertError }, 'Database');
        results.errors.push(`Failed to insert authors: ${insertError.message}`);
      } else {
        results.authorsCreated = insertedAuthors?.length || 0;
        logger.info('Authors inserted successfully', { count: results.authorsCreated }, 'Database');
      }
    }

    // 5. Обновляем books с author_id
    logger.info('Updating books with author_id', {}, 'Database');
    
    const { data: allAuthors, error: authorsError } = await supabase
      .from('authors')
      .select('id, name');
      
    if (authorsError) {
      logger.error('Failed to fetch authors for updating books', { error: authorsError }, 'Database');
      results.errors.push(`Failed to fetch authors: ${authorsError.message}`);
    }

    // Создаем мапинг author_name -> author_id
    const authorMap = new Map();
    allAuthors?.forEach(author => {
      authorMap.set(author.name, author.id);
    });

    // Получаем все книги для обновления
    const { data: allBooks, error: allBooksError } = await supabase
      .from('books')
      .select('id, author');
      
    if (allBooksError) {
      logger.error('Failed to fetch all books', { error: allBooksError }, 'Database');
      results.errors.push(`Failed to fetch books: ${allBooksError.message}`);
    }

    // Обновляем книги батчами
    const batchSize = 20;
    let updatedCount = 0;
    
    if (allBooks) {
      for (let i = 0; i < allBooks.length; i += batchSize) {
        const batch = allBooks.slice(i, i + batchSize);
        
        for (const book of batch) {
          if (book.author && authorMap.has(book.author)) {
            const authorId = authorMap.get(book.author);
            
            const { error: updateError } = await supabase
              .from('books')
              .update({ author_id: authorId })
              .eq('id', book.id);
              
            if (updateError) {
              logger.error('Failed to update book author_id', { 
                error: updateError, 
                bookId: book.id 
              }, 'Database');
            } else {
              updatedCount++;
            }
          }
        }
        
        logger.info('Updated books batch', { 
          updated: i + batch.length, 
          total: allBooks.length 
        }, 'Database');
      }
    }
    
    results.booksUpdated = updatedCount;

    // 6. Создаем индексы (skip for now - need to be done manually in SQL Editor)
    logger.info('Skipping index creation - needs manual SQL execution', {}, 'Database');
    
    // 7. Создаем RLS политики (skip for now - need to be done manually in SQL Editor)
    logger.info('Skipping RLS setup - needs manual SQL execution', {}, 'Database');

    logger.info('Database normalization completed', results, 'Database');
    
    return NextResponse.json({
      success: true,
      message: 'Database normalization completed successfully',
      results
    });
    
  } catch (error: any) {
    logger.error('Database normalization failed', { error }, 'Database');
    return NextResponse.json({ 
      success: false, 
      error: 'Database normalization failed',
      details: error.message 
    }, { status: 500 });
  }
}