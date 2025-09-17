'use client'

import { useState } from 'react'
import { RefreshCw, Trash2 } from 'lucide-react'

export default function CacheClearButton() {
  const [isClearing, setIsClearing] = useState(false)

  const clearCache = async () => {
    setIsClearing(true)
    
    try {
      // Очищаем Service Worker кеш
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration()
        if (registration) {
          // Удаляем все кеши
          const cacheNames = await caches.keys()
          await Promise.all(
            cacheNames.map(cacheName => caches.delete(cacheName))
          )
          
          // Обновляем Service Worker
          await registration.update()
        }
      }

      // Очищаем localStorage и sessionStorage
      localStorage.clear()
      sessionStorage.clear()

      // Очищаем IndexedDB (если используется)
      if ('indexedDB' in window) {
        // Закрываем все открытые соединения
        if (window.indexedDB.databases) {
          const databases = await window.indexedDB.databases()
          await Promise.all(
            databases.map(db => {
              if (db.name) {
                return new Promise<void>((resolve) => {
                  const deleteReq = window.indexedDB.deleteDatabase(db.name)
                  deleteReq.onsuccess = () => resolve()
                  deleteReq.onerror = () => resolve()
                  deleteReq.onblocked = () => resolve()
                })
              }
            })
          )
        }
      }

      // Принудительно перезагружаем страницу
      window.location.reload()
      
    } catch (error) {
      console.error('Ошибка очистки кеша:', error)
      // В любом случае перезагружаем страницу
      window.location.reload()
    } finally {
      setIsClearing(false)
    }
  }

  return (
    <button
      onClick={clearCache}
      disabled={isClearing}
      className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      title="Очистить кеш браузера и перезагрузить страницу"
    >
      {isClearing ? (
        <>
          <RefreshCw className="h-4 w-4 animate-spin" />
          Очистка...
        </>
      ) : (
        <>
          <Trash2 className="h-4 w-4" />
          Очистить кеш
        </>
      )}
    </button>
  )
}
