'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, X, SlidersHorizontal, Loader2 } from 'lucide-react';
import BookCard from '@/components/BookCard'; // Use standard import
import { FilterPopup } from '@/components/filters/FilterPopup';
import { LoadMoreButton } from '@/components/ui/LoadMoreButton';
import { fetchBooks, fetchCategories } from '@/lib/api/books';
import type { Book } from '@/lib/supabase';
import { logger } from '@/lib/logger';

interface SearchFilters {
  categories: string[];
  authors: string[];
  searchMode: 'simple';
}

interface SimpleSearchProps {
  onSearchResults?: (results: Book[]) => void;
}

export function SimpleSearch({ onSearchResults }: SimpleSearchProps) {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState('');
  // const [showFilters, setShowFilters] = useState(false); // Will be used for filter UI
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [filters, setFilters] = useState<SearchFilters>({
    categories: [],
    authors: [],
    searchMode: 'simple'
  });

  // State to track all books and displayed books
  const [books, setBooks] = useState<Book[]>([]);
  const [displayedBooks, setDisplayedBooks] = useState<Book[]>([]);
  // const [categories, setCategories] = useState<Category[]>([]); // Will be used for category filtering
  
  // Pagination state
  const [hasMore, setHasMore] = useState(true);
  const [totalBooks, setTotalBooks] = useState<number>(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const ITEMS_PER_PAGE = 12; // Для поиска используем 12 книг за раз

  // Load data from API
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load books and categories in parallel
        const [booksResponse, categoriesResponse] = await Promise.all([
          fetchBooks({ limit: ITEMS_PER_PAGE }), // Загружаем только первую порцию
          fetchCategories()
        ]);

        if (booksResponse.success && booksResponse.data) {
          setBooks(booksResponse.data);
          setDisplayedBooks(booksResponse.data);
          
          // Обновляем информацию о пагинации
          if (booksResponse.pagination) {
            setTotalBooks(booksResponse.pagination.total);
            setHasMore(booksResponse.pagination.hasMore);
          }
        } else {
          throw new Error(booksResponse.error || 'Ошибка загрузки книг');
        }

        if (categoriesResponse.success) {
          // setCategories(categoriesResponse.data); // Will be used for category filtering
        }

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Extract filter options from loaded books
  // const filterOptions = {
  //   categories: categories.length > 0 
  //     ? categories.flatMap(cat => cat.subcategories?.map(sub => sub.name) || [cat.name]).sort()
  //     : books ? [...new Set(books.map(book => book.category_id))].filter(Boolean).sort() : [],
  //   authors: books ? [...new Set(books.map(book => book.author))].filter(Boolean).sort() : []
  // }; // Will be used for filter UI

  // Apply current filters to books
  const applyFilters = useCallback((booksToFilter: Book[]) => {
    let filteredBooks = booksToFilter;
    
    if (filters.categories.length > 0) {
      filteredBooks = filteredBooks.filter(book => 
        book.category_id && filters.categories.includes(book.category_id)
      );
    }
    
    if (filters.authors.length > 0) {
      filteredBooks = filteredBooks.filter(book =>
        filters.authors.includes(book.author)
      );
    }
    
    return filteredBooks;
  }, [filters]);

  // Simple search function - now uses API
  const performSimpleSearch = useCallback(async (searchQuery: string) => {
    const normalizedQuery = searchQuery.toLowerCase().trim();
    
    if (!normalizedQuery) {
      // No search query - apply only filters
      const filtered = applyFilters(books);
      setDisplayedBooks(filtered);
      onSearchResults?.(filtered);
      return;
    }

    setIsSearching(true);
    const startTime = performance.now();

    try {
      // Use API search instead of local search
      const searchResponse = await fetchBooks({
        search: normalizedQuery,
        limit: 200 // Increase limit to find more results
      });

      const endTime = performance.now();
      const searchTime = endTime - startTime;

      if (searchResponse.success && searchResponse.data) {
        // Apply additional client-side filters if any are selected
        const results = applyFilters(searchResponse.data);
        
        setDisplayedBooks(results);
        onSearchResults?.(results);

        logger.search(`Found ${results.length} results in ${searchTime.toFixed(1)}ms`, { 
          query: searchQuery, 
          resultsCount: results.length, 
          searchTime,
          source: 'API'
        });
      } else {
        // Fallback to empty results
        setDisplayedBooks([]);
        onSearchResults?.([]);
        
        logger.search(`API search failed, showing no results`, { 
          query: searchQuery, 
          error: searchResponse.error 
        });
      }
      
    } catch (error) {
      // Fallback to local search if API fails
      logger.search(`API search failed, falling back to local search`, { 
        query: searchQuery, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      
      const searchableBooks = applyFilters(books);
      const results = searchableBooks.filter((book: Book) => {
        const searchText = `${book.title} ${book.author} ${book.category_id} ${book.short_description || ''}`.toLowerCase();
        return searchText.includes(normalizedQuery);
      });

      setDisplayedBooks(results);
      onSearchResults?.(results);
      
    } finally {
      setIsSearching(false);
    }
  }, [books, onSearchResults, applyFilters]);

  // Update displayed books when books change
  useEffect(() => {
    if (!loading && books && books.length > 0) {
      const filtered = applyFilters(books);
      setDisplayedBooks(filtered);
      onSearchResults?.(filtered);
    }
  }, [books, loading, applyFilters, onSearchResults]);

  // Handle URL search parameters
  useEffect(() => {
    const urlSearch = searchParams?.get('search');
    if (urlSearch && !loading) {
      setQuery(urlSearch);
      performSimpleSearch(urlSearch);
    }
  }, [searchParams, books, loading, performSimpleSearch]);

  // Apply filters when they change and no search query
  useEffect(() => {
    if (!query && !loading) {
      const filtered = applyFilters(books);
      setDisplayedBooks(filtered);
      onSearchResults?.(filtered);
    }
  }, [filters, books, onSearchResults, query, loading, applyFilters]);

  // Perform search when query changes
  useEffect(() => {
    if (!loading) {
      const debounceTimer = setTimeout(() => {
        performSimpleSearch(query);
      }, 300);

      return () => clearTimeout(debounceTimer);
    }
  }, [query, loading, performSimpleSearch]);

  // Clear search
  const clearSearch = () => {
    setQuery('');
    const filtered = applyFilters(books);
    setDisplayedBooks(filtered);
    onSearchResults?.(filtered);
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      categories: [],
      authors: [],
      searchMode: 'simple'
    });
    const filtered = query ? [] : books; // If there's a query, we'll let the search effect handle it
    if (!query) {
      setDisplayedBooks(filtered);
      onSearchResults?.(filtered);
    }
  };

  // Update filter
  const updateFilter = (filterType: keyof SearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  // Get active filter count
  const activeFilterCount = filters.categories.length + filters.authors.length;

  // Load more books function
  const loadMore = async () => {
    if (isLoadingMore || !hasMore) return;

    try {
      setIsLoadingMore(true);
      setError(null);

      const currentOffset = displayedBooks.length;
      const searchResponse = await fetchBooks({
        search: query.trim() || undefined,
        limit: ITEMS_PER_PAGE,
        offset: currentOffset
      });

      if (searchResponse.success && searchResponse.data) {
        const newBooks = applyFilters(searchResponse.data);
        setDisplayedBooks(prev => [...prev, ...newBooks]);
        
        // Обновляем информацию о пагинации
        if (searchResponse.pagination) {
          setHasMore(searchResponse.pagination.hasMore);
        }

        onSearchResults?.([...displayedBooks, ...newBooks]);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Помилка завантаження');
    } finally {
      setIsLoadingMore(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <h3 className="text-body-lg font-medium text-red-800 mb-2">Ошибка загрузки</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          Повторить попытку
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <label htmlFor="search-input" className="sr-only">
            Пошук книг за назвою, автором або категорією
          </label>
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <input
            id="search-input"
            type="text"
            placeholder="Пошук книг за назвою, автором або категорією..."
            className="w-full pl-10 pr-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-describedby="search-help"
            autoComplete="off"
          />
          {query && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
              aria-label="Очистити пошук"
              type="button"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        
        <button
          onClick={() => setShowFilterPopup(true)}
          className="inline-flex items-center gap-2 px-4 py-2 border border-input rounded-md hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          aria-label={`Відкрити фільтри${activeFilterCount > 0 ? ` (${activeFilterCount} активних)` : ''}`}
          type="button"
        >
          <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
          Фільтри
          {activeFilterCount > 0 && (
            <span 
              className="bg-primary text-primary-foreground text-caption font-medium rounded-2xl px-2 py-0.5"
              aria-label={`${activeFilterCount} активних фільтрів`}
            >
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>
      
      <div id="search-help" className="sr-only">
        Введіть назву книги, автора або категорію для пошуку
      </div>

      {/* Filter Tags - More Compact */}
      {(filters.categories.length > 0 || filters.authors.length > 0) && (
        <div className="space-y-2">
          {/* Categories */}
          {filters.categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {filters.categories.map((category: string) => (
                <button
                  key={`filter-cat-${category}`}
                  onClick={() => {
                    const newCategories = filters.categories.filter((c: string) => c !== category);
                    updateFilter('categories', newCategories);
                  }}
                  className={`px-2 py-1 text-caption font-medium rounded border transition-all text-left ${
                    filters.categories.includes(category)
                      ? 'border-brand-accent bg-brand-accent text-white'
                      : 'border-border bg-background hover:border-blue-300'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          )}
          
          {/* Authors */}
          {filters.authors.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {filters.authors.map((author: string) => (
                <button
                  key={`filter-author-${author}`}
                  onClick={() => {
                    const newAuthors = filters.authors.filter((a: string) => a !== author);
                    updateFilter('authors', newAuthors);
                  }}
                  className={`px-2 py-1 text-caption font-medium rounded border transition-all text-left ${
                    filters.authors.includes(author)
                      ? 'border-brand-accent bg-brand-accent text-white'
                      : 'border-border bg-background hover:border-blue-300'
                  }`}
                >
                  {author}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Active Filters - More Compact */}
      {activeFilterCount > 0 && (
        <div className="mb-3 flex flex-wrap items-center gap-1 text-xs">
          <span className="text-muted-foreground">Активні:</span>
          
          {/* Selected Categories */}
          {filters.categories.map((category: string) => (
            <button
              key={`active-cat-${category}`}
              onClick={() => {
                const newCategories = filters.categories.filter((c: string) => c !== category);
                updateFilter('categories', newCategories);
              }}
              className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-accent text-accent-foreground rounded hover:bg-accent/80 transition-colors"
            >
              {category}
              <X className="h-3 w-3" />
            </button>
          ))}
          
          {/* Selected Authors */}
          {filters.authors.map((author: string) => (
            <button
              key={`active-author-${author}`}
              onClick={() => {
                const newAuthors = filters.authors.filter((a: string) => a !== author);
                updateFilter('authors', newAuthors);
              }}
              className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-brand-accent text-white rounded hover:bg-blue-400 transition-colors"
            >
              {author}
              <X className="h-3 w-3" />
            </button>
          ))}

          {/* Clear All Button */}
          <button
            onClick={clearFilters}
            className="inline-flex items-center gap-1 px-1.5 py-0.5 text-muted-foreground hover:text-foreground border border-border rounded hover:bg-muted transition-colors"
          >
            <X className="h-3 w-3" />
            Очистити
          </button>
        </div>
      )}

      {/* Search Stats - More Compact */}
      {(query || activeFilterCount > 0) && (
        <div className="mb-3 text-caption text-muted-foreground">
          {query 
            ? `${(displayedBooks || []).length} результатів пошуку`
            : `${(displayedBooks || []).length} з ${books?.length || 0} книг`
          }
        </div>
      )}

      {/* Search Results */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {(displayedBooks || []).map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>

      {/* Load More Button */}
      {(displayedBooks || []).length > 0 && (query || activeFilterCount > 0) && (
        <LoadMoreButton
          onLoadMore={loadMore}
          isLoading={isLoadingMore}
          hasMore={hasMore}
          loadedCount={displayedBooks.length}
          totalCount={totalBooks > 0 ? totalBooks : undefined}
        />
      )}

      {/* No Results */}
      {(displayedBooks || []).length === 0 && !isSearching && (
        <div className="text-center py-12">
          <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-body-lg font-medium mb-2">
            {query ? "Нічого не знайдено" : "Немає книг за вибраними фільтрами"}
          </h3>
          <p className="text-muted-foreground mb-4">
            {query 
              ? "Спробуйте змінити запит або скористайтеся фільтрами"
              : "Спробуйте змінити фільтри або очистити їх"
            }
          </p>
          {(activeFilterCount > 0 || query) && (
            <div className="space-y-2">
              {query && (
                <button
                  onClick={clearSearch}
                  className="text-accent hover:underline mr-4"
                >
                  Очистити пошук
                </button>
              )}
              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-accent hover:underline"
                >
                  Очистити фільтри
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Filter Popup */}
      <FilterPopup 
        isOpen={showFilterPopup}
        onClose={() => setShowFilterPopup(false)}
      />
    </div>
  );
}