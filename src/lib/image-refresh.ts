/**
 * Утилиты для принудительного обновления изображений
 * Решает проблемы с кешированием обложек книг
 */

import { cacheUtils } from './cache-manager'

/**
 * Принудительно обновляет изображение, обходя все кеши
 */
export async function refreshImage(imageUrl: string): Promise<boolean> {
  try {
    // Очищаем кеш для этого изображения
    cacheUtils.refreshImage(imageUrl)
    
    // Очищаем кеш браузера
    if (typeof window !== 'undefined') {
      // Создаем новый URL с timestamp
      const url = new URL(imageUrl)
      url.searchParams.set('_t', Date.now().toString())
      
      // Предзагружаем изображение
      const img = new Image()
      img.src = url.toString()
      
      return new Promise((resolve) => {
        img.onload = () => resolve(true)
        img.onerror = () => resolve(false)
        
        // Таймаут на случай, если изображение не загрузится
        setTimeout(() => resolve(false), 10000)
      })
    }
    
    return true
  } catch (error) {
    console.error('Error refreshing image:', error)
    return false
  }
}

/**
 * Обновляет все изображения на странице
 */
export async function refreshAllImages(): Promise<{ success: number; failed: number }> {
  if (typeof window === 'undefined') {
    return { success: 0, failed: 0 }
  }

  const images = Array.from(document.querySelectorAll('img[src*="cloudinary.com"]')) as HTMLImageElement[]
  let success = 0
  let failed = 0

  for (const img of images) {
    const result = await refreshImage(img.src)
    if (result) {
      success++
    } else {
      failed++
    }
  }

  return { success, failed }
}

/**
 * Обновляет изображения книг в каталоге
 */
export async function refreshBookImages(): Promise<{ success: number; failed: number }> {
  if (typeof window === 'undefined') {
    return { success: 0, failed: 0 }
  }

  // Находим все изображения обложек книг
  const bookImages = Array.from(
    document.querySelectorAll('img[alt*="Обкладинка книги"], img[src*="cloudinary.com"]')
  ) as HTMLImageElement[]

  let success = 0
  let failed = 0

  for (const img of bookImages) {
    const result = await refreshImage(img.src)
    if (result) {
      success++
    } else {
      failed++
    }
  }

  return { success, failed }
}

/**
 * Очищает кеш изображений и перезагружает страницу
 */
export function clearImageCacheAndReload(): void {
  if (typeof window === 'undefined') return

  // Очищаем кеш
  cacheUtils.clearImages()
  
  // Очищаем localStorage кеш
  const keys = Object.keys(localStorage)
  keys.forEach(key => {
    if (key.includes('image') || key.includes('cover') || key.includes('cloudinary')) {
      localStorage.removeItem(key)
    }
  })
  
  // Перезагружаем страницу
  window.location.reload()
}

/**
 * Добавляет timestamp к URL изображения для обхода кеша
 */
export function addCacheBuster(url: string): string {
  if (!url) return url
  
  try {
    const urlObj = new URL(url)
    urlObj.searchParams.set('_t', Date.now().toString())
    return urlObj.toString()
  } catch {
    // Если не удается распарсить URL, добавляем timestamp в конец
    const separator = url.includes('?') ? '&' : '?'
    return `${url}${separator}_t=${Date.now()}`
  }
}

/**
 * Проверяет, загружается ли изображение
 */
export function isImageLoading(img: HTMLImageElement): boolean {
  return !img.complete || img.naturalWidth === 0
}

/**
 * Ждет загрузки изображения
 */
export function waitForImageLoad(img: HTMLImageElement, timeout = 10000): Promise<boolean> {
  return new Promise((resolve) => {
    if (!isImageLoading(img)) {
      resolve(true)
      return
    }

    const timeoutId = setTimeout(() => {
      resolve(false)
    }, timeout)

    img.onload = () => {
      clearTimeout(timeoutId)
      resolve(true)
    }

    img.onerror = () => {
      clearTimeout(timeoutId)
      resolve(false)
    }
  })
}

export default {
  refreshImage,
  refreshAllImages,
  refreshBookImages,
  clearImageCacheAndReload,
  addCacheBuster,
  isImageLoading,
  waitForImageLoad
}
