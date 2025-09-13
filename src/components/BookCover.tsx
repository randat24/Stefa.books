'use client';

import { useState } from 'react';
import CachedImage from '@/components/ui/CachedImage';
import { BookOpen } from 'lucide-react';

interface BookCoverProps {
  src: string;
  alt: string;
  title: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  showFallback?: boolean;
}

export function BookCover({ 
  src, 
  alt, 
  title,
  width = 300, 
  height = 400, 
  className = '',
  priority = false,
  showFallback = true
}: BookCoverProps) {
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    setHasError(true);
  };

  const handleLoad = () => {
    setHasError(false);
  };

  // Если есть ошибка и показываем fallback
  if (hasError && showFallback) {
    return (
      <div className={`relative overflow-hidden bg-gradient-to-br from-neutral-100 to-neutral-200 flex items-center justify-center ${className}`}>
        <div className="text-center p-4">
          <div className="w-16 h-16 bg-neutral-300 rounded-lg flex items-center justify-center mx-auto mb-3">
            <BookOpen className="w-8 h-8 text-neutral-500" />
          </div>
          <p className="text-sm text-neutral-600 font-medium">{title}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <CachedImage
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        className="w-full h-full object-cover"
        enableCache={true}
        showRefreshButton={false}
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  );
}
