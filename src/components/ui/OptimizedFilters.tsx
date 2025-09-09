'use client'

import { memo, useCallback, useState, useMemo } from 'react'
import { Filter, X, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/cn'
import PerformanceButton from './PerformanceButton'

interface FilterOption {
  value: string
  label: string
  count?: number
}

interface FilterGroup {
  key: string
  label: string
  type: 'select' | 'multiselect' | 'range' | 'checkbox'
  options?: FilterOption[]
  min?: number
  max?: number
  step?: number
}

interface OptimizedFiltersProps {
  filters: FilterGroup[]
  values: Record<string, any>
  onChange: (values: Record<string, any>) => void
  className?: string
  showClearAll?: boolean
  onClearAll?: () => void
  loading?: boolean
}

const OptimizedFilters = memo(function OptimizedFilters({
  filters,
  values,
  onChange,
  className = '',
  showClearAll = true,
  onClearAll,
  loading = false,
}: OptimizedFiltersProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())
  const [localValues, setLocalValues] = useState<Record<string, any>>(values)

  // Обработка изменения значения фильтра
  const handleFilterChange = useCallback((key: string, value: any) => {
    const newValues = { ...localValues, [key]: value }
    setLocalValues(newValues)
    onChange(newValues)
  }, [localValues, onChange])

  // Обработка переключения группы
  const handleGroupToggle = useCallback((key: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev)
      if (newSet.has(key)) {
        newSet.delete(key)
      } else {
        newSet.add(key)
      }
      return newSet
    })
  }, [])

  // Очистка всех фильтров
  const handleClearAll = useCallback(() => {
    const clearedValues = filters.reduce((acc, filter) => {
      acc[filter.key] = filter.type === 'multiselect' ? [] : filter.type === 'range' ? { min: filter.min, max: filter.max } : ''
      return acc
    }, {} as Record<string, any>)
    
    setLocalValues(clearedValues)
    onChange(clearedValues)
    onClearAll?.()
  }, [filters, onChange, onClearAll])

  // Очистка конкретного фильтра
  const handleClearFilter = useCallback((key: string) => {
    const filter = filters.find(f => f.key === key)
    if (!filter) return

    const defaultValue = filter.type === 'multiselect' ? [] : filter.type === 'range' ? { min: filter.min, max: filter.max } : ''
    handleFilterChange(key, defaultValue)
  }, [filters, handleFilterChange])

  // Проверка активности фильтра
  const isFilterActive = useCallback((key: string) => {
    const value = localValues[key]
    const filter = filters.find(f => f.key === key)
    
    if (!filter) return false
    
    if (filter.type === 'multiselect') {
      return Array.isArray(value) && value.length > 0
    } else if (filter.type === 'range') {
      return value && (value.min !== filter.min || value.max !== filter.max)
    } else {
      return value && value !== ''
    }
  }, [localValues, filters])

  // Подсчет активных фильтров
  const activeFiltersCount = useMemo(() => {
    return filters.filter(filter => isFilterActive(filter.key)).length
  }, [filters, isFilterActive])

  // Рендер фильтра по типу
  const renderFilter = (filter: FilterGroup) => {
    const value = localValues[filter.key] || ''
    const isActive = isFilterActive(filter.key)

    switch (filter.type) {
      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleFilterChange(filter.key, e.target.value)}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          >
            <option value="">Всі {filter.label.toLowerCase()}</option>
            {filter.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label} {option.count && `(${option.count})`}
              </option>
            ))}
          </select>
        )

      case 'multiselect':
        const selectedValues = Array.isArray(value) ? value : []
        return (
          <div className="space-y-2">
            {filter.options?.map((option) => (
              <label key={option.value} className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedValues.includes(option.value)}
                  onChange={(e) => {
                    const newValues = e.target.checked
                      ? [...selectedValues, option.value]
                      : selectedValues.filter(v => v !== option.value)
                    handleFilterChange(filter.key, newValues)
                  }}
                  className="rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
                  disabled={loading}
                />
                <span className="ml-2 text-body-sm text-neutral-700">
                  {option.label} {option.count && `(${option.count})`}
                </span>
              </label>
            ))}
          </div>
        )

      case 'range':
        const rangeValue = value || { min: filter.min || 0, max: filter.max || 100 }
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-body-sm text-neutral-600 mb-1">Мін</label>
                <input
                  type="number"
                  value={rangeValue.min}
                  onChange={(e) => handleFilterChange(filter.key, {
                    ...rangeValue,
                    min: parseInt(e.target.value) || filter.min || 0
                  })}
                  min={filter.min}
                  max={filter.max}
                  step={filter.step}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                />
              </div>
              <div className="flex-1">
                <label className="block text-body-sm text-neutral-600 mb-1">Макс</label>
                <input
                  type="number"
                  value={rangeValue.max}
                  onChange={(e) => handleFilterChange(filter.key, {
                    ...rangeValue,
                    max: parseInt(e.target.value) || filter.max || 100
                  })}
                  min={filter.min}
                  max={filter.max}
                  step={filter.step}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                />
              </div>
            </div>
            <div className="text-body-sm text-neutral-500">
              {rangeValue.min} - {rangeValue.max}
            </div>
          </div>
        )

      case 'checkbox':
        return (
          <div className="space-y-2">
            {filter.options?.map((option) => (
              <label key={option.value} className="flex items-center">
                <input
                  type="checkbox"
                  checked={value === option.value}
                  onChange={(e) => handleFilterChange(filter.key, e.target.checked ? option.value : '')}
                  className="rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
                  disabled={loading}
                />
                <span className="ml-2 text-body-sm text-neutral-700">
                  {option.label} {option.count && `(${option.count})`}
                </span>
              </label>
            ))}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Заголовок с кнопкой очистки */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-neutral-500" />
          <h3 className="text-body-lg font-medium text-neutral-900">Фільтри</h3>
          {activeFiltersCount > 0 && (
            <span className="px-2 py-1 text-caption font-medium text-blue-600 bg-blue-100 rounded-2xl">
              {activeFiltersCount}
            </span>
          )}
        </div>
        
        {showClearAll && activeFiltersCount > 0 && (
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

      {/* Фильтры */}
      <div className="space-y-4">
        {filters.map((filter) => {
          const isExpanded = expandedGroups.has(filter.key)
          const isActive = isFilterActive(filter.key)

          return (
            <div key={filter.key} className="border border-neutral-200 rounded-lg">
              <button
                onClick={() => handleGroupToggle(filter.key)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-neutral-50 transition-colors"
                disabled={loading}
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium text-neutral-900">{filter.label}</span>
                  {isActive && (
                    <span className="w-2 h-2 bg-blue-500 rounded-2xl" />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {isActive && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleClearFilter(filter.key)
                      }}
                      className="p-1 text-neutral-400 hover:text-neutral-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  <ChevronDown
                    className={cn(
                      'w-4 h-4 text-neutral-400 transition-transform',
                      isExpanded && 'rotate-180'
                    )}
                  />
                </div>
              </button>
              
              {isExpanded && (
                <div className="px-4 pb-4 border-t border-neutral-200">
                  {renderFilter(filter)}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
})

export default OptimizedFilters
