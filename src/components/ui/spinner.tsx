'use client';

import { cn } from '@/lib/cn';

interface SpinnerProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'brand';
}

export function Spinner({
  className,
  size = 'md',
  variant = 'default'
}: SpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-6 w-6 border-2',
    lg: 'h-8 w-8 border-3',
  };

  const variantClasses = {
    default: 'border-neutral-300 border-t-neutral-600',
    brand: 'border-neutral-300 border-t-[var(--brand)]',
  };

  return (
    <div
      className={cn(
        'animate-spin rounded-full',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
    />
  );
}
