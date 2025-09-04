'use client';

import Image from 'next/image';
import { getOptimizedBookCover } from '@/lib/cloudinary-optimization';
import { cn } from '@/lib/cn';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  sizes?: string;
  priority?: boolean;
  loading?: 'lazy' | 'eager';
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  preset?: 'thumbnail' | 'mobile' | 'bookCover' | 'bookCoverLarge';
  responsive?: boolean;
}

/**
 * Компонент для оптимизированных изображений с Cloudinary
 * Автоматически применяет оптимизацию в зависимости от контекста
 */
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  sizes,
  priority = false,
  loading = 'lazy',
  placeholder = 'blur',
  blurDataURL,
  preset = 'bookCover',
  // responsive = false, // Will be used for responsive images
  ...props
}: OptimizedImageProps) {
  // Если включен responsive режим, получаем несколько размеров
  // const responsiveSizes = responsive ? getResponsiveBookCover(src) : null; // Will be used for responsive images
  
  // Получаем оптимизированный URL
  const optimizedSrc = getOptimizedBookCover(src, preset);
  
  // Базовый blur placeholder
  const defaultBlurDataURL = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=";

  return (
    <Image
      src={optimizedSrc}
      alt={alt}
      width={width}
      height={height}
      className={cn("object-cover", className)}
      sizes={sizes || "(min-width: 1280px) 320px, (min-width: 768px) 33vw, 100vw"}
      priority={priority}
      loading={loading}
      placeholder={placeholder}
      blurDataURL={blurDataURL || defaultBlurDataURL}
      {...props}
    />
  );
}

/**
 * Специализированный компонент для обложек книг
 */
export function BookCoverImage({
  src,
  alt,
  className,
  size = 'medium',
  ...props
}: {
  src: string;
  alt: string;
  className?: string;
  size?: 'small' | 'medium' | 'large';
} & Omit<OptimizedImageProps, 'preset'>) {
  const presetMap = {
    small: 'thumbnail' as const,
    medium: 'bookCover' as const,
    large: 'bookCoverLarge' as const
  };

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      className={cn("transition-transform duration-300 hover:scale-105", className)}
      preset={presetMap[size]}
      {...props}
    />
  );
}