import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { convertHtmlToMarkdown } from '@/lib/mdream';
import { logger } from '@/lib/logger';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    logger.info('Генерация Markdown для книги', { bookId: id });

    // Get book data with category name
    const { data: book, error } = await supabase
      .from('books')
      .select(`
        *,
        categories(name)
      `)
      .eq('id', id)
      .single();

    if (error || !book) {
      logger.error('Книга не найдена', { bookId: id, error });
      return NextResponse.json(
        { error: 'Книга не найдена' },
        { status: 404 }
      );
    }

    // Generate HTML structure for the book
    const bookHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${book.title} - ${book.author}</title>
        <meta charset="utf-8">
      </head>
      <body>
        <article>
          <header>
            <h1>${book.title}</h1>
            <p class="author">Автор: <strong>${book.author}</strong></p>
            ${(book as any).categories?.name ? `<p class="category">Категорія: ${(book as any).categories.name}</p>` : ''}
            <p class="price">Ціна: ${book.price_uah} грн</p>
            <p class="availability">${book.available ? 'Доступна для оренди' : 'Тимчасово недоступна'}</p>
          </header>
          
          <main>
            ${book.cover_url ? `<img src="${book.cover_url}" alt="Обкладинка книги ${book.title}" />` : ''}
            
            <section class="description">
              <h2>Опис</h2>
              <div>${book.description || book.short_description || 'Захоплююча дитяча книга для розвитку та навчання.'}</div>
            </section>
            
            ${book.age_range ? `
              <section class="details">
                <h2>Деталі</h2>
                <p><strong>Вікова категорія:</strong> ${book.age_range}</p>
                ${book.pages ? `<p><strong>Кількість сторінок:</strong> ${book.pages}</p>` : ''}
                ${book.isbn ? `<p><strong>ISBN:</strong> ${book.isbn}</p>` : ''}
                ${book.publisher ? `<p><strong>Видавництво:</strong> ${book.publisher}</p>` : ''}
                ${book.publication_year ? `<p><strong>Рік видання:</strong> ${book.publication_year}</p>` : ''}
              </section>
            ` : ''}
            
            ${book.rating ? `
              <section class="rating">
                <h2>Рейтинг</h2>
                <p>⭐ ${book.rating}/5 (${book.rating_count || 0} відгуків)</p>
              </section>
            ` : ''}
            
            <section class="rental">
              <h2>Оренда книги</h2>
              <p>Ви можете орендувати цю книгу через наш сервіс Stefa.Books.</p>
              <p><strong>Переваги оренди:</strong></p>
              <ul>
                <li>Доставка по всій Україні</li>
                <li>Гнучкі терміни оренди</li>
                <li>Професійна консультація</li>
                <li>Якісні дитячі книги</li>
              </ul>
              <p><a href="https://stefa-books.com.ua/books/${book.id}/order">Орендувати книгу</a></p>
            </section>
          </main>
        </article>
      </body>
      </html>
    `;

    try {
      const result = await convertHtmlToMarkdown(bookHtml, {
        minimal: true,
        title: `${book.title} - ${book.author}`,
        origin: `https://stefa-books.com.ua/books/${book.id}`,
        metadata: {
          author: book.author,
          category: (book as any).categories?.name,
          price: book.price_uah,
          available: book.available,
          isbn: book.isbn,
          publisher: book.publisher
        }
      });

      // Return as plain text markdown
      const frontmatter = result.frontmatter && Object.keys(result.frontmatter).length > 0
        ? `---\n${Object.entries(result.frontmatter).map(([key, value]) => `${key}: ${value}`).join('\n')}\n---\n\n`
        : '';

      const markdownContent = frontmatter + result.markdown;

      logger.info('Markdown сгенерирован успешно', {
        bookId: id,
        title: book.title,
        length: markdownContent.length
      });

      return new NextResponse(markdownContent, {
        headers: {
          'Content-Type': 'text/markdown; charset=utf-8',
          'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
          'X-Book-ID': id,
          'X-Book-Title': book.title
        }
      });

    } catch (mdreamError) {
      logger.error('Ошибка конвертации mdream', { bookId: id, error: mdreamError });
      
      // Fallback: simple markdown
      const fallbackMarkdown = `# ${book.title}

**Автор:** ${book.author}  
**Ціна:** ${book.price_uah} грн  
**Статус:** ${book.available ? 'Доступна' : 'Недоступна'}

## Опис

${book.description || book.short_description || 'Детальний опис книги.'}

## Оренда

Орендуйте цю книгу через [Stefa.Books](https://stefa-books.com.ua/books/${book.id}/order).
`;

      logger.info('Возвращен fallback markdown', { bookId: id });

      return new NextResponse(fallbackMarkdown, {
        headers: {
          'Content-Type': 'text/markdown; charset=utf-8',
          'X-Fallback': 'true'
        }
      });
    }

  } catch (error) {
    logger.error('Ошибка генерации markdown для книги', { error });
    
    return NextResponse.json(
      { 
        error: 'Не удалось сгенерировать markdown',
        details: error instanceof Error ? error.message : 'Неизвестная ошибка'
      },
      { status: 500 }
    );
  }
}