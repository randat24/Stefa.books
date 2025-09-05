'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Filter, X, SlidersHorizontal, Clock, TrendingUp, BookOpen, User, Tag } from 'lucide-react';
import { useSearch } from './SearchProvider';
import { useDebounce } from '@/hooks/useDebounce';
import { searchService } from '@/lib/search/searchService';
import BookCard from '@/components/BookCard';
import { Badge } from '@/components/ui/Badge';
import type { Book } from '@/lib/supabase';
import type { SearchResponse, SearchSuggestion, SearchFilters as SupabaseSearchFilters } from '@/lib/search/searchService';
import { logger } from '@/lib/logger';

interface SearchFilters {
  categories: string[];
  priceRange: [number, number];
  authors: string[];
  searchMode: 'fuzzy' | 'semantic' | 'hybrid';
  availableOnly: boolean;
  minRating: number;
}

interface AdvancedSearchProps {
  books: Book[];
  onSearchResults?: (results: Book[]) => void;
}

export function AdvancedSearch({ books, onSearchResults }: AdvancedSearchProps) {
  const [query, setQuery] = useState('');
  const [supabaseSuggestions, setSupabaseSuggestions] = useState<SearchSuggestion[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [popularSearches, setPopularSearches] = useState<Array<{ query: string; count: number }>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [isSupabaseSearch, setIsSupabaseSearch] = useState(false);
  const [supabaseResults, setSupabaseResults] = useState<SearchResponse | null>(null);
  
  const debouncedQuery = useDebounce(query, 300);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  
  const [filters, setFilters] = useState<SearchFilters>({
    categories: [],
    priceRange: [0, 1000],
    authors: [],
    searchMode: 'hybrid',
    availableOnly: false,
    minRating: 0
  });

  // Use integrated search context
  const { 
    performSearch, 
    getSuggestions, 
    searchResults, 
    searchStats, 
    isSearching, 
    clearSearch,
    isInitialized 
  } = useSearch();

  // State to track filtered books for when there's no search query
  const [displayedBooks, setDisplayedBooks] = useState<Book[]>(books);

  // Memoized Supabase search function
  const handleSupabaseSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    try {
      const supabaseFilters: SupabaseSearchFilters = {
        categories: filters.categories,
        authors: filters.authors,
        availableOnly: filters.availableOnly,
        minRating: filters.minRating,
        maxResults: 50
      };

      const results = await searchService.searchBooks(searchQuery, supabaseFilters);
      setSupabaseResults(results);
      
      // Convert Supabase results to Book format
      const convertedResults = results.results.map(r => r.book);
      onSearchResults?.(convertedResults);
      
      // Save to recent searches
      const saveRecentSearch = (searchQuery: string) => {
        try {
          const recent = JSON.parse(localStorage.getItem('recentSearches') || '[]');
          const updated = [
            searchQuery,
            ...recent.filter((q: string) => q !== searchQuery)
          ].slice(0, 10);
          
          localStorage.setItem('recentSearches', JSON.stringify(updated));
          setRecentSearches(updated.slice(0, 5));
        } catch (error) {
          logger.warn('Failed to save recent search:', error);
        }
      };
      saveRecentSearch(searchQuery);
      
    } catch (error) {
      logger.error('Supabase search failed:', error);
      setSupabaseResults(null);
    }
  }, [filters, onSearchResults]);

  // Load recent and popular searches on mount
  useEffect(() => {
    const loadRecentSearches = () => {
      try {
        const recent = JSON.parse(localStorage.getItem('recentSearches') || '[]');
        setRecentSearches(recent.slice(0, 5));
      } catch {
        logger.warn('Failed to load recent searches');
        setRecentSearches([]);
      }
    };

    const loadPopularSearches = async () => {
      try {
        const popular: any[] = [];
        setPopularSearches(popular);
      } catch {
        setPopularSearches([]);
      }
    };

    loadRecentSearches();
    loadPopularSearches();
  }, []);

  // Handle debounced Supabase search
  useEffect(() => {
    const loadSupabaseSuggestions = async (searchQuery: string) => {
      if (searchQuery.length < 2) {
        setSupabaseSuggestions([]);
        return;
      }

      try {
        const suggestions: any[] = [];
        setSupabaseSuggestions(suggestions);
        setShowSuggestions(true);
      } catch {
        setSupabaseSuggestions([]);
      }
    };

    if (debouncedQuery.trim() && isSupabaseSearch) {
      handleSupabaseSearch(debouncedQuery);
      loadSupabaseSuggestions(debouncedQuery);
    } else if (debouncedQuery.trim()) {
      // Load suggestions for mock search
      if (isInitialized) {
        const mockSuggestions = getSuggestions(debouncedQuery);
        setSupabaseSuggestions(mockSuggestions.map(s => ({ text: s, type: 'title' as const, count: 1 })));
        setShowSuggestions(true);
      }
    } else {
      setSupabaseSuggestions([]);
      setShowSuggestions(false);
    }
  }, [debouncedQuery, isSupabaseSearch, getSuggestions, isInitialized, handleSupabaseSearch]);

  // Handle clicks outside suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  // Helper function to apply current filters to books
  const applyFiltersToBooks = useCallback((booksToFilter: Book[]) => {
    let filteredBooks = booksToFilter;
    
    if (filters.categories.length > 0) {
      filteredBooks = filteredBooks.filter(book => 
        filters.categories.includes(book.category_id)
      );
    }
    
    if (filters.authors.length > 0) {
      filteredBooks = filteredBooks.filter(book =>
        filters.authors.includes(book.author)
      );
    }

    if (filters.availableOnly) {
      filteredBooks = filteredBooks.filter(book => book.available !== false);
    }

    if (filters.minRating > 0) {
      filteredBooks = filteredBooks.filter(book => (book.rating || 0) >= filters.minRating);
    }
    
    return filteredBooks;
  }, [filters]);

  // Extract filter options from books
  const filterOptions = {
    categories: [...new Set(books.map(book => book.category_id))].sort(),
    authors: [...new Set(books.map(book => book.author))].sort(),
    maxPrice: 1000 // Default max price since books don't have price field currently
  };

  // Initialize displayed books when books prop changes
  useEffect(() => {
    setDisplayedBooks(books);
  }, [books]);

  // Apply filters to books when no search query
  useEffect(() => {
    if (!query) {
      const filteredBooks = applyFiltersToBooks(books);
      setDisplayedBooks(filteredBooks);
      onSearchResults?.(filteredBooks);
    }
  }, [filters, query, books, onSearchResults, applyFiltersToBooks]);

  // Update parent component when search results change
  useEffect(() => {
    if (query) {
      if (isSupabaseSearch && supabaseResults) {
        const convertedResults = supabaseResults.results.map(r => r.book);
        onSearchResults?.(convertedResults);
      } else if (!isSupabaseSearch && searchResults) {
        onSearchResults?.(searchResults);
      }
    }
  }, [searchResults, supabaseResults, onSearchResults, query, isSupabaseSearch]);

  // Perform search using integrated search context
  const performSearchWithFilters = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      clearSearch();
      return;
    }

    if (!isInitialized) {
      logger.warn('Search engines not initialized yet');
      return;
    }

    try {
      // Convert our local filters to the format expected by performSearch
      const searchFilters = {
        categories: filters.categories,
        authors: filters.authors
      };

      await performSearch(searchQuery, {
        mode: filters.searchMode,
        filters: searchFilters
      });

    } catch (error) {
      logger.error('Search error', error);
    }
  };

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    setShowSuggestions(false);
    
    if (isSupabaseSearch) {
      handleSupabaseSearch(searchQuery);
    } else {
      performSearchWithFilters(searchQuery);
    }
  };

  const clearLocalSearch = () => {
    setQuery('');
    setShowSuggestions(false);
    setSupabaseResults(null);
    clearSearch();
    // Reset to showing filtered books based on current filters
    const filteredBooks = applyFiltersToBooks(books);
    setDisplayedBooks(filteredBooks);
    onSearchResults?.(filteredBooks);
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    handleSearch(suggestion.text);
    inputRef.current?.focus();
  };

  const handleRecentSearchClick = (recentQuery: string) => {
    handleSearch(recentQuery);
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'title':
        return <BookOpen className="w-4 h-4" />;
      case 'author':
        return <User className="w-4 h-4" />;
      case 'category':
        return <Tag className="w-4 h-4" />;
      default:
        return <Search className="w-4 h-4" />;
    }
  };

  const getSuggestionTypeLabel = (type: string) => {
    switch (type) {
      case 'title':
        return 'Книга';
      case 'author':
        return 'Автор';
      case 'category':
        return 'Категорія';
      default:
        return '';
    }
  };

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    if (query.trim()) {
      // If there's a search query, perform search with new filters
      if (isSupabaseSearch) {
        handleSupabaseSearch(query);
      } else {
        performSearchWithFilters(query);
      }
    } else {
      // If no search query, just apply filters to all books
      const filteredBooks = applyFiltersToBooks(books);
      setDisplayedBooks(filteredBooks);
      onSearchResults?.(filteredBooks);
    }
  };

  const clearFilters = () => {
    setFilters({
      categories: [],
      priceRange: [0, filterOptions.maxPrice],
      authors: [],
      searchMode: 'hybrid',
      availableOnly: false,
      minRating: 0
    });
    
    if (query.trim()) {
      if (isSupabaseSearch) {
        handleSupabaseSearch(query);
      } else {
        performSearchWithFilters(query);
      }
    } else {
      // Reset to showing all books when no search query
      setDisplayedBooks(books);
      onSearchResults?.(books);
    }
  };

  const activeFilterCount = filters.categories.length + filters.authors.length +
    (filters.priceRange[0] > 0 || filters.priceRange[1] < filterOptions.maxPrice ? 1 : 0) +
    (filters.availableOnly ? 1 : 0) +
    (filters.minRating > 0 ? 1 : 0);

  return (
    <div className="w-full">
      {/* Search Input */}
      <div className="relative mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch(query)}
            onFocus={() => setShowSuggestions(true)}
            placeholder={isSupabaseSearch ? "Пошук з AI-індексацією..." : "Пошук книг за назвою, автором, категорією..."}
            className="w-full h-14 pl-12 pr-32 rounded-full border-2 border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none transition-colors"
            disabled={!isInitialized}
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {query && (
              <button
                onClick={clearLocalSearch}
                className="p-2 hover:bg-muted rounded-full transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={() => setIsSupabaseSearch(!isSupabaseSearch)}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                isSupabaseSearch 
                  ? 'bg-green-100 text-green-800 border border-green-200' 
                  : 'bg-gray-100 text-gray-600 border border-gray-200'
              }`}
              title={isSupabaseSearch ? 'AI пошук активний' : 'Увімкнути AI пошук'}
            >
              {isSupabaseSearch ? 'AI' : 'Мок'}
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-full transition-colors relative ${showFilters ? 'bg-accent text-accent-foreground' : 'hover:bg-muted'}`}
            >
              <Filter className="h-4 w-4" />
              {activeFilterCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs bg-accent">
                  {activeFilterCount}
                </Badge>
              )}
            </button>
            <button
              onClick={() => handleSearch(query)}
              disabled={isSearching || !isInitialized}
              className="px-4 py-2 bg-accent text-accent-foreground rounded-full hover:bg-accent/90 transition-colors disabled:opacity-50"
            >
              {isSearching ? 'Пошук...' : 'Знайти'}
            </button>
          </div>
        </div>

        {/* Advanced Suggestions Dropdown */}
        {showSuggestions && (query.length >= 2 || recentSearches.length > 0 || popularSearches.length > 0) && (
          <div 
            ref={suggestionsRef}
            className="absolute top-full left-0 right-0 mt-2 bg-card border rounded-2xl shadow-lg z-50 max-h-96 overflow-y-auto"
          >
            {/* Search Suggestions */}
            {supabaseSuggestions.length > 0 && (
              <div className="p-2">
                <div className="px-3 py-2 text-sm font-medium text-muted-foreground border-b border-border">
                  Пропозиції
                </div>
                {supabaseSuggestions.map((suggestion, index) => (
                  <button
                    key={`${suggestion.type}-${suggestion.text}-${index}`}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-muted rounded-lg transition-colors text-left"
                  >
                    {getSuggestionIcon(suggestion.type)}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground truncate">
                        {suggestion.text}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {getSuggestionTypeLabel(suggestion.type)}
                        {suggestion.count > 1 && ` • ${suggestion.count} результатів`}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Recent Searches */}
            {recentSearches.length > 0 && query.length < 2 && (
              <div className="p-2 border-t border-border">
                <div className="px-3 py-2 text-sm font-medium text-muted-foreground border-b border-border flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Останні пошуки
                </div>
                {recentSearches.map((recentQuery, index) => (
                  <button
                    key={`recent-${index}`}
                    onClick={() => handleRecentSearchClick(recentQuery)}
                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-muted rounded-lg transition-colors text-left"
                  >
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-foreground truncate">{recentQuery}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Popular Searches */}
            {popularSearches.length > 0 && query.length < 2 && (
              <div className="p-2 border-t border-border">
                <div className="px-3 py-2 text-sm font-medium text-muted-foreground border-b border-border flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Популярні пошуки
                </div>
                {popularSearches.map((popular, index) => (
                  <button
                    key={`popular-${index}`}
                    onClick={() => handleRecentSearchClick(popular.query)}
                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-muted rounded-lg transition-colors text-left"
                  >
                    <TrendingUp className="w-4 h-4 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm text-foreground truncate">{popular.query}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        {popular.count} пошуків
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="mb-6 p-6 border rounded-lg bg-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <SlidersHorizontal className="h-5 w-5" />
              Розширені фільтри
            </h3>
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Очистити всі
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Search Mode */}
            <div>
              <label className="block text-sm font-medium mb-2">Режим пошуку</label>
              <select
                value={filters.searchMode}
                onChange={(e) => updateFilter('searchMode', e.target.value as SearchFilters['searchMode'])}
                className="w-full p-2 border rounded-md bg-background"
                disabled={isSupabaseSearch}
              >
                <option value="hybrid">Гібридний (рекомендований)</option>
                <option value="fuzzy">Нечіткий пошук</option>
                <option value="semantic">Семантичний пошук</option>
              </select>
              {isSupabaseSearch && (
                <p className="text-xs text-muted-foreground mt-1">
                  AI пошук використовує оптимальний режим автоматично
                </p>
              )}
            </div>

            {/* Availability Filter */}
            <div>
              <label className="block text-sm font-medium mb-2">Доступність</label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filters.availableOnly}
                  onChange={(e) => updateFilter('availableOnly', e.target.checked)}
                  className="rounded border-border"
                />
                <span className="text-sm">Тільки доступні книги</span>
              </label>
            </div>

            {/* Rating Filter */}
            <div>
              <label className="block text-sm font-medium mb-2">Мінімальний рейтинг</label>
              <select
                value={filters.minRating}
                onChange={(e) => updateFilter('minRating', Number(e.target.value))}
                className="w-full p-2 border rounded-md bg-background"
              >
                <option value={0}>Будь-який рейтинг</option>
                <option value={3}>3+ зірки</option>
                <option value={4}>4+ зірки</option>
                <option value={4.5}>4.5+ зірки</option>
              </select>
            </div>

            {/* Categories */}
            <div>
              <label className="block text-sm font-medium mb-2">Категорії</label>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {filterOptions.categories.map(category => (
                  <label key={category} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filters.categories.includes(category)}
                      onChange={(e) => {
                        const newCategories = e.target.checked
                          ? [...filters.categories, category]
                          : filters.categories.filter(c => c !== category);
                        updateFilter('categories', newCategories);
                      }}
                      className="rounded border-border"
                    />
                    <span className="text-sm">{category}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Authors */}
            <div>
              <label className="block text-sm font-medium mb-2">Автори</label>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {filterOptions.authors.slice(0, 10).map(author => (
                  <label key={author} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filters.authors.includes(author)}
                      onChange={(e) => {
                        const newAuthors = e.target.checked
                          ? [...filters.authors, author]
                          : filters.authors.filter(a => a !== author);
                        updateFilter('authors', newAuthors);
                      }}
                      className="rounded border-border"
                    />
                    <span className="text-sm">{author}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search Stats */}
      {(query || activeFilterCount > 0) && (
        <div className="mb-4 flex items-center gap-4 text-sm text-muted-foreground">
          <span>
            {query 
              ? (isSupabaseSearch && supabaseResults
                  ? `${supabaseResults.totalCount} результатів за ${supabaseResults.searchTime.toFixed(0)} мс`
                  : `${searchResults?.length || 0} результатів пошуку за ${searchStats.searchTime.toFixed(0)} мс`
                )
              : `${displayedBooks.length} книг з ${books.length}`
            }
          </span>
          {isSupabaseSearch && query && (
            <Badge className="bg-green-100 text-green-800 border border-green-200">
              AI пошук
            </Badge>
          )}
          {searchStats.correctedQuery && (
            <span className="text-accent">
              Виправлено: &quot;{searchStats.correctedQuery}&quot;
            </span>
          )}
          {activeFilterCount > 0 && (
            <Badge variant="secondary">
              {activeFilterCount} активних фільтрів
            </Badge>
          )}
        </div>
      )}

      {/* Search Results */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {(() => {
          if (query) {
            if (isSupabaseSearch && supabaseResults) {
              return supabaseResults.results.map(result => (
                <BookCard key={result.book.id} book={result.book} />
              ));
            } else if (!isSupabaseSearch && searchResults) {
              return searchResults.map(book => (
                <BookCard key={book.id} book={book} />
              ));
            }
            return [];
          } else {
            return displayedBooks.map(book => (
              <BookCard key={book.id} book={book} />
            ));
          }
        })()}
      </div>

      {/* No Results */}
      {(() => {
        const hasResults = query 
          ? (isSupabaseSearch 
              ? (supabaseResults?.results?.length || 0) > 0
              : searchResults?.length > 0)
          : displayedBooks.length > 0;
        
        return !hasResults && !isSearching && (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {query ? "Нічого не знайдено" : "Немає книг за вибраними фільтрами"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {query 
                ? "Спробуйте змінити запит або скористайтеся фільтрами"
                : "Спробуйте змінити фільтри або очистити їх"
              }
            </p>
            {query && isSupabaseSearch && (
              <p className="text-sm text-muted-foreground mb-4">
                Спробуйте перемкнутися на звичайний пошук або використайте інші ключові слова
              </p>
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
        );
      })()}
    </div>
  );
}