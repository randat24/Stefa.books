import { useEffect, useCallback, useMemo } from 'react'
import { useBooksStore } from '@/store/books'
import { logger } from '@/lib/logger'

export function useBooksCache() {
  const {
    books,
    lastSync,
    isSyncing,
    cacheVersion,
    getBookById,
    getBooksByCategory,
    getBooksByAgeCategory,
    searchBooks,
    getAvailableBooks,
    getFilteredBooks,
    syncWithServer,
    checkForUpdates,
    setBooks
  } = useBooksStore()
  
  // Проверка необходимости синхронизации
  const shouldSync = useCallback(() => {
    if (!lastSync) return true
    
    // Синхронизируем каждые 30 минут
    const syncInterval = 30 * 60 * 1000
    return Date.now() - lastSync > syncInterval
  }, [lastSync])
  
  // Автоматическая синхронизация при монтировании
  useEffect(() => {
    const initializeCache = async () => {
      try {
        // Если кэш пустой или устарел, синхронизируем
        if (books.length === 0 || shouldSync()) {
          logger.info('Initializing books cache...')
          await syncWithServer()
        } else {
          // Проверяем обновления в фоне
          checkForUpdates().then(hasUpdates => {
            if (hasUpdates) {
              logger.info('Updates available, syncing...')
              syncWithServer()
            }
          })
        }
      } catch (error) {
        logger.error('Failed to initialize cache:', error)
      }
    }
    
    initializeCache()
  }, [books.length, checkForUpdates, shouldSync, syncWithServer])
  
  // Принудительная синхронизация
  const forceSync = useCallback(async () => {
    try {
      await syncWithServer()
      logger.info('Force sync completed')
    } catch (error) {
      logger.error('Force sync failed:', error)
      throw error
    }
  }, [syncWithServer])
  
  // Статистика кэша
  const cacheStats = useMemo(() => ({
    totalBooks: books.length,
    availableBooks: books.filter(book => book.available).length,
    lastSync: lastSync ? new Date(lastSync).toLocaleString() : 'Never',
    cacheVersion,
    isSyncing
  }), [books, lastSync, cacheVersion, isSyncing])
  
  return {
    // Data
    books,
    getBookById,
    getBooksByCategory,
    getBooksByAgeCategory,
    searchBooks,
    getAvailableBooks,
    getFilteredBooks,
    
    // Cache management
    cacheStats,
    isSyncing,
    lastSync,
    
    // Actions
    syncWithServer,
    forceSync,
    checkForUpdates,
    setBooks
  }
}
