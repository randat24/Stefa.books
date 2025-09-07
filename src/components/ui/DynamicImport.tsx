'use client'

import React, { Suspense, ComponentType, ReactNode } from 'react'
import { Loader2 } from 'lucide-react'

interface DynamicImportProps {
  children: ReactNode
  fallback?: ReactNode
  className?: string
  loading?: boolean
}

// Default loading component
const DefaultLoader = ({ className }: { className?: string }) => (
  <div className={`flex items-center justify-center p-4 ${className}`}>
    <Loader2 className="h-4 w-4 animate-spin" />
    <span className="ml-2 text-sm text-gray-600">Завантаження...</span>
  </div>
)

// Dynamic import wrapper
export function DynamicImport({ 
  children, 
  fallback, 
  className = '',
  loading = false 
}: DynamicImportProps) {
  if (loading) {
    return fallback || <DefaultLoader className={className} />
  }

  return (
    <Suspense fallback={fallback || <DefaultLoader className={className} />}>
      {children}
    </Suspense>
  )
}

// Hook for dynamic imports with error handling
export function useDynamicImport<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: {
    fallback?: ReactNode
    onError?: (error: Error) => void
  } = {}
) {
  const [Component, setComponent] = React.useState<T | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<Error | null>(null)

  const loadComponent = React.useCallback(async () => {
    if (Component || loading) return

    setLoading(true)
    setError(null)

    try {
      const moduleResult = await importFn()
      setComponent(() => moduleResult.default)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load component')
      setError(error)
      options.onError?.(error)
    } finally {
      setLoading(false)
    }
  }, [Component, loading, importFn, options])

  return {
    Component: Component ? Component : null,
    loading,
    error,
    loadComponent
  }
}

// Utility for creating dynamic imports with retry
export function createDynamicImport<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  retries = 3
) {
  return async (): Promise<{ default: T }> => {
    let lastError: Error | null = null

    for (let i = 0; i < retries; i++) {
      try {
        return await importFn()
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Import failed')
        
        if (i < retries - 1) {
          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000))
        }
      }
    }

    throw lastError || new Error('All retry attempts failed')
  }
}

// Preload utility
export function preloadComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>
) {
  if (typeof window !== 'undefined') {
    // Use requestIdleCallback if available, otherwise setTimeout
    const schedulePreload = window.requestIdleCallback || 
      ((callback: () => void) => setTimeout(callback, 0))
    
    schedulePreload(() => {
      importFn().catch(() => {
        // Silently fail for preloads
      })
    })
  }
}

// Bundle analyzer helper
export function getBundleSize() {
  if (typeof window !== 'undefined' && 'performance' in window) {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    return {
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
      totalTime: navigation.loadEventEnd - navigation.fetchStart
    }
  }
  return null
}
