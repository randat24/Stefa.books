import { NextRequest, NextResponse } from 'next/server';
import { convertHtmlToMarkdown, convertUrlToMarkdown, parseHtmlContent } from '@/lib/mdream';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { html, url, options = {} } = body;

    // Validate input
    if (!html && !url) {
      return NextResponse.json(
        { error: 'Требуется HTML контент или URL' },
        { status: 400 }
      );
    }

    if (html && url) {
      return NextResponse.json(
        { error: 'Укажите либо HTML контент, либо URL, но не оба одновременно' },
        { status: 400 }
      );
    }

    logger.info('Получен запрос на конвертацию в Markdown', {
      hasHtml: !!html,
      hasUrl: !!url,
      htmlLength: html?.length || 0
    });

    let result;

    if (html) {
      // Convert HTML to Markdown
      result = await convertHtmlToMarkdown(html, options);
    } else {
      // Convert URL to Markdown
      result = await convertUrlToMarkdown(url, options);
    }

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    logger.error('Ошибка конвертации в Markdown', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
    
    return NextResponse.json(
      { 
        error: 'Не удалось конвертировать в Markdown',
        details: errorMessage
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');
    const minimal = searchParams.get('minimal') !== 'false'; // Default to true
    const title = searchParams.get('title') || undefined;

    if (!url) {
      return NextResponse.json(
        { error: 'Параметр URL обязателен' },
        { status: 400 }
      );
    }

    logger.info('GET запрос на конвертацию URL в Markdown', { url, minimal });

    const result = await convertUrlToMarkdown(url, {
      minimal,
      title
    });

    // Return plain markdown if requested
    const format = searchParams.get('format');
    if (format === 'text') {
      const content = result.frontmatter && Object.keys(result.frontmatter).length > 0
        ? `---\n${Object.entries(result.frontmatter).map(([key, value]) => `${key}: ${value}`).join('\n')}\n---\n\n${result.markdown}`
        : result.markdown;

      return new NextResponse(content, {
        headers: {
          'Content-Type': 'text/markdown; charset=utf-8',
          'Content-Disposition': `attachment; filename="${encodeURIComponent(result.title || 'converted')}.md"`
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    logger.error('GET конвертация в Markdown не удалась', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
    
    return NextResponse.json(
      { 
        error: 'Не удалось конвертировать URL в Markdown',
        details: errorMessage
      },
      { status: 500 }
    );
  }
}

// Parse HTML endpoint (no markdown conversion)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { html } = body;

    if (!html) {
      return NextResponse.json(
        { error: 'HTML контент обязателен' },
        { status: 400 }
      );
    }

    logger.info('Парсинг HTML контента', { htmlLength: html.length });

    const result = await parseHtmlContent(html);

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    logger.error('Ошибка парсинга HTML', error);
    
    return NextResponse.json(
      { 
        error: 'Не удалось разобрать HTML контент',
        details: error instanceof Error ? error.message : 'Неизвестная ошибка'
      },
      { status: 500 }
    );
  }
}