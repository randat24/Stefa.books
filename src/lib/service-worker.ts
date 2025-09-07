/**
 * Service Worker registration and management
 */

import { logger } from './logger'

interface ServiceWorkerConfig {
  enabled: boolean
  updateInterval: number
  onUpdate?: (registration: ServiceWorkerRegistration) => void
  onOffline?: () => void
  onOnline?: () => void
}

class ServiceWorkerManager {
  private config: ServiceWorkerConfig
  private registration: ServiceWorkerRegistration | null = null
  private updateCheckInterval: NodeJS.Timeout | null = null

  constructor(config: ServiceWorkerConfig) {
    this.config = config
  }

  // Register service worker
  async register(): Promise<boolean> {
    if (!this.config.enabled) {
      logger.info('Service Worker disabled by config')
      return false
    }

    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      logger.warn('Service Worker not supported')
      return false
    }

    try {
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      })

      logger.info('Service Worker registered successfully', {
        scope: this.registration.scope,
        state: this.registration.active?.state
      })

      // Set up event listeners
      this.setupEventListeners()

      // Start update checking
      this.startUpdateChecking()

      return true
    } catch (error) {
      logger.error('Service Worker registration failed:', error)
      return false
    }
  }

  // Set up event listeners
  private setupEventListeners() {
    if (!this.registration) return

    // Handle service worker updates
    this.registration.addEventListener('updatefound', () => {
      const newWorker = this.registration?.installing
      if (!newWorker) return

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          logger.info('New Service Worker available')
          this.config.onUpdate?.(this.registration!)
        }
      })
    })

    // Handle controller change
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      logger.info('Service Worker controller changed')
      window.location.reload()
    })

    // Handle online/offline events
    window.addEventListener('online', () => {
      logger.info('Connection restored')
      this.config.onOnline?.()
    })

    window.addEventListener('offline', () => {
      logger.warn('Connection lost')
      this.config.onOffline?.()
    })

    // Handle service worker messages
    navigator.serviceWorker.addEventListener('message', (event) => {
      this.handleMessage(event.data)
    })
  }

  // Handle messages from service worker
  private handleMessage(data: any) {
    switch (data.type) {
      case 'CACHE_UPDATED':
        logger.info('Cache updated:', data.payload)
        break
      case 'CACHE_ERROR':
        logger.error('Cache error:', data.payload)
        break
      case 'OFFLINE_ACTION_QUEUED':
        logger.info('Offline action queued:', data.payload)
        break
      default:
        logger.debug('Unknown message from Service Worker:', data)
    }
  }

  // Start checking for updates
  private startUpdateChecking() {
    if (this.updateCheckInterval) {
      clearInterval(this.updateCheckInterval)
    }

    this.updateCheckInterval = setInterval(() => {
      this.checkForUpdates()
    }, this.config.updateInterval)
  }

  // Check for service worker updates
  async checkForUpdates(): Promise<boolean> {
    if (!this.registration) return false

    try {
      await this.registration.update()
      return true
    } catch (error) {
      logger.error('Failed to check for updates:', error)
      return false
    }
  }

  // Send message to service worker
  async sendMessage(message: any): Promise<void> {
    if (!navigator.serviceWorker.controller) {
      logger.warn('No service worker controller available')
      return
    }

    try {
      navigator.serviceWorker.controller.postMessage(message)
    } catch (error) {
      logger.error('Failed to send message to service worker:', error)
    }
  }

  // Get cache status
  async getCacheStatus(): Promise<{
    caches: string[]
    totalSize: number
    entries: number
  }> {
    const cacheNames = await (globalThis as any).caches.keys()
    let totalSize = 0
    let totalEntries = 0

    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName)
      const keys = await cache.keys()
      totalEntries += keys.length

      // Estimate size (rough calculation)
      for (const key of keys) {
        const response = await cache.match(key)
        if (response) {
          const contentLength = response.headers.get('content-length')
          if (contentLength) {
            totalSize += parseInt(contentLength, 10)
          }
        }
      }
    }

    return {
      caches: cacheNames,
      totalSize,
      entries: totalEntries
    }
  }

  // Clear all caches
  async clearAllCaches(): Promise<void> {
    const cacheNames = await caches.keys()
    await Promise.all(
      cacheNames.map(cacheName => caches.delete(cacheName))
    )
    logger.info('All caches cleared')
  }

  // Unregister service worker
  async unregister(): Promise<boolean> {
    if (!this.registration) return false

    try {
      const result = await this.registration.unregister()
      this.registration = null

      if (this.updateCheckInterval) {
        clearInterval(this.updateCheckInterval)
        this.updateCheckInterval = null
      }

      logger.info('Service Worker unregistered')
      return result
    } catch (error) {
      logger.error('Failed to unregister service worker:', error)
      return false
    }
  }

  // Get registration info
  getRegistrationInfo() {
    return {
      registered: !!this.registration,
      scope: this.registration?.scope,
      state: this.registration?.active?.state,
      waiting: !!this.registration?.waiting,
      installing: !!this.registration?.installing
    }
  }
}

// Global instance
let serviceWorkerManager: ServiceWorkerManager | null = null

// Initialize service worker
export function initServiceWorker(config: Partial<ServiceWorkerConfig> = {}) {
  const defaultConfig: ServiceWorkerConfig = {
    enabled: process.env.NODE_ENV === 'production',
    updateInterval: 60000, // 1 minute
    onUpdate: (registration) => {
      logger.info('Service Worker update available')
      // You can show a notification to the user here
    },
    onOffline: () => {
      logger.warn('App is now offline')
    },
    onOnline: () => {
      logger.info('App is now online')
    }
  }

  const finalConfig = { ...defaultConfig, ...config }

  if (!serviceWorkerManager) {
    serviceWorkerManager = new ServiceWorkerManager(finalConfig)
  }

  return serviceWorkerManager.register()
}

// Get service worker manager
export function getServiceWorkerManager(): ServiceWorkerManager | null {
  return serviceWorkerManager
}

// Utility functions
export async function isServiceWorkerSupported(): Promise<boolean> {
  return typeof window !== 'undefined' && 'serviceWorker' in navigator
}

export async function isOnline(): Promise<boolean> {
  return typeof window !== 'undefined' ? navigator.onLine : true
}

export async function waitForOnline(): Promise<void> {
  if (typeof window === 'undefined') return

  if (navigator.onLine) return

  return new Promise((resolve) => {
    const handleOnline = () => {
      window.removeEventListener('online', handleOnline)
      resolve()
    }
    window.addEventListener('online', handleOnline)
  })
}

// Export types
export type { ServiceWorkerConfig }
