'use client'

import { memo, useCallback, useState, useMemo } from 'react'
import { Filter, Grid, List, RefreshCw, Settings, Download, Upload, Trash2, Plus } from 'lucide-react'
import { cn } from '@/lib/cn'
import PerformanceButton from './PerformanceButton'
import OptimizedSearch from './OptimizedSearch'
import OptimizedFilters from './OptimizedFilters'
import OptimizedPagination from './OptimizedPagination'
import OptimizedInfiniteScroll from './OptimizedInfiniteScroll'
import VirtualizedBookList from './VirtualizedBookList'
import { useOptimizedCache } from './OptimizedCache'

interface OptimizedDataContainerProps<T> {
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
  cacheKey?: string
  cacheTTL?: number
  onRefresh?: () => void
  onExport?: (data: T[]) => void
  onImport?: (file: File) => void
  onAdd?: () => void
  onEdit?: (item: T) => void
  onDelete?: (item: T) => void
  onBulkDelete?: (items: T[]) => void
  settings?: {
    showSearch?: boolean
    showFilters?: boolean
    showViewMode?: boolean
    showRefresh?: boolean
    showClearAll?: boolean
    showExport?: boolean
    showImport?: boolean
    showSettings?: boolean
    showAdd?: boolean
    showEdit?: boolean
    showDelete?: boolean
    showBulkDelete?: boolean
  }
}

const OptimizedDataContainer = memo(function OptimizedDataContainer<T>({
  data,
  renderItem,
  className = '',
  searchable = true,
  searchPlaceholder = 'Пошук...',
  searchFields: _searchFields = [], // eslint-disable-line @typescript-eslint/no-unused-vars
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
  selectable: _selectable = false, // eslint-disable-line @typescript-eslint/no-unused-vars
  selectedItems: propSelectedItems = [],
  onSelectionChange: _onSelectionChange, // eslint-disable-line @typescript-eslint/no-unused-vars
  getRowKey = (item: T) => (item as any).id || Math.random().toString(),
  error,
  onRetry,
  cacheKey,
  cacheTTL = 5 * 60 * 1000, // 5 минут
  onRefresh,
  onExport,
  onImport,
  onAdd,
  onEdit: _onEdit, // eslint-disable-line @typescript-eslint/no-unused-vars
  onDelete: _onDelete, // eslint-disable-line @typescript-eslint/no-unused-vars
  onBulkDelete,
  settings = {
    showSearch: true,
    showFilters: true,
    showViewMode: true,
    showRefresh: true,
    showClearAll: true,
    showExport: true,
    showImport: true,
    showSettings: true,
    showAdd: true,
    showEdit: true,
    showDelete: true,
    showBulkDelete: true,
  },
}: OptimizedDataContainerProps<T>) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterValues, setFilterValues] = useState<Record<string, any>>({})
  const [showFiltersPanel, setShowFiltersPanel] = useState(false)
  const [currentViewMode, setCurrentViewMode] = useState<'grid' | 'list' | 'table'>(viewMode)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [selectedItems, setSelectedItems] = useState<T[]>(propSelectedItems)

  // Кэширование данных
  const { loading: cacheLoading, refresh: refreshCache } = useOptimizedCache(
    cacheKey || 'data-container',
    async () => data,
    {
      ttl: cacheTTL,
      fallback: data,
    }
  )

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

  // Обработка обновления данных
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true)
    try {
      await refreshCache()
      onRefresh?.()
    } finally {
      setIsRefreshing(false)
    }
  }, [refreshCache, onRefresh])

  // Обработка экспорта данных
  const handleExport = useCallback(async () => {
    if (!onExport) return
    
    setIsExporting(true)
    try {
      await onExport(data)
    } finally {
      setIsExporting(false)
    }
  }, [onExport, data])

  // Обработка импорта данных
  const handleImport = useCallback(async (file: File) => {
    if (!onImport) return
    
    setIsImporting(true)
    try {
      await onImport(file)
    } finally {
      setIsImporting(false)
    }
  }, [onImport])

  // Обработка добавления элемента
  const handleAdd = useCallback(() => {
    onAdd?.()
  }, [onAdd])

  // Обработка редактирования элемента
  // const handleEdit = useCallback((item: T) => {
  //   onEdit?.(item)
  // }, [onEdit])

  // Обработка удаления элемента
  // const handleDelete = useCallback((item: T) => {
  //   onDelete?.(item)
  // }, [onDelete])

  // Обработка массового удаления
  const handleBulkDelete = useCallback(() => {
    if (selectedItems.length > 0) {
      onBulkDelete?.(selectedItems)
      setSelectedItems([])
    }
  }, [selectedItems, onBulkDelete])

  // Обработка изменения выбранных элементов
  // const handleSelectionChange = useCallback((items: T[]) => {
  //   setSelectedItems(items)
  //   onSelectionChange?.(items)
  // }, [onSelectionChange])

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
  const isLoading = loading || cacheLoading

  // Рендер контента в зависимости от режима просмотра
  const renderContent = () => {
    if (isLoading && !hasData) {
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
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">
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
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">
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
          {settings.showSearch && searchable && (
            <div className="w-full sm:w-80">
              <OptimizedSearch
                onSearch={handleSearch}
                placeholder={searchPlaceholder}
                loading={isLoading}
              />
            </div>
          )}

          {/* Кнопка фильтров */}
          {settings.showFilters && hasFilters && (
            <PerformanceButton
              variant="outline"
              size="sm"
              onClick={handleToggleFilters}
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Фільтри
              {activeFiltersCount > 0 && (
                <span className="px-2 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </PerformanceButton>
          )}

          {/* Переключатель режима просмотра */}
          {settings.showViewMode && (
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
          )}

          {/* Кнопка добавления */}
          {settings.showAdd && onAdd && (
            <PerformanceButton
              variant="primary"
              size="sm"
              onClick={handleAdd}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Додати
            </PerformanceButton>
          )}

          {/* Кнопка обновления */}
          {settings.showRefresh && onRefresh && (
            <PerformanceButton
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              loading={isRefreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Оновити
            </PerformanceButton>
          )}

          {/* Кнопка экспорта */}
          {settings.showExport && onExport && (
            <PerformanceButton
              variant="ghost"
              size="sm"
              onClick={handleExport}
              loading={isExporting}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Експорт
            </PerformanceButton>
          )}

          {/* Кнопка импорта */}
          {settings.showImport && onImport && (
            <label className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer transition-colors">
              <Upload className="w-4 h-4" />
              Імпорт
              <input
                type="file"
                accept=".json,.csv,.xlsx"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleImport(file)
                }}
                className="hidden"
                disabled={isImporting}
              />
            </label>
          )}

          {/* Кнопка массового удаления */}
          {settings.showBulkDelete && onBulkDelete && selectedItems.length > 0 && (
            <PerformanceButton
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
              className="flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Видалити ({selectedItems.length})
            </PerformanceButton>
          )}

          {/* Очистка фильтров */}
          {settings.showClearAll && activeFiltersCount > 0 && (
            <PerformanceButton
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="text-gray-500 hover:text-gray-700"
            >
              Очистити все
            </PerformanceButton>
          )}

          {/* Кнопка настроек */}
          {settings.showSettings && (
            <PerformanceButton
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Налаштування
            </PerformanceButton>
          )}
        </div>
      </div>

      {/* Панель настроек */}
      {showSettings && (
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Режим просмотра
              </label>
              <select
                value={currentViewMode}
                onChange={(e) => handleViewModeChange(e.target.value as 'grid' | 'list' | 'table')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="grid">Сітка</option>
                <option value="list">Список</option>
                <option value="table">Таблиця</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Розмір сторінки
              </label>
              <select
                value={pagination?.pageSize || 10}
                onChange={() => {
                  // Обработка изменения размера страницы
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Виртуализация
              </label>
              <select
                value={virtualization?.enabled ? 'enabled' : 'disabled'}
                onChange={() => {
                  // Обработка включения/выключения виртуализации
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="disabled">Вимкнено</option>
                <option value="enabled">Увімкнено</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Панель фильтров */}
      {hasFilters && showFiltersPanel && (
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <OptimizedFilters
            filters={filters}
            values={filterValues}
            onChange={handleFilter}
            loading={isLoading}
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

export default OptimizedDataContainer
