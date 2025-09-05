import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Параметры запроса
    const query = searchParams.get('q') || searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const author = searchParams.get('author') || '';
    const available = searchParams.get('available') === 'true';
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const sortBy = searchParams.get('sort') || 'title';
    const sortOrder = searchParams.get('order') || 'asc';
    
    // Новые параметры для структурированных категорий (временно отключены)
    // TODO: Восстановить когда будет настроена структура категорий

    // Создаем Supabase клиент
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    
    if (!supabaseUrl || !supabaseKey) {
      logger.warn('Missing Supabase environment variables, returning mock data');
      
      // Fallback: возвращаем моковые данные
      const mockBooks = [
        {
          id: '1',
          code: 'MOCK001',
          title: 'Казка про принцесу',
          author: 'Анна Іванова',
          category_id: 'fairy-tales',
          category_name: 'Казки',
          subcategory: 'Дитячі казки',
          pages: 32,
          status: 'available',
          available: true,
          rating: 4.5,
          rating_count: 12,
          badges: ['Популярна', 'Новинка'],
          description: 'Чарівна казка про принцесу, яка навчилася бути доброю та мудрою.',
          short_description: 'Казка про принцесу',
          age_range: '3-6',
          cover_url: '/images/book-placeholder.svg',
          language: 'uk',
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-15T10:00:00Z'
        },
        {
          id: '2',
          code: 'MOCK002',
          title: 'Пригоди маленького мисливця',
          author: 'Петро Петренко',
          category_id: 'adventures',
          category_name: 'Пригоди',
          subcategory: 'Дитячі пригоди',
          pages: 48,
          status: 'available',
          available: true,
          rating: 4.2,
          rating_count: 8,
          badges: ['Пригоди'],
          description: 'Захоплююча історія про маленького хлопчика, який вирушив у подорож.',
          short_description: 'Пригоди маленького мисливця',
          age_range: '6-9',
          cover_url: '/images/book-placeholder.svg',
          language: 'uk',
          created_at: '2024-01-16T10:00:00Z',
          updated_at: '2024-01-16T10:00:00Z'
        },
        {
          id: '3',
          code: 'MOCK003',
          title: 'Математика для дошкільнят',
          author: 'Олена Коваленко',
          category_id: 'educational',
          category_name: 'Пізнавальні',
          subcategory: 'Математика',
          pages: 64,
          status: 'available',
          available: true,
          rating: 4.8,
          rating_count: 15,
          badges: ['Освіта', 'Розвиток'],
          description: 'Цікаві завдання з математики для дітей дошкільного віку.',
          short_description: 'Математика для дошкільнят',
          age_range: '4-6',
          cover_url: '/images/book-placeholder.svg',
          language: 'uk',
          created_at: '2024-01-17T10:00:00Z',
          updated_at: '2024-01-17T10:00:00Z'
        },
        {
          id: '4',
          code: 'MOCK004',
          title: 'Фентезійний світ',
          author: 'Михайло Соколов',
          category_id: 'fantasy',
          category_name: 'Фентезі',
          subcategory: 'Дитяче фентезі',
          pages: 120,
          status: 'available',
          available: true,
          rating: 4.6,
          rating_count: 22,
          badges: ['Фентезі', 'Магія'],
          description: 'Подорож у неймовірний світ магії та чарівництва.',
          short_description: 'Фентезійний світ',
          age_range: '8-12',
          cover_url: '/images/book-placeholder.svg',
          language: 'uk',
          created_at: '2024-01-18T10:00:00Z',
          updated_at: '2024-01-18T10:00:00Z'
        },
        {
          id: '5',
          code: 'MOCK005',
          title: 'Психологія для дітей',
          author: 'Ірина Мельник',
          category_id: 'psychology',
          category_name: 'Психологія і саморозвиток',
          subcategory: 'Дитяча психологія',
          pages: 80,
          status: 'available',
          available: true,
          rating: 4.4,
          rating_count: 18,
          badges: ['Психологія', 'Розвиток'],
          description: 'Книга допоможе дітям зрозуміти свої емоції та навчитися ними керувати.',
          short_description: 'Психологія для дітей',
          age_range: '6-10',
          cover_url: '/images/book-placeholder.svg',
          language: 'uk',
          created_at: '2024-01-19T10:00:00Z',
          updated_at: '2024-01-19T10:00:00Z'
        }
      ];

      // Применяем фильтры к моковым данным
      let filteredBooks = mockBooks;

      if (query) {
        const searchQuery = query.toLowerCase();
        filteredBooks = filteredBooks.filter(book => 
          book.title.toLowerCase().includes(searchQuery) ||
          book.author.toLowerCase().includes(searchQuery) ||
          book.category_id.toLowerCase().includes(searchQuery) ||
          book.description.toLowerCase().includes(searchQuery)
        );
      }

      if (category) {
        filteredBooks = filteredBooks.filter(book => 
          book.category_id.toLowerCase().includes(category.toLowerCase())
        );
      }

      if (author) {
        filteredBooks = filteredBooks.filter(book => 
          book.author.toLowerCase().includes(author.toLowerCase())
        );
      }

      if (available) {
        filteredBooks = filteredBooks.filter(book => book.available);
      }

      // Применяем пагинацию
      const paginatedBooks = filteredBooks.slice(offset, offset + limit);

      return NextResponse.json({
        success: true,
        data: paginatedBooks,
        books: paginatedBooks,
        pagination: {
          total: filteredBooks.length,
          limit,
          offset,
          hasMore: (offset + limit) < filteredBooks.length
        },
        filters: {
          query,
          category,
          author,
          available
        }
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Базовый запрос - только публичные поля (скрываем админские: qty_total, qty_available, price_uah, full_price_uah, publisher)
    let queryBuilder = supabase
      .from('books')
      .select(`
        id, code, title, author, category, subcategory, pages, status, available,
        rating, rating_count, badges, description, short_description, age_range,
        cover_url, language, created_at, updated_at
      `)
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1);

    // Применяем фильтры
    if (query) {
      // Используем поиск по подстроке в названии, авторе, категории и описании
      queryBuilder = queryBuilder.or(`title.ilike.%${query}%,author.ilike.%${query}%,category.ilike.%${query}%,subcategory.ilike.%${query}%,description.ilike.%${query}%,short_description.ilike.%${query}%`);
    }

    if (category) {
      queryBuilder = queryBuilder.ilike('category', `%${category}%`);
    }

    if (author) {
      queryBuilder = queryBuilder.ilike('author', `%${author}%`);
    }

    if (available) {
      queryBuilder = queryBuilder.eq('available', true);
    }
    
    // Выполняем запрос
    const { data: books, error, count } = await queryBuilder;

    if (error) {
      logger.error('Database error when fetching books', { error });
      return NextResponse.json(
        { error: 'Ошибка при получении книг' },
        { status: 500 }
      );
    }

    // Получаем общее количество для пагинации
    let totalCount = count;
    if (!count) {
      const { count: total } = await supabase
        .from('books')
        .select('*', { count: 'exact', head: true });
      totalCount = total;
    }

    // Логируем поисковый запрос для аналитики
    if (query || category || author) {
      try {
        await supabase
          .from('search_queries')
          .insert({
            query: query || '',
            results_count: books?.length || 0,
            filters: {
              category,
              author,
              available,
              sortBy,
              sortOrder
            }
          });
      } catch (err) {
        logger.warn('Failed to log search query', { error: err });
      }
    }

    return NextResponse.json({
      success: true,
      data: books || [],
      books: books || [],
      pagination: {
        total: totalCount || 0,
        limit,
        offset,
        hasMore: (offset + limit) < (totalCount || 0)
      },
      filters: {
        query,
        category,
        author,
        available
      }
    });

  } catch (error) {
    logger.error('Unexpected error in books API', { error });
    return NextResponse.json(
      { error: 'Внутрішня помилка сервера' },
      { status: 500 }
    );
  }
}

// Получение одной книги по ID
export async function POST(request: NextRequest) {
  try {
    const { id } = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID книги обязателен' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: book, error } = await supabase
      .from('books')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      logger.error('Database error when fetching book', { error, bookId: id });
      return NextResponse.json(
        { error: 'Книга не найдена' },
        { status: 404 }
      );
    }

    return NextResponse.json({ book });

  } catch (error) {
    logger.error('Unexpected error in book detail API', { error });
    return NextResponse.json(
      { error: 'Внутрішня помилка сервера' },
      { status: 500 }
    );
  }
}