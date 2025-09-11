import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';

// ============================================================================
// API ДЛЯ ПОЛУЧЕНИЯ АВТОРОВ
// ============================================================================

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    logger.info('Fetching all authors', {}, 'API');

    const { data: authors, error } = await supabase
      .from('authors')
      .select('id, name, biography, birth_year, nationality')
      .order('name', { ascending: true });

    if (error) {
      logger.error('Failed to fetch authors', error, 'API');
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    logger.info(`Found ${authors.length} authors`, { count: authors.length }, 'API');

    return NextResponse.json({
      success: true,
      data: authors,
      count: authors.length
    });

  } catch (error: any) {
    logger.error('API error', error, 'API');
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Неизвестная ошибка'
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// СОЗДАНИЕ НОВОГО АВТОРА
// ============================================================================

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, biography, birth_year, nationality } = body;

    if (!name?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Имя автора обязательно' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    logger.info(`Creating new author: ${name}`, { name }, 'API');

    const { data: author, error } = await supabase
      .from('authors')
      .insert({
        name: name.trim(),
        biography: biography?.trim() || null,
        birth_year: birth_year || null,
        nationality: nationality?.trim() || null
      })
      .select()
      .single();

    if (error) {
      logger.error('Failed to create author', error, 'API');
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    logger.info(`Author created successfully: ${author.name}`, { authorId: author.id }, 'API');

    return NextResponse.json({
      success: true,
      data: author
    });

  } catch (error: any) {
    logger.error('API error', error, 'API');
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Неизвестная ошибка'
      },
      { status: 500 }
    );
  }
}