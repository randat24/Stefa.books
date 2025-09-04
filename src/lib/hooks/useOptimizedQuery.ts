import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect } from 'react';
import { logger } from '@/lib/logger';

interface UseOptimizedQueryOptions<T> {
  queryKey: string[];
  queryFn: () => Promise<T>;
  staleTime?: number;
  cacheTime?: number;
  enabled?: boolean;
  refetchOnWindowFocus?: boolean;
  refetchOnMount?: boolean;
  retry?: number;
  retryDelay?: number;
}

export function useOptimizedQuery<T>({
  queryKey,
  queryFn,
  staleTime = 5 * 60 * 1000, // 5 minutes
  cacheTime = 10 * 60 * 1000, // 10 minutes
  enabled = true,
  refetchOnWindowFocus = false,
  refetchOnMount = true,
  retry = 3,
  retryDelay = 1000,
}: UseOptimizedQueryOptions<T>) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey,
    queryFn,
    staleTime,
    gcTime: cacheTime,
    enabled,
    refetchOnWindowFocus,
    refetchOnMount,
    retry,
    retryDelay,
  });

  // Prefetch related data
  const prefetchRelated = useCallback((relatedKeys: string[]) => {
    relatedKeys.forEach((key) => {
      queryClient.prefetchQuery({
        queryKey: [key],
        queryFn: () => Promise.resolve(null), // Placeholder
        staleTime: 2 * 60 * 1000, // 2 minutes
      });
    });
  }, [queryClient]);

  // Optimistic updates
  const updateOptimistically = useCallback((updater: (oldData: T | undefined) => T) => {
    queryClient.setQueryData(queryKey, updater);
  }, [queryClient, queryKey]);

  // Invalidate and refetch
  const invalidateAndRefetch = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey });
    return query.refetch();
  }, [queryClient, queryKey, query]);

  // Log performance metrics
  useEffect(() => {
    if (query.data && !query.isLoading) {
      logger.debug('Query completed', {
        queryKey,
        duration: query.dataUpdatedAt - query.dataUpdatedAt,
        dataSize: JSON.stringify(query.data).length,
      }, 'Query');
    }
  }, [query.data, query.isLoading, query.dataUpdatedAt, queryKey]);

  return {
    ...query,
    prefetchRelated,
    updateOptimistically,
    invalidateAndRefetch,
  };
}

// Specialized hooks for common use cases
export function useBooksQuery(filters: Record<string, any> = {}) {
  return useOptimizedQuery({
    queryKey: ['books', JSON.stringify(filters)],
    queryFn: async () => {
      const { fetchBooks } = await import('@/lib/api/books');
      return fetchBooks(filters);
    },
    staleTime: 2 * 60 * 1000, // 2 minutes for books
  });
}

export function useCategoriesQuery() {
  return useOptimizedQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { fetchCategories } = await import('@/lib/api/books');
      return fetchCategories();
    },
    staleTime: 30 * 60 * 1000, // 30 minutes for categories
  });
}

export function useBookQuery(id: string) {
  return useOptimizedQuery({
    queryKey: ['book', id],
    queryFn: async () => {
      const { fetchBook } = await import('@/lib/api/books');
      return fetchBook(id);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes for individual books
    enabled: !!id,
  });
}
