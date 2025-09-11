'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { RefreshCw, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { imageCache, cacheUtils } from '@/lib/cache-manager'

interface CachedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  quality?: number
  sizes?: string
  fallback?: string
  onLoad?: () => void
  onError?: () => void
  showRefreshButton?: boolean
  enableCache?: boolean
}

export function CachedImage({
  src,
  alt,
  width = 300,
  height = 400,
  className = '',
  priority = false,
  quality = 80,
  sizes,
  fallback = '/images/book-placeholder.svg',
  onLoad,
  onError,
  showRefreshButton = false,
  enableCache = true
}: CachedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [optimizedSrc, setOptimizedSrc] = useState(src)

  // Максимальное количество попыток загрузки
  const MAX_RETRIES = 3

  // Генерируем ключ кеша для изображения
  const cacheKey = `image_${src}_${width}_${height}`

  // Оптимизируем URL для Cloudinary
  const getOptimizedUrl = useCallback((originalSrc: string, forceRefresh = false) => {
    if (!originalSrc) return fallback

    // Если это Cloudinary URL, добавляем оптимизации
    if (originalSrc.includes('cloudinary.com')) {
      const baseUrl = originalSrc.split('/upload/')[0]
      const imagePath = originalSrc.split('/upload/')[1]
      
      // Параметры оптимизации
      const optimizations = [
        'f_auto',           // Автоматический формат (WebP/AVIF)
        'q_auto:good',      // Автоматическое качество
        'fl_progressive',   // Progressive loading
        'dpr_auto',         // Автоматический DPR для Retina
        `w_${width}`,       // Ширина
        `h_${height}`,      // Высота
        'c_fit'             // Сохранение пропорций
      ].join(',')

      // Добавляем timestamp для принудительного обновления
      const timestamp = forceRefresh ? `_t=${Date.now()}` : ''
      const separator = timestamp ? '&' : '?'
      
      return `${baseUrl}/upload/${optimizations}/${imagePath}${separator}${timestamp}`
    }

    // Для других URL добавляем timestamp если нужно обновление
    if (forceRefresh) {
      const url = new URL(originalSrc)
      url.searchParams.set('_t', Date.now().toString())
      return url.toString()
    }

    return originalSrc
  }, [width, height, fallback])

  // Загружаем изображение с кешированием
  const loadImage = useCallback(async (imageSrc: string, forceRefresh = false) => {
    if (!enableCache) {
      setOptimizedSrc(getOptimizedUrl(imageSrc, forceRefresh))
      return
    }

    // Проверяем кеш
    const cachedData = imageCache.get<{ src: string; loaded: boolean }>(cacheKey)
    
    if (cachedData && !forceRefresh) {
      setOptimizedSrc(cachedData.src)
      setIsLoading(false)
      setHasError(false)
      return
    }

    // Генерируем оптимизированный URL
    const optimizedUrl = getOptimizedUrl(imageSrc, forceRefresh)
    setOptimizedSrc(optimizedUrl)

    // Сохраняем в кеш
    imageCache.set(cacheKey, { src: optimizedUrl, loaded: true })
  }, [cacheKey, enableCache, getOptimizedUrl])

  // Обработчики событий
  const handleLoad = useCallback(() => {
    setIsLoading(false)
    setHasError(false)
    setRetryCount(0)
    onLoad?.()
  }, [onLoad])

  const handleError = useCallback(() => {
    console.warn(`Failed to load image: ${src} (attempt ${retryCount + 1})`)
    
    if (retryCount < MAX_RETRIES) {
      // Повторная попытка через небольшую задержку
      setTimeout(() => {
        setRetryCount(prev => prev + 1)
        loadImage(src, true) // Принудительное обновление
      }, 1000 * (retryCount + 1)) // Увеличиваем задержку с каждой попыткой
    } else {
      setIsLoading(false)
      setHasError(true)
      onError?.()
    }
  }, [src, retryCount, loadImage, onError])

  // Принудительное обновление изображения
  const handleRefresh = useCallback(() => {
    setIsLoading(true)
    setHasError(false)
    setRetryCount(0)
    
    // Очищаем кеш для этого изображения
    imageCache.delete(cacheKey)
    
    // Загружаем заново
    loadImage(src, true)
  }, [src, cacheKey, loadImage])

  // Загружаем изображение при изменении src
  useEffect(() => {
    if (src) {
      setIsLoading(true)
      setHasError(false)
      setRetryCount(0)
      loadImage(src)
    }
  }, [src, loadImage])

  // Если есть ошибка, показываем fallback
  if (hasError) {
    return (
      <div className={`relative bg-neutral-100 flex items-center justify-center ${className}`} style={{ width, height }}>
        <div className="text-center p-4">
          <AlertCircle className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
          <p className="text-sm text-neutral-500 mb-2">Не удалось загрузить изображение</p>
          {showRefreshButton && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleRefresh}
              className="text-xs"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Обновить
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      {/* Основное изображение */}
      <Image
        src={hasError ? fallback : optimizedSrc}
        alt={alt}
        fill
        priority={priority}
        quality={quality}
        sizes={sizes || `(max-width: 768px) 100vw, ${width}px`}
        className="object-cover"
        onLoad={handleLoad}
        onError={handleError}
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
      />
      
      {/* Индикатор загрузки */}
      {isLoading && !hasError && (
        <div className="absolute inset-0 bg-neutral-100 flex items-center justify-center">
          <div className="animate-pulse bg-neutral-200 w-full h-full rounded" />
        </div>
      )}
      
      {/* Кнопка обновления при наведении */}
      {showRefreshButton && !isLoading && !hasError && (
        <div className="absolute top-2 right-2 opacity-0 hover:opacity-100 transition-opacity">
          <Button
            size="sm"
            variant="outline"
            onClick={handleRefresh}
            className="bg-white/90 hover:bg-white shadow-md"
          >
            <RefreshCw className="w-3 h-3" />
          </Button>
        </div>
      )}
    </div>
  )
}

export default CachedImage
