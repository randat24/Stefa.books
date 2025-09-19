'use client'

import { useState, useEffect } from 'react'
import { RefreshCw, X } from 'lucide-react'

export default function UpdateNotification() {
  const [isVisible, setIsVisible] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [newVersion, setNewVersion] = useState<string>('')

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Слушаем сообщения от Service Worker о новой версии
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data?.type === 'NEW_VERSION_AVAILABLE') {
          console.log('🔄 Обнаружена новая версия:', event.data.buildId)
          setNewVersion(event.data.buildId)
          setIsVisible(true)
        }
      })

      // Проверяем версию при загрузке компонента
      navigator.serviceWorker.ready.then((registration) => {
        if (registration.active) {
          const channel = new MessageChannel()
          channel.port1.onmessage = (event) => {
            const currentVersion = process.env.NEXT_PUBLIC_BUILD_ID
            const swVersion = event.data.version

            console.log('📋 Проверка версий - Текущая:', currentVersion, 'SW:', swVersion)

            if (currentVersion !== swVersion) {
              setNewVersion(swVersion)
              setIsVisible(true)
            }
          }

          registration.active.postMessage(
            { type: 'GET_VERSION' },
            [channel.port2]
          )
        }
      })
    }
  }, [])

  const handleUpdate = async () => {
    setIsUpdating(true)
    console.log('🔄 Начинаем принудительное обновление...')

    try {
      if ('serviceWorker' in navigator) {
        // Сначала очищаем все кеши через Service Worker
        const registration = await navigator.serviceWorker.ready
        if (registration.active) {
          const channel = new MessageChannel()
          channel.port1.onmessage = (event) => {
            if (event.data.success) {
              console.log('✅ Service Worker кеши очищены')
              // Дополнительно очищаем browser cache
              if ('caches' in window) {
                caches.keys().then(names => {
                  names.forEach(name => {
                    console.log('🗑️ Удаляем кеш:', name)
                    caches.delete(name)
                  })
                })
              }

              // Принудительная перезагрузка с очисткой кеша
              setTimeout(() => {
                console.log('🔄 Принудительная перезагрузка страницы...')
                window.location.reload()
              }, 500)
            }
          }

          registration.active.postMessage(
            { type: 'CLEAR_ALL_CACHE' },
            [channel.port2]
          )
        }
      } else {
        // Если Service Worker не поддерживается
        console.log('🔄 Service Worker не поддерживается, обычная перезагрузка')
        window.location.reload()
      }
    } catch (error) {
      console.error('❌ Ошибка при обновлении:', error)
      // В случае ошибки просто перезагружаем страницу
      window.location.reload()
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
