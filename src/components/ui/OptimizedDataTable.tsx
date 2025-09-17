'use client'

import { useCallback, useState, useMemo , ReactNode } from 'react';
import { ReactNode } from 'react'
import { Filter } from 'lucide-react'
import { cn } from '@/lib/cn'
import PerformanceButton from './PerformanceButton'
import OptimizedSearch from './OptimizedSearch'
import OptimizedFilters from './OptimizedFilters'
import OptimizedPagination from './OptimizedPagination'
import OptimizedTable from './OptimizedTable'

interface Column<T> {
  key: keyof T
  label: string
  sortable?: boolean
  filterable?: boolean
  render?: (value: any, item: T) => React.ReactNode
  className?: string
  width?: string
}

interface FilterGroup {
  key: string
  label: string
  type: 'select' | 'multiselect' | 'range' | 'checkbox'
  options?: { value: string; label: string; count?: number }[]
  min?: number
  max?: number
  step?: number
}

interface OptimizedDataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  className?: string
  searchable?: boolean
  searchPlaceholder?: string
  searchFields?: (keyof T)[]
  filters?: FilterGroup[]
  onSearch?: (query: string) => void
  onFilter?: (filters: Record<string, any>) => void
  onSort?: (key: keyof T, direction: 'asc' | 'desc') => void
  onRowClick?: (item: T) => void
  loading?: boolean
  emptyMessage?: string
  selectable?: boolean
  selectedItems?: T[]
  onSelectionChange?: (items: T[]) => void
  getRowKey?: (item: T) => string | number
  pageSize?: number
  currentPage?: number
  onPageChange?: (page: number) => void
  totalPages?: number
  showFilters?: boolean
  showSearch?: boolean
  showPagination?: boolean
}

const OptimizedDataTable = (function OptimizedDataTable<T>({
  data,
  columns,
  className = '',
  searchable = true,
  searchPlaceholder = 'Пошук...',
  searchFields: _searchFields = [], // eslint-disable-line @typescript-eslint/no-unused-vars
  filters = [],
  onSearch,
  onFilter,
  onSort,
  onRowClick,
  loading = false,
  emptyMessage = 'Немає даних',
  selectable = false,
  selectedItems = [],
  onSelectionChange,
  getRowKey = (item: T) => (item as any).id || Math.random().toString(),
  pageSize = 10,
  currentPage = 1,
  onPageChange,
  totalPages,
  showFilters = true,
  showSearch = true,
  showPagination = true }: OptimizedDataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterValues, setFilterValues] = useState<Record<string, any>>({})
  const [showFiltersPanel, setShowFiltersPanel] = useState(false)
  const [sortKey, setSortKey] = useState<keyof T | null>(null) // eslint-disable-line @typescript-eslint/no-unused-vars
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc') // eslint-disable-line @typescript-eslint/no-unused-vars

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

  // Обработка сортировки
  const handleSort = useCallback((key: keyof T, direction: 'asc' | 'desc') => {
    setSortKey(key)
    setSortDirection(direction)
    onSort?.(key, direction)
  }, [onSort])

  // Обработка переключения панели фильтров
  const handleToggleFilters = useCallback(() => {
    setShowFiltersPanel(prev => !prev)
  }, [])

  // Обработка очистки всех фильтров
  const handleClearAll = useCallback(() => {
    setSearchQuery('')
    setFilterValues({})
    setSortKey(null)
    setSortDirection('asc')
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
  // const hasData = data.length > 0
  const hasFilters = filters.length > 0

  return (
    <div className={cn('w-full space-y-4', className)}>
      {/* Панель управления */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-1">
          {/* Поиск */}
          {showSearch && searchable && (
            <div className="w-full sm:w-80">
              <OptimizedSearch
                onSearch={handleSearch}
                placeholder={searchPlaceholder}
                loading={loading}
              />
            </div>
          )}

          {/* Кнопка фильтров */}
          {showFilters && hasFilters && (
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

          {/* Очистка фильтров */}
          {activeFiltersCount > 0 && (
            <PerformanceButton
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="text-neutral-500 hover:text-neutral-700"
            >
              Очистити все
            </PerformanceButton>
          )}
        </div>
      </div>

      {/* Панель фильтров */}
      {showFilters && hasFilters && showFiltersPanel && (
        <div className="border border-neutral-200 rounded-lg p-4 bg-neutral-50">
          <OptimizedFilters
            filters={filters}
            values={filterValues}
            onChange={handleFilter}
            loading={loading}
          />
        </div>
      )}

      {/* Таблица */}
      <div className="border border-neutral-200 rounded-lg overflow-hidden">
        <OptimizedTable
          data={data}
          columns={columns as any}
          onSort={handleSort}
          onRowClick={onRowClick as any}
          loading={loading}
          emptyMessage={emptyMessage}
          selectable={selectable}
          selectedItems={selectedItems}
          onSelectionChange={onSelectionChange as any}
          getRowKey={getRowKey as any}
          pageSize={pageSize}
          currentPage={currentPage}
          onPageChange={onPageChange}
        />
      </div>

      {/* Пагинация */}
      {showPagination && totalPages && totalPages > 1 && (
        <div className="flex justify-center">
          <OptimizedPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange || (() => {})}
          />
        </div>
      )}
    </div>
  )
})

export default OptimizedDataTable
