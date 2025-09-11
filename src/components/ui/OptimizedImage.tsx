"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { logger } from '@/lib/logger';

interface OptimizedImageProps {
  /** Public ID изображения в Cloudinary */
  publicId: string;
  /** Альтернативный текст */
  alt: string;
  /** Ширина изображения */
  width?: number;
  /** Высота изображения */
  height?: number;
  /** CSS классы */
  className?: string;
  /** Тип оптимизации */
  optimizationType?: 'web' | 'mobile' | 'print' | 'social' | 'custom';
  /** Кастомные трансформации */
  customTransformations?: Record<string, any>;
  /** Качество изображения */
  quality?: 'auto:low' | 'auto:good' | 'auto:better' | 'auto:best' | string;
  /** Формат изображения */
  format?: 'auto' | 'jpg' | 'png' | 'webp' | 'avif';
  /** Приоритет загрузки */
  priority?: boolean;
  /** Размеры для responsive */
  sizes?: string;
  /** Callback при загрузке */
  onLoad?: () => void;
  /** Callback при ошибке */
  onError?: (error: Error) => void;
}

export function OptimizedImage({
  publicId,
  alt,
  width = 400,
  height = 300,
  className = '',
  optimizationType = 'web',
  customTransformations = {},
  quality = 'auto:best',
  format = 'auto',
  priority = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  onLoad,
  onError
}: OptimizedImageProps) {
  const [optimizedUrl, setOptimizedUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const generateOptimizedUrl = async () => {
      try {
        setIsLoading(true);
        setError(null);

        let result;

        // Если есть кастомные трансформации, используем POST endpoint
        if (Object.keys(customTransformations).length > 0) {
          const response = await fetch('/api/optimize/image', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              public_id: publicId,
              transformations: [customTransformations],
              preset: optimizationType
            })
          });

          if (!response.ok) {
            throw new Error('Ошибка оптимизации изображения');
          }

          result = await response.json();
        } else {
          // Используем GET endpoint для предустановленных оптимизаций
          const params = new URLSearchParams({
            public_id: publicId,
            width: width.toString(),
            height: height.toString(),
            quality,
            format,
            preset: optimizationType
          });

          const response = await fetch(`/api/optimize/image?${params}`);
          
          if (!response.ok) {
            throw new Error('Ошибка оптимизации изображения');
          }

          result = await response.json();
        }

        setOptimizedUrl(result.optimized_url);

        logger.info('Optimized image URL generated', {
          public_id: publicId,
          optimization_type: optimizationType,
          url: result.optimized_url
        });

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
        setError(errorMessage);
        logger.error('Image optimization failed', err);
        onError?.(err instanceof Error ? err : new Error(errorMessage));
      } finally {
        setIsLoading(false);
      }
    };

    if (publicId) {
      generateOptimizedUrl();
    }
  }, [publicId, optimizationType, customTransformations, width, height, quality, format, onError]);

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
        <div className="text-center p-4">
          <p className="text-sm text-gray-600">Ошибка загрузки изображения</p>
          <p className="text-xs text-gray-500 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 animate-pulse ${className}`}>
        <div className="text-center p-4">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Оптимизация изображения...</p>
        </div>
      </div>
    );
  }

  if (!optimizedUrl) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
        <div className="text-center p-4">
          <p className="text-sm text-gray-600">Изображение не найдено</p>
        </div>
      </div>
    );
  }

  return (
    <Image
      src={optimizedUrl}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority={priority}
      sizes={sizes}
      onLoad={onLoad}
      onError={() => {
        const error = new Error('Ошибка загрузки изображения');
        setError(error.message);
        onError?.(error);
      }}
    />
  );
}

// Специализированные компоненты для разных типов оптимизации
export function WebOptimizedImage(props: Omit<OptimizedImageProps, 'optimizationType'>) {
  return <OptimizedImage {...props} optimizationType="web" />;
}

export function MobileOptimizedImage(props: Omit<OptimizedImageProps, 'optimizationType'>) {
  return <OptimizedImage {...props} optimizationType="mobile" />;
}

export function PrintOptimizedImage(props: Omit<OptimizedImageProps, 'optimizationType'>) {
  return <OptimizedImage {...props} optimizationType="print" />;
}

export function SocialOptimizedImage(props: Omit<OptimizedImageProps, 'optimizationType'>) {
  return <OptimizedImage {...props} optimizationType="social" />;
}