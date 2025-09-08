'use client'

import { memo, useState, useCallback, useMemo, useEffect } from 'react'
import { Search, X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/cn'

interface OptimizedSearchProps {
  onSearch: (query: string) => void
  placeholder?: string
  className?: string
  debounceMs?: number
  minLength?: number
  showClearButton?: boolean
  loading?: boolean
}

const OptimizedSearch = memo(function OptimizedSearch({
  onSearch,
  placeholder = 'Пошук книг...',
  className = '',
  debounceMs = 300,
  minLength = 2,
  showClearButton = true,
  loading = false,
}: OptimizedSearchProps) {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')

  // Дебаунсинг поиска
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query)
    }, debounceMs)

    return () => clearTimeout(timer)
  }, [query, debounceMs])

  // Вызываем поиск только если запрос достаточно длинный
  useEffect(() => {
    if (debouncedQuery.length >= minLength) {
      onSearch(debouncedQuery)
    } else if (debouncedQuery.length === 0) {
      onSearch('')
    }
  }, [debouncedQuery, onSearch, minLength])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
  }, [])

  const handleClear = useCallback(() => {
    setQuery('')
    setDebouncedQuery('')
    onSearch('')
  }, [onSearch])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      handleClear()
    }
  }, [handleClear])

  const showClear = useMemo(() => {
    return showClearButton && query.length > 0
  }, [showClearButton, query.length])

  return (
    <div className={cn('relative', className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(
            'w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg',
            'focus:ring-2 focus:ring-blue-500 focus:border-transparent',
            'transition-all duration-200',
            'placeholder-gray-400 text-gray-900',
            'disabled:bg-gray-50 disabled:cursor-not-allowed'
          )}
          disabled={loading}
        />
        
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
          {loading && (
            <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
          )}
          
          {showClear && !loading && (
            <button
              type="button"
              onClick={handleClear}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Очистити пошук"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      
      {/* Показываем статус поиска */}
      {query.length > 0 && query.length < minLength && (
        <p className="text-body-sm text-gray-500 mt-1">
          Введіть щонайменше {minLength} символи
        </p>
      )}
      
      {loading && (
        <p className="text-body-sm text-gray-500 mt-1">
          Пошук...
        </p>
      )}
    </div>
  )
})

export default OptimizedSearch
