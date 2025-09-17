'use client'

import { useServiceWorker } from '@/lib/hooks/useServiceWorker'
import { useState, useEffect } from 'react'
import { RefreshCw, X } from 'lucide-react'

export default function UpdateNotification() {
  const { updateAvailable, updateServiceWorker, isSupported } = useServiceWorker()
  const [isVisible, setIsVisible] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    if (updateAvailable && isSupported) {
      setIsVisible(true)
    }
  }, [updateAvailable, isSupported])

  const handleUpdate = async () => {
    setIsUpdating(true)
    try {
      await updateServiceWorker()
      // Service Worker автоматически перезагрузит страницу
    } catch (error) {
      console.error('Ошибка обновления:', error)
      setIsUpdating(false)
    }
  }

  const handleDismiss = () => {
    setIsVisible(false)
  }

  if (!isVisible) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 max-w-sm">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
            Доступно обновление
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
            Новая версия сайта готова к загрузке
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleUpdate}
              disabled={isUpdating}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-md transition-colors"
            >
              <RefreshCw className={`h-3 w-3 ${isUpdating ? 'animate-spin' : ''}`} />
              {isUpdating ? 'Обновление...' : 'Обновить'}
            </button>
            <button
              onClick={handleDismiss}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <X className="h-3 w-3" />
              Позже
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
