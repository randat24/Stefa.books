'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { OptimizedBookCard } from '@/components/OptimizedBookCard';
import { PaginationControls, calculateTotalPages } from '@/components/ui/PaginationControls';
import { LoadMoreButton } from '@/components/ui/LoadMoreButton';
import { CatalogSearchFilter } from './CatalogSearchFilter';
import { useDebounce } from '@/hooks/useDebounce';
import { fetchBooks } from '@/lib/api/books';
import type { Book } from '@/lib/supabase';
import { logger } from '@/lib/logger';

interface OptimizedBooksCatalogProps {
  initialBooks?: Book[];
  className?: string;
}

// Виртуализированный список книг
function VirtualizedBookGrid({
  books,
  loading,
  hasMore
}: {
  books: Book[];
  loading: boolean;
  hasMore: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  // Constants for grid layout (used implicitly in template)

  // Автодогрузка отключена — используем только кнопку "Завантажити ще"

  // Рендерим все загруженные книги (простая версия без слайсинга)
  const visibleBooks = useMemo(() => books, [books]);

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Виртуализированная сетка книг */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {visibleBooks.map((book) => (
          <OptimizedBookCard 
            key={book.id} 
            book={book} 
            className="animate-in fade-in-0 slide-in-from-bottom-4 duration-300"
          />
        ))}
      </div>

      {/* Load More Trigger */}
      {hasMore && (
        <div id="load-more-trigger" className="h-10" />
      )}

      {/* Loading indicator */}
      {loading && (
        <div className="flex justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-brand-accent" />
        </div>
      )}
    </div>
  );
}

export function OptimizedBooksCatalog({ initialBooks = [], className = '' }: OptimizedBooksCatalogProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State
  const [books, setBooks] = useState<Book[]>(initialBooks);
  const [isLoading, setLoading] = useState(!initialBooks.length);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  
  // Ref to prevent multiple simultaneous requests
  const isRequestingRef = useRef(false);
  
  // Search and filter state
  const [searchFilters, setSearchFilters] = useState({
    search: '',
    category: '',
    author: '',
    availableOnly: false,
    minRating: 0
  });
  
  // Debounce search to avoid too many requests
  const debouncedSearch = useDebounce(searchFilters.search, 500);
  
  // Data for dropdowns
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [allAuthors, setAllAuthors] = useState<string[]>([]);
  
  // Pagination settings
  const BOOKS_PER_PAGE = 20;
  const currentPage = parseInt(searchParams?.get('page') || '1');
  const totalPages = calculateTotalPages(totalCount, BOOKS_PER_PAGE);


  // Fetch books with optimized caching
  const fetchBooksData = useCallback(async (params: any, append = false) => {
    // Prevent multiple simultaneous requests
    if (isRequestingRef.current) return;
    isRequestingRef.current = true;
    
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setError(null);
      }

      // Нормализуем параметры для API: вычисляем limit/offset и только поддерживаемые фильтры
      const page = Math.max(1, Number(params.page) || 1);
      const limit = BOOKS_PER_PAGE;
      const offset = (page - 1) * limit;
      const apiParams = {
        limit,
        offset,
        search: params.search || '',
        category: params.category || '',
        author: params.author || '',
        available_only: params.available_only ? true : undefined
      } as const;

      const response = await fetchBooks(apiParams);
      
      if (response.success && response.data) {
        const newBooks = Array.isArray(response.data) ? response.data : [];
        
        if (append) {
          setBooks(prev => [...prev, ...newBooks]);
        } else {
          setBooks(newBooks);
        }
        
        // Встановлюємо правильний totalCount з відповіді API
        setTotalCount(response.pagination?.total || response.count || newBooks.length);
      } else {
        setError(response.error || 'Помилка завантаження книг');
      }
    } catch (err) {
      logger.error('Error fetching books', err);
      setError('Помилка завантаження книг');
    } finally {
      setLoading(false);
      setLoadingMore(false);
      isRequestingRef.current = false;
    }
  }, [BOOKS_PER_PAGE]);

  // Load more books
  const handleLoadMore = useCallback(() => {
    if (!loadingMore && books.length < totalCount) {
      const nextPage = Math.ceil(books.length / BOOKS_PER_PAGE) + 1;
      const params = {
        page: nextPage,
        search: debouncedSearch,
        category: searchFilters.category,
        author: searchFilters.author,
        available_only: searchFilters.availableOnly,
        min_rating: searchFilters.minRating
      };
      fetchBooksData(params, true);
    }
  }, [loadingMore, books.length, totalCount, debouncedSearch, searchFilters, fetchBooksData]);

  // Initial load and search changes
  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        setError(null);

        const page = Math.max(1, Number(currentPage) || 1);
        const limit = BOOKS_PER_PAGE;
        const offset = (page - 1) * limit;

        const isUuid = (value: string) => /^(?:[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$/.test(value);

        const apiParams: Record<string, unknown> = {
          limit,
          offset,
          search: debouncedSearch || '',
          author: searchFilters.author || '',
          available_only: searchFilters.availableOnly || undefined
        };

        if (searchFilters.category && isUuid(searchFilters.category)) {
          apiParams.category = searchFilters.category;
        }

        const response = await fetchBooks(apiParams as any);

        if (response.success && response.data) {
          const newBooks = Array.isArray(response.data) ? response.data : [];
          setBooks(newBooks);
          setTotalCount(response.pagination?.total || response.count || newBooks.length);
        } else {
          setError(response.error || 'Помилка завантаження книг');
        }
      } catch (err) {
        logger.error('Error fetching books', err);
        setError('Помилка завантаження книг');
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [debouncedSearch, searchFilters.category, searchFilters.author, searchFilters.availableOnly, searchFilters.minRating, currentPage]);

  // Load categories and authors for filters
  useEffect(() => {
    const loadFilterData = async () => {
      try {
        // Load categories
        const categoriesResponse = await fetch('/api/categories');
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json();
          if (categoriesData.success) {
            setAllCategories(categoriesData.data.map((cat: any) => cat.name));
          }
        }

        // Load authors from books
        const authorsResponse = await fetch('/api/books?limit=1000');
        if (authorsResponse.ok) {
          const authorsData = await authorsResponse.json();
          if (authorsData.success && authorsData.data) {
            const books = Array.isArray(authorsData.data) ? authorsData.data : [];
            const authors = [...new Set(books.map((book: Book) => book.author).filter(Boolean))] as string[];
            setAllAuthors(authors);
          }
        }
      } catch (err) {
        logger.error('Error loading filter data', err);
      }
    };

    loadFilterData();
  }, []);

  // Handle filter changes
  const handleFilterChange = useCallback((newFilters: Partial<typeof searchFilters>) => {
    setSearchFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Handle page change
  const handlePageChange = useCallback((page: number) => {
    const newSearchParams = new URLSearchParams(searchParams?.toString());
    newSearchParams.set('page', page.toString());
    router.push(`/books?${newSearchParams.toString()}`);
  }, [router, searchParams]);

  // Memoized components
  const MemoizedSearchFilter = useMemo(() => (
    <CatalogSearchFilter
      onFiltersChange={handleFilterChange}
      categories={allCategories}
      authors={allAuthors}
    />
  ), [handleFilterChange, allCategories, allAuthors]);

  const MemoizedVirtualizedGrid = useMemo(() => (
      <VirtualizedBookGrid
      books={books}
      loading={loadingMore || isLoading}
      hasMore={books.length < totalCount}
    />
  ), [books, loadingMore, isLoading, totalCount]);

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <button 
          onClick={() => {
            const params = {
              page: currentPage,
              search: debouncedSearch,
              category: searchFilters.category,
              author: searchFilters.author,
              available_only: searchFilters.availableOnly,
              min_rating: searchFilters.minRating
            };
            fetchBooksData(params);
          }}
          className="px-4 py-2 bg-brand-accent text-white rounded-lg hover:bg-brand-accent/90"
        >
          Спробувати знову
        </button>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Search and Filters */}
      {MemoizedSearchFilter}

      {/* Books Grid with Virtualization */}
      {MemoizedVirtualizedGrid}

      {/* Load More Button (after books) */}
      {books.length < totalCount && !loadingMore && (
        <div className="text-center">
          <LoadMoreButton
            onClick={handleLoadMore}
            isLoading={loadingMore}
            hasMore={books.length < totalCount}
          />
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center pt-6 border-t">
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}
