'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, X, SlidersHorizontal, SortAsc, SortDesc, Loader2 } from 'lucide-react';
import BookCard from '@/components/BookCard';
import { AdvancedFilters } from '@/components/filters/AdvancedFilters';
import { LoadMoreButton } from '@/components/ui/LoadMoreButton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/Badge';
import { fetchBooks } from '@/lib/api/books';
import type { Book } from '@/lib/supabase';

interface FilterOptions {
  categories: string[];
  authors: string[];
  ageRanges: string[];
  availability: 'all' | 'available' | 'unavailable';
  rating: number | null;
  sortBy: 'title' | 'author' | 'rating' | 'date' | 'popularity';
  sortOrder: 'asc' | 'desc';
}

interface EnhancedSearchProps {
  onSearchResults?: (results: Book[]) => void;
}

export function EnhancedSearch({ onSearchResults }: EnhancedSearchProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [filters, setFilters] = useState<FilterOptions>({
    categories: [],
    authors: [],
    ageRanges: [],
    availability: 'all',
    rating: null,
    sortBy: 'popularity',
    sortOrder: 'desc'
  });

  // State for books and pagination
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [displayedBooks, setDisplayedBooks] = useState<Book[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [totalBooks, setTotalBooks] = useState<number>(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  const ITEMS_PER_PAGE = 12;

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetchBooks({
          available_only: false,
          limit: 100 // Load more books for better filtering
        });

        if (response.success) {
          setBooks(response.data);
          setFilteredBooks(response.data);
          setTotalBooks(response.data.length);
          
          // Initialize displayed books
          const initialBooks = response.data.slice(0, ITEMS_PER_PAGE);
          setDisplayedBooks(initialBooks);
          setHasMore(response.data.length > ITEMS_PER_PAGE);
          
          if (onSearchResults) {
            onSearchResults(initialBooks);
          }
        } else {
          throw new Error(response.error || 'Failed to load books');
        }
      } catch (error) {
        console.error('Error loading books:', error);
        setError('Помилка завантаження книг');
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [onSearchResults]);

  // Apply filters and search
  const applyFiltersAndSearch = useCallback(() => {
    let filtered = [...books];

    // Apply search query
    if (query.trim()) {
      const searchTerm = query.toLowerCase().trim();
      filtered = filtered.filter(book => 
        book.title.toLowerCase().includes(searchTerm) ||
        book.author.toLowerCase().includes(searchTerm) ||
        (book.description && book.description.toLowerCase().includes(searchTerm)) ||
        (book.short_description && book.short_description.toLowerCase().includes(searchTerm))
      );
    }

    // Apply category filter
    if (filters.categories.length > 0) {
      filtered = filtered.filter(book => 
        filters.categories.some(category => 
          book.category_id?.toLowerCase().includes(category.toLowerCase()) ||
          book.title.toLowerCase().includes(category.toLowerCase())
        )
      );
    }

    // Apply author filter
    if (filters.authors.length > 0) {
      filtered = filtered.filter(book => 
        filters.authors.some(author => 
          book.author.toLowerCase().includes(author.toLowerCase())
        )
      );
    }

    // Apply age range filter
    if (filters.ageRanges.length > 0) {
      filtered = filtered.filter(book => 
        filters.ageRanges.some(ageRange => {
          if (book.age_range) {
            return book.age_range.includes(ageRange) || 
                   book.age_range.includes(ageRange.split(' ')[0]);
          }
          return false;
        })
      );
    }

    // Apply availability filter
    if (filters.availability !== 'all') {
      filtered = filtered.filter(book => 
        filters.availability === 'available' ? book.available : !book.available
      );
    }

    // Apply rating filter
    if (filters.rating) {
      filtered = filtered.filter(book => 
        book.rating && book.rating >= filters.rating!
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (filters.sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title, 'uk');
          break;
        case 'author':
          comparison = a.author.localeCompare(b.author, 'uk');
          break;
        case 'rating':
          comparison = (a.rating || 0) - (b.rating || 0);
          break;
        case 'date':
          comparison = new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
          break;
        case 'popularity':
          comparison = (a.rating_count || 0) - (b.rating_count || 0);
          break;
        default:
          comparison = 0;
      }

      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredBooks(filtered);
    setTotalBooks(filtered.length);
    
    // Reset pagination
    const initialBooks = filtered.slice(0, ITEMS_PER_PAGE);
    setDisplayedBooks(initialBooks);
    setHasMore(filtered.length > ITEMS_PER_PAGE);

    if (onSearchResults) {
      onSearchResults(initialBooks);
    }
  }, [books, query, filters, onSearchResults]);

  // Apply filters when they change
  useEffect(() => {
    applyFiltersAndSearch();
  }, [applyFiltersAndSearch]);

  // Handle search
  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    setIsSearching(true);
    
    // Debounce search
    setTimeout(() => {
      setIsSearching(false);
    }, 300);
  };

  // Load more books
  const loadMore = () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    
    setTimeout(() => {
      const currentLength = displayedBooks.length;
      const nextBooks = filteredBooks.slice(currentLength, currentLength + ITEMS_PER_PAGE);
      
      setDisplayedBooks(prev => [...prev, ...nextBooks]);
      setHasMore(currentLength + nextBooks.length < filteredBooks.length);
      setIsLoadingMore(false);
    }, 500);
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      categories: [],
      authors: [],
      ageRanges: [],
      availability: 'all',
      rating: null,
      sortBy: 'popularity',
      sortOrder: 'desc'
    });
    setQuery('');
  };

  // Get active filters count
  const activeFiltersCount = 
    filters.categories.length + 
    filters.authors.length + 
    filters.ageRanges.length + 
    (filters.availability !== 'all' ? 1 : 0) + 
    (filters.rating ? 1 : 0) +
    (query ? 1 : 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-accent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <div className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Пошук за назвою, автором або описом..."
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-transparent"
          />
          {isSearching && (
            <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
          )}
        </div>

        {/* Filter Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setShowFilters(true)}
              className="flex items-center gap-2"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Фільтри
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>

            {activeFiltersCount > 0 && (
              <Button variant="ghost" onClick={clearFilters} className="text-sm">
                Очистити все
              </Button>
            )}
          </div>

          <div className="text-sm text-gray-600">
            Знайдено {totalBooks} книг
          </div>
        </div>

        {/* Active Filters */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2">
            {query && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Пошук: "{query}"
                <button
                  onClick={() => setQuery('')}
                  className="ml-1 hover:text-red-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            
            {filters.categories.map(category => (
              <Badge key={category} variant="secondary" className="flex items-center gap-1">
                {category}
                <button
                  onClick={() => setFilters(prev => ({
                    ...prev,
                    categories: prev.categories.filter(c => c !== category)
                  }))}
                  className="ml-1 hover:text-red-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}

            {filters.authors.map(author => (
              <Badge key={author} variant="secondary" className="flex items-center gap-1">
                {author}
                <button
                  onClick={() => setFilters(prev => ({
                    ...prev,
                    authors: prev.authors.filter(a => a !== author)
                  }))}
                  className="ml-1 hover:text-red-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}

            {filters.ageRanges.map(ageRange => (
              <Badge key={ageRange} variant="secondary" className="flex items-center gap-1">
                {ageRange}
                <button
                  onClick={() => setFilters(prev => ({
                    ...prev,
                    ageRanges: prev.ageRanges.filter(a => a !== ageRange)
                  }))}
                  className="ml-1 hover:text-red-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}

            {filters.availability !== 'all' && (
              <Badge variant="secondary" className="flex items-center gap-1">
                {filters.availability === 'available' ? 'Доступні' : 'Видані'}
                <button
                  onClick={() => setFilters(prev => ({ ...prev, availability: 'all' }))}
                  className="ml-1 hover:text-red-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}

            {filters.rating && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Рейтинг {filters.rating}+
                <button
                  onClick={() => setFilters(prev => ({ ...prev, rating: null }))}
                  className="ml-1 hover:text-red-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Results */}
      {error ? (
        <div className="text-center py-12 text-red-600">
          {error}
        </div>
      ) : displayedBooks.length === 0 ? (
        <div className="text-center py-12 text-gray-600">
          <Search className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium mb-2">Книги не знайдено</h3>
          <p className="text-sm">
            {query ? `За запитом "${query}" нічого не знайдено` : 'Спробуйте змінити фільтри'}
          </p>
        </div>
      ) : (
        <>
          {/* Books Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayedBooks.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>

          {/* Load More */}
          {hasMore && (
            <div className="flex justify-center pt-8">
              <LoadMoreButton
                onClick={loadMore}
                isLoading={isLoadingMore}
                hasMore={hasMore}
              />
            </div>
          )}
        </>
      )}

      {/* Advanced Filters Modal */}
      <AdvancedFilters
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters}
        onFiltersChange={setFilters}
        onApplyFilters={() => setShowFilters(false)}
        onClearFilters={clearFilters}
      />
    </div>
  );
}
