'use client'

import Image from 'next/image'
import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { cn } from '@/lib/cn'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  quality?: number
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  sizes?: string
  onLoad?: () => void
  onError?: () => void
  fallback?: React.ReactNode
}

// Generate blur data URL for placeholder
function generateBlurDataURL(width: number, height: number): string {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  
  if (ctx) {
    const gradient = ctx.createLinearGradient(0, 0, width, height)
    gradient.addColorStop(0, '#f3f4f6')
    gradient.addColorStop(1, '#e5e7eb')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)
  }
  
  return canvas.toDataURL()
}

// WebP support detection
function supportsWebP(): boolean {
  if (typeof window === 'undefined') return false
  
  const canvas = document.createElement('canvas')
  canvas.width = 1
  canvas.height = 1
  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0
}

// AVIF support detection
function supportsAVIF(): boolean {
  if (typeof window === 'undefined') return false
  
  const canvas = document.createElement('canvas')
  canvas.width = 1
  canvas.height = 1
  return canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0
}

export function OptimizedImage({
  src,
  alt,
  width = 300,
  height = 400,
  className,
  priority = false,
  quality = 85,
  placeholder = 'blur',
  blurDataURL,
  sizes,
  onLoad,
  onError,
  fallback
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  // Generate optimized src with format detection
  const optimizedSrc = useMemo(() => {
    if (!src) return src

    // For Cloudinary images, add format optimization
    if (src.includes('cloudinary.com')) {
      const format = supportsAVIF() ? 'f_avif' : supportsWebP() ? 'f_webp' : 'f_auto'
      const qualityParam = `q_auto:${quality}`
      const widthParam = `w_${width}`
      const heightParam = `h_${height}`
      
      // Insert optimization parameters
      if (src.includes('/upload/')) {
        return src.replace('/upload/', `/upload/${format},${qualityParam},${widthParam},${heightParam}/`)
      }
    }

    return src
  }, [src, width, height, quality])

  // Generate blur placeholder
  const blurPlaceholder = useMemo(() => {
    if (blurDataURL) return blurDataURL
    if (placeholder === 'blur') {
      return generateBlurDataURL(width, height)
    }
    return undefined
  }, [blurDataURL, placeholder, width, height])

  // Handle image load
  const handleLoad = useCallback(() => {
    setIsLoading(false)
    setImageLoaded(true)
    onLoad?.()
  }, [onLoad])

  // Handle image error
  const handleError = useCallback(() => {
    setIsLoading(false)
    setHasError(true)
    onError?.()
  }, [onError])

  // Responsive sizes
  const responsiveSizes = sizes || `(max-width: 768px) 100vw, (max-width: 1200px) 50vw, ${width}px`

  if (hasError && fallback) {
    return <>{fallback}</>
  }

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Loading placeholder */}
      {isLoading && (
        <div 
          className="absolute inset-0 bg-gray-200 animate-pulse"
          style={{ width, height }}
        />
      )}
      
      {/* Error state */}
      {hasError && !fallback && (
        <div 
          className="flex items-center justify-center bg-gray-100 text-gray-500"
          style={{ width, height }}
        >
          <span className="text-sm">Помилка завантаження</span>
        </div>
      )}
      
      {/* Optimized image */}
    <Image
      src={optimizedSrc}
      alt={alt}
      width={width}
      height={height}
        className={cn(
          'transition-opacity duration-300',
          imageLoaded ? 'opacity-100' : 'opacity-0'
        )}
      priority={priority}
        quality={quality}
      placeholder={placeholder}
        blurDataURL={blurPlaceholder}
        sizes={responsiveSizes}
        onLoad={handleLoad}
        onError={handleError}
        loading={priority ? 'eager' : 'lazy'}
      />
    </div>
  )
}

// Hook for image optimization
export function useImageOptimization() {
  const [webpSupported, setWebpSupported] = useState(false)
  const [avifSupported, setAvifSupported] = useState(false)

  useState(() => {
    setWebpSupported(supportsWebP())
    setAvifSupported(supportsAVIF())
  })

  const getOptimalFormat = useCallback(() => {
    if (avifSupported) return 'avif'
    if (webpSupported) return 'webp'
    return 'jpeg'
  }, [webpSupported, avifSupported])

  const getOptimalQuality = useCallback((originalQuality = 85) => {
    // Adjust quality based on format support
    if (avifSupported) return Math.min(originalQuality + 10, 100)
    if (webpSupported) return originalQuality
    return Math.max(originalQuality - 5, 60)
  }, [webpSupported, avifSupported])

  return {
    webpSupported,
    avifSupported,
    getOptimalFormat,
    getOptimalQuality
  }
}

// Preload critical images
export function preloadImage(src: string, as = 'image') {
  if (typeof window !== 'undefined') {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.href = src
    link.as = as
    document.head.appendChild(link)
  }
}

// Lazy load images with intersection observer
export function useLazyImage(src: string, options: IntersectionObserverInit = {}) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1, ...options }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => observer.disconnect()
  }, [options])

  return { imgRef, isLoaded, isInView, setIsLoaded }
}