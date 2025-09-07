'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import BookCard from '@/components/BookCard';
import { PaginationControls, PaginationInfo, calculateTotalPages } from '@/components/ui/PaginationControls';
import { LoadMoreButton } from '@/components/ui/LoadMoreButton';
import { CatalogSearchFilter } from './CatalogSearchFilter';
import { useDebounce } from '@/hooks/useDebounce';
import { fetchBooks, type BooksResponse } from '@/lib/api/books';
import type { Book } from '@/lib/supabase';
import { logger } from '@/lib/logger';

interface BooksCatalogProps {
  initialBooks?: Book[];
  className?: string;
}

export function BooksCatalog({ initialBooks = [], className = '' }: BooksCatalogProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State
  const [books, setBooks] = useState<Book[]>(initialBooks);
  const [loading, setLoading] = useState(!initialBooks.length);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  
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
  const currentPage = parseInt(searchParams.get('page') || '1');
  const totalPages = calculateTotalPages(totalCount, BOOKS_PER_PAGE);
  
  // Calculate how many pages are currently displayed (taking into account loaded books)
  // const displayedPages = Math.ceil(books.length / BOOKS_PER_PAGE); // Will be used for pagination UI

  // Initialize categories and authors from initialBooks
  useEffect(() => {
    if (initialBooks.length > 0) {
      const categories = [...new Set(initialBooks.map(book => book.category_id).filter(Boolean) as string[])].sort();
      const authors = [...new Set(initialBooks.map(book => book.author).filter(Boolean))].sort();
      setAllCategories(categories);
      setAllAuthors(authors);
    }
  }, [initialBooks]);

  // Create stable filter object to avoid unnecessary re-renders
  const effectiveFilters = useMemo(() => ({
    search: debouncedSearch,
    category: searchFilters.category,
    author: searchFilters.author,
    availableOnly: searchFilters.availableOnly,
    minRating: searchFilters.minRating
  }), [debouncedSearch, searchFilters.category, searchFilters.author, searchFilters.availableOnly, searchFilters.minRating]);

  // Memoized function to build API filters
  const buildApiFilters = useCallback((page: number, filters: typeof effectiveFilters) => {
    const offset = (page - 1) * BOOKS_PER_PAGE;
    const apiFilters: any = {
      limit: BOOKS_PER_PAGE,
      offset: offset
    };

    if (filters.search.trim()) {
      apiFilters.search = filters.search.trim();
    }
    
    if (filters.category) {
      apiFilters.category = filters.category;
    }
    
    if (filters.author) {
      apiFilters.author = filters.author;
    }
    
    if (filters.availableOnly) {
      apiFilters.available_only = true;
    }

    return apiFilters;
  }, [BOOKS_PER_PAGE]);

  // Load books based on current page and filters
  useEffect(() => {
    const loadBooks = async () => {
      try {
        setLoading(true);
        setError(null);

        const apiFilters = buildApiFilters(currentPage, effectiveFilters);
        const response: BooksResponse = await fetchBooks(apiFilters);

        if (response.success) {
          setBooks(response.data);
          
          // Устанавливаем общее количество книг
          if (response.pagination) {
            setTotalCount(response.pagination.total);
          } else {
            // Fallback если пагинация не вернулась
            setTotalCount(response.count || response.data.length);
          }

          // Extract categories and authors for filters only on first load or when search is empty
          if (response.data.length > 0 && !effectiveFilters.search) {
            const categories = [...new Set(response.data.map(book => book.category_id).filter(Boolean) as string[])].sort();
            const authors = [...new Set(response.data.map(book => book.author).filter(Boolean))].sort();
            setAllCategories(categories);
            setAllAuthors(authors);
          }

          // Логируем для аналитики
          logger.debug('Books loaded for catalog', {
            page: currentPage,
            count: response.data.length,
            total: response.pagination?.total,
            filters: effectiveFilters
          });
        } else {
          throw new Error(response.error || 'Помилка завантаження книг');
        }

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Невідома помилка';
        setError(errorMessage);
        logger.error('Error loading books for catalog', err);
      } finally {
        setLoading(false);
      }
    };

    // Load books when page or effective filters change
    loadBooks();
  }, [currentPage, effectiveFilters, buildApiFilters]);

  // Handle page change
  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    
    if (page === 1) {
      params.delete('page');
    } else {
      params.set('page', page.toString());
    }
    
    const newUrl = params.toString() ? `?${params.toString()}` : '';
    router.push(`/books${newUrl}`, { scroll: true });
    
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle load more
  const handleLoadMore = useCallback(async () => {
    try {
      setLoadingMore(true);
      const nextOffset = books.length;
      
      const apiFilters = buildApiFilters(Math.ceil(nextOffset / BOOKS_PER_PAGE) + 1, effectiveFilters);
      apiFilters.offset = nextOffset; // Override offset for load more

      const response: BooksResponse = await fetchBooks(apiFilters);

      if (response.success && response.data.length > 0) {
        setBooks(prevBooks => [...prevBooks, ...response.data]);
        
        logger.debug('More books loaded for catalog', {
          newCount: response.data.length,
          totalLoaded: books.length + response.data.length,
          total: totalCount,
          filters: effectiveFilters
        });
      }
    } catch (err) {
      logger.error('Error loading more books', err);
    } finally {
      setLoadingMore(false);
    }
  }, [books.length, buildApiFilters, effectiveFilters, totalCount]);

  // Handle filter changes
  const handleFiltersChange = useCallback((newFilters: typeof searchFilters) => {
    setSearchFilters(newFilters);
    // Reset to first page when filters change
    if (currentPage !== 1) {
      const params = new URLSearchParams(searchParams);
      params.delete('page');
      const newUrl = params.toString() ? `?${params.toString()}` : '';
      router.push(`/books${newUrl}`, { scroll: false });
    }
  }, [currentPage, searchParams, router]);

  // Loading state
  if (loading) {
    return (
      <div className={`flex items-center justify-center py-12 ${className}`}>
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-brand-yellow" />
          <p className="text-gray-600">Завантаження каталогу книг...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-6 text-center ${className}`}>
        <h3 className="text-lg font-medium text-red-800 mb-2">Помилка завантаження</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          Повторити спробу
        </button>
      </div>
    );
  }

  // Empty state
  if (!loading && books.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <h3 className="text-xl font-semibold mb-2 text-gray-900">Книги не знайдені</h3>
        <p className="text-gray-600">
          На даний момент книг у каталозі немає. Спробуйте пізніше.
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Search and Filters */}
      <CatalogSearchFilter
        onFiltersChange={handleFiltersChange}
        categories={allCategories}
        authors={allAuthors}
        className="mb-8"
      />

      {/* Pagination Info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <PaginationInfo
          currentPage={currentPage}
          itemsPerPage={BOOKS_PER_PAGE}
          totalItems={totalCount}
        />
        <div className="text-sm text-gray-600 mt-2 sm:mt-0" aria-live="polite">
          Сторінка {currentPage} з {totalPages}
        </div>
      </div>

      {/* Books Grid */}
      <div 
        className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
        role="grid"
        aria-label="Каталог книг"
        aria-live="polite"
        aria-busy={loading}
      >
        {books.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>

      {/* Load More Button */}
      {books.length < totalCount && (
        <div className="flex justify-center">
          <LoadMoreButton
            isLoading={loadingMore}
            onLoadMore={handleLoadMore}
            hasMore={books.length < totalCount}
            loadedCount={books.length}
            totalCount={totalCount}
            className="mt-6"
          />
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          className="mt-8"
        />
      )}

    </div>
  );
}

// Hook for using catalog with URL parameters
export function useCatalogParams() {
  const searchParams = useSearchParams();
  
  return {
    currentPage: parseInt(searchParams.get('page') || '1'),
    category: searchParams.get('category') || undefined,
    author: searchParams.get('author') || undefined
  };
}