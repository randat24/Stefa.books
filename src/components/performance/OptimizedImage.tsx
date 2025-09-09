'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Loader2, AlertCircle } from 'lucide-react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
  loading?: 'lazy' | 'eager';
  sizes?: string;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  onLoad?: () => void;
  onError?: () => void;
  fallbackSrc?: string;
  showLoadingState?: boolean;
  showErrorState?: boolean;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  objectPosition?: string;
}

/**
 * Оптимизированное изображение с поддержкой различных состояний
 */
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  loading = 'lazy',
  sizes,
  quality = 75,
  placeholder = 'empty',
  blurDataURL,
  onLoad,
  onError,
  fallbackSrc = '/images/placeholder.svg',
  showLoadingState = true,
  showErrorState = true,
  objectFit = 'cover',
  objectPosition = 'center'
}: OptimizedImageProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSrc, setCurrentSrc] = useState(src);
  const imageRef = useRef<HTMLImageElement>(null);

  // Обработка ошибки загрузки
  const handleError = () => {
    if (!imageError && fallbackSrc) {
      setImageError(true);
      setCurrentSrc(fallbackSrc);
      onError?.();
    } else {
      setImageError(true);
      onError?.();
    }
  };

  // Обработка успешной загрузки
  const handleLoad = () => {
    setImageLoaded(true);
    setIsLoading(false);
    onLoad?.();
  };

  // Сброс состояния при изменении src
  useEffect(() => {
    setImageError(false);
    setImageLoaded(false);
    setIsLoading(true);
    setCurrentSrc(src);
  }, [src]);

  // Генерация blur placeholder
  const generateBlurDataURL = (w: number, h: number) => {
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#f3f4f6';
      ctx.fillRect(0, 0, w, h);
    }
    return canvas.toDataURL();
  };

  const defaultBlurDataURL = blurDataURL || generateBlurDataURL(width, height);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Основное изображение */}
      <Image
        ref={imageRef}
        src={currentSrc}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        loading={loading}
        sizes={sizes}
        quality={quality}
        placeholder={placeholder}
        blurDataURL={placeholder === 'blur' ? defaultBlurDataURL : undefined}
        onLoad={handleLoad}
        onError={handleError}
        className={`
          transition-opacity duration-300
          ${imageLoaded ? 'opacity-100' : 'opacity-0'}
          ${imageError ? 'grayscale' : ''}
        `}
        style={{
          objectFit,
          objectPosition
        }}
      />

      {/* Состояние загрузки */}
      {isLoading && showLoadingState && (
        <div className="absolute inset-0 bg-neutral-200 animate-pulse flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      )}

      {/* Состояние ошибки */}
      {imageError && showErrorState && (
        <div className="absolute inset-0 bg-neutral-100 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
            <p className="text-body-sm text-neutral-500">Зображення недоступне</p>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Компонент для адаптивных изображений
 */
interface ResponsiveImageProps {
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: string;
  breakpoints?: {
    mobile: { width: number; height: number };
    tablet: { width: number; height: number };
    desktop: { width: number; height: number };
  };
  quality?: number;
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
  fallbackSrc?: string;
}

export function ResponsiveImage({
  src,
  alt,
  className = '',
  aspectRatio = '16/9',
  breakpoints = {
    mobile: { width: 400, height: 300 },
    tablet: { width: 800, height: 600 },
    desktop: { width: 1200, height: 900 }
  },
  quality = 75,
  priority = false,
  onLoad,
  onError,
  fallbackSrc
}: ResponsiveImageProps) {
  const [currentBreakpoint, setCurrentBreakpoint] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  useEffect(() => {
    const updateBreakpoint = () => {
      if (window.innerWidth < 768) {
        setCurrentBreakpoint('mobile');
      } else if (window.innerWidth < 1024) {
        setCurrentBreakpoint('tablet');
      } else {
        setCurrentBreakpoint('desktop');
      }
    };

    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);

  const currentSize = breakpoints[currentBreakpoint];

  return (
    <div 
      className={`relative ${className}`}
      style={{ aspectRatio }}
    >
      <OptimizedImage
        src={src}
        alt={alt}
        width={currentSize.width}
        height={currentSize.height}
        className="w-full h-full"
        quality={quality}
        priority={priority}
        onLoad={onLoad}
        onError={onError}
        fallbackSrc={fallbackSrc}
        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
      />
    </div>
  );
}

/**
 * Компонент для галереи изображений с оптимизацией
 */
interface OptimizedGalleryProps {
  images: Array<{
    src: string;
    alt: string;
    caption?: string;
    width: number;
    height: number;
  }>;
  currentIndex: number;
  onIndexChange: (index: number) => void;
  className?: string;
  showThumbnails?: boolean;
  quality?: number;
  priority?: boolean;
}

export function OptimizedGallery({
  images,
  currentIndex,
  onIndexChange,
  className = '',
  showThumbnails = true,
  quality = 75,
  priority = false
}: OptimizedGalleryProps) {
  const currentImage = images[currentIndex];

  const goToPrevious = () => {
    const newIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1;
    onIndexChange(newIndex);
  };

  const goToNext = () => {
    const newIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0;
    onIndexChange(newIndex);
  };

  const goToImage = (index: number) => {
    onIndexChange(index);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Основное изображение */}
      <div className="relative">
        <OptimizedImage
          src={currentImage.src}
          alt={currentImage.alt}
          width={currentImage.width}
          height={currentImage.height}
          className="w-full h-auto rounded-lg"
          quality={quality}
          priority={priority}
          showLoadingState={true}
          showErrorState={true}
        />
        
        {/* Навигация */}
        {images.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="
                absolute left-4 top-1/2 -translate-y-1/2
                p-2 bg-neutral-0/80 hover:bg-neutral-0 rounded-2xl
                focus:outline-none focus:ring-2 focus:ring-accent
                transition-colors
              "
              aria-label="Попереднє зображення"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <button
              onClick={goToNext}
              className="
                absolute right-4 top-1/2 -translate-y-1/2
                p-2 bg-neutral-0/80 hover:bg-neutral-0 rounded-2xl
                focus:outline-none focus:ring-2 focus:ring-accent
                transition-colors
              "
              aria-label="Наступне зображення"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </div>
      
      {/* Миниатюры */}
      {showThumbnails && images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => goToImage(index)}
              className={`
                flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden
                focus:outline-none focus:ring-2 focus:ring-accent
                transition-all duration-200
                ${index === currentIndex 
                  ? 'ring-2 ring-accent scale-105' 
                  : 'hover:scale-105'
                }
              `}
              aria-label={`Переглянути зображення ${index + 1}: ${image.alt}`}
            >
              <OptimizedImage
                src={image.src}
                alt={image.alt}
                width={80}
                height={80}
                className="w-full h-full"
                quality={60}
                priority={index < 3} // Предзагружаем первые 3 миниатюры
              />
            </button>
          ))}
        </div>
      )}
      
      {/* Счетчик изображений */}
      {images.length > 1 && (
        <div className="text-center text-body-sm text-neutral-600">
          {currentIndex + 1} з {images.length}
        </div>
      )}
    </div>
  );
}
