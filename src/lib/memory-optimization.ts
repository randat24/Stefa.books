/**
 * Memory optimization utilities
 */

// WeakMap for storing component instances to prevent memory leaks
const componentRegistry = new WeakMap<object, Set<string>>();

// Register a component instance
export function registerComponentInstance(component: object, id: string): void {
  if (!componentRegistry.has(component)) {
    componentRegistry.set(component, new Set());
  }
  
  const instances = componentRegistry.get(component);
  instances?.add(id);
}

// Unregister a component instance
export function unregisterComponentInstance(component: object, id: string): void {
  const instances = componentRegistry.get(component);
  if (instances) {
    instances.delete(id);
    
    // Clean up the WeakMap entry if no instances left
    if (instances.size === 0) {
      componentRegistry.delete(component);
    }
  }
}

// Memory usage monitoring
export function monitorMemoryUsage(): void {
  if (typeof window === 'undefined' || !('memory' in performance)) return;

  const memory = (performance as any).memory;
  
  // Log memory usage periodically
  setInterval(() => {
    const used = Math.round(memory.usedJSHeapSize / 1024 / 1024);
    const limit = Math.round(memory.jsHeapSizeLimit / 1024 / 1024);
    
    // Log warning if memory usage is high
    if (used > limit * 0.8) {
      console.warn(`High memory usage: ${used}MB / ${limit}MB`);
    }
  }, 30000); // Check every 30 seconds
}

// Cleanup function to release memory
export function cleanupMemory(): void {
  if (typeof window === 'undefined') return;

  // Force garbage collection if available (only in development)
  if (process.env.NODE_ENV === 'development' && (window as any).gc) {
    (window as any).gc();
  }
  
  // Dispatch custom event for components to clean up
  window.dispatchEvent(new CustomEvent('memory-cleanup'));
}

// Utility to create memory-efficient data structures
export class EfficientMap<K, V> extends Map<K, V> {
  private maxSize: number;
  
  constructor(maxSize: number = 1000) {
    super();
    this.maxSize = maxSize;
  }
  
  set(key: K, value: V): this {
    // If we're at max size, remove the oldest entry
    if (this.size >= this.maxSize) {
      const firstKey = this.keys().next().value;
      if (firstKey !== undefined) {
        this.delete(firstKey);
      }
    }
    
    return super.set(key, value);
  }
}

// Utility to create memory-efficient cache
export class EfficientCache<K, V> {
  private cache: Map<K, { value: V; timestamp: number }>;
  private ttl: number;
  private maxSize: number;
  
  constructor(ttl: number = 5 * 60 * 1000, maxSize: number = 100) { // 5 minutes TTL, max 100 entries
    this.cache = new Map();
    this.ttl = ttl;
    this.maxSize = maxSize;
    
    // Clean up expired entries periodically
    setInterval(() => this.cleanup(), 60000); // Every minute
  }
  
  get(key: K): V | undefined {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return undefined;
    }
    
    // Check if entry is expired
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return undefined;
    }
    
    return entry.value;
  }
  
  set(key: K, value: V): void {
    // If we're at max size, remove the oldest entry
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }
    
    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });
  }
  
  delete(key: K): boolean {
    return this.cache.delete(key);
  }
  
  clear(): void {
    this.cache.clear();
  }
  
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.ttl) {
        this.cache.delete(key);
      }
    }
  }
}