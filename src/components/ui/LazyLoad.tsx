'use client';

import { useEffect, useRef, useState , ReactNode } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/cn';

interface LazyLoadProps {
  children: React.ReactNode;
  className?: string;
  threshold?: number;
  rootMargin?: string;
  fallback?: React.ReactNode;
  onVisible?: () => void;
  placeholder?: React.ReactNode;
}

export function LazyLoad({
  children,
  className,
  threshold = 0.1,
  rootMargin = '50px',
  fallback,
  onVisible,
  placeholder }: LazyLoadProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const ref = useRef<HTMLDivElement | null | null>(null);

  useEffect(() => {
    const currentRef = ref.current;
    if (!currentRef) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          onVisible?.();
          
          // Add a small delay to simulate loading
          setTimeout(() => setIsLoaded(true), 100);
          
          // Unobserve after loading
          observer.unobserve(currentRef);
        }
      },
      {
        threshold,
        rootMargin }
    );

    observer.observe(currentRef);

    return () => {
      observer.unobserve(currentRef);
    };
  }, [threshold, rootMargin, onVisible]);

  return (
    <div ref={ref} className={cn('lazy-load', className)}>
      {!isVisible && placeholder && (
        <div className="lazy-load-placeholder">
          {placeholder}
        </div>
      )}
      
      {isVisible && !isLoaded && fallback && (
        <div className="lazy-load-fallback">
          {fallback}
        </div>
      )}
      
      {isLoaded && (
        <div className="lazy-load-content animate-fade-in">
          {children}
        </div>
      )}
    </div>
  );
}

// Specialized lazy load components
export function LazyImage({
  src,
  alt,
  className,
  placeholder = <div className="w-full h-full bg-neutral-200 animate-pulse" />,
  ...props
}: {
  src: string;
  alt: string;
  className?: string;
  placeholder?: React.ReactNode;
  [key: string]: any;
}) {
  return (
    <LazyLoad
      className={className}
      placeholder={placeholder}
      onVisible={() => {
        // Preload image
        const img = new window.Image();
        img.src = src;
      }}
    >
      <Image src={src} alt={alt} width={300} height={400} {...props} />
    </LazyLoad>
  );
}

export function LazyBookCard({ ...props }: { [key: string]: any }) {
  return (
    <LazyLoad
      placeholder={<div className="w-full h-48 bg-neutral-200 animate-pulse rounded-lg" />}
    >
      {/* Your BookCard component here */}
      <div className="book-card" {...props}>
        {/* Book card content */}
      </div>
    </LazyLoad>
  );
}

export function LazySection({ children, className, ...props }: { children: React.ReactNode; className?: string; [key: string]: any }) {
  return (
    <LazyLoad
      className={cn('section', className)}
      threshold={0.05}
      rootMargin="100px"
      {...props}
    >
      {children}
    </LazyLoad>
  );
}
