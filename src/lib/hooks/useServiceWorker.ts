'use client'

import { useEffect, useState } from 'react'

interface ServiceWorkerState {
  isSupported: boolean
  isInstalled: boolean
  isActive: boolean
  version: string | null
  updateAvailable: boolean
}

export const useServiceWorker = () => {
  const [swState, setSwState] = useState<ServiceWorkerState>({
    isSupported: false,
    isInstalled: false,
    isActive: false,
    version: null,
    updateAvailable: false
  })

  useEffect(() => {
    // Проверяем поддержку Service Worker
    if (!('serviceWorker' in navigator)) {
      return
    }

    setSwState(prev => ({ ...prev, isSupported: true }))

    // Регистрируем Service Worker
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('Service Worker зарегистрирован:', registration)
        setSwState(prev => ({ ...prev, isInstalled: true }))

        // Проверяем, активен ли Service Worker
        if (registration.active) {
          setSwState(prev => ({ ...prev, isActive: true }))
        }

        // Слушаем обновления
        registration.addEventListener('updatefound', () => {
          console.log('Найдено обновление Service Worker')
          setSwState(prev => ({ ...prev, updateAvailable: true }))

          const newWorker = registration.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  // Есть новый Service Worker
                  console.log('Новый Service Worker готов к активации')
                  setSwState(prev => ({ ...prev, updateAvailable: true }))
                } else {
                  // Первая установка
                  console.log('Service Worker установлен впервые')
                  setSwState(prev => ({ ...prev, isActive: true, updateAvailable: false }))
                }
              }
            })
          }
        })

        // Получаем версию
        if (registration.active) {
          const messageChannel = new MessageChannel()
          messageChannel.port1.onmessage = (event) => {
            if (event.data.version) {
              setSwState(prev => ({ ...prev, version: event.data.version }))
            }
          }
          registration.active.postMessage({ type: 'GET_VERSION' }, [messageChannel.port2])
        }
      })
      .catch((error) => {
        console.error('Ошибка регистрации Service Worker:', error)
      })

    // Слушаем изменения контроллера
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('Service Worker контроллер изменился')
      window.location.reload()
    })

    // Слушаем сообщения от Service Worker
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data.type === 'UPDATE_AVAILABLE') {
        setSwState(prev => ({ ...prev, updateAvailable: true }))
      }
    })

  }, [])

  const updateServiceWorker = () => {
    if (!('serviceWorker' in navigator)) return

    navigator.serviceWorker.getRegistration().then((registration) => {
      if (registration?.waiting) {
        // Сообщаем ожидающему Service Worker активироваться
        registration.waiting.postMessage({ type: 'SKIP_WAITING' })
      }
    })
  }

  const clearCache = async () => {
    if (!('serviceWorker' in navigator)) return

    try {
      // Очищаем все кеши
      const cacheNames = await caches.keys()
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      )

      // Перезагружаем Service Worker
      const registration = await navigator.serviceWorker.getRegistration()
      if (registration) {
        await registration.unregister()
        window.location.reload()
      }
    } catch (error) {
      console.error('Ошибка очистки кеша:', error)
    }
  }

  return {
    ...swState,
    updateServiceWorker,
    clearCache
  }
}
