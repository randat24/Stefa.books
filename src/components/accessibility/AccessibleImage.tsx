'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';

interface AccessibleImageProps {
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
  showCaption?: boolean;
  caption?: string;
  longDescription?: string;
  decorative?: boolean;
}

/**
 * Доступное изображение с поддержкой fallback и описаний
 */
export function AccessibleImage({
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
  showCaption = false,
  caption,
  longDescription,
  decorative = false
}: AccessibleImageProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showLongDescription, setShowLongDescription] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);

  const handleLoad = () => {
    setImageLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setImageError(true);
    onError?.();
  };

  const toggleLongDescription = () => {
    setShowLongDescription(!showLongDescription);
  };

  const currentSrc = imageError ? fallbackSrc : src;
  const currentAlt = imageError ? 'Зображення недоступне' : alt;

  return (
    <figure className={`inline-block ${className}`}>
      <div className="relative">
        <Image
          ref={imageRef}
          src={currentSrc}
          alt={decorative ? '' : currentAlt}
          width={width}
          height={height}
          priority={priority}
          loading={loading}
          sizes={sizes}
          quality={quality}
          placeholder={placeholder}
          blurDataURL={blurDataURL}
          onLoad={handleLoad}
          onError={handleError}
          className={`
            transition-opacity duration-300
            ${imageLoaded ? 'opacity-100' : 'opacity-0'}
            ${imageError ? 'grayscale' : ''}
          `}
          role={decorative ? 'presentation' : 'img'}
          aria-describedby={longDescription ? 'image-description' : undefined}
        />
        
        {/* Индикатор загрузки */}
        {!imageLoaded && !imageError && (
          <div 
            className="absolute inset-0 bg-neutral-200 animate-pulse flex items-center justify-center"
            aria-hidden="true"
          >
            <div className="w-8 h-8 border-2 border-neutral-300 border-t-accent rounded-2xl animate-spin" />
          </div>
        )}
        
        {/* Индикатор ошибки */}
        {imageError && (
          <div 
            className="absolute inset-0 bg-neutral-100 flex items-center justify-center"
            aria-hidden="true"
          >
            <AlertCircle className="w-8 h-8 text-neutral-400" />
          </div>
        )}
      </div>
      
      {/* Описание изображения */}
      {longDescription && (
        <div className="mt-2">
          <button
            onClick={toggleLongDescription}
            className="
              inline-flex items-center gap-1 text-body-sm text-neutral-600 hover:text-neutral-800
              focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2
              rounded px-2 py-1 transition-colors
            "
            aria-expanded={showLongDescription}
            aria-controls="image-description"
          >
            {showLongDescription ? (
              <>
                <EyeOff className="w-4 h-4" aria-hidden="true" />
                Приховати опис
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" aria-hidden="true" />
                Показати опис
              </>
            )}
          </button>
          
          {showLongDescription && (
            <div
              id="image-description"
              className="mt-2 p-3 bg-neutral-50 rounded-lg text-body-sm text-neutral-700"
              role="region"
              aria-live="polite"
            >
              {longDescription}
            </div>
          )}
        </div>
      )}
      
      {/* Подпись */}
      {showCaption && caption && (
        <figcaption className="mt-2 text-body-sm text-neutral-600 text-center">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

/**
 * Компонент для галереи изображений с поддержкой навигации
 */
interface ImageGalleryProps {
  images: Array<{
    src: string;
    alt: string;
    caption?: string;
    longDescription?: string;
  }>;
  currentIndex: number;
  onIndexChange: (index: number) => void;
  className?: string;
}

export function ImageGallery({
  images,
  currentIndex,
  onIndexChange,
  className = ''
}: ImageGalleryProps) {
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
        <AccessibleImage
          src={currentImage.src}
          alt={currentImage.alt}
          width={800}
          height={600}
          className="w-full h-auto rounded-lg"
          longDescription={currentImage.longDescription}
          showCaption={true}
          caption={currentImage.caption}
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
      {images.length > 1 && (
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
              <Image
                src={image.src}
                alt={image.alt}
                width={80}
                height={80}
                className="w-full h-full object-cover"
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
