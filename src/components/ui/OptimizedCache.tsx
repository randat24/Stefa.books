'use client'

import { useCallback, useState, useEffect, useRef , ReactNode } from 'react';
import { ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface CacheItem<T> {
  data: T
  timestamp: number
  ttl: number
}

interface OptimizedCacheProps<T> {
  key: string
  fetcher: () => Promise<T>
  ttl?: number // Time to live in milliseconds
  fallback?: T
  onError?: (error: Error) => void
  onSuccess?: (data: T) => void
  children: (data: T | null, loading: boolean, error: string | null) => React.ReactNode
}

// Глобальный кэш для всех компонентов
const globalCache = new Map<string, CacheItem<any>>()

// Очистка устаревших элементов кэша
const cleanupCache = () => {
  const now = Date.now()
  for (const [key, item] of globalCache.entries()) {
    if (now - item.timestamp > item.ttl) {
      globalCache.delete(key)
    }
  }
}

// Запускаем очистку каждые 5 минут
setInterval(cleanupCache, 5 * 60 * 1000)

function OptimizedCache<T>({
  key,
  fetcher,
  ttl = 5 * 60 * 1000, // 5 минут по умолчанию
  fallback,
  onError,
  onSuccess,
  children }: OptimizedCacheProps<T>) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const mountedRef = useRef(true)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Проверяем кэш
      const cachedItem = globalCache.get(key)
      if (cachedItem && Date.now() - cachedItem.timestamp < cachedItem.ttl) {
        setData(cachedItem.data)
        setLoading(false)
        onSuccess?.(cachedItem.data)
        return
      }

      // Загружаем данные
      const result = await fetcher()
      
      if (!mountedRef.current) return

      // Сохраняем в кэш
      globalCache.set(key, {
        data: result,
        timestamp: Date.now(),
        ttl })

      setData(result)
      setLoading(false)
      onSuccess?.(result)
    } catch (err) {
      if (!mountedRef.current) return

      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      setLoading(false)
      onError?.(err instanceof Error ? err : new Error(errorMessage))
      
      // Используем fallback если есть
      if (fallback) {
        setData(fallback)
      }
    }
  }, [key, fetcher, ttl, fallback, onError, onSuccess])

  useEffect(() => {
    mountedRef.current = true
    fetchData()

    return () => {
      mountedRef.current = false
    }
  }, [fetchData])

  const refresh = useCallback(() => {
    globalCache.delete(key)
    fetchData()
  }, [key, fetchData])

  return (
    <div className="w-full">
      {children(data, loading, error)}
    </div>
  )
}

// Хук для использования кэша
export function useOptimizedCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: {
    ttl?: number
    fallback?: T
    onError?: (error: Error) => void
    onSuccess?: (data: T) => void
  } = {}
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const mountedRef = useRef(true)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Проверяем кэш
      const cachedItem = globalCache.get(key)
      if (cachedItem && Date.now() - cachedItem.timestamp < cachedItem.ttl) {
        setData(cachedItem.data)
        setLoading(false)
        options.onSuccess?.(cachedItem.data)
        return
      }

      // Загружаем данные
      const result = await fetcher()
      
      if (!mountedRef.current) return

      // Сохраняем в кэш
      globalCache.set(key, {
        data: result,
        timestamp: Date.now(),
        ttl: options.ttl || 5 * 60 * 1000 })

      setData(result)
      setLoading(false)
      options.onSuccess?.(result)
    } catch (err) {
      if (!mountedRef.current) return

      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      setLoading(false)
      options.onError?.(err instanceof Error ? err : new Error(errorMessage))
      
      // Используем fallback если есть
      if (options.fallback) {
        setData(options.fallback)
      }
    }
  }, [key, fetcher, options])

  useEffect(() => {
    mountedRef.current = true
    fetchData()

    return () => {
      mountedRef.current = false
    }
  }, [fetchData])

  const refresh = useCallback(() => {
    globalCache.delete(key)
    fetchData()
  }, [key, fetchData])

  const clearCache = useCallback(() => {
    globalCache.delete(key)
  }, [key])

  return {
    data,
    loading,
    error,
    refresh,
    clearCache }
}

// Утилиты для управления кэшем
export const cacheUtils = {
  clear: (key: string) => {
    globalCache.delete(key)
  },
  clearAll: () => {
    globalCache.clear()
  },
  get: <T,>(key: string): T | null => {
    const item = globalCache.get(key)
    if (item && Date.now() - item.timestamp < item.ttl) {
      return item.data
    }
    return null
  },
  set: <T,>(key: string, data: T, ttl: number = 5 * 60 * 1000) => {
    globalCache.set(key, {
      data,
      timestamp: Date.now(),
      ttl })
  },
  has: (key: string): boolean => {
    const item = globalCache.get(key)
    return item ? Date.now() - item.timestamp < item.ttl : false
  },
  size: () => globalCache.size }

export default OptimizedCache
