'use client'

import { useCallback, useState, useMemo , ReactNode } from 'react';
import { ReactNode } from 'react'
import { ChevronUp, ChevronDown, MoreHorizontalIcon } from 'lucide-react'
import { cn } from '@/lib/cn'
import PerformanceButton from './PerformanceButton'

interface Column<T> {
  key: keyof T
  label: string
  sortable?: boolean
  render?: (value: any, item: T) => React.ReactNode
  className?: string
  width?: string
}

interface OptimizedTableProps<T> {
  data: T[]
  columns: Column<T>[]
  className?: string
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
}

const OptimizedTable = (function OptimizedTable<T>({
  data,
  columns,
  className = '',
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
  onPageChange }: OptimizedTableProps<T>) {
  const [sortKey, setSortKey] = useState<keyof T | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [selectedRows, setSelectedRows] = useState<Set<string | number>>(new Set())

  // Обработка сортировки
  const handleSort = useCallback((key: keyof T) => {
    const column = columns.find(col => col.key === key)
    if (!column?.sortable) return

    const newDirection = sortKey === key && sortDirection === 'asc' ? 'desc' : 'asc'
    setSortKey(key)
    setSortDirection(newDirection)
    onSort?.(key, newDirection)
  }, [columns, sortKey, sortDirection, onSort])

  // Обработка выбора строк
  const handleRowSelect = useCallback((item: T, checked: boolean) => {
    const key = getRowKey(item)
    const newSelected = new Set(selectedRows)
    
    if (checked) {
      newSelected.add(key)
    } else {
      newSelected.delete(key)
    }
    
    setSelectedRows(newSelected)
    
    if (onSelectionChange) {
      const selectedItems = data.filter(item => newSelected.has(getRowKey(item)))
      onSelectionChange(selectedItems)
    }
  }, [data, selectedRows, getRowKey, onSelectionChange])

  // Обработка выбора всех строк
  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      const allKeys = data.map(item => getRowKey(item))
      setSelectedRows(new Set(allKeys))
      onSelectionChange?.(data)
    } else {
      setSelectedRows(new Set())
      onSelectionChange?.([])
    }
  }, [data, getRowKey, onSelectionChange])

  // Обработка клика по строке
  const handleRowClick = useCallback((item: T) => {
    onRowClick?.(item)
  }, [onRowClick])

  // Пагинация
  const paginatedData = useMemo(() => {
    if (!pageSize || !onPageChange) return data
    
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return data.slice(startIndex, endIndex)
  }, [data, pageSize, currentPage, onPageChange])

  // Проверка выбора всех строк
  const isAllSelected = useMemo(() => {
    if (data.length === 0) return false
    return data.every(item => selectedRows.has(getRowKey(item)))
  }, [data, selectedRows, getRowKey])

  // Проверка частичного выбора
  const isPartiallySelected = useMemo(() => {
    if (data.length === 0) return false
    const selectedCount = data.filter(item => selectedRows.has(getRowKey(item))).length
    return selectedCount > 0 && selectedCount < data.length
  }, [data, selectedRows, getRowKey])

  if (loading) {
    return (
      <div className={cn('w-full', className)}>
        <div className="animate-pulse">
          <div className="h-12 bg-neutral-200 rounded mb-4" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-neutral-100 rounded mb-2" />
          ))}
        </div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className={cn('w-full', className)}>
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MoreHorizontalIcon className="w-8 h-8 text-neutral-400" />
          </div>
          <p className="text-neutral-500 text-lg">{emptyMessage}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('w-full', className)}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-neutral-50">
            <tr>
              {selectable && (
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(input) => {
                      if (input) input.indeterminate = isPartiallySelected
                    }}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSelectAll(e.target.checked)}
                    className="rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className={cn(
                    'px-6 py-3 text-left text-caption font-medium text-neutral-500 uppercase tracking-wider',
                    column.className
                  )}
                  style={{ width: column.width }}
                >
                  {column.sortable ? (
                    <button
                      onClick={() => handleSort(column.key)}
                      className="flex items-center gap-1 hover:text-neutral-700 transition-colors"
                    >
                      {column.label}
                      {sortKey === column.key && (
                        sortDirection === 'asc' ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )
                      )}
                    </button>
                  ) : (
                    column.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.map((item, index) => {
              const key = getRowKey(item)
              const isSelected = selectedRows.has(key)
              
              return (
                <tr
                  key={key}
                  className={cn(
                    'hover:bg-neutral-50 transition-colors',
                    isSelected && 'bg-blue-50',
                    onRowClick && 'cursor-pointer'
                  )}
                  onClick={() => handleRowClick(item)}
                >
                  {selectable && (
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleRowSelect(item, e.target.checked)}
                        onClick={(e: React.MouseEvent<HTMLInputElement>) => e.stopPropagation()}
                        className="rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                  )}
                  {columns.map((column) => (
                    <td
                      key={String(column.key)}
                      className={cn(
                        'px-6 py-4 whitespace-nowrap text-body-sm text-neutral-900',
                        column.className
                      )}
                    >
                      {column.render
                        ? column.render(item[column.key], item)
                        : String(item[column.key] || '')}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
})

export default OptimizedTable
