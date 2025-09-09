'use client'

import { memo, useCallback, useMemo } from 'react'
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/cn'
import PerformanceButton from './PerformanceButton'

interface OptimizedPaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
  showFirstLast?: boolean
  maxVisiblePages?: number
  disabled?: boolean
}

const OptimizedPagination = memo(function OptimizedPagination({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
  showFirstLast = true,
  maxVisiblePages = 5,
  disabled = false,
}: OptimizedPaginationProps) {
  const handlePageChange = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages && !disabled) {
      onPageChange(page)
    }
  }, [onPageChange, totalPages, disabled])

  const handlePrevious = useCallback(() => {
    handlePageChange(currentPage - 1)
  }, [currentPage, handlePageChange])

  const handleNext = useCallback(() => {
    handlePageChange(currentPage + 1)
  }, [currentPage, handlePageChange])

  const handleFirst = useCallback(() => {
    handlePageChange(1)
  }, [handlePageChange])

  const handleLast = useCallback(() => {
    handlePageChange(totalPages)
  }, [handlePageChange, totalPages])

  // Вычисляем видимые страницы
  const visiblePages = useMemo(() => {
    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    const half = Math.floor(maxVisiblePages / 2)
    let start = Math.max(1, currentPage - half)
    const end = Math.min(totalPages, start + maxVisiblePages - 1)

    if (end - start + 1 < maxVisiblePages) {
      start = Math.max(1, end - maxVisiblePages + 1)
    }

    const pages = []
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    return pages
  }, [currentPage, totalPages, maxVisiblePages])

  const showFirstEllipsis = useMemo(() => {
    return visiblePages[0] > 2
  }, [visiblePages])

  const showLastEllipsis = useMemo(() => {
    return visiblePages[visiblePages.length - 1] < totalPages - 1
  }, [visiblePages, totalPages])

  if (totalPages <= 1) {
    return null
  }

  return (
    <nav
      className={cn('flex items-center justify-center space-x-1', className)}
      aria-label="Пагінація"
    >
      {/* Первая страница */}
      {showFirstLast && currentPage > 1 && (
        <PerformanceButton
          variant="outline"
          size="sm"
          onClick={handleFirst}
          disabled={disabled}
          className="px-2"
          aria-label="Перша сторінка"
        >
          1
        </PerformanceButton>
      )}

      {/* Многоточие в начале */}
      {showFirstEllipsis && (
        <span className="px-2 text-neutral-500">
          <MoreHorizontal className="w-4 h-4" />
        </span>
      )}

      {/* Предыдущая страница */}
      <PerformanceButton
        variant="outline"
        size="sm"
        onClick={handlePrevious}
        disabled={disabled || currentPage === 1}
        className="px-2"
        aria-label="Попередня сторінка"
      >
        <ChevronLeft className="w-4 h-4" />
      </PerformanceButton>

      {/* Видимые страницы */}
      {visiblePages.map((page) => (
        <PerformanceButton
          key={page}
          variant={page === currentPage ? 'primary' : 'outline'}
          size="sm"
          onClick={() => handlePageChange(page)}
          disabled={disabled}
          className="px-3 min-w-[40px]"
          aria-label={`Сторінка ${page}`}
          aria-current={page === currentPage ? 'page' : undefined}
        >
          {page}
        </PerformanceButton>
      ))}

      {/* Следующая страница */}
      <PerformanceButton
        variant="outline"
        size="sm"
        onClick={handleNext}
        disabled={disabled || currentPage === totalPages}
        className="px-2"
        aria-label="Наступна сторінка"
      >
        <ChevronRight className="w-4 h-4" />
      </PerformanceButton>

      {/* Многоточие в конце */}
      {showLastEllipsis && (
        <span className="px-2 text-neutral-500">
          <MoreHorizontal className="w-4 h-4" />
        </span>
      )}

      {/* Последняя страница */}
      {showFirstLast && currentPage < totalPages && (
        <PerformanceButton
          variant="outline"
          size="sm"
          onClick={handleLast}
          disabled={disabled}
          className="px-2"
          aria-label="Остання сторінка"
        >
          {totalPages}
        </PerformanceButton>
      )}
    </nav>
  )
})

export default OptimizedPagination
