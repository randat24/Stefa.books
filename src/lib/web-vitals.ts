/**
 * Web Vitals monitoring and optimization
 */

import { logger } from './logger'

// Web Vitals types
interface WebVitalMetric {
  name: string
  value: number
  delta: number
  id: string
  navigationType: string
}

interface WebVitalsConfig {
  reportAllChanges?: boolean
  debug?: boolean
  onMetric?: (metric: WebVitalMetric) => void
}

// Core Web Vitals thresholds
const VITALS_THRESHOLDS = {
  LCP: { good: 2500, needsImprovement: 4000 },
  FID: { good: 100, needsImprovement: 300 },
  CLS: { good: 0.1, needsImprovement: 0.25 },
  FCP: { good: 1800, needsImprovement: 3000 },
  TTFB: { good: 800, needsImprovement: 1800 }
} as const

// Web Vitals monitoring class
class WebVitalsMonitor {
  private config: WebVitalsConfig
  private metrics: Map<string, WebVitalMetric> = new Map()
  private observers: Map<string, PerformanceObserver> = new Map()

  constructor(config: WebVitalsConfig = {}) {
    this.config = {
      reportAllChanges: false,
      debug: process.env.NODE_ENV === 'development',
      ...config
    }
  }

  // Initialize Web Vitals monitoring
  init() {
    if (typeof window === 'undefined') return

    this.observeLCP()
    this.observeFID()
    this.observeCLS()
    this.observeFCP()
    this.observeTTFB()

    // Report metrics on page unload
    window.addEventListener('beforeunload', () => {
      this.reportMetrics()
    })
  }

  // Observe Largest Contentful Paint
  private observeLCP() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1] as PerformanceEntry & { renderTime: number }
        
        const metric: WebVitalMetric = {
          name: 'LCP',
          value: lastEntry.renderTime,
          delta: lastEntry.renderTime,
          id: lastEntry.name,
          navigationType: this.getNavigationType()
        }

        this.recordMetric(metric)
      })

      observer.observe({ entryTypes: ['largest-contentful-paint'] })
      this.observers.set('LCP', observer)
    } catch (error) {
      logger.error('Failed to observe LCP:', error)
    }
  }

  // Observe First Input Delay
  private observeFID() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry) => {
          const fidEntry = entry as PerformanceEventTiming
          
          const metric: WebVitalMetric = {
            name: 'FID',
            value: fidEntry.processingStart - fidEntry.startTime,
            delta: fidEntry.processingStart - fidEntry.startTime,
            id: fidEntry.name,
            navigationType: this.getNavigationType()
          }

          this.recordMetric(metric)
        })
      })

      observer.observe({ entryTypes: ['first-input'] })
      this.observers.set('FID', observer)
    } catch (error) {
      logger.error('Failed to observe FID:', error)
    }
  }

  // Observe Cumulative Layout Shift
  private observeCLS() {
    try {
      let clsValue = 0
      let sessionValue = 0
      let sessionEntries: PerformanceEntry[] = []

      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry) => {
          if (!(entry as any).hadRecentInput) {
            const firstSessionEntry = sessionEntries[0]
            const lastSessionEntry = sessionEntries[sessionEntries.length - 1]

            if (sessionValue && 
                entry.startTime - (lastSessionEntry as any).startTime < 1000 &&
                entry.startTime - (firstSessionEntry as any).startTime < 5000) {
              sessionValue += (entry as any).value
              sessionEntries.push(entry)
            } else {
              sessionValue = (entry as any).value
              sessionEntries = [entry]
            }

            if (sessionValue > clsValue) {
              clsValue = sessionValue
              
              const metric: WebVitalMetric = {
                name: 'CLS',
                value: clsValue,
                delta: clsValue,
                id: entry.name,
                navigationType: this.getNavigationType()
              }

              this.recordMetric(metric)
            }
          }
        })
      })

      observer.observe({ entryTypes: ['layout-shift'] })
      this.observers.set('CLS', observer)
    } catch (error) {
      logger.error('Failed to observe CLS:', error)
    }
  }

  // Observe First Contentful Paint
  private observeFCP() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const fcpEntry = entries[0] as PerformanceEntry

        const metric: WebVitalMetric = {
          name: 'FCP',
          value: fcpEntry.startTime,
          delta: fcpEntry.startTime,
          id: fcpEntry.name,
          navigationType: this.getNavigationType()
        }

        this.recordMetric(metric)
      })

      observer.observe({ entryTypes: ['paint'] })
      this.observers.set('FCP', observer)
    } catch (error) {
      logger.error('Failed to observe FCP:', error)
    }
  }

  // Observe Time to First Byte
  private observeTTFB() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const ttfbEntry = entries[0] as PerformanceNavigationTiming

        const metric: WebVitalMetric = {
          name: 'TTFB',
          value: ttfbEntry.responseStart - ttfbEntry.fetchStart,
          delta: ttfbEntry.responseStart - ttfbEntry.fetchStart,
          id: ttfbEntry.name,
          navigationType: this.getNavigationType()
        }

        this.recordMetric(metric)
      })

      observer.observe({ entryTypes: ['navigation'] })
      this.observers.set('TTFB', observer)
    } catch (error) {
      logger.error('Failed to observe TTFB:', error)
    }
  }

  // Record a metric
  private recordMetric(metric: WebVitalMetric) {
    this.metrics.set(metric.name, metric)
    
    if (this.config.debug) {
      logger.info(`Web Vital ${metric.name}:`, metric)
    }

    this.config.onMetric?.(metric)
  }

  // Get navigation type
  private getNavigationType(): string {
    if (typeof window === 'undefined') return 'unknown'
    
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    return navigation.type || 'unknown'
  }

  // Get metric rating
  getMetricRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
    const threshold = VITALS_THRESHOLDS[name as keyof typeof VITALS_THRESHOLDS]
    if (!threshold) return 'good'

    if (value <= threshold.good) return 'good'
    if (value <= threshold.needsImprovement) return 'needs-improvement'
    return 'poor'
  }

  // Get all metrics
  getMetrics(): WebVitalMetric[] {
    return Array.from(this.metrics.values())
  }

  // Get metrics summary
  getMetricsSummary() {
    const metrics = this.getMetrics()
    const summary = {
      total: metrics.length,
      good: 0,
      needsImprovement: 0,
      poor: 0,
      details: {} as Record<string, any>
    }

    metrics.forEach(metric => {
      const rating = this.getMetricRating(metric.name, metric.value)
      if (rating === 'needs-improvement') {
        summary.needsImprovement++
      } else if (rating === 'good') {
        summary.good++
      } else if (rating === 'poor') {
        summary.poor++
      }
      summary.details[metric.name] = {
        value: metric.value,
        rating,
        threshold: VITALS_THRESHOLDS[metric.name as keyof typeof VITALS_THRESHOLDS]
      }
    })

    return summary
  }

  // Report metrics to analytics
  private reportMetrics() {
    const summary = this.getMetricsSummary()
    
    // Send to analytics service
    if (typeof window !== 'undefined' && 'gtag' in window) {
      (window as any).gtag('event', 'web_vitals', {
        event_category: 'Performance',
        event_label: 'Core Web Vitals',
        value: summary.good,
        custom_map: {
          'good': summary.good,
          'needs_improvement': summary.needsImprovement,
          'poor': summary.poor
        }
      })
    }

    // Log to console in development
    if (this.config.debug) {
      logger.info('Web Vitals Summary:', summary)
    }
  }

  // Cleanup observers
  cleanup() {
    this.observers.forEach(observer => observer.disconnect())
    this.observers.clear()
  }
}

// Global instance
let webVitalsMonitor: WebVitalsMonitor | null = null

// Initialize Web Vitals monitoring
export function initWebVitals(config?: WebVitalsConfig) {
  if (typeof window === 'undefined') return

  if (!webVitalsMonitor) {
    webVitalsMonitor = new WebVitalsMonitor(config)
    webVitalsMonitor.init()
  }

  return webVitalsMonitor
}

// Get Web Vitals instance
export function getWebVitals() {
  return webVitalsMonitor
}

// Performance optimization utilities
export function optimizeForWebVitals() {
  // Preload critical resources
  if (typeof window !== 'undefined') {
    // Preload critical CSS
    const criticalCSS = document.querySelector('link[rel="preload"][as="style"]')
    if (!criticalCSS) {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'style'
      link.href = '/styles/critical.css'
      document.head.appendChild(link)
    }

    // Preload critical fonts
    const fontPreload = document.querySelector('link[rel="preload"][as="font"]')
    if (!fontPreload) {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'font'
      link.type = 'font/woff2'
      link.href = '/fonts/inter.woff2'
      link.crossOrigin = 'anonymous'
      document.head.appendChild(link)
    }
  }
}

// Export types
export type { WebVitalMetric, WebVitalsConfig }
