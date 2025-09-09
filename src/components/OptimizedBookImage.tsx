import Image from 'next/image';
import { useState } from 'react';

interface OptimizedBookImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  sizes?: string;
}

/**
 * Оптимизированный компонент изображения книги
 * Применяет техники оптимизации из Cloudinary консоли:
 * - Автоматический формат (WebP/AVIF для современных браузеров)
 * - Responsive изображения с multiple sizes
 * - Progressive loading
 * - Автоматическое качество
 */
export function OptimizedBookImage({
  src,
  alt,
  width = 400,
  height = 600,
  className = '',
  sizes = '(min-width: 1280px) 320px, (min-width: 768px) 33vw, 100vw'
}: OptimizedBookImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Если изображение из Cloudinary, применяем оптимизации
  const isCloudinaryImage = src?.includes('cloudinary.com');
  
  // Создаем оптимизированные URL для разных размеров (как в консоли Cloudinary)
  const getOptimizedSrc = (size: 'small' | 'medium' | 'large' = 'medium') => {
    if (!isCloudinaryImage) return src;
    
    const sizeMap = {
      small: 'w_250,h_375',   // 250x375 для маленьких экранов
      medium: 'w_400,h_600',  // 400x600 стандартный
      large: 'w_800,h_1200'   // 800x1200 для Retina дисплеев
    };
    
    // Применяем оптимизации из скриншота:
    // - f_auto (автоматический формат WebP/AVIF)
    // - q_auto:good (автоматическое качество)
    // - fl_progressive (progressive loading)
    // - dpr_auto (автоматический DPR для Retina)
    const transformations = [
      'f_auto',           // Автоматический формат
      'q_auto:good',      // Автоматическое качество
      'fl_progressive',   // Progressive loading
      'dpr_auto',         // Автоматический DPR
      sizeMap[size],      // Размеры
      'c_fit'             // Crop fit для сохранения пропорций
    ].join(',');
    
    // Вставляем трансформации в Cloudinary URL
    return src.replace('/upload/', `/upload/${transformations}/`);
  };

  // Создаем srcSet для responsive изображений (не используется в текущей реализации)
  // const srcSet = isCloudinaryImage ? 
  //   `${getOptimizedSrc('small')} 250w, ${getOptimizedSrc('medium')} 400w, ${getOptimizedSrc('large')} 800w` :
  //   undefined;

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  // Плейсхолдер для загрузки
  const placeholderSrc = '/images/book-placeholder.svg';

  return (
    <div className={`relative overflow-hidden ${className}`} style={{ width, height }}>
      {/* Основное изображение */}
      <Image
        src={hasError ? placeholderSrc : getOptimizedSrc('medium')}
        alt={alt}
        width={width}
        height={height}
        className={`
          object-cover w-full h-full transition-opacity duration-300
          ${isLoading ? 'opacity-0' : 'opacity-100'}
        `}
        sizes={sizes}
        onLoad={handleLoad}
        onError={handleError}
        priority={false} // Lazy loading по умолчанию
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
      />
      
      {/* Индикатор загрузки */}
      {isLoading && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-neutral-100">
          <div className="animate-pulse bg-neutral-200 w-full h-full rounded" />
        </div>
      )}
      
      {/* Оверлей для WebP/AVIF браузеров */}
      {isCloudinaryImage && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-caption bg-green-500 text-neutral-0 px-2 py-1 rounded">
            WebP
          </span>
        </div>
      )}
    </div>
  );
}

// Хук для использования оптимизированных изображений
export function useOptimizedImage(src: string) {
  const isCloudinaryImage = src?.includes('cloudinary.com');
  
  if (!isCloudinaryImage) return src;
  
  // Применяем базовые оптимизации
  const optimizations = [
    'f_auto',         // Автоматический формат
    'q_auto:good',    // Автоматическое качество
    'fl_progressive', // Progressive loading
    'dpr_auto'        // Автоматический DPR
  ].join(',');
  
  return src.replace('/upload/', `/upload/${optimizations}/`);
}

export default OptimizedBookImage;