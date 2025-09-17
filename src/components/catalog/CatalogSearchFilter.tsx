'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, Filter, X, ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SearchFilters {
  search: string;
  category: string;
  author: string;
  availableOnly: boolean;
  minRating: number;
}

interface CatalogSearchFilterProps {
  onFiltersChange: (filters: SearchFilters) => void;
  categories: string[];
  authors: string[];
  className?: string;
}

export function CatalogSearchFilter({
  onFiltersChange,
  categories,
  authors,
  className = ''
}: CatalogSearchFilterProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    search: '',
    category: '',
    author: '',
    availableOnly: false,
    minRating: 0
  });

  const [showFilters, setShowFilters] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [showAuthors, setShowAuthors] = useState(false);
  
  const searchInputRef = useRef<HTMLInputElement | null | null>(null);
  const categoryDropdownRef = useRef<HTMLDivElement | null | null>(null);
  const authorDropdownRef = useRef<HTMLDivElement | null | null>(null);

  // Handle clicks outside dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(target)) {
        setShowCategories(false);
      }
      if (authorDropdownRef.current && !authorDropdownRef.current.contains(target)) {
        setShowAuthors(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update parent when filters change
  useEffect(() => {
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  const updateFilter = <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      author: '',
      availableOnly: false,
      minRating: 0
    });
  };

  const activeFilterCount = 
    (filters.category ? 1 : 0) +
    (filters.author ? 1 : 0) +
    (filters.availableOnly ? 1 : 0) +
    (filters.minRating > 0 ? 1 : 0);

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Search is handled by the filter change effect
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Main Search Bar */}
      <div className="relative mb-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={filters.search}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateFilter('search', e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Пошук по назві, автору, опису..."
              className="w-full h-12 pl-12 pr-12 rounded-2xl border-2 border-neutral-200 bg-[var(--surface-2)] text-neutral-900 placeholder:text-neutral-500 focus:border-accent-light focus:outline-none transition-colors"
            />
            {filters.search && (
              <button
                onClick={() => updateFilter('search', '')}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-neutral-100 rounded-2xl transition-colors"
              >
                <X className="h-4 w-4 text-neutral-400" />
              </button>
            )}
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-3 rounded-2xl border-2 transition-colors relative ${
              showFilters 
                ? 'bg-yellow-50 border-accent-light text-accent-dark' 
                : 'bg-transparent border-neutral-200 text-neutral-600 hover:border-neutral-300'
            }`}
          >
            <Filter className="h-5 w-5" />
            {activeFilterCount > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 text-caption bg-accent text-neutral-0 rounded-2xl flex items-center justify-center">
                {activeFilterCount}
              </Badge>
            )}
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="mb-6 p-6 border-2 border-neutral-200 rounded-2xl bg-transparent">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-body-lg font-semibold text-neutral-900">Фільтри</h3>
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="text-body-sm text-neutral-500 hover:text-neutral-700 transition-colors"
              >
                Очистити все
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Category Filter */}
            <div className="relative" ref={categoryDropdownRef}>
              <label className="block text-body-sm font-medium text-neutral-700 mb-2">
                Категорія
              </label>
              <button
                onClick={() => setShowCategories(!showCategories)}
                className="w-full p-3 text-left border border-neutral-300 rounded-lg bg-[var(--surface-2)] hover:bg-neutral-50 transition-colors flex items-center justify-between"
              >
                <span className={filters.category ? 'text-neutral-900' : 'text-neutral-500'}>
                  {filters.category || 'Всі категорії'}
                </span>
                <ChevronDown className={`h-4 w-4 text-neutral-400 transition-transform ${showCategories ? 'rotate-180' : ''}`} />
              </button>
              
              {showCategories && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                  <button
                    onClick={() => {
                      updateFilter('category', '');
                      setShowCategories(false);
                    }}
                    className="w-full p-3 text-left hover:bg-neutral-50 transition-colors text-sm"
                  >
                    Всі категорії
                  </button>
                  {categories.map(category => (
                    <button
                      key={category}
                      onClick={() => {
                        updateFilter('category', category);
                        setShowCategories(false);
                      }}
                      className={`w-full p-3 text-left hover:bg-neutral-50 transition-colors text-body-sm ${
                        filters.category === category ? 'bg-yellow-50 text-yellow-800' : ''
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Author Filter */}
            <div className="relative" ref={authorDropdownRef}>
              <label className="block text-body-sm font-medium text-neutral-700 mb-2">
                Автор
              </label>
              <button
                onClick={() => setShowAuthors(!showAuthors)}
                className="w-full p-3 text-left border border-neutral-300 rounded-lg bg-[var(--surface-2)] hover:bg-neutral-50 transition-colors flex items-center justify-between"
              >
                <span className={filters.author ? 'text-neutral-900' : 'text-neutral-500'}>
                  {filters.author || 'Всі автори'}
                </span>
                <ChevronDown className={`h-4 w-4 text-neutral-400 transition-transform ${showAuthors ? 'rotate-180' : ''}`} />
              </button>
              
              {showAuthors && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                  <button
                    onClick={() => {
                      updateFilter('author', '');
                      setShowAuthors(false);
                    }}
                    className="w-full p-3 text-left hover:bg-neutral-50 transition-colors text-sm"
                  >
                    Всі автори
                  </button>
                  {authors.slice(0, 20).map(author => (
                    <button
                      key={author}
                      onClick={() => {
                        updateFilter('author', author);
                        setShowAuthors(false);
                      }}
                      className={`w-full p-3 text-left hover:bg-neutral-50 transition-colors text-body-sm ${
                        filters.author === author ? 'bg-yellow-50 text-yellow-800' : ''
                      }`}
                    >
                      {author}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Availability Filter */}
            <div>
              <label className="block text-body-sm font-medium text-neutral-700 mb-2">
                Доступність
              </label>
              <label className="flex items-center gap-3 p-3 border border-neutral-300 rounded-lg bg-transparent hover:bg-neutral-50 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.availableOnly}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateFilter('availableOnly', e.target.checked)}
                  className="w-4 h-4 text-accent rounded border-neutral-300 focus:ring-accent"
                />
                <span className="text-body-sm text-neutral-700">Тільки доступні</span>
              </label>
            </div>

            {/* Rating Filter */}
            <div>
              <label className="block text-body-sm font-medium text-neutral-700 mb-2">
                Мінімальний рейтинг
              </label>
              <select
                value={filters.minRating}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateFilter('minRating', Number(e.target.value))}
                className="w-full p-3 border border-neutral-300 rounded-lg bg-[var(--surface-2)] focus:border-accent-light focus:outline-none transition-colors"
              >
                <option value={0}>Будь-який</option>
                <option value={3}>3+ ⭐</option>
                <option value={4}>4+ ⭐</option>
                <option value={4.5}>4.5+ ⭐</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {filters.category && (
            <Badge 
              variant="secondary"
              className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 cursor-pointer"
              onClick={() => updateFilter('category', '')}
            >
              Категорія: {filters.category}
              <X className="h-3 w-3 ml-1" />
            </Badge>
          )}
          {filters.author && (
            <Badge 
              variant="secondary"
              className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 cursor-pointer"
              onClick={() => updateFilter('author', '')}
            >
              Автор: {filters.author}
              <X className="h-3 w-3 ml-1" />
            </Badge>
          )}
          {filters.availableOnly && (
            <Badge 
              variant="secondary"
              className="bg-green-100 text-green-800 hover:bg-green-200 cursor-pointer"
              onClick={() => updateFilter('availableOnly', false)}
            >
              Тільки доступні
              <X className="h-3 w-3 ml-1" />
            </Badge>
          )}
          {filters.minRating > 0 && (
            <Badge 
              variant="secondary"
              className="bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-pointer"
              onClick={() => updateFilter('minRating', 0)}
            >
              {filters.minRating}+ ⭐
              <X className="h-3 w-3 ml-1" />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}