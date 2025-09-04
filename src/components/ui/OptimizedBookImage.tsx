'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { getOptimizedBookCover } from '@/lib/cloudinary-optimization';
import { observeElement } from '@/lib/intersection-observer';

interface OptimizedBookImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export function OptimizedBookImage({
  src,
  alt,
  width = 300,
  height = 400,
  priority = false,
  className = '',
  onLoad,
  onError
}: OptimizedBookImageProps) {
  const [imgSrc, setImgSrc] = useState<string>(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasLoadedRef = useRef(false);

  // Optimize the image URL
  useEffect(() => {
    if (src) {
      try {
        const optimizedSrc = getOptimizedBookCover(src);
        setImgSrc(optimizedSrc);
      } catch (error) {
        console.error('Error optimizing image:', error);
        // Keep original source if optimization fails
        setImgSrc(src);
      }
    }
  }, [src]);

  // Implement lazy loading with Intersection Observer
  useEffect(() => {
    if (!priority && containerRef.current && !hasLoadedRef.current) {
      try {
        observeElement(containerRef.current, () => {
          // Image is in viewport, allow loading
          hasLoadedRef.current = true;
          setIsLoading(false);
        });
      } catch (error) {
        console.error('Error with intersection observer:', error);
        // Fallback if intersection observer fails
        setIsLoading(false);
        hasLoadedRef.current = true;
      }
    } else if (priority) {
      // Priority images load immediately
      setIsLoading(false);
    }
    
    // Fallback timeout in case the intersection observer doesn't trigger
    const timer = setTimeout(() => {
      if (isLoading) {
        setIsLoading(false);
        hasLoadedRef.current = true;
      }
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [priority, isLoading]);

  const handleLoad = () => {
    setIsLoading(false);
    hasLoadedRef.current = true;
    onLoad?.();
  };

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setIsLoading(false);
      // Fallback to placeholder image
      setImgSrc('/images/book-placeholder.svg');
      onError?.();
    }
  };

  // Show placeholder while loading or if there's an error
  if (isLoading || hasError) {
    return (
      <div 
        ref={containerRef}
        className={`relative bg-gray-100 animate-pulse ${className}`}
        style={{ width, height }}
      >
        {hasError ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-gray-400 text-sm">Зображення недоступне</span>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`relative ${className}`} style={{ width, height }}>
      <Image
        src={imgSrc}
        alt={alt}
        fill
        priority={priority}
        onLoad={handleLoad}
        onError={handleError}
        sizes={`(max-width: 768px) 100vw, ${width}px`}
        className="object-cover"
        quality={priority ? 90 : 80}
      />
    </div>
  );
}