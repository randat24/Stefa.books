import { NextRequest, NextResponse } from 'next/server';
import { generateLlmsTxt } from '@/lib/mdream';
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    logger.info('Генерация llms.txt файла для AI дискавери');

    const baseUrl = request.headers.get('host') || 'localhost:3000';
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const siteUrl = `${protocol}://${baseUrl}`;

    // Collect pages for llms.txt
    const pages: Array<{ url: string; title: string; description?: string; markdown?: string }> = [];

    // Main site pages
    pages.push({
      url: siteUrl,
      title: 'Stefa.Books - Головна сторінка',
      description: 'Українська дитяча бібліотека з підпискою та орендою книг для дітей'
    });

    pages.push({
      url: `${siteUrl}/books`,
      title: 'Каталог дитячих книг',
      description: 'Повний каталог дитячих книг українською мовою з можливістю оренди та підписки'
    });

    pages.push({
      url: `${siteUrl}/subscribe`,
      title: 'Підписка на дитячі книги',
      description: 'Оформіть підписку на дитячі книги з доставкою додому'
    });

    pages.push({
      url: `${siteUrl}/rent`,
      title: 'Оренда дитячих книг',
      description: 'Орендуйте дитячі книги на зручний термін'
    });

    // Add categories
    try {
      const { data: categories } = await supabase
        .from('categories')
        .select('*')
        .limit(10);
        
      if (categories) {
        for (const category of categories) {
          pages.push({
            url: `${siteUrl}/catalog/${encodeURIComponent(category.name)}`,
            title: `Категорія: ${category.name}`,
            description: `Дитячі книги в категорії "${category.name}"`
          });
        }
      }
    } catch (error) {
      logger.warn('Не удалось загрузить категории для llms.txt', error);
    }

    // Add popular books
    try {
      const { data: books } = await supabase
        .from('books')
        .select('*')
        .eq('available', true)
        .limit(20);
        
      if (books) {
        for (const book of books) {
          const bookDescription = [
            `Автор: ${book.author}`,
            book.short_description || book.description,
            `Ціна: ${book.price_uah} грн`,
            book.available ? 'Доступна для оренди' : 'Тимчасово недоступна'
          ].filter(Boolean).join('. ');

          pages.push({
            url: `${siteUrl}/books/${book.id}`,
            title: `${book.title} - ${book.author}`,
            description: bookDescription
          });
        }
      }
    } catch (error) {
      logger.warn('Не удалось загрузить книги для llms.txt', error);
    }

    // Generate llms.txt content
    const llmsTxt = await generateLlmsTxt(pages);

    logger.info('llms.txt сгенерирован успешно', {
      pages: pages.length,
      contentLength: llmsTxt.length
    });

    return new NextResponse(llmsTxt, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
        'X-Total-Pages': pages.length.toString()
      }
    });

  } catch (error) {
    logger.error('Ошибка генерации llms.txt', error);
    
    return NextResponse.json(
      { 
        error: 'Не удалось сгенерировать llms.txt',
        details: error instanceof Error ? error.message : 'Неизвестная ошибка'
      },
      { status: 500 }
    );
  }
}

// Allow customization of llms.txt via POST
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pages, title, description } = body;

    if (!pages || !Array.isArray(pages)) {
      return NextResponse.json(
        { error: 'Массив страниц (pages) обязателен' },
        { status: 400 }
      );
    }

    logger.info('Генерация кастомного llms.txt', {
      pagesCount: pages.length
    });

    let llmsTxt = '';

    if (title) {
      llmsTxt += `# ${title}\n\n`;
    }

    if (description) {
      llmsTxt += `${description}\n\n`;
    }

    const generatedContent = await generateLlmsTxt(pages);
    
    // Remove the default header if we provided custom ones
    const contentWithoutHeader = generatedContent.replace(/^# Stefa\.Books[^\n]*\n\n[^\n]*\n\n/, '');
    llmsTxt += contentWithoutHeader;

    return new NextResponse(llmsTxt, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Total-Pages': pages.length.toString()
      }
    });

  } catch (error) {
    logger.error('Ошибка генерации кастомного llms.txt', error);
    
    return NextResponse.json(
      { 
        error: 'Не удалось сгенерировать кастомный llms.txt',
        details: error instanceof Error ? error.message : 'Неизвестная ошибка'
      },
      { status: 500 }
    );
  }
}