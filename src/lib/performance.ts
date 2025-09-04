import { logger } from './logger';

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

interface WebVitals {
  FCP: number; // First Contentful Paint
  LCP: number; // Largest Contentful Paint
  FID: number; // First Input Delay
  CLS: number; // Cumulative Layout Shift
  TTFB: number; // Time to First Byte
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private observers: Map<string, PerformanceObserver> = new Map();

  constructor() {
    this.initializeWebVitals();
    this.initializeCustomMetrics();
  }

  private initializeWebVitals() {
    // First Contentful Paint
    if ('PerformanceObserver' in window) {
      try {
        const fcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const fcp = entries[entries.length - 1];
          this.recordMetric('FCP', fcp.startTime, 'ms');
        });
        fcpObserver.observe({ entryTypes: ['paint'] });
        this.observers.set('FCP', fcpObserver);
      } catch (e) {
        logger.warn('Failed to initialize FCP observer', e);
      }

      // Largest Contentful Paint
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lcp = entries[entries.length - 1];
          this.recordMetric('LCP', lcp.startTime, 'ms');
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.set('LCP', lcpObserver);
      } catch (e) {
        logger.warn('Failed to initialize LCP observer', e);
      }

      // First Input Delay
      try {
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            const fidEntry = entry as any; // Type assertion for first-input entries
            this.recordMetric('FID', fidEntry.processingStart - fidEntry.startTime, 'ms');
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.set('FID', fidObserver);
      } catch (e) {
        logger.warn('Failed to initialize FID observer', e);
      }

      // Cumulative Layout Shift
      try {
        const clsObserver = new PerformanceObserver((list) => {
          let clsValue = 0;
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });
          this.recordMetric('CLS', clsValue, 'score');
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.set('CLS', clsObserver);
      } catch (e) {
        logger.warn('Failed to initialize CLS observer', e);
      }
    }
  }

  private initializeCustomMetrics() {
    // Navigation timing
    if ('performance' in window) {
      window.addEventListener('load', () => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigation) {
          this.recordMetric('TTFB', navigation.responseStart - navigation.requestStart, 'ms');
          this.recordMetric('DOMContentLoaded', navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart, 'ms');
          this.recordMetric('LoadComplete', navigation.loadEventEnd - navigation.loadEventStart, 'ms');
        }
      });
    }
  }

  recordMetric(name: string, value: number, unit: string, metadata?: Record<string, any>) {
    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      timestamp: Date.now(),
      metadata,
    };

    this.metrics.push(metric);
    logger.debug('Performance metric recorded', metric, 'Performance');

    // Send to analytics if available
    this.sendToAnalytics(metric);
  }

  private sendToAnalytics(metric: PerformanceMetric) {
    // Send to your analytics service
    if (typeof window !== 'undefined' && 'gtag' in window) {
      (window as any).gtag('event', 'performance_metric', {
        metric_name: metric.name,
        metric_value: metric.value,
        metric_unit: metric.unit,
        ...metric.metadata,
      });
    }
  }

  measureTime<T>(name: string, fn: () => T): T {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    
    this.recordMetric(name, end - start, 'ms');
    return result;
  }

  async measureTimeAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    
    this.recordMetric(name, end - start, 'ms');
    return result;
  }

  getMetrics(name?: string): PerformanceMetric[] {
    if (name) {
      return this.metrics.filter(m => m.name === name);
    }
    return this.metrics;
  }

  getLatestMetric(name: string): PerformanceMetric | null {
    const metrics = this.getMetrics(name);
    return metrics.length > 0 ? metrics[metrics.length - 1] : null;
  }

  getAverageMetric(name: string): number | null {
    const metrics = this.getMetrics(name);
    if (metrics.length === 0) return null;
    
    const sum = metrics.reduce((acc, m) => acc + m.value, 0);
    return sum / metrics.length;
  }

  clearMetrics() {
    this.metrics = [];
  }

  disconnect() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
  }

  getWebVitals(): Partial<WebVitals> {
    return {
      FCP: this.getLatestMetric('FCP')?.value,
      LCP: this.getLatestMetric('LCP')?.value,
      FID: this.getLatestMetric('FID')?.value,
      CLS: this.getLatestMetric('CLS')?.value,
      TTFB: this.getLatestMetric('TTFB')?.value,
    };
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Utility functions
export function measureTime<T>(name: string, fn: () => T): T {
  return performanceMonitor.measureTime(name, fn);
}

export async function measureTimeAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
  return performanceMonitor.measureTimeAsync(name, fn);
}

export function recordMetric(name: string, value: number, unit: string, metadata?: Record<string, any>) {
  performanceMonitor.recordMetric(name, value, unit, metadata);
}

// React hook for performance monitoring
export function usePerformanceMonitoring() {
  return {
    recordMetric: performanceMonitor.recordMetric.bind(performanceMonitor),
    measureTime: performanceMonitor.measureTime.bind(performanceMonitor),
    measureTimeAsync: performanceMonitor.measureTimeAsync.bind(performanceMonitor),
    getMetrics: performanceMonitor.getMetrics.bind(performanceMonitor),
    getWebVitals: performanceMonitor.getWebVitals.bind(performanceMonitor),
  };
}
