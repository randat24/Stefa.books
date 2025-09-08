'use client'

import { memo, useCallback, useState, useEffect, useRef } from 'react'
import { cn } from '@/lib/cn'
import { BookListSkeleton, FormSkeleton, TableSkeleton } from './LazyComponent'

interface OptimizedDataLoaderProps<T> {
  data: T[] | null
  loading: boolean
  error: string | null
  renderItem: (item: T, index: number) => React.ReactNode
  renderEmpty?: () => React.ReactNode
  renderError?: (error: string) => React.ReactNode
  skeletonType?: 'book-list' | 'form' | 'table' | 'custom'
  customSkeleton?: React.ReactNode
  className?: string
  itemClassName?: string
  onRetry?: () => void
  retryText?: string
}

function OptimizedDataLoader<T>({
  data,
  loading,
  error,
  renderItem,
  renderEmpty,
  renderError,
  skeletonType = 'book-list',
  customSkeleton,
  className = '',
  itemClassName = '',
  onRetry,
  retryText = 'Спробувати знову',
}: OptimizedDataLoaderProps<T>) {
  const [isVisible, setIsVisible] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Intersection Observer для ленивой загрузки
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const handleRetry = useCallback(() => {
    if (onRetry) {
      onRetry()
    }
  }, [onRetry])

  const renderSkeleton = () => {
    if (customSkeleton) {
      return customSkeleton
    }

    switch (skeletonType) {
      case 'book-list':
        return <BookListSkeleton />
      case 'form':
        return <FormSkeleton />
      case 'table':
        return <TableSkeleton />
      default:
        return <BookListSkeleton />
    }
  }

  const renderEmptyState = () => {
    if (renderEmpty) {
      return renderEmpty()
    }

    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-gray-400"
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
        <h3 className="text-body-lg font-medium text-gray-900 mb-2">
          Нічого не знайдено
        </h3>
        <p className="text-gray-500">
          Спробуйте змінити параметри пошуку
        </p>
      </div>
    )
  }

  const renderErrorState = () => {
    if (renderError && error) {
      return renderError(error)
    }

    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mb-4">
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
        <h3 className="text-body-lg font-medium text-gray-900 mb-2">
          Помилка завантаження
        </h3>
        <p className="text-gray-500 mb-4">
          {error}
        </p>
        {onRetry && (
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            {retryText}
          </button>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div ref={containerRef} className={cn('w-full', className)}>
        {renderSkeleton()}
      </div>
    )
  }

  if (error) {
    return (
      <div ref={containerRef} className={cn('w-full', className)}>
        {renderErrorState()}
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div ref={containerRef} className={cn('w-full', className)}>
        {renderEmptyState()}
      </div>
    )
  }

  return (
    <div ref={containerRef} className={cn('w-full', className)}>
      {isVisible ? (
        <div className={cn('space-y-4', itemClassName)}>
          {data.map((item, index) => (
            <div key={index}>
              {renderItem(item, index)}
            </div>
          ))}
        </div>
      ) : (
        renderSkeleton()
      )}
    </div>
  )
}

export default OptimizedDataLoader
