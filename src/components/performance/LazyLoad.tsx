'use client';

import React, { useState, useRef, useEffect, Suspense } from 'react';
import { Loader2 } from 'lucide-react';

interface LazyLoadProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  threshold?: number;
  rootMargin?: string;
  className?: string;
  placeholder?: React.ReactNode;
  delay?: number;
}

/**
 * Компонент для lazy loading с Intersection Observer
 */
export function LazyLoad({
  children,
  fallback,
  threshold = 0.1,
  rootMargin = '50px',
  className = '',
  placeholder,
  delay = 0
}: LazyLoadProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          
          if (delay > 0) {
            setTimeout(() => {
              setShouldRender(true);
            }, delay);
          } else {
            setShouldRender(true);
          }
          
          observer.disconnect();
        }
      },
      {
        threshold,
        rootMargin
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, delay]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const defaultFallback = (
    <div className="flex items-center justify-center p-8">
      <Loader2 className="w-8 h-8 animate-spin text-accent" />
    </div>
  );

  const defaultPlaceholder = (
    <div className="animate-pulse bg-neutral-200 rounded-lg h-64 flex items-center justify-center">
      <span className="text-neutral-400">Завантаження...</span>
    </div>
  );

  return (
    <div ref={elementRef} className={className}>
      {!isVisible && placeholder && (
        <div className="min-h-[200px]">
          {placeholder}
        </div>
      )}
      
      {isVisible && !shouldRender && (
        <div className="min-h-[200px]">
          {placeholder || defaultPlaceholder}
        </div>
      )}
      
      {shouldRender && (
        <Suspense fallback={fallback || defaultFallback}>
          <div onLoad={handleLoad}>
            {children}
          </div>
        </Suspense>
      )}
    </div>
  );
}

/**
 * HOC для lazy loading компонентов
 */
export function withLazyLoad<P extends object>(
  Component: React.ComponentType<P>,
  options?: Omit<LazyLoadProps, 'children'>
) {
  return function LazyLoadedComponent(props: P) {
    return (
      <LazyLoad {...options}>
        <Component {...props} />
      </LazyLoad>
    );
  };
}

/**
 * Компонент для lazy loading изображений
 */
interface LazyImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  placeholder?: string;
  blurDataURL?: string;
  priority?: boolean;
  sizes?: string;
  quality?: number;
  onLoad?: () => void;
  onError?: () => void;
}

export function LazyImage({
  src,
  alt,
  width,
  height,
  className = '',
  placeholder,
  blurDataURL,
  priority = false,
  sizes,
  quality = 75,
  onLoad,
  onError
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  if (priority) {
    return (
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        onLoad={handleLoad}
        onError={handleError}
      />
    );
  }

  return (
    <LazyLoad
      threshold={0.1}
      rootMargin="100px"
      placeholder={
        <div 
          className={`bg-neutral-200 animate-pulse ${className}`}
          style={{ width, height }}
        >
          {placeholder && (
            <img
              src={placeholder}
              alt=""
              className="w-full h-full object-cover opacity-50"
            />
          )}
        </div>
      }
    >
      <div className="relative">
        {!isLoaded && !hasError && (
          <div 
            className={`bg-neutral-200 animate-pulse ${className}`}
            style={{ width, height }}
          />
        )}
        
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={`
            ${className}
            transition-opacity duration-300
            ${isLoaded ? 'opacity-100' : 'opacity-0'}
            ${hasError ? 'hidden' : ''}
          `}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
          sizes={sizes}
        />
        
        {hasError && (
          <div 
            className={`bg-neutral-100 flex items-center justify-center ${className}`}
            style={{ width, height }}
          >
            <span className="text-neutral-400 text-sm">Зображення недоступне</span>
          </div>
        )}
      </div>
    </LazyLoad>
  );
}

/**
 * Компонент для lazy loading списков
 */
interface LazyListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  batchSize?: number;
  threshold?: number;
  className?: string;
  placeholder?: React.ReactNode;
}

export function LazyList<T>({
  items,
  renderItem,
  batchSize = 10,
  threshold = 0.1,
  className = '',
  placeholder
}: LazyListProps<T>) {
  const [visibleItems, setVisibleItems] = useState<T[]>(items.slice(0, batchSize));
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(items.length > batchSize);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = loadMoreRef.current;
    if (!element || !hasMore) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isLoading) {
          setIsLoading(true);
          
          setTimeout(() => {
            const nextBatch = items.slice(0, visibleItems.length + batchSize);
            setVisibleItems(nextBatch);
            setHasMore(nextBatch.length < items.length);
            setIsLoading(false);
          }, 300);
        }
      },
      {
        threshold
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [items, visibleItems.length, batchSize, hasMore, isLoading, threshold]);

  return (
    <div className={className}>
      {visibleItems.map((item, index) => (
        <div key={index}>
          {renderItem(item, index)}
        </div>
      ))}
      
      {hasMore && (
        <div ref={loadMoreRef} className="flex justify-center py-4">
          {isLoading ? (
            <Loader2 className="w-6 h-6 animate-spin text-accent" />
          ) : (
            placeholder || (
              <div className="text-neutral-500 text-sm">Завантаження...</div>
            )
          )}
        </div>
      )}
    </div>
  );
}
