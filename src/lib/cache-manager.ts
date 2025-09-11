/**
 * Менеджер кеширования для изображений и API
 * Решает проблемы с загрузкой обложек книг
 */

interface CacheConfig {
  ttl: number; // время жизни в миллисекундах
  maxSize: number; // максимальный размер кеша
  storage: 'memory' | 'localStorage' | 'sessionStorage';
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  key: string;
}

class CacheManager {
  private memoryCache = new Map<string, CacheEntry<any>>();
  private config: CacheConfig;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      ttl: 5 * 60 * 1000, // 5 минут по умолчанию
      maxSize: 100, // максимум 100 записей
      storage: 'memory',
      ...config
    };
  }

  /**
   * Получить данные из кеша
   */
  get<T>(key: string): T | null {
    const entry = this.memoryCache.get(key);
    
    if (!entry) {
      return null;
    }

    // Проверяем, не истек ли срок действия
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.memoryCache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Сохранить данные в кеш
   */
  set<T>(key: string, data: T, ttl?: number): void {
    // Очищаем старые записи если достигли лимита
    if (this.memoryCache.size >= this.config.maxSize) {
      this.cleanup();
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.config.ttl,
      key
    };

    this.memoryCache.set(key, entry);
  }

  /**
   * Удалить конкретную запись из кеша
   */
  delete(key: string): boolean {
    return this.memoryCache.delete(key);
  }

  /**
   * Очистить весь кеш
   */
  clear(): void {
    this.memoryCache.clear();
  }

  /**
   * Очистить устаревшие записи
   */
  cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.memoryCache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.memoryCache.delete(key));
  }

  /**
   * Получить статистику кеша
   */
  getStats() {
    const now = Date.now();
    let expiredCount = 0;
    let totalSize = 0;

    for (const entry of this.memoryCache.values()) {
      if (now - entry.timestamp > entry.ttl) {
        expiredCount++;
      }
      totalSize += JSON.stringify(entry.data).length;
    }

    return {
      totalEntries: this.memoryCache.size,
      expiredEntries: expiredCount,
      totalSize: `${(totalSize / 1024).toFixed(2)} KB`,
      maxSize: this.config.maxSize
    };
  }

  /**
   * Очистить кеш изображений
   */
  clearImageCache(): void {
    const imageKeys = Array.from(this.memoryCache.keys()).filter(key => 
      key.includes('image') || key.includes('cover') || key.includes('cloudinary')
    );
    
    imageKeys.forEach(key => this.memoryCache.delete(key));
  }

  /**
   * Очистить кеш API
   */
  clearApiCache(): void {
    const apiKeys = Array.from(this.memoryCache.keys()).filter(key => 
      key.includes('api') || key.includes('books') || key.includes('categories')
    );
    
    apiKeys.forEach(key => this.memoryCache.delete(key));
  }
}

// Создаем специализированные экземпляры кеша
export const imageCache = new CacheManager({
  ttl: 10 * 60 * 1000, // 10 минут для изображений
  maxSize: 50
});

export const apiCache = new CacheManager({
  ttl: 5 * 60 * 1000, // 5 минут для API
  maxSize: 100
});

export const bookCache = new CacheManager({
  ttl: 15 * 60 * 1000, // 15 минут для книг
  maxSize: 200
});

// Утилиты для работы с кешем
export const cacheUtils = {
  /**
   * Очистить весь кеш
   */
  clearAll: () => {
    imageCache.clear();
    apiCache.clear();
    bookCache.clear();
  },

  /**
   * Очистить кеш изображений
   */
  clearImages: () => {
    imageCache.clearImageCache();
  },

  /**
   * Очистить кеш API
   */
  clearApi: () => {
    apiCache.clearApiCache();
  },

  /**
   * Получить статистику всех кешей
   */
  getStats: () => ({
    images: imageCache.getStats(),
    api: apiCache.getStats(),
    books: bookCache.getStats()
  }),

  /**
   * Принудительно обновить изображение
   */
  refreshImage: (imageUrl: string) => {
    // Удаляем из кеша
    const keys = Array.from(imageCache['memoryCache'].keys()).filter(key => 
      key.includes(imageUrl) || key.includes(encodeURIComponent(imageUrl))
    );
    keys.forEach(key => imageCache.delete(key));
    
    // Очищаем кеш браузера для этого изображения
    if (typeof window !== 'undefined') {
      // Создаем новый URL с timestamp для обхода кеша браузера
      const url = new URL(imageUrl);
      url.searchParams.set('_t', Date.now().toString());
      
      // Предзагружаем изображение
      const img = new Image();
      img.src = url.toString();
    }
  }
};

export default CacheManager;
