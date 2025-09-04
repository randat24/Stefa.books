'use client';

import { useState, useEffect } from 'react';

interface ImagePerformanceMetrics {
  loadTime: number;
  fileSize: number;
  format: string;
  dimensions: { width: number; height: number };
}

/**
 * Хук для мониторинга производительности оптимизированных изображений
 */
export function useImageOptimization(src: string) {
  const [metrics, setMetrics] = useState<ImagePerformanceMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!src) return;

    const startTime = performance.now();
    setIsLoading(true);
    setError(null);

    const img = new Image();
    
    img.onload = () => {
      const endTime = performance.now();
      const loadTime = endTime - startTime;
      
      // Получаем информацию о формате из URL
      const format = src.includes('f_auto') ? 'auto' : 
                    src.includes('f_webp') ? 'webp' :
                    src.includes('f_avif') ? 'avif' : 'original';
      
      setMetrics({
        loadTime: Math.round(loadTime),
        fileSize: 0, // Размер файла сложно получить без дополнительных запросов
        format,
        dimensions: {
          width: img.naturalWidth,
          height: img.naturalHeight
        }
      });
      
      setIsLoading(false);
    };
    
    img.onerror = () => {
      setError('Failed to load image');
      setIsLoading(false);
    };
    
    img.src = src;
  }, [src]);

  return {
    metrics,
    isLoading,
    error,
    isOptimized: src.includes('res.cloudinary.com') && 
                 (src.includes('q_auto') || src.includes('f_auto'))
  };
}

/**
 * Хук для сравнения производительности оригинального и оптимизированного изображения
 */
export function useImageComparison(originalSrc: string, optimizedSrc: string) {
  const originalMetrics = useImageOptimization(originalSrc);
  const optimizedMetrics = useImageOptimization(optimizedSrc);

  const comparison = {
    original: originalMetrics,
    optimized: optimizedMetrics,
    improvement: null as {
      loadTimeReduction: number;
      sizeReduction: number;
    } | null
  };

  // Вычисляем улучшения когда оба изображения загружены
  if (originalMetrics.metrics && optimizedMetrics.metrics) {
    const loadTimeReduction = 
      ((originalMetrics.metrics.loadTime - optimizedMetrics.metrics.loadTime) / 
       originalMetrics.metrics.loadTime) * 100;
    
    comparison.improvement = {
      loadTimeReduction: Math.round(loadTimeReduction),
      sizeReduction: 0 // Требует дополнительной логики для получения размера файла
    };
  }

  return comparison;
}
