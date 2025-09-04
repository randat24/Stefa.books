import { apiCache } from './cache';
import { logger } from './logger';
import { redisCacheManager } from './redis-cache';

/**
 * Cache Invalidation Service
 * Provides utilities for invalidating different types of cached data
 */

export class CacheInvalidationService {
  /**
   * Invalidate all book-related cache entries
   */
  static async invalidateBooksCache(bookId?: string): Promise<void> {
    try {
      if (bookId) {
        // Invalidate specific book cache
        apiCache.clear();
        // Also invalidate search cache since a specific book change might affect search results
        apiCache.clear();
        
        // Invalidate Redis cache
        if (redisCacheManager) {
          await redisCacheManager.invalidateAllByPattern(`books.*${bookId}.*`);
          await redisCacheManager.invalidateAllByPattern(`search.*`);
        }
      } else {
        // Invalidate all books cache
        apiCache.clear();
        // Also invalidate search cache since book changes might affect search results
        apiCache.clear();
        
        // Invalidate Redis cache
        if (redisCacheManager) {
          await redisCacheManager.invalidateAllByPattern('books.*');
          await redisCacheManager.invalidateAllByPattern('search.*');
        }
      }
    } catch (error) {
      logger.error('Failed to invalidate books cache', error, 'Cache');
    }
  }

  /**
   * Invalidate all category-related cache entries
   */
  static async invalidateCategoriesCache(categoryId?: string): Promise<void> {
    try {
      if (categoryId) {
        // Invalidate specific category cache
        apiCache.clear();
        
        // Invalidate Redis cache
        if (redisCacheManager) {
          await redisCacheManager.invalidateAllByPattern(`categories.*${categoryId}.*`);
        }
      } else {
        // Invalidate all categories cache
        apiCache.clear();
        
        // Invalidate Redis cache
        if (redisCacheManager) {
          await redisCacheManager.invalidateAllByPattern('categories.*');
        }
      }
      // Also invalidate books cache since category changes might affect book listings
      apiCache.clear();
      
      // Invalidate Redis cache for books
      if (redisCacheManager) {
        await redisCacheManager.invalidateAllByPattern('books.*');
      }
    } catch (error) {
      logger.error('Failed to invalidate categories cache', error, 'Cache');
    }
  }

  /**
   * Invalidate all search-related cache entries
   */
  static async invalidateSearchCache(query?: string): Promise<void> {
    try {
      if (query) {
        // Invalidate specific search query cache
        apiCache.clear();
        
        // Invalidate Redis cache
        if (redisCacheManager) {
          await redisCacheManager.invalidateAllByPattern(`search.*${query}.*`);
        }
      } else {
        // Invalidate all search cache
        apiCache.clear();
        
        // Invalidate Redis cache
        if (redisCacheManager) {
          await redisCacheManager.invalidateAllByPattern('search.*');
        }
      }
    } catch (error) {
      logger.error('Failed to invalidate search cache', error, 'Cache');
    }
  }

  /**
   * Invalidate all cache entries related to a specific user
   */
  static async invalidateUserCache(userId: string): Promise<void> {
    try {
      apiCache.clear();
      
      // Invalidate Redis cache
      if (redisCacheManager) {
        await redisCacheManager.invalidateAllByPattern(`user.*${userId}.*`);
      }
    } catch (error) {
      logger.error('Failed to invalidate user cache', error, 'Cache');
    }
  }

  /**
   * Invalidate all cache entries (use with caution)
   */
  static async invalidateAllCache(): Promise<void> {
    try {
      apiCache.clear();
      
      // Invalidate Redis cache
      if (redisCacheManager) {
        await redisCacheManager.clearAll();
      }
    } catch (error) {
      logger.error('Failed to invalidate all cache', error, 'Cache');
    }
  }

  /**
   * Invalidate cache entries by tag
   */
  static async invalidateByTag(tag: string): Promise<void> {
    try {
      apiCache.clear();
      
      // Invalidate Redis cache
      if (redisCacheManager) {
        await redisCacheManager.invalidateAllByPattern(tag);
      }
    } catch (error) {
      logger.error('Failed to invalidate cache by tag', error, 'Cache');
    }
  }

  /**
   * Smart cache invalidation based on data type and operation
   */
  static async smartInvalidate(
    dataType: 'book' | 'category' | 'author' | 'user',
    operation: 'create' | 'update' | 'delete',
    id?: string
  ): Promise<void> {
    try {
      switch (dataType) {
        case 'book':
          await this.invalidateBooksCache(id);
          break;
          
        case 'category':
          await this.invalidateCategoriesCache(id);
          break;
          
        case 'author':
          // Invalidate books cache since author changes might affect book listings
          apiCache.clear();
          
          // Invalidate Redis cache for books
          if (redisCacheManager) {
            await redisCacheManager.invalidateAllByPattern('books.*');
          }
          break;
          
        case 'user':
          if (id) {
            await this.invalidateUserCache(id);
          }
          break;
      }

      // For create and delete operations, we might need to invalidate more aggressively
      if (operation === 'create' || operation === 'delete') {
        // Invalidate search cache for create/delete operations
        apiCache.clear();
        
        // Invalidate Redis cache for search
        if (redisCacheManager) {
          await redisCacheManager.invalidateAllByPattern('search.*');
        }
      }
    } catch (error) {
      logger.error('Failed to perform smart cache invalidation', error, 'Cache');
    }
  }
}

export default CacheInvalidationService;