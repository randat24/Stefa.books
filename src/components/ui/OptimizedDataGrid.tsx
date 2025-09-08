'use client'

import { memo, useCallback, useState, useMemo, useEffect } from 'react'
import { Search, Filter, Grid, List, MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/cn'
import PerformanceButton from './PerformanceButton'
import OptimizedSearch from './OptimizedSearch'
import OptimizedFilters from './OptimizedFilters'
import OptimizedPagination from './OptimizedPagination'
import OptimizedInfiniteScroll from './OptimizedInfiniteScroll'
import VirtualizedBookList from './VirtualizedBookList'

interface OptimizedDataGridProps<T> {
  data: T[]
  renderItem: (item: T, index: number) => React.ReactNode
  className?: string
  searchable?: boolean
  searchPlaceholder?: string
  searchFields?: (keyof T)[]
  filters?: Array<{
    key: string
    label: string
    type: 'select' | 'multiselect' | 'range' | 'checkbox'
    options?: { value: string; label: string; count?: number }[]
    min?: number
    max?: number
    step?: number
  }>
  onSearch?: (query: string) => void
  onFilter?: (filters: Record<string, any>) => void
  loading?: boolean
  emptyMessage?: string
  viewMode?: 'grid' | 'list' | 'table'
  onViewModeChange?: (mode: 'grid' | 'list' | 'table') => void
  pagination?: {
    pageSize: number
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
  }
  infiniteScroll?: {
    hasMore: boolean
    onLoadMore: () => void
  }
  virtualization?: {
    enabled: boolean
    itemHeight: number
    containerHeight: number
    overscan?: number
  }
  selectable?: boolean
  selectedItems?: T[]
  onSelectionChange?: (items: T[]) => void
  getRowKey?: (item: T) => string | number
  error?: string | null
  onRetry?: () => void
}

const OptimizedDataGrid = memo(function OptimizedDataGrid<T>({
  data,
  renderItem,
  className = '',
  searchable = true,
  searchPlaceholder = 'Пошук...',
  searchFields = [],
  filters = [],
  onSearch,
  onFilter,
  loading = false,
  emptyMessage = 'Немає даних',
  viewMode = 'grid',
  onViewModeChange,
  pagination,
  infiniteScroll,
  virtualization,
  selectable = false,
  selectedItems = [],
  onSelectionChange,
  getRowKey = (item: T) => (item as any).id || Math.random().toString(),
  error,
  onRetry,
}: OptimizedDataGridProps<T>) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterValues, setFilterValues] = useState<Record<string, any>>({})
  const [showFiltersPanel, setShowFiltersPanel] = useState(false)
  const [currentViewMode, setCurrentViewMode] = useState<'grid' | 'list' | 'table'>(viewMode)

  // Обработка поиска
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)
    onSearch?.(query)
  }, [onSearch])

  // Обработка фильтров
  const handleFilter = useCallback((filters: Record<string, any>) => {
    setFilterValues(filters)
    onFilter?.(filters)
  }, [onFilter])

  // Обработка изменения режима просмотра
  const handleViewModeChange = useCallback((mode: 'grid' | 'list' | 'table') => {
    setCurrentViewMode(mode)
    onViewModeChange?.(mode)
  }, [onViewModeChange])

  // Обработка переключения панели фильтров
  const handleToggleFilters = useCallback(() => {
    setShowFiltersPanel(prev => !prev)
  }, [])

  // Обработка очистки всех фильтров
  const handleClearAll = useCallback(() => {
    setSearchQuery('')
    setFilterValues({})
    onSearch?.('')
    onFilter?.({})
  }, [onSearch, onFilter])

  // Подсчет активных фильтров
  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (searchQuery) count++
    if (Object.values(filterValues).some(value => 
      Array.isArray(value) ? value.length > 0 : value !== '' && value !== null && value !== undefined
    )) count++
    return count
  }, [searchQuery, filterValues])

  // Проверка наличия данных
  const hasData = data.length > 0
  const hasFilters = filters.length > 0

  // Рендер контента в зависимости от режима просмотра
  const renderContent = () => {
    if (loading && !hasData) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 rounded-lg h-64 mb-4" />
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )
    }

    if (error) {
      return (
        <div className="text-center py-12">
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
          <h3 className="text-body-lg font-medium text-gray-900 mb-2">
            Помилка завантаження
          </h3>
          <p className="text-gray-500 mb-4">{error}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Спробувати знову
            </button>
          )}
        </div>
      )
    }

    if (!hasData) {
      return (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
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
            {emptyMessage}
          </h3>
          <p className="text-gray-500">
            Спробуйте змінити параметри пошуку
          </p>
        </div>
      )
    }

    // Виртуализация для больших списков
    if (virtualization?.enabled && currentViewMode === 'grid') {
      return (
        <VirtualizedBookList
          books={data as any[]}
          itemHeight={virtualization.itemHeight}
          containerHeight={virtualization.containerHeight}
          overscan={virtualization.overscan}
        />
      )
    }

    // Бесконечная прокрутка
    if (infiniteScroll) {
      const renderItemWrapper = (item: unknown, index: number) => {
        return renderItem(item as T, index)
      }
      
      return (
        <OptimizedInfiniteScroll
          data={data}
          hasMore={infiniteScroll.hasMore}
          loading={loading}
          onLoadMore={infiniteScroll.onLoadMore}
          renderItem={renderItemWrapper}
          error={error}
          onRetry={onRetry}
        />
      )
    }

    // Обычный рендер
    const gridClasses = {
      grid: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6',
      list: 'space-y-4',
      table: 'space-y-2',
    }

    return (
      <div className={gridClasses[currentViewMode]}>
        {data.map((item, index) => (
          <div key={getRowKey(item)}>
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={cn('w-full space-y-4', className)}>
      {/* Панель управления */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-1">
          {/* Поиск */}
          {searchable && (
            <div className="w-full sm:w-80">
              <OptimizedSearch
                onSearch={handleSearch}
                placeholder={searchPlaceholder}
                loading={loading}
              />
            </div>
          )}

          {/* Кнопка фильтров */}
          {hasFilters && (
            <PerformanceButton
              variant="outline"
              size="sm"
              onClick={handleToggleFilters}
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Фільтри
              {activeFiltersCount > 0 && (
                <span className="px-2 py-1 text-caption font-medium text-blue-600 bg-blue-100 rounded-2xl">
                  {activeFiltersCount}
                </span>
              )}
            </PerformanceButton>
          )}

          {/* Переключатель режима просмотра */}
          <div className="flex items-center gap-1 border border-gray-300 rounded-md">
            <PerformanceButton
              variant={currentViewMode === 'grid' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => handleViewModeChange('grid')}
              className="px-3 py-2"
            >
              <Grid className="w-4 h-4" />
            </PerformanceButton>
            <PerformanceButton
              variant={currentViewMode === 'list' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => handleViewModeChange('list')}
              className="px-3 py-2"
            >
              <List className="w-4 h-4" />
            </PerformanceButton>
          </div>

          {/* Очистка фильтров */}
          {activeFiltersCount > 0 && (
            <PerformanceButton
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="text-gray-500 hover:text-gray-700"
            >
              Очистити все
            </PerformanceButton>
          )}
        </div>
      </div>

      {/* Панель фильтров */}
      {hasFilters && showFiltersPanel && (
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <OptimizedFilters
            filters={filters}
            values={filterValues}
            onChange={handleFilter}
            loading={loading}
          />
        </div>
      )}

      {/* Контент */}
      <div className="min-h-[400px]">
        {renderContent()}
      </div>

      {/* Пагинация */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center">
          <OptimizedPagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={pagination.onPageChange}
          />
        </div>
      )}
    </div>
  )
})

export default OptimizedDataGrid
