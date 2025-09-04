import { fetchBooks, fetchCategories, fetchBook, Category, CategoriesResponse as ExternalCategoriesResponse } from './api/books';
import type { Book } from './supabase';
import { booksCache, categoriesCache, searchCache, APICache } from './cache';
import { logger } from './logger';

// Type definitions
interface SSRBooksFilter {
  category?: string;
  category_id?: string;
  search?: string;
  limit?: number;
  available_only?: boolean;
}

interface CachedData<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface BooksResponse {
  success: boolean;
  data: Book[];
  count: number;
  total?: number;
  error?: string;
}


class SSRCacheService {
  private static instance: SSRCacheService;
  private ssrCache: Map<string, CachedData<any>> = new Map();

  private constructor() {}

  static getInstance(): SSRCacheService {
    if (!SSRCacheService.instance) {
      SSRCacheService.instance = new SSRCacheService();
    }
    return SSRCacheService.instance;
  }

  /**
   * Get books with SSR caching strategy
   */
  async getBooks(filters: SSRBooksFilter = {}, ssrCacheKey?: string): Promise<Book[]> {
    try {
      // For SSR, we use a special cache key that includes SSR context
      const cacheKey = ssrCacheKey || this.generateBooksCacheKey(filters);
      
      // Check SSR cache first
      const ssrCached = this.getFromSSRCache<Book[]>(cacheKey);
      if (ssrCached) {
        logger.debug(`SSR Cache hit for books: ${cacheKey}`);
        return ssrCached;
      }

      // Check regular cache
      const regularCacheKey = APICache.createKey('books', filters);
      const regularCached = await booksCache.get<BooksResponse>(regularCacheKey);
      if (regularCached && regularCached.success) {
        logger.debug(`Regular cache hit for books: ${regularCacheKey}`);
        // Store in SSR cache as well for consistency
        this.setInSSRCache(cacheKey, regularCached.data);
        return regularCached.data;
      }

      // Fetch from API if not cached
      logger.debug(`Fetching books from API with filters:`, filters);
      const response = await fetchBooks(filters);
      
      if (response.success && response.data) {
        // Cache in both regular and SSR caches
        booksCache.set(regularCacheKey, response);
        this.setInSSRCache(cacheKey, response.data);
        return response.data;
      }

      logger.warn(`Failed to fetch books:`, response.error);
      return [];
    } catch (error) {
      logger.error('Error fetching books for SSR:', error);
      return [];
    }
  }

  /**
   * Get categories with SSR caching strategy
   */
  async getCategories(ssrCacheKey?: string): Promise<Category[]> {
    try {
      const cacheKey = ssrCacheKey || 'categories';
      
      // Check SSR cache first
      const ssrCached = this.getFromSSRCache<Category[]>(cacheKey);
      if (ssrCached) {
        logger.debug(`SSR Cache hit for categories: ${cacheKey}`);
        return ssrCached;
      }

      // Check regular cache
      const regularCached = await categoriesCache.get<ExternalCategoriesResponse>(cacheKey);
      if (regularCached && regularCached.success) {
        logger.debug(`Regular cache hit for categories: ${cacheKey}`);
        // Store in SSR cache as well for consistency
        this.setInSSRCache(cacheKey, regularCached.data);
        return regularCached.data;
      }

      // Fetch from API if not cached
      logger.debug('Fetching categories from API');
      const response = await fetchCategories();
      
      if (response.success && response.data) {
        // Cache in both regular and SSR caches
        categoriesCache.set(cacheKey, response);
        this.setInSSRCache(cacheKey, response.data);
        return response.data;
      }

      logger.warn(`Failed to fetch categories:`, response.error);
      return [];
    } catch (error) {
      logger.error('Error fetching categories for SSR:', error);
      return [];
    }
  }

  /**
   * Get a single book with SSR caching strategy
   */
  async getBook(bookId: string, ssrCacheKey?: string): Promise<Book | null> {
    try {
      const cacheKey = ssrCacheKey || `book_${bookId}`;
      
      // Check SSR cache first
      const ssrCached = this.getFromSSRCache<Book>(cacheKey);
      if (ssrCached) {
        logger.debug(`SSR Cache hit for book: ${cacheKey}`);
        return ssrCached;
      }

      // Check regular cache
      const regularCacheKey = APICache.createKey('book', { id: bookId });
      const regularCached = await booksCache.get<{ success: boolean; data?: Book }>(regularCacheKey);
      if (regularCached && regularCached.success && regularCached.data) {
        logger.debug(`Regular cache hit for book: ${regularCacheKey}`);
        // Store in SSR cache as well for consistency
        this.setInSSRCache(cacheKey, regularCached.data);
        return regularCached.data || null;
      }

      // Fetch from API if not cached
      logger.debug(`Fetching book from API: ${bookId}`);
      const response = await fetchBook(bookId);
      
      if (response.success && response.data) {
        // Cache in both regular and SSR caches
        booksCache.set(regularCacheKey, response, 300); // 5 minutes for books
        this.setInSSRCache(cacheKey, response.data);
        return response.data;
      }

      logger.warn(`Failed to fetch book ${bookId}:`, response.error);
      return null;
    } catch (error) {
      logger.error(`Error fetching book ${bookId} for SSR:`, error);
      return null;
    }
  }

  /**
   * Get search results with SSR caching strategy
   */
  async getSearchResults(query: string, limit = 20, ssrCacheKey?: string): Promise<Book[]> {
    try {
      const cacheKey = ssrCacheKey || `search_${query}_${limit}`;
      
      // Check SSR cache first
      const ssrCached = this.getFromSSRCache<Book[]>(cacheKey);
      if (ssrCached) {
        logger.debug(`SSR Cache hit for search: ${cacheKey}`);
        return ssrCached;
      }

      // Check regular cache
      const regularCacheKey = APICache.createKey('search', { query, limit });
      const regularCached = await searchCache.get<BooksResponse>(regularCacheKey);
      if (regularCached && regularCached.success) {
        logger.debug(`Regular cache hit for search: ${regularCacheKey}`);
        // Store in SSR cache as well for consistency
        this.setInSSRCache(cacheKey, regularCached.data);
        return regularCached.data;
      }

      // Fetch from API if not cached
      logger.debug(`Fetching search results from API: ${query}`);
      const response = await fetchBooks({ search: query, limit });
      
      if (response.success && response.data) {
        // Cache in both regular and SSR caches
        searchCache.set(regularCacheKey, response);
        this.setInSSRCache(cacheKey, response.data);
        return response.data;
      }

      logger.warn(`Failed to fetch search results for "${query}":`, response.error);
      return [];
    } catch (error) {
      logger.error(`Error fetching search results for "${query}" for SSR:`, error);
      return [];
    }
  }

  /**
   * Generate cache key for books based on filters
   */
  private generateBooksCacheKey(filters: SSRBooksFilter): string {
    const parts = ['books'];
    
    if (filters.category) parts.push(`category_${filters.category}`);
    if (filters.category_id) parts.push(`category_id_${filters.category_id}`);
    if (filters.search) parts.push(`search_${filters.search}`);
    if (filters.limit) parts.push(`limit_${filters.limit}`);
    if (filters.available_only) parts.push('available_only');
    
    return parts.join('|');
  }

  /**
   * Get data from SSR cache
   */
  private getFromSSRCache<T>(key: string): T | null {
    const entry = this.ssrCache.get(key);
    
    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.ssrCache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Set data in SSR cache
   */
  private setInSSRCache<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    // For SSR, we use a longer TTL since it's for static generation
    const now = Date.now();
    const entry: CachedData<T> = {
      data,
      timestamp: now,
      expiresAt: now + ttl
    };

    this.ssrCache.set(key, entry);
    logger.debug(`Set SSR cache entry: ${key}, TTL: ${ttl}ms`);
  }

  /**
   * Clear SSR cache
   */
  clearSSRCache(): void {
    this.ssrCache.clear();
    logger.debug('Cleared SSR cache');
  }

  /**
   * Get SSR cache statistics
   */
  getSSRStats(): { entryCount: number; keys: string[] } {
    return {
      entryCount: this.ssrCache.size,
      keys: Array.from(this.ssrCache.keys())
    };
  }
}

// Export singleton instance
const ssrCache = SSRCacheService.getInstance();

// Export for use in getServerSideProps and getStaticProps
export default SSRCacheService;

// Export cache functions for backward compatibility
export { ssrCache };