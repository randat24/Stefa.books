import type { Book } from '@/lib/supabase'
import { logger } from '@/lib/logger'
import { categoriesCache } from '@/lib/cache';

// ============================================================================
// КЛИЕНТСКАЯ БИБЛИОТЕКА ДЛЯ РАБОТЫ С КНИГАМИ
// ============================================================================

export interface BooksFilter {
  category?: string
  category_id?: string
  age_category?: string
  age_category_id?: string
  search?: string
  limit?: number
  offset?: number
  available_only?: boolean
}

export interface BooksResponse {
  success: boolean
  data: Book[]
  count: number
  pagination?: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
  error?: string
}

export interface BookResponse {
  success: boolean
  data?: Book
  error?: string
}

export interface Category {
  id: string
  name: string
  display_order: number
  subcategories?: Subcategory[]
}

export interface Subcategory {
  id: string
  name: string
  display_order: number
}

export interface CategoriesResponse {
  success: boolean
  data: Category[]
  count: number
  type?: string
  error?: string
}

export interface CategoryStats {
  name: string
  total: number
  available: number
}

export interface CategoriesStatsResponse {
  success: boolean
  data: CategoryStats[]
  count: number
  error?: string
}

// ============================================================================
// ПОЛУЧЕНИЕ СПИСКА КНИГ
// ============================================================================

// Simplified fetchBooks without connection pooling to fix SSR issues
export async function fetchBooks(filters: BooksFilter = {}): Promise<BooksResponse> {
  try {
    const searchParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });

    // Use absolute URL for server-side rendering
    const serverBaseUrl = typeof window === 'undefined' 
      ? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
      : '';
    const baseUrl = `${serverBaseUrl}/api/books`;
    const queryString = searchParams.toString();
    const url = queryString ? `${baseUrl}?${queryString}` : baseUrl;
    

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Add cache control headers
      cache: 'no-store',
      next: {
        revalidate: 0, // No cache for now
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch books: ${res.status} ${res.statusText}`);
    }

    const response = await res.json();
    
    return response;
  } catch (error) {
    console.error('Error fetching books:', error);
    logger.error('Error fetching books', error, 'API');
    return {
      success: false,
      data: [],
      count: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ============================================================================
// ПОЛУЧЕНИЕ ОДНОЙ КНИГИ
// ============================================================================

export async function fetchBook(id: string): Promise<BookResponse> {
  try {
    if (!id) {
      throw new Error('ID книги не указан')
    }

    // Use absolute URL for server-side rendering
    const serverBaseUrl = typeof window === 'undefined' 
      ? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
      : '';
    const url = `${serverBaseUrl}/api/books/${id}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      if (response.status === 404) {
        return {
          success: false,
          error: 'Книга не знайдена'
        }
      }
      return {
        success: false,
        error: `HTTP error! status: ${response.status}`
      }
    }

    const result = await response.json()
    
    if (!result.success) {
      return {
        success: false,
        error: result.error || 'Помилка при отриманні книги'
      }
    }
    
    return result

  } catch (error) {
    logger.error('Error fetching book', error, 'API');
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Невідома помилка'
    }
  }
}

// ============================================================================
// ПОЛУЧЕНИЕ КАТЕГОРИЙ
// ============================================================================

export async function fetchCategories(): Promise<CategoriesResponse> {
  try {
    const cacheKey = 'categories'
    
    // Check cache first
    const cachedData = categoriesCache.get<CategoriesResponse>(cacheKey)
    if (cachedData) {
      logger.debug('Returning cached categories data', undefined, 'API')
      return cachedData
    }

    // Use absolute URL for server-side rendering
    const serverBaseUrl = typeof window === 'undefined' 
      ? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
      : '';
    const url = `${serverBaseUrl}/api/categories`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    
    if (!result.success) {
      throw new Error(result.error || 'Ошибка при получении категорий')
    }
    
    // Cache successful response
    categoriesCache.set(cacheKey, result)
    logger.debug('Cached categories data', { count: result.count }, 'API')
    
    return result

  } catch (error) {
    return {
      success: false,
      data: [],
      count: 0,
      error: error instanceof Error ? error.message : 'Неизвестная ошибка'
    }
  }
}

// ============================================================================
// ПОЛУЧЕНИЕ СТАТИСТИКИ ПО КАТЕГОРИЯМ
// ============================================================================

export async function fetchCategoriesStats(): Promise<CategoriesStatsResponse> {
  try {
    // Use absolute URL for server-side rendering
    const serverBaseUrl = typeof window === 'undefined' 
      ? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
      : '';
    const url = `${serverBaseUrl}/api/books`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ action: 'get_categories_stats' })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    
    if (!result.success) {
      throw new Error(result.error || 'Ошибка при получении статистики категорий')
    }
    
    return result

  } catch (error) {
    return {
      success: false,
      data: [],
      count: 0,
      error: error instanceof Error ? error.message : 'Неизвестная ошибка'
    }
  }
}

// ============================================================================
// УТИЛИТЫ
// ============================================================================

/**
 * Получить популярные книги (с высоким рейтингом)
 */
export async function fetchPopularBooks(limit = 8): Promise<BooksResponse> {
  return fetchBooks({
    limit
  })
}

/**
 * Получить новые книги (последние добавленные)
 */
export async function fetchNewBooks(limit = 12): Promise<BooksResponse> {
  return fetchBooks({
    limit
  })
}

/**
 * Поиск книг по запросу
 */
export async function searchBooks(query: string, limit = 20): Promise<BooksResponse> {
  if (!query.trim()) {
    return {
      success: true,
      data: [],
      count: 0
    }
  }

  return fetchBooks({
    search: query.trim(),
    limit
  })
}

/**
 * Получить книги по категории
 */
export async function fetchBooksByCategory(category: string, limit?: number): Promise<BooksResponse> {
  return fetchBooks({
    category,
    limit
  })
}

// ============================================================================
// УТИЛИТЫ ДЛЯ РАБОТЫ С КАТЕГОРИЯМИ
// ============================================================================

/**
 * Преобразует структурированные категории в плоский список подкатегорий
 */
export function flattenCategories(categories: Category[]): string[] {
  const result: string[] = []
  
  categories.forEach(category => {
    if (category.subcategories && category.subcategories.length > 0) {
      // Добавляем все подкатегории
      category.subcategories.forEach(subcategory => {
        result.push(subcategory.name)
      })
    } else {
      // Если нет подкатегорий, добавляем главную категорию
      result.push(category.name)
    }
  })
  
  return result
}

/**
 * Получить все уникальные категории из книг (для обратной совместимости)
 */
export function getCategoriesFromBooks(books: Book[]): string[] {
  const categories = new Set<string>()
  
  books.forEach(book => {
    if (book.category_id) {
      categories.add(book.category_id)
    }
  })
  
  return Array.from(categories).sort()
}