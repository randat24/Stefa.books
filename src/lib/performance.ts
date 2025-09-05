/**
 * Утилиты для оптимизации производительности
 */

/**
 * Дебаунс функция
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate = false
): T {
  let timeout: NodeJS.Timeout | null = null;

  return ((...args: Parameters<T>) => {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };

    const callNow = immediate && !timeout;

    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);

    if (callNow) func(...args);
  }) as T;
}

/**
 * Троттлинг функция
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): T {
  let inThrottle: boolean;

  return ((...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  }) as T;
}

/**
 * Проверка поддержки браузерных API
 */
export function supportsIntersectionObserver(): boolean {
  return typeof window !== 'undefined' && 'IntersectionObserver' in window;
}

export function supportsResizeObserver(): boolean {
  return typeof window !== 'undefined' && 'ResizeObserver' in window;
}

export function supportsRequestIdleCallback(): boolean {
  return typeof window !== 'undefined' && 'requestIdleCallback' in window;
}

/**
 * Полифилл для requestIdleCallback
 */
export function requestIdleCallback(
  callback: (deadline: { didTimeout: boolean; timeRemaining: () => number }) => void,
  options?: { timeout?: number }
): number {
  if (supportsRequestIdleCallback()) {
    return window.requestIdleCallback(callback, options);
  }

  const start = Date.now();
  return window.setTimeout(() => {
    callback({
      didTimeout: false,
      timeRemaining: () => Math.max(0, 50 - (Date.now() - start))
    });
  }, 1);
}

export function cancelIdleCallback(id: number): void {
  if (supportsRequestIdleCallback()) {
    window.cancelIdleCallback(id);
  } else {
    window.clearTimeout(id);
  }
}

/**
 * Измерение производительности
 */
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private marks: Map<string, number> = new Map();
  private measures: Map<string, number> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  mark(name: string): void {
    if (typeof window !== 'undefined' && 'performance' in window) {
      this.marks.set(name, performance.now());
    }
  }

  measure(name: string, startMark: string, endMark?: string): number {
    if (typeof window !== 'undefined' && 'performance' in window) {
      const startTime = this.marks.get(startMark);
      const endTime = endMark ? this.marks.get(endMark) : performance.now();

      if (startTime !== undefined && endTime !== undefined) {
        const duration = endTime - startTime;
        this.measures.set(name, duration);
        return duration;
      }
    }
    return 0;
  }

  getMeasure(name: string): number | undefined {
    return this.measures.get(name);
  }

  getAllMeasures(): Record<string, number> {
    return Object.fromEntries(this.measures);
  }

  clear(): void {
    this.marks.clear();
    this.measures.clear();
  }
}