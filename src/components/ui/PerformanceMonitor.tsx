'use client'

import { useEffect, useState, useCallback } from 'react'
import { Activity, Zap, Clock, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'
import { cn } from '@/lib/cn'
import { initWebVitals, getWebVitals, type WebVitalMetric } from '@/lib/web-vitals'

interface PerformanceMonitorProps {
  className?: string
  showDetails?: boolean
  autoRefresh?: boolean
  refreshInterval?: number
}

interface PerformanceMetrics {
  webVitals: WebVitalMetric[]
  memoryUsage?: {
    used: number
    total: number
    percentage: number
  }
  loadTime?: number
  renderTime?: number
}

export function PerformanceMonitor({ 
  className,
  showDetails = false,
  autoRefresh = true,
  refreshInterval = 5000
}: PerformanceMonitorProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    webVitals: []
  })
  const [isVisible, setIsVisible] = useState(false)

  // Initialize Web Vitals monitoring
  useEffect(() => {
    const monitor = initWebVitals({
      onMetric: (metric) => {
        setMetrics(prev => ({
          ...prev,
          webVitals: [...prev.webVitals.filter(m => m.name !== metric.name), metric]
        }))
      }
    })
  }, [])

  // Get memory usage
  const getMemoryUsage = useCallback(() => {
    if (typeof window !== 'undefined' && 'memory' in performance) {
      const memory = (performance as any).memory
      return {
        used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round(memory.jsHeapSizeLimit / 1024 / 1024),
        percentage: Math.round((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100)
      }
    }
    return undefined
  }, [])

  // Get performance metrics
  const getPerformanceMetrics = useCallback(() => {
    if (typeof window === 'undefined') return

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    const paint = performance.getEntriesByType('paint')
    
    const loadTime = navigation.loadEventEnd - navigation.fetchStart
    const renderTime = paint.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0

    setMetrics(prev => ({
      ...prev,
      memoryUsage: getMemoryUsage(),
      loadTime,
      renderTime
    }))
  }, [getMemoryUsage])

  // Auto refresh metrics
  useEffect(() => {
    if (!autoRefresh) return

    getPerformanceMetrics()
    const interval = setInterval(getPerformanceMetrics, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, getPerformanceMetrics])

  // Get metric rating
  const getMetricRating = (name: string, value: number): 'good' | 'needs-improvement' | 'poor' => {
    const thresholds = {
      LCP: { good: 2500, needsImprovement: 4000 },
      FID: { good: 100, needsImprovement: 300 },
      CLS: { good: 0.1, needsImprovement: 0.25 },
      FCP: { good: 1800, needsImprovement: 3000 },
      TTFB: { good: 800, needsImprovement: 1800 }
    }

    const threshold = thresholds[name as keyof typeof thresholds]
    if (!threshold) return 'good'

    if (value <= threshold.good) return 'good'
    if (value <= threshold.needsImprovement) return 'needs-improvement'
    return 'poor'
  }

  // Get rating icon
  const getRatingIcon = (rating: string) => {
    switch (rating) {
      case 'good':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'needs-improvement':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'poor':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Activity className="h-4 w-4 text-neutral-500" />
    }
  }

  // Format metric value
  const formatMetricValue = (name: string, value: number): string => {
    switch (name) {
      case 'LCP':
      case 'FCP':
      case 'TTFB':
        return `${Math.round(value)}ms`
      case 'FID':
        return `${Math.round(value)}ms`
      case 'CLS':
        return value.toFixed(3)
      default:
        return value.toString()
    }
  }

  // Get overall performance score
  const getOverallScore = (): number => {
    if (metrics.webVitals.length === 0) return 0

    const scores = metrics.webVitals.map(metric => {
      const rating = getMetricRating(metric.name, metric.value)
      switch (rating) {
        case 'good': return 100
        case 'needs-improvement': return 60
        case 'poor': return 20
        default: return 0
      }
    })

    return Math.round(scores.reduce((sum: number, score: number) => sum + score, 0) / scores.length)
  }

  const overallScore = getOverallScore()

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className={cn(
          'fixed bottom-4 right-4 z-50 p-2 bg-blue-600 text-neutral-0 rounded-2xl shadow-lg hover:bg-blue-700 transition-colors',
          className
        )}
        title="Показати моніторинг продуктивності"
      >
        <Activity className="h-5 w-5" />
      </button>
    )
  }

  return (
    <div className={cn(
      'fixed bottom-4 right-4 z-50 bg-neutral-0 rounded-lg shadow-xl border max-w-sm',
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b">
        <div className="flex items-center space-x-2">
          <Activity className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-neutral-900">Продуктивність</h3>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-neutral-400 hover:text-neutral-600"
        >
          <XCircle className="h-4 w-4" />
        </button>
      </div>

      {/* Overall Score */}
      <div className="p-3 border-b">
        <div className="flex items-center justify-between mb-2">
          <span className="text-body-sm font-medium text-neutral-700">Загальна оцінка</span>
          <span className={cn(
            'text-h4',
            overallScore >= 80 ? 'text-green-600' : 
            overallScore >= 60 ? 'text-yellow-600' : 'text-red-600'
          )}>
            {overallScore}/100
          </span>
        </div>
        <div className="w-full bg-neutral-200 rounded-2xl h-2">
          <div
            className={cn(
              'h-2 rounded-2xl transition-all duration-300',
              overallScore >= 80 ? 'bg-green-500' : 
              overallScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
            )}
            style={{ width: `${overallScore}%` }}
          />
        </div>
      </div>

      {/* Web Vitals */}
      <div className="p-3">
        <h4 className="text-body-sm font-medium text-neutral-700 mb-2">Core Web Vitals</h4>
        <div className="space-y-2">
          {metrics.webVitals.map((metric) => {
            const rating = getMetricRating(metric.name, metric.value)
            return (
              <div key={metric.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getRatingIcon(rating)}
                  <span className="text-body-sm text-neutral-600">{metric.name}</span>
                </div>
                <span className="text-body-sm font-medium text-neutral-900">
                  {formatMetricValue(metric.name, metric.value)}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Additional Metrics */}
      {showDetails && (
        <div className="p-3 border-t">
          <h4 className="text-body-sm font-medium text-neutral-700 mb-2">Додаткові метрики</h4>
          <div className="space-y-2">
            {metrics.memoryUsage && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Zap className="h-4 w-4 text-blue-500" />
                  <span className="text-body-sm text-neutral-600">Пам&apos;ять</span>
                </div>
                <span className="text-body-sm font-medium text-neutral-900">
                  {metrics.memoryUsage.used}MB / {metrics.memoryUsage.total}MB
                </span>
              </div>
            )}
            {metrics.loadTime && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-green-500" />
                  <span className="text-body-sm text-neutral-600">Час завантаження</span>
                </div>
                <span className="text-body-sm font-medium text-neutral-900">
                  {Math.round(metrics.loadTime)}ms
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="p-3 border-t">
        <button
          onClick={getPerformanceMetrics}
          className="w-full text-body-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Оновити метрики
        </button>
      </div>
    </div>
  )
}

// Hook for performance monitoring
export function usePerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    webVitals: []
  })

  const updateMetrics = useCallback(() => {
    const monitor = getWebVitals()
    if (monitor) {
      setMetrics({
        webVitals: monitor.getMetrics(),
        memoryUsage: (() => {
          if (typeof window !== 'undefined' && 'memory' in performance) {
            const memory = (performance as any).memory
            return {
              used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
              total: Math.round(memory.jsHeapSizeLimit / 1024 / 1024),
              percentage: Math.round((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100)
            }
          }
          return undefined
        })()
      })
    }
  }, [])

  return { metrics, updateMetrics }
}
