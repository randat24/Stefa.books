'use client'

import { memo, useMemo, useCallback, useState, useEffect } from 'react'
import { BookCard } from '@/components/BookCard'
// import { BookListSkeleton } from '@/components/ui/LazyComponent' // TODO: Use when implementing skeleton loading
import type { Book } from '@/lib/supabase'

interface VirtualizedBookListProps {
  books: Book[]
  className?: string
  itemHeight?: number
  containerHeight?: number
  overscan?: number
  showActions?: boolean
  priorityLoading?: boolean
}

const VirtualizedBookList = memo(function VirtualizedBookList({
  books,
  className = '',
  itemHeight = 400,
  containerHeight = 600,
  overscan = 5,
  showActions = true,
  priorityLoading = false,
}: VirtualizedBookListProps) {
  const [scrollTop, setScrollTop] = useState(0)
  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null)

  // Вычисляем видимые элементы
  const visibleRange = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight)
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + overscan,
      books.length
    )
    
    return {
      startIndex: Math.max(0, startIndex - overscan),
      endIndex,
    }
  }, [scrollTop, itemHeight, containerHeight, overscan, books.length])

  // Получаем видимые книги
  const visibleBooks = useMemo(() => {
    return books.slice(visibleRange.startIndex, visibleRange.endIndex)
  }, [books, visibleRange])

  // Обработчик скролла
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }, [])

  // Эффект для отслеживания контейнера
  useEffect(() => {
    if (containerRef) {
      const handleResize = () => {
        // Пересчитываем при изменении размера
        setScrollTop(containerRef?.scrollTop || 0)
      }
      
      window.addEventListener('resize', handleResize)
      return () => window.removeEventListener('resize', handleResize)
    }
  }, [containerRef])

  if (books.length === 0) {
    return (
      <div className={`flex items-center justify-center h-64 ${className}`}>
        <p className="text-gray-500 text-lg">Книги не знайдено</p>
      </div>
    )
  }

  return (
    <div
      ref={setContainerRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div
        style={{
          height: books.length * itemHeight,
          position: 'relative',
        }}
      >
        <div
          style={{
            transform: `translateY(${visibleRange.startIndex * itemHeight}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4">
            {visibleBooks.map((book, index) => (
              <div
                key={book.id}
                style={{ height: itemHeight }}
                className="flex items-center justify-center"
              >
                <BookCard
                  book={book}
                  showActions={showActions}
                  priorityLoading={priorityLoading && index < 4}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
})

export default VirtualizedBookList
