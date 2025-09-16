'use client';

import React from 'react';
import { Loader2, Plus } from 'lucide-react';

interface LoadMoreButtonProps {
  onClick?: () => void;
  onLoadMore?: () => void;
  isLoading?: boolean;
  hasMore?: boolean;
  className?: string;
}

export function LoadMoreButton({
  onClick,
  onLoadMore,
  isLoading = false,
  hasMore = true,
  className = ''
}: LoadMoreButtonProps) {
  const handleClick = onClick || onLoadMore;
  if (!hasMore) {
    return null;
  }

  return (
    <div className={`text-center py-8 space-y-4 ${className}`}>
      {/* Кнопка загрузки */}
      <button
        onClick={handleClick}
        disabled={isLoading}
        className="inline-flex items-center gap-2 px-6 py-3 text-body-sm font-medium text-neutral-700 bg-white border-2 border-neutral-300 rounded-lg hover:bg-neutral-50 hover:border-accent-light focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-neutral-300 transition-all duration-200"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Завантаження...
          </>
        ) : (
          <>
            <Plus className="w-4 h-4" />
            Завантажити ще
          </>
        )}
      </button>

    </div>
  );
}

// Компонент с автоматической загрузкой при скролле
interface InfiniteScrollProps extends Omit<LoadMoreButtonProps, 'onLoadMore'> {
  onLoadMore: () => void;
  threshold?: number; // Расстояние от низа страницы для триггера загрузки (в пикселях)
}

export function InfiniteScrollTrigger({
  onLoadMore,
  isLoading = false,
  hasMore = true,
  threshold = 500,
  ...props
}: InfiniteScrollProps) {
  React.useEffect(() => {
    if (!hasMore || isLoading) return;

    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight;
      const scrollTop = document.documentElement.scrollTop;
      const clientHeight = document.documentElement.clientHeight;
      
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
      
      if (distanceFromBottom < threshold) {
        onLoadMore();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, isLoading, onLoadMore, threshold]);

  return (
    <LoadMoreButton
      onLoadMore={onLoadMore}
      isLoading={isLoading}
      hasMore={hasMore}
      {...props}
    />
  );
}

// Хук для управления состоянием "загрузить еще"
export function useLoadMore<T>(
  initialItems: T[] = [],
  fetchMore: (offset: number, limit: number) => Promise<{ items: T[]; hasMore: boolean; total?: number }>,
  itemsPerPage: number = 12
) {
  const [items, setItems] = React.useState<T[]>(initialItems);
  const [isLoading, setIsLoading] = React.useState(false);
  const [hasMore, setHasMore] = React.useState(true);
  const [totalCount, setTotalCount] = React.useState<number | undefined>();
  const [error, setError] = React.useState<string | null>(null);

  const loadMore = React.useCallback(async () => {
    if (isLoading || !hasMore) return;

    try {
      setIsLoading(true);
      setError(null);
      
      const result = await fetchMore(items.length, itemsPerPage);
      
      setItems(prev => [...prev, ...result.items]);
      setHasMore(result.hasMore);
      if (result.total !== undefined) {
        setTotalCount(result.total);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Помилка завантаження');
    } finally {
      setIsLoading(false);
    }
  }, [items.length, itemsPerPage, fetchMore, isLoading, hasMore]);

  const reset = React.useCallback((newItems: T[] = []) => {
    setItems(newItems);
    setHasMore(true);
    setTotalCount(undefined);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    items,
    isLoading,
    hasMore,
    totalCount,
    error,
    loadMore,
    reset
  };
}