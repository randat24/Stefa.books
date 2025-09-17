'use client'

import { useState, useEffect } from 'react'
import { Activity, Zap, Eye, Clock, AlertTriangleIcon, TrendingUp, Monitor } from 'lucide-react'

interface WebVitalData {
  metric: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  timestamp: number
  url: string
}

interface PerformanceMetrics {
  webVitals: WebVitalData[]
  customMetrics: Array<{
    name: string
    value: number
    timestamp: number
  }>
  resourceTimings: Array<{
    name: string
    duration: number
    type: string
  }>
}

const RATING_COLORS = {
  good: 'text-green-600 bg-green-50',
  'needs-improvement': 'text-yellow-600 bg-yellow-50',
  poor: 'text-red-600 bg-red-50'
}

const METRIC_ICONS = {
  CLS: Activity,
  FID: Zap,
  FCP: Eye,
  LCP: Monitor,
  TTFB: Clock
}

export default function PerformanceDashboard() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    webVitals: [],
    customMetrics: [],
    resourceTimings: []
  })
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Only show in development mode
    if (process.env.NODE_ENV !== 'development') return

    // Load stored performance data
    const loadStoredData = () => {
      try {
        const stored = localStorage.getItem('performance-metrics')
        if (stored) {
          setMetrics(JSON.parse(stored))
        }
      } catch (error) {
        console.warn('Failed to load performance metrics:', error)
      }
    }

    loadStoredData()

    // Listen for new performance data
    const handlePerformanceData = (event: CustomEvent<WebVitalData>) => {
      setMetrics(prev => {
        const updated = {
          ...prev,
          webVitals: [...prev.webVitals, event.detail].slice(-20) // Keep last 20 entries
        }
        
        // Store in localStorage
        try {
          localStorage.setItem('performance-metrics', JSON.stringify(updated))
        } catch (error) {
          console.warn('Failed to store performance metrics:', error)
        }
        
        return updated
      })
    }

    // Create custom event listener for web vitals
    const listener = (event: Event) => {
      handlePerformanceData(event as CustomEvent<WebVitalData>)
    }

    window.addEventListener('web-vital-measured', listener)

    // Collect resource timing data
    if ('performance' in window && 'getEntriesByType' in window.performance) {
      const resourceEntries = window.performance.getEntriesByType('resource') as PerformanceResourceTiming[]
      const resourceTimings = resourceEntries
        .filter(entry => entry.duration > 0)
        .map(entry => ({
          name: entry.name.split('/').pop() || entry.name,
          duration: Math.round(entry.duration),
          type: entry.initiatorType
        }))
        .sort((a, b) => b.duration - a.duration)
        .slice(0, 10) // Top 10 slowest resources

      setMetrics(prev => ({
        ...prev,
        resourceTimings
      }))
    }

    return () => {
      window.removeEventListener('web-vital-measured', listener)
    }
  }, [])

  // Only render in development
  if (process.env.NODE_ENV !== 'development') return null

  const toggleVisibility = () => setIsVisible(!isVisible)

  const getLatestMetric = (metricName: string) => {
    return metrics.webVitals
      .filter(m => m.metric === metricName)
      .sort((a, b) => b.timestamp - a.timestamp)[0]
  }

  const formatValue = (metric: string, value: number) => {
    if (metric === 'CLS') {
      return value.toFixed(3)
    }
    return `${Math.round(value)}ms`
  }

  const clearData = () => {
    setMetrics({ webVitals: [], customMetrics: [], resourceTimings: [] })
    localStorage.removeItem('performance-metrics')
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Toggle Button */}
      <button
        onClick={toggleVisibility}
        className="mb-2 p-3 bg-blue-600 hover:bg-blue-700 text-neutral-0 rounded-2xl shadow-lg transition-colors"
        title="Performance Dashboard"
      >
        <TrendingUp className="w-5 h-5" />
      </button>

      {/* Dashboard Panel */}
      {isVisible && (
        <div className="w-96 max-h-96 overflow-y-auto bg-white border border-neutral-200 rounded-lg shadow-lg">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-neutral-200 p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-body-lg font-semibold text-neutral-900">
                Performance Monitor
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={clearData}
                  className="text-body-sm text-neutral-500 hover:text-red-600 transition-colors"
                  title="Clear Data"
                >
                  Clear
                </button>
                <button
                  onClick={toggleVisibility}
                  className="text-neutral-400 hover:text-neutral-600"
                >
                  ×
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 space-y-6">
            {/* Core Web Vitals */}
            <div>
              <h4 className="text-body-sm font-medium text-neutral-700 mb-3">
                Core Web Vitals
              </h4>
              <div className="space-y-2">
                {['CLS', 'FID', 'FCP', 'LCP', 'TTFB'].map(metricName => {
                  const metric = getLatestMetric(metricName)
                  const Icon = METRIC_ICONS[metricName as keyof typeof METRIC_ICONS]
                  
                  return (
                    <div key={metricName} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-neutral-500" />
                        <span className="text-body-sm text-neutral-700">{metricName}</span>
                      </div>
                      {metric ? (
                        <span className={`text-caption px-2 py-1 rounded ${RATING_COLORS[metric.rating]}`}>
                          {formatValue(metricName, metric.value)}
                        </span>
                      ) : (
                        <span className="text-caption text-neutral-400">No data</span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Resource Timings */}
            {metrics.resourceTimings.length > 0 && (
              <div>
                <h4 className="text-body-sm font-medium text-neutral-700 mb-3">
                  Slowest Resources
                </h4>
                <div className="space-y-1">
                  {metrics.resourceTimings.slice(0, 5).map((resource, index) => (
                    <div key={index} className="flex items-center justify-between text-xs">
                      <span className="text-neutral-600 truncate max-w-48" title={resource.name}>
                        {resource.name}
                      </span>
                      <span className={`px-2 py-1 rounded ${
                        resource.duration > 1000 ? 'text-red-600 bg-red-50' :
                        resource.duration > 500 ? 'text-yellow-600 bg-yellow-50' :
                        'text-green-600 bg-green-50'
                      }`}>
                        {resource.duration}ms
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Summary */}
            {metrics.webVitals.length > 0 && (
              <div>
                <h4 className="text-body-sm font-medium text-neutral-700 mb-3">
                  Summary
                </h4>
                <div className="text-caption text-neutral-600 space-y-1">
                  <div>Total measurements: {metrics.webVitals.length}</div>
                  <div>
                    Good ratings: {metrics.webVitals.filter(m => m.rating === 'good').length}
                  </div>
                  <div>
                    Needs improvement: {metrics.webVitals.filter(m => m.rating === 'needs-improvement').length}
                  </div>
                  <div>
                    Poor ratings: {metrics.webVitals.filter(m => m.rating === 'poor').length}
                  </div>
                </div>
              </div>
            )}

            {/* No Data State */}
            {metrics.webVitals.length === 0 && (
              <div className="text-center py-8">
                <AlertTriangleIcon className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
                <p className="text-body-sm text-neutral-500">
                  No performance data available yet.
                  <br />
                  Interact with the page to collect metrics.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// Hook to send custom performance metrics to the dashboard
export function usePerformanceDashboard() {
  const trackCustomMetric = (name: string, value: number) => {
    if (process.env.NODE_ENV === 'development') {
      window.dispatchEvent(new CustomEvent('custom-metric', {
        detail: { name, value, timestamp: Date.now() }
      }))
    }
  }

  const trackWebVital = (metric: string, value: number, rating: 'good' | 'needs-improvement' | 'poor') => {
    if (process.env.NODE_ENV === 'development') {
      window.dispatchEvent(new CustomEvent('web-vital-measured', {
        detail: {
          metric,
          value,
          rating,
          timestamp: Date.now(),
          url: window.location.pathname
        }
      }))
    }
  }

  return { trackCustomMetric, trackWebVital }
}