'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useBreakpoint } from './ResponsiveContainer';

interface ResponsiveImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  quality?: number;
  sizes?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  objectPosition?: string;
  fallbackSrc?: string;
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * Адаптивное изображение с автоматическим выбором размера
 */
export function ResponsiveImage({
  src,
  alt,
  className = '',
  priority = false,
  quality = 75,
  sizes,
  objectFit = 'cover',
  objectPosition = 'center',
  fallbackSrc = '/images/placeholder.svg',
  onLoad,
  onError
}: ResponsiveImageProps) {
  const { breakpoint, isMobile, isTablet, isDesktop } = useBreakpoint();
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Определяем размеры изображения в зависимости от breakpoint
  const getImageDimensions = () => {
    if (isMobile) {
      return { width: 400, height: 300 };
    } else if (isTablet) {
      return { width: 600, height: 450 };
    } else {
      return { width: 800, height: 600 };
    }
  };

  // Определяем sizes для оптимизации
  const getSizes = () => {
    if (sizes) return sizes;
    
    if (isMobile) {
      return '100vw';
    } else if (isTablet) {
      return '50vw';
    } else {
      return '33vw';
    }
  };

  const { width, height } = getImageDimensions();
  const currentSrc = imageError ? fallbackSrc : src;

  const handleLoad = () => {
    setImageLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    if (!imageError && fallbackSrc) {
      setImageError(true);
    }
    onError?.();
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image
        src={currentSrc}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        quality={quality}
        sizes={getSizes()}
        className={`
          transition-opacity duration-300
          ${imageLoaded ? 'opacity-100' : 'opacity-0'}
          ${imageError ? 'grayscale' : ''}
        `}
        style={{
          objectFit,
          objectPosition
        }}
        onLoad={handleLoad}
        onError={handleError}
      />
      
      {!imageLoaded && !imageError && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      
      {imageError && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <span className="text-gray-400 text-sm">Зображення недоступне</span>
        </div>
      )}
    </div>
  );
}

/**
 * Адаптивная галерея изображений
 */
interface ResponsiveGalleryProps {
  images: Array<{
    src: string;
    alt: string;
    caption?: string;
  }>;
  currentIndex: number;
  onIndexChange: (index: number) => void;
  className?: string;
  showThumbnails?: boolean;
  showNavigation?: boolean;
}

export function ResponsiveGallery({
  images,
  currentIndex,
  onIndexChange,
  className = '',
  showThumbnails = true,
  showNavigation = true
}: ResponsiveGalleryProps) {
  const { isMobile, isTablet } = useBreakpoint();
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
        <ResponsiveImage
          src={currentImage.src}
          alt={currentImage.alt}
          className="w-full h-auto rounded-lg"
          priority={currentIndex < 3} // Предзагружаем первые 3 изображения
        />
        
        {/* Навигация */}
        {showNavigation && images.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className={`
                absolute left-2 top-1/2 -translate-y-1/2
                p-2 bg-white/80 hover:bg-white rounded-full
                focus:outline-none focus:ring-2 focus:ring-brand-yellow
                transition-colors
                ${isMobile ? 'p-1' : 'p-2'}
              `}
              aria-label="Попереднє зображення"
            >
              <svg className={`${isMobile ? 'w-4 h-4' : 'w-6 h-6'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <button
              onClick={goToNext}
              className={`
                absolute right-2 top-1/2 -translate-y-1/2
                p-2 bg-white/80 hover:bg-white rounded-full
                focus:outline-none focus:ring-2 focus:ring-brand-yellow
                transition-colors
                ${isMobile ? 'p-1' : 'p-2'}
              `}
              aria-label="Наступне зображення"
            >
              <svg className={`${isMobile ? 'w-4 h-4' : 'w-6 h-6'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </div>
      
      {/* Миниатюры */}
      {showThumbnails && images.length > 1 && (
        <div className={`flex gap-2 overflow-x-auto pb-2 ${isMobile ? 'px-2' : ''}`}>
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => goToImage(index)}
              className={`
                flex-shrink-0 rounded-lg overflow-hidden
                focus:outline-none focus:ring-2 focus:ring-brand-yellow
                transition-all duration-200
                ${index === currentIndex 
                  ? 'ring-2 ring-brand-yellow scale-105' 
                  : 'hover:scale-105'
                }
                ${isMobile ? 'w-16 h-16' : 'w-20 h-20'}
              `}
              aria-label={`Переглянути зображення ${index + 1}: ${image.alt}`}
            >
              <ResponsiveImage
                src={image.src}
                alt={image.alt}
                width={isMobile ? 64 : 80}
                height={isMobile ? 64 : 80}
                className="w-full h-full"
                quality={60}
                priority={index < 3}
              />
            </button>
          ))}
        </div>
      )}
      
      {/* Счетчик изображений */}
      {images.length > 1 && (
        <div className={`text-center text-sm text-gray-600 ${isMobile ? 'px-2' : ''}`}>
          {currentIndex + 1} з {images.length}
        </div>
      )}
      
      {/* Подпись */}
      {currentImage.caption && (
        <div className={`text-center text-sm text-gray-600 ${isMobile ? 'px-2' : ''}`}>
          {currentImage.caption}
        </div>
      )}
    </div>
  );
}

/**
 * Адаптивная сетка изображений
 */
interface ResponsiveImageGridProps {
  images: Array<{
    src: string;
    alt: string;
    caption?: string;
    href?: string;
  }>;
  className?: string;
  columns?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: string;
  aspectRatio?: string;
}

export function ResponsiveImageGrid({
  images,
  className = '',
  columns = {
    xs: 1,
    sm: 2,
    md: 3,
    lg: 4,
    xl: 5
  },
  gap = 'gap-4',
  aspectRatio = 'aspect-square'
}: ResponsiveImageGridProps) {
  const { breakpoint } = useBreakpoint();

  const getColumns = () => {
    switch (breakpoint) {
      case 'xs':
        return columns.xs || 1;
      case 'sm':
        return columns.sm || 2;
      case 'md':
        return columns.md || 3;
      case 'lg':
        return columns.lg || 4;
      case 'xl':
        return columns.xl || 5;
      default:
        return columns.xl || 5;
    }
  };

  const getGridClasses = () => {
    const cols = getColumns();
    return `grid grid-cols-${cols} ${gap}`;
  };

  return (
    <div className={`${getGridClasses()} ${className}`}>
      {images.map((image, index) => (
        <div
          key={index}
          className={`relative ${aspectRatio} rounded-lg overflow-hidden group`}
        >
          <ResponsiveImage
            src={image.src}
            alt={image.alt}
            className="w-full h-full"
            objectFit="cover"
          />
          
          {image.caption && (
            <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-2 text-sm opacity-0 group-hover:opacity-100 transition-opacity">
              {image.caption}
            </div>
          )}
          
          {image.href && (
            <a
              href={image.href}
              className="absolute inset-0"
              aria-label={`Переглянути ${image.alt}`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
