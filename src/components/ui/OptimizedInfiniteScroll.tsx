'use client'

import { useCallback, useEffect, useRef, useState, ReactNode } from 'react';
import { cn } from '@/lib/cn'
import { BookListSkeleton } from './LazyComponent'

interface OptimizedInfiniteScrollProps<T> {
  data: T[]
  hasMore: boolean
  loading: boolean
  onLoadMore: () => void
  renderItem: (item: T, index: number) => React.ReactNode
  renderSkeleton?: () => React.ReactNode
  className?: string
  itemClassName?: string
  threshold?: number
  rootMargin?: string
  error?: string | null
  onRetry?: () => void
}

const OptimizedInfiniteScroll = (function OptimizedInfiniteScroll<T>({
  data,
  hasMore,
  loading,
  onLoadMore,
  renderItem,
  renderSkeleton,
  className = '',
  itemClassName = '',
  threshold = 0.1,
  rootMargin = '100px',
  error,
  onRetry }: OptimizedInfiniteScrollProps<T>) {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)
  const observerRef = useRef<IntersectionObserver | null | null | null>(null)
  const sentinelRef = useRef<HTMLDivElement | null | null>(null)

  // Создаем Intersection Observer
  useEffect(() => {
    if (typeof window === 'undefined') return

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting)
      },
      {
        threshold,
        rootMargin }
    )

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [threshold, rootMargin])

  // Наблюдаем за sentinel элементом
  useEffect(() => {
    if (sentinelRef.current && observerRef.current) {
      observerRef.current.observe(sentinelRef.current)
    }

    return () => {
      if (sentinelRef.current && observerRef.current) {
        observerRef.current.unobserve(sentinelRef.current)
      }
    }
  }, [])

  // Загружаем больше данных при пересечении
  useEffect(() => {
    if (isIntersecting && hasMore && !loading && !error) {
      onLoadMore()
    }
  }, [isIntersecting, hasMore, loading, error, onLoadMore])

  // Отмечаем, что данные были загружены
  useEffect(() => {
    if (data.length > 0) {
      setHasLoaded(true)
    }
  }, [data.length])

  // Обработка ошибки
  const handleRetry = useCallback(() => {
    if (onRetry) {
      onRetry()
    }
  }, [onRetry])

  // Рендер скелетона
  const renderLoadingSkeleton = () => {
    if (renderSkeleton) {
      return renderSkeleton()
    }

    return <BookListSkeleton />
  }

  // Рендер ошибки
  const renderError = () => {
    if (!error) return null

    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-red-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <h3 className="text-body-lg font-medium text-neutral-900 mb-2">
          Помилка завантаження
        </h3>
        <p className="text-neutral-500 mb-4">{error}</p>
        {onRetry && (
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-blue-600 text-neutral-0 rounded-md hover:bg-blue-700 transition-colors"
          >
            Спробувати знову
          </button>
        )}
      </div>
    )
  }

  // Рендер пустого состояния
  const renderEmpty = () => {
    if (data.length > 0 || loading) return null

    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-neutral-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h3 className="text-body-lg font-medium text-neutral-900 mb-2">
          Нічого не знайдено
        </h3>
        <p className="text-neutral-500">
          Спробуйте змінити параметри пошуку
        </p>
      </div>
    )
  }

  return (
    <div className={cn('w-full', className)}>
      {/* Данные */}
      {data.length > 0 && (
        <div className={cn('space-y-4', itemClassName)}>
          {data.map((item, index) => (
            <div key={index}>
              {renderItem(item, index)}
            </div>
          ))}
        </div>
      )}

      {/* Пустое состояние */}
      {renderEmpty()}

      {/* Ошибка */}
      {error && renderError()}

      {/* Sentinel элемент для отслеживания пересечения */}
      {hasMore && !error && (
        <div ref={sentinelRef} className="h-4" />
      )}

      {/* Индикатор загрузки */}
      {loading && hasLoaded && (
        <div className="mt-8">
          {renderLoadingSkeleton()}
        </div>
      )}

      {/* Индикатор окончания данных */}
      {!hasMore && data.length > 0 && !loading && (
        <div className="text-center py-8">
          <p className="text-neutral-500">
            Всі дані завантажено
          </p>
        </div>
      )}
    </div>
  )
})

export default OptimizedInfiniteScroll
