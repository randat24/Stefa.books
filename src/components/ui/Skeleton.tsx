import { cn } from '@/lib/cn';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

export function Skeleton({
  className,
  variant = 'rectangular',
  width,
  height,
  animation = 'pulse',
  ...props
}: SkeletonProps) {
  const baseClasses = 'bg-neutral-200 animate-pulse';
  
  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-2xl',
    rectangular: '',
    rounded: 'rounded-lg',
  };

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-pulse bg-gradient-to-r from-neutral-200 via-gray-100 to-neutral-200 bg-[length:200%_100%]',
    none: '',
  };

  const style = {
    width: width,
    height: height,
  };

  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        animationClasses[animation],
        className
      )}
      style={style}
      {...props}
    />
  );
}

// Predefined skeleton components
export function BookCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl bg-white">
      <Skeleton className="aspect-[3/4] w-full rounded-t-xl" />
      <div className="flex flex-1 flex-col gap-3 px-4 pb-5 pt-4">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
}

export function BookGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <BookCardSkeleton key={index} />
      ))}
    </div>
  );
}

export function SearchResultsSkeleton() {
  return (
    <div className="space-y-4">
      {/* Books section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex items-center gap-3 p-3">
              <Skeleton className="h-16 w-12 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-5 w-5" />
            </div>
          ))}
        </div>
      </div>

      {/* Categories section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex items-center gap-3 p-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-16 ml-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function HeaderSkeleton() {
  return (
    <header className="w-full sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-neutral-200">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-2xl" />
          <Skeleton className="h-8 w-32" />
        </div>
        <nav className="flex items-center gap-1 sm:gap-2">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <Skeleton className="h-10 w-20 rounded-lg" />
          <Skeleton className="h-10 w-24 rounded-lg" />
          <Skeleton className="h-10 w-28 rounded-2xl" />
        </nav>
      </div>
    </header>
  );
}
