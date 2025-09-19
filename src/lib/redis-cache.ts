// Redis is optional, so we need to handle the case where it's not installed
let createClient: any;

// Initialize Redis client lazily
const initializeRedis = async () => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const redis = require('redis');
    createClient = redis.createClient;
    return true;
  } catch {
    // Redis not installed, use fallback
    console.warn('Redis package not found, Redis caching will be disabled');
    return false;
  }
};

import { logger } from './logger';

/**
 * Redis Cache Service
 * Provides a Redis-based caching layer that can be used alongside the existing in-memory cache
 */

export interface RedisCacheOptions {
  ttl?: number; // Time to live in seconds
  prefix?: string; // Key prefix for namespacing
  url?: string; // Redis connection URL
}

export class RedisCache {
  private client: any | null = null;
  private prefix: string;
  private defaultTTL: number;
  private isConnected: boolean = false;

  constructor(options: RedisCacheOptions = {}) {
    this.prefix = options.prefix || 'cache';
    this.defaultTTL = options.ttl || 300; // 5 minutes default
    
    // Initialize Redis client if URL is provided
    if (options.url) {
      this.initializeClient(options.url);
    } else if (process.env.REDIS_URL) {
      this.initializeClient(process.env.REDIS_URL);
    }
  }

  private async initializeClient(url: string): Promise<void> {
    try {
      if (!createClient) {
        const redisAvailable = await initializeRedis();
        if (!redisAvailable) {
          logger.warn('Redis client not available, skipping initialization', undefined, 'Redis');
          return;
        }
      }
      
      this.client = createClient({
        url,
        socket: {
          reconnectStrategy: (retries: number) => {
            if (retries > 10) {
              logger.error('Redis reconnection attempts exceeded', undefined, 'Redis');
              return new Error('Redis reconnection attempts exceeded');
            }
            // Exponential backoff: 100ms, 200ms, 400ms, ... up to 3 seconds
            return Math.min(retries * 100, 3000);
          }
        }
      });

      this.client.on('error', (err: any) => {
        logger.error('Redis client error', err, 'Redis');
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        logger.debug('Redis client connected', undefined, 'Redis');
        this.isConnected = true;
      });

      this.client.on('ready', () => {
        logger.debug('Redis client ready', undefined, 'Redis');
        this.isConnected = true;
      });

      this.client.on('reconnecting', () => {
        logger.debug('Redis client reconnecting', undefined, 'Redis');
      });

      this.client.on('end', () => {
        logger.debug('Redis client disconnected', undefined, 'Redis');
        this.isConnected = false;
      });

      await this.client.connect();
      this.isConnected = true;
      logger.info('Redis cache initialized successfully', { url }, 'Redis');
    } catch (error) {
      logger.error('Failed to initialize Redis client', error, 'Redis');
      this.isConnected = false;
    }
  }

  /**
   * Generate a namespaced cache key
   */
  private generateKey(key: string): string {
    return `${this.prefix}:${key}`;
  }

  /**
   * Get data from Redis cache
   */
  async get<T>(key: string): Promise<T | null> {
    if (!this.isConnected || !this.client) {
      logger.debug('Redis not connected, skipping get operation', undefined, 'Redis');
      return null;
    }

    try {
      const fullKey = this.generateKey(key);
      const cached = await this.client.get(fullKey);
      
      if (cached === null) {
        logger.debug(`Redis cache miss for key: ${fullKey}`, undefined, 'Redis');
        return null;
      }
      
      logger.debug(`Redis cache hit for key: ${fullKey}`, undefined, 'Redis');
      return JSON.parse(cached) as T;
    } catch (error) {
      logger.error('Redis cache get error', error, 'Redis');
      return null;
    }
  }

  /**
   * Store data in Redis cache
   */
  async set<T>(key: string, data: T, ttl?: number): Promise<void> {
    if (!this.isConnected || !this.client) {
      logger.debug('Redis not connected, skipping set operation', undefined, 'Redis');
      return;
    }

    try {
      const fullKey = this.generateKey(key);
      const ttlSeconds = ttl || this.defaultTTL;
      const serialized = JSON.stringify(data);
      
      if (ttlSeconds > 0) {
        await this.client.setEx(fullKey, ttlSeconds, serialized);
      } else {
        await this.client.set(fullKey, serialized);
      }
      
      logger.debug(`Redis cache set for key: ${fullKey} with TTL: ${ttlSeconds}s`, undefined, 'Redis');
    } catch (error) {
      logger.error('Redis cache set error', error, 'Redis');
    }
  }

  /**
   * Delete data from Redis cache
   */
  async delete(key: string): Promise<boolean> {
    if (!this.isConnected || !this.client) {
      logger.debug('Redis not connected, skipping delete operation', undefined, 'Redis');
      return false;
    }

    try {
      const fullKey = this.generateKey(key);
      const result = await this.client.del(fullKey);
      const deleted = result > 0;
      
      if (deleted) {
        logger.debug(`Redis cache deleted key: ${fullKey}`, undefined, 'Redis');
      }
      
      return deleted;
    } catch (error) {
      logger.error('Redis cache delete error', error, 'Redis');
      return false;
    }
  }

  /**
   * Invalidate cache entries by pattern
   */
  async invalidatePattern(pattern: string): Promise<number> {
    if (!this.isConnected || !this.client) {
      logger.debug('Redis not connected, skipping invalidatePattern operation', undefined, 'Redis');
      return 0;
    }

    try {
      const fullPattern = this.generateKey(pattern);
      const keys = await this.client.keys(fullPattern);
      let deletedCount = 0;
      
      if (keys.length > 0) {
        deletedCount = await this.client.del(keys);
      }
      
      if (deletedCount > 0) {
        logger.debug(`Redis cache invalidated ${deletedCount} entries matching pattern: ${fullPattern}`, undefined, 'Redis');
      }
      
      return deletedCount;
    } catch (error) {
      logger.error('Redis cache invalidate pattern error', error, 'Redis');
      return 0;
    }
  }

  /**
   * Clear all cache entries with this prefix
   */
  async clear(): Promise<void> {
    if (!this.isConnected || !this.client) {
      logger.debug('Redis not connected, skipping clear operation', undefined, 'Redis');
      return;
    }

    try {
      const pattern = this.generateKey('*');
      const keys = await this.client.keys(pattern);
      
      if (keys.length > 0) {
        await this.client.del(keys);
      }
      
      logger.debug(`Redis cache cleared ${keys.length} entries with prefix: ${this.prefix}`, undefined, 'Redis');
    } catch (error) {
      logger.error('Redis cache clear error', error, 'Redis');
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{ keyCount: number }> {
    if (!this.isConnected || !this.client) {
      logger.debug('Redis not connected, returning empty stats', undefined, 'Redis');
      return { keyCount: 0 };
    }

    try {
      const pattern = this.generateKey('*');
      const keys = await this.client.keys(pattern);
      return { keyCount: keys.length };
    } catch (error) {
      logger.error('Redis cache stats error', error, 'Redis');
      return { keyCount: 0 };
    }
  }

  /**
   * Disconnect Redis client
   */
  async disconnect(): Promise<void> {
    if (this.client && this.isConnected) {
      await this.client.quit();
      this.isConnected = false;
      logger.debug('Redis client disconnected', undefined, 'Redis');
    }
  }
}

// Pre-configured Redis cache instances for different data types
export const redisBooksCache = new RedisCache({ 
  prefix: 'books', 
  ttl: 600,
  url: process.env.REDIS_URL
}); // 10 minutes

export const redisCategoriesCache = new RedisCache({ 
  prefix: 'categories', 
  ttl: 1800,
  url: process.env.REDIS_URL
}); // 30 minutes

export const redisSearchCache = new RedisCache({ 
  prefix: 'search', 
  ttl: 300,
  url: process.env.REDIS_URL
}); // 5 minutes

export const redisApiCache = new RedisCache({ 
  prefix: 'api',
  url: process.env.REDIS_URL
}); // Default 5 minutes

// Redis Cache Manager for coordinating multiple cache instances
export class RedisCacheManager {
  private caches: Map<string, RedisCache> = new Map([
    ['books', redisBooksCache],
    ['categories', redisCategoriesCache],
    ['search', redisSearchCache],
    ['api', redisApiCache]
  ]);

  /**
   * Get overall cache statistics
   */
  async getGlobalStats() {
    const stats: Array<{ name: string; keyCount: number }> = [];
    for (const [name, cache] of this.caches.entries()) {
      const cacheStats = await cache.getStats();
      stats.push({ name, ...cacheStats });
    }
    return stats;
  }

  /**
   * Clear all Redis caches
   */
  async clearAll(): Promise<void> {
    for (const [name, cache] of this.caches.entries()) {
      await cache.clear();
      logger.info(`Cleared Redis ${name} cache`, undefined, 'Redis');
    }
  }

  /**
   * Invalidate all caches by pattern
   */
  async invalidateAllByPattern(pattern: string): Promise<number> {
    let totalDeleted = 0;
    for (const [, cache] of this.caches.entries()) {
      const deleted = await cache.invalidatePattern(pattern);
      totalDeleted += deleted;
    }
    logger.info(`Invalidated ${totalDeleted} total Redis entries matching pattern: ${pattern}`, undefined, 'Redis');
    return totalDeleted;
  }

  /**
   * Get cache by name
   */
  getCache(name: string): RedisCache | undefined {
    return this.caches.get(name);
  }

  /**
   * Disconnect all Redis clients
   */
  async disconnectAll(): Promise<void> {
    for (const [, cache] of this.caches.entries()) {
      await cache.disconnect();
    }
  }
}

export const redisCacheManager = new RedisCacheManager();

export default RedisCache;