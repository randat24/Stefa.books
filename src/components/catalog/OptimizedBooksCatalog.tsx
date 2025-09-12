'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { OptimizedBookCard } from '@/components/OptimizedBookCard';
import { PaginationControls, PaginationInfo, calculateTotalPages } from '@/components/ui/PaginationControls';
import { LoadMoreButton } from '@/components/ui/LoadMoreButton';
import { CatalogSearchFilter } from './CatalogSearchFilter';
import { useDebounce } from '@/hooks/useDebounce';
import { fetchBooks, type BooksResponse } from '@/lib/api/books';
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
  onLoadMore, 
  hasMore 
}: { 
  books: Book[]; 
  loading: boolean; 
  onLoadMore: () => void; 
  hasMore: boolean; 
}) {
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 20 });
  const containerRef = useRef<HTMLDivElement>(null);
  const ITEMS_PER_ROW = 4;
  const ITEMS_PER_PAGE = 20;

  // Intersection Observer для lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && hasMore && !loading) {
            onLoadMore();
          }
        });
      },
      { threshold: 0.1 }
    );

    const loadMoreElement = document.getElementById('load-more-trigger');
    if (loadMoreElement) {
      observer.observe(loadMoreElement);
    }

    return () => observer.disconnect();
  }, [hasMore, loading, onLoadMore]);

  // Виртуализация - рендерим только видимые элементы
  const visibleBooks = useMemo(() => {
    return books.slice(visibleRange.start, visibleRange.end);
  }, [books, visibleRange]);

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Виртуализированная сетка книг */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
  const currentPage = parseInt(searchParams?.get('page') || '1');
  const totalPages = calculateTotalPages(totalCount, BOOKS_PER_PAGE);

  // Memoized search params
  const searchParamsMemo = useMemo(() => ({
    page: currentPage,
    search: debouncedSearch,
    category: searchFilters.category,
    author: searchFilters.author,
    available_only: searchFilters.availableOnly,
    min_rating: searchFilters.minRating
  }), [currentPage, debouncedSearch, searchFilters]);

  // Fetch books with optimized caching
  const fetchBooksData = useCallback(async (params: typeof searchParamsMemo, append = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setError(null);
      }

      const response = await fetchBooks(params);
      
      if (response.success && response.data) {
        const newBooks = Array.isArray(response.data) ? response.data : [];
        
        if (append) {
          setBooks(prev => [...prev, ...newBooks]);
        } else {
          setBooks(newBooks);
        }
        
        setTotalCount(newBooks.length);
      } else {
        setError(response.error || 'Помилка завантаження книг');
      }
    } catch (err) {
      logger.error('Error fetching books', err);
      setError('Помилка завантаження книг');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  // Load more books
  const handleLoadMore = useCallback(() => {
    if (!loadingMore && books.length < totalCount) {
      const nextPage = Math.ceil(books.length / BOOKS_PER_PAGE) + 1;
      fetchBooksData({ ...searchParamsMemo, page: nextPage }, true);
    }
  }, [loadingMore, books.length, totalCount, searchParamsMemo, fetchBooksData]);

  // Initial load and search changes
  useEffect(() => {
    fetchBooksData(searchParamsMemo);
  }, [debouncedSearch, searchFilters.category, searchFilters.author, searchFilters.availableOnly, searchFilters.minRating]);

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
      loading={loadingMore}
      onLoadMore={handleLoadMore}
      hasMore={books.length < totalCount}
    />
  ), [books, loadingMore, handleLoadMore, totalCount]);

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <button 
          onClick={() => fetchBooksData(searchParamsMemo)}
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t">
          <PaginationInfo
            currentPage={currentPage}
            totalItems={totalCount}
            itemsPerPage={BOOKS_PER_PAGE}
          />
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {/* Load More Button (fallback) */}
      {books.length < totalCount && !loadingMore && (
        <div className="text-center">
          <LoadMoreButton
            onClick={handleLoadMore}
            isLoading={loadingMore}
            hasMore={books.length < totalCount}
          />
        </div>
      )}
    </div>
  );
}
