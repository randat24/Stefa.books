'use client';

import { useState, useEffect } from 'react';
import { X, SlidersHorizontal, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/Badge';
import { fetchCategories } from '@/lib/api/books';

interface FilterOptions {
  categories: string[];
  authors: string[];
  ageRanges: string[];
  availability: 'all' | 'available' | 'unavailable';
  rating: number | null;
  sortBy: 'title' | 'author' | 'rating' | 'date' | 'popularity';
  sortOrder: 'asc' | 'desc';
}

interface AdvancedFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
}

const AGE_RANGES = [
  '0-2 роки',
  '3-5 років', 
  '6-8 років',
  '9-12 років',
  '13+ років'
];

const SORT_OPTIONS = [
  { value: 'title', label: 'За назвою' },
  { value: 'author', label: 'За автором' },
  { value: 'rating', label: 'За рейтингом' },
  { value: 'date', label: 'За датою додавання' },
  { value: 'popularity', label: 'За популярністю' }
];

export function AdvancedFilters({ 
  isOpen, 
  onClose, 
  filters, 
  onFiltersChange, 
  onApplyFilters,
  onClearFilters 
}: AdvancedFiltersProps) {
  const [categories, setCategories] = useState<string[]>([]);
  const [authors, setAuthors] = useState<string[]>([]);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['categories', 'age']));
  const [loading, setLoading] = useState(true);

  // Load categories and authors
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [categoriesResponse] = await Promise.all([
          fetchCategories()
        ]);

        if (categoriesResponse.success) {
          if (categoriesResponse.type === 'structured') {
            const flatCategories = categoriesResponse.data.flatMap(cat => 
              [cat.name, ...(cat.subcategories || []).map(sub => sub.name)]
            );
            setCategories(flatCategories);
          } else {
            setCategories(categoriesResponse.data.map(cat => typeof cat === 'string' ? cat : cat.name));
          }
        }

        // Mock authors for now - in real app would come from API
        setAuthors([
          'Іван Франко',
          'Леся Українка', 
          'Тарас Шевченко',
          'Сергій Жадан',
          'Оксана Забужко',
          'Юрій Андрухович'
        ]);
      } catch (error) {
        console.error('Error loading filter data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const toggleCategory = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter(c => c !== category)
      : [...filters.categories, category];
    
    onFiltersChange({ ...filters, categories: newCategories });
  };

  const toggleAuthor = (author: string) => {
    const newAuthors = filters.authors.includes(author)
      ? filters.authors.filter(a => a !== author)
      : [...filters.authors, author];
    
    onFiltersChange({ ...filters, authors: newAuthors });
  };

  const toggleAgeRange = (ageRange: string) => {
    const newAgeRanges = filters.ageRanges.includes(ageRange)
      ? filters.ageRanges.filter(a => a !== ageRange)
      : [...filters.ageRanges, ageRange];
    
    onFiltersChange({ ...filters, ageRanges: newAgeRanges });
  };

  const handleRatingChange = (rating: number) => {
    onFiltersChange({ 
      ...filters, 
      rating: filters.rating === rating ? null : rating 
    });
  };

  const handleSortChange = (sortBy: string, sortOrder: string) => {
    onFiltersChange({ 
      ...filters, 
      sortBy: sortBy as FilterOptions['sortBy'],
      sortOrder: sortOrder as FilterOptions['sortOrder']
    });
  };

  const handleAvailabilityChange = (availability: string) => {
    onFiltersChange({ 
      ...filters, 
      availability: availability as FilterOptions['availability']
    });
  };

  const activeFiltersCount = 
    filters.categories.length + 
    filters.authors.length + 
    filters.ageRanges.length + 
    (filters.availability !== 'all' ? 1 : 0) + 
    (filters.rating ? 1 : 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-t-xl sm:rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5 text-neutral-600" />
            <h2 className="text-body-lg font-semibold">Фільтри та сортування</h2>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount}
              </Badge>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)] p-4 space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-2xl h-8 w-8 border-b-2 border-brand-accent"></div>
            </div>
          ) : (
            <>
              {/* Categories */}
              <div>
                <button
                  onClick={() => toggleSection('categories')}
                  className="flex items-center justify-between w-full text-left font-medium text-neutral-900 mb-3"
                >
                  <span>Категорії</span>
                  {expandedSections.has('categories') ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>
                {expandedSections.has('categories') && (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {categories.map((category) => (
                      <label
                        key={category}
                        className="flex items-center space-x-2 cursor-pointer hover:bg-neutral-50 p-2 rounded"
                      >
                        <input
                          type="checkbox"
                          checked={filters.categories.includes(category)}
                          onChange={() => toggleCategory(category)}
                          className="rounded border-neutral-300 text-brand-accent focus:ring-brand-accent"
                        />
                        <span className="text-body-sm text-neutral-700">{category}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Authors */}
              <div>
                <button
                  onClick={() => toggleSection('authors')}
                  className="flex items-center justify-between w-full text-left font-medium text-neutral-900 mb-3"
                >
                  <span>Автори</span>
                  {expandedSections.has('authors') ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>
                {expandedSections.has('authors') && (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {authors.map((author) => (
                      <label
                        key={author}
                        className="flex items-center space-x-2 cursor-pointer hover:bg-neutral-50 p-2 rounded"
                      >
                        <input
                          type="checkbox"
                          checked={filters.authors.includes(author)}
                          onChange={() => toggleAuthor(author)}
                          className="rounded border-neutral-300 text-brand-accent focus:ring-brand-accent"
                        />
                        <span className="text-body-sm text-neutral-700">{author}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Age Ranges */}
              <div>
                <button
                  onClick={() => toggleSection('age')}
                  className="flex items-center justify-between w-full text-left font-medium text-neutral-900 mb-3"
                >
                  <span>Вікова категорія</span>
                  {expandedSections.has('age') ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>
                {expandedSections.has('age') && (
                  <div className="space-y-2">
                    {AGE_RANGES.map((ageRange) => (
                      <label
                        key={ageRange}
                        className="flex items-center space-x-2 cursor-pointer hover:bg-neutral-50 p-2 rounded"
                      >
                        <input
                          type="checkbox"
                          checked={filters.ageRanges.includes(ageRange)}
                          onChange={() => toggleAgeRange(ageRange)}
                          className="rounded border-neutral-300 text-brand-accent focus:ring-brand-accent"
                        />
                        <span className="text-body-sm text-neutral-700">{ageRange}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Availability */}
              <div>
                <h3 className="font-medium text-neutral-900 mb-3">Доступність</h3>
                <div className="space-y-2">
                  {[
                    { value: 'all', label: 'Всі книги' },
                    { value: 'available', label: 'Тільки доступні' },
                    { value: 'unavailable', label: 'Тільки видані' }
                  ].map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center space-x-2 cursor-pointer hover:bg-neutral-50 p-2 rounded"
                    >
                      <input
                        type="radio"
                        name="availability"
                        value={option.value}
                        checked={filters.availability === option.value}
                        onChange={(e) => handleAvailabilityChange(e.target.value)}
                        className="text-brand-accent focus:ring-brand-accent"
                      />
                      <span className="text-body-sm text-neutral-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Rating */}
              <div>
                <h3 className="font-medium text-neutral-900 mb-3">Мінімальний рейтинг</h3>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => handleRatingChange(rating)}
                      className={`px-3 py-1 rounded-2xl text-body-sm font-medium transition-colors ${
                        filters.rating && filters.rating <= rating
                          ? 'bg-brand-accent text-neutral-0'
                          : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                      }`}
                    >
                      {rating}+
                    </button>
                  ))}
                </div>
              </div>

              {/* Sorting */}
              <div>
                <h3 className="font-medium text-neutral-900 mb-3">Сортування</h3>
                <div className="space-y-2">
                  {SORT_OPTIONS.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="sortBy"
                        value={option.value}
                        checked={filters.sortBy === option.value}
                        onChange={(e) => handleSortChange(e.target.value, filters.sortOrder)}
                        className="text-brand-accent focus:ring-brand-accent"
                      />
                      <span className="text-body-sm text-neutral-700">{option.label}</span>
                    </div>
                  ))}
                  <div className="ml-6 space-y-1">
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="sortOrder"
                        value="asc"
                        checked={filters.sortOrder === 'asc'}
                        onChange={(e) => handleSortChange(filters.sortBy, e.target.value)}
                        className="text-brand-accent focus:ring-brand-accent"
                      />
                      <span className="text-caption text-neutral-600">За зростанням</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="sortOrder"
                        value="desc"
                        checked={filters.sortOrder === 'desc'}
                        onChange={(e) => handleSortChange(filters.sortBy, e.target.value)}
                        className="text-brand-accent focus:ring-brand-accent"
                      />
                      <span className="text-caption text-neutral-600">За спаданням</span>
                    </label>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-4 flex gap-3">
          <Button variant="outline" onClick={onClearFilters} className="flex-1">
            Очистити
          </Button>
          <Button onClick={onApplyFilters} className="flex-1">
            Застосувати
          </Button>
        </div>
      </div>
    </div>
  );
}
