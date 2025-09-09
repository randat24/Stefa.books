'use client'

import Image from 'next/image'
import React, { useState, useCallback, useMemo } from 'react'
import { cn } from '@/lib/cn'

interface CloudinaryImageProps {
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
  transformations?: {
    crop?: 'fill' | 'fit' | 'scale' | 'crop' | 'thumb'
    gravity?: 'auto' | 'face' | 'center' | 'north' | 'south' | 'east' | 'west'
    effect?: 'blur' | 'sharpen' | 'grayscale' | 'sepia'
    radius?: number
    border?: string
  }
}

// Cloudinary optimization parameters
const CLOUDINARY_OPTIMIZATIONS = {
  format: 'f_auto', // Auto format selection (WebP, AVIF, etc.)
  quality: 'q_auto', // Auto quality
  dpr: 'dpr_auto', // Device pixel ratio
  responsive: 'w_auto', // Responsive width
  fetch: 'c_fill,g_auto' // Smart cropping
}

// Generate optimized Cloudinary URL
function generateCloudinaryURL(
  src: string, 
  width: number, 
  height: number, 
  quality: number = 85,
  transformations: CloudinaryImageProps['transformations'] = {}
): string {
  if (!src.includes('cloudinary.com')) {
    return src
  }

  const baseURL = src.split('/upload/')[0] + '/upload/'
  const imagePath = src.split('/upload/')[1]

  // Build transformation string
  const transforms = [
    CLOUDINARY_OPTIMIZATIONS.format,
    `q_auto:${quality}`,
    `w_${width}`,
    `h_${height}`,
    CLOUDINARY_OPTIMIZATIONS.dpr,
    CLOUDINARY_OPTIMIZATIONS.fetch
  ]

  // Add custom transformations
  if (transformations.crop) {
    transforms.push(`c_${transformations.crop}`)
  }
  if (transformations.gravity) {
    transforms.push(`g_${transformations.gravity}`)
  }
  if (transformations.effect) {
    transforms.push(`e_${transformations.effect}`)
  }
  if (transformations.radius) {
    transforms.push(`r_${transformations.radius}`)
  }
  if (transformations.border) {
    transforms.push(`bo_${transformations.border}`)
  }

  return `${baseURL}${transforms.join(',')}/${imagePath}`
}

// Generate responsive sizes for different breakpoints
function generateResponsiveSizes(width: number, height: number): string {
  return `(max-width: 640px) ${Math.min(width, 640)}px, (max-width: 768px) ${Math.min(width, 768)}px, (max-width: 1024px) ${Math.min(width, 1024)}px, ${width}px`
}

// Generate blur placeholder
function generateBlurPlaceholder(width: number, height: number): string {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  
  if (ctx) {
    // Create a subtle gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height)
    gradient.addColorStop(0, '#f3f4f6')
    gradient.addColorStop(0.5, '#e5e7eb')
    gradient.addColorStop(1, '#d1d5db')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)
  }
  
  return canvas.toDataURL('image/jpeg', 0.1)
}

export function CloudinaryImage({
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
  fallback,
  transformations = {}
}: CloudinaryImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  // Generate optimized URL
  const optimizedSrc = useMemo(() => {
    return generateCloudinaryURL(src, width, height, quality, transformations)
  }, [src, width, height, quality, transformations])

  // Generate blur placeholder
  const blurPlaceholder = useMemo(() => {
    if (blurDataURL) return blurDataURL
    if (placeholder === 'blur') {
      return generateBlurPlaceholder(width, height)
    }
    return undefined
  }, [blurDataURL, placeholder, width, height])

  // Generate responsive sizes
  const responsiveSizes = useMemo(() => {
    return sizes || generateResponsiveSizes(width, height)
  }, [sizes, width, height])

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

  // Error state
  if (hasError && fallback) {
    return <>{fallback}</>
  }

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Loading placeholder */}
      {isLoading && (
        <div 
          className="absolute inset-0 bg-neutral-200 animate-pulse"
          style={{ width, height }}
        />
      )}
      
      {/* Error state */}
      {hasError && !fallback && (
        <div 
          className="flex items-center justify-center bg-neutral-100 text-neutral-500"
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

// Hook for Cloudinary optimization
export function useCloudinaryOptimization() {
  const [webpSupported, setWebpSupported] = useState(false)
  const [avifSupported, setAvifSupported] = useState(false)

  useState(() => {
    // Check WebP support
    const webpCanvas = document.createElement('canvas')
    webpCanvas.width = 1
    webpCanvas.height = 1
    setWebpSupported(webpCanvas.toDataURL('image/webp').indexOf('data:image/webp') === 0)

    // Check AVIF support
    const avifCanvas = document.createElement('canvas')
    avifCanvas.width = 1
    avifCanvas.height = 1
    setAvifSupported(avifCanvas.toDataURL('image/avif').indexOf('data:image/avif') === 0)
  })

  const getOptimalQuality = useCallback((originalQuality = 85) => {
    // Adjust quality based on format support
    if (avifSupported) return Math.min(originalQuality + 10, 100)
    if (webpSupported) return originalQuality
    return Math.max(originalQuality - 5, 60)
  }, [webpSupported, avifSupported])

  const getOptimalTransformations = useCallback(() => {
    return {
      crop: 'fill' as const,
      gravity: 'auto' as const,
      effect: undefined,
      radius: undefined,
      border: undefined
    }
  }, [])

  return {
    webpSupported,
    avifSupported,
    getOptimalQuality,
    getOptimalTransformations
  }
}

// Preload critical images
export function preloadCloudinaryImage(src: string, width: number, height: number) {
  if (typeof window !== 'undefined') {
    const optimizedSrc = generateCloudinaryURL(src, width, height, 85)
    const link = document.createElement('link')
    link.rel = 'preload'
    link.href = optimizedSrc
    link.as = 'image'
    document.head.appendChild(link)
  }
}

// Lazy load with intersection observer
export function useCloudinaryLazyLoad(src: string, options: IntersectionObserverInit = {}) {
  const [isLoaded, setIsLoaded] = React.useState(false)
  const [isInView, setIsInView] = React.useState(false)
  const imgRef = React.useRef<HTMLImageElement>(null)

  React.useEffect(() => {
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
