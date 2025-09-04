/**
 * Request optimization utilities for improved performance
 */

// Debounce function to limit request frequency
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(later, wait);
  };
}

// Throttle function to limit execution rate
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Request caching with expiration
class RequestCache {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private defaultTTL: number;

  constructor(defaultTTL: number = 5 * 60 * 1000) { // 5 minutes default
    this.defaultTTL = defaultTTL;
  }

  get(key: string): any | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    if (Date.now() - entry.timestamp > this.defaultTTL) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  set(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  clear(): void {
    this.cache.clear();
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }
}

// Global request cache instance
export const requestCache = new RequestCache();

// Batch requests to reduce HTTP overhead
export class RequestBatcher {
  private batch: Map<string, { 
    url: string; 
    options: RequestInit; 
    resolve: (value: any) => void; 
    reject: (reason: any) => void 
  }> = new Map();
  
  private batchTimeout: NodeJS.Timeout | null = null;
  private batchSizeLimit: number;

  constructor(batchSizeLimit: number = 10) {
    this.batchSizeLimit = batchSizeLimit;
  }

  async addRequest<T>(url: string, options: RequestInit = {}): Promise<T> {
    return new Promise((resolve, reject) => {
      const requestId = `${url}_${JSON.stringify(options)}`;
      
      this.batch.set(requestId, { url, options, resolve, reject });
      
      // If batch is full, execute immediately
      if (this.batch.size >= this.batchSizeLimit) {
        this.executeBatch();
      } else if (!this.batchTimeout) {
        // Otherwise, schedule execution
        this.batchTimeout = setTimeout(() => {
          this.executeBatch();
        }, 50); // 50ms delay to allow batching
      }
    });
  }

  private async executeBatch(): Promise<void> {
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
      this.batchTimeout = null;
    }

    const batch = Array.from(this.batch.entries());
    this.batch.clear();

    // In a real implementation, you would send batched requests
    // For now, we'll execute them individually but with batching logic
    for (const [, request] of batch) {
      try {
        const response = await fetch(request.url, request.options);
        const data = await response.json();
        request.resolve(data);
      } catch (error) {
        request.reject(error);
      }
    }
  }
}

// Connection pooling for HTTP requests
export class ConnectionPool {
  private pool: Set<string> = new Set();
  private maxConcurrent: number;
  private queue: Array<() => void> = [];

  constructor(maxConcurrent: number = 6) {
    this.maxConcurrent = maxConcurrent;
  }

  async execute<T>(key: string, fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      const executeRequest = async () => {
        this.pool.add(key);
        
        try {
          const result = await fn();
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          this.pool.delete(key);
          this.processQueue();
        }
      };

      if (this.pool.size < this.maxConcurrent) {
        executeRequest();
      } else {
        this.queue.push(executeRequest);
      }
    });
  }

  private processQueue(): void {
    if (this.queue.length > 0 && this.pool.size < this.maxConcurrent) {
      const next = this.queue.shift();
      if (next) {
        next();
      }
    }
  }
}

// Export a global connection pool
export const connectionPool = new ConnectionPool();