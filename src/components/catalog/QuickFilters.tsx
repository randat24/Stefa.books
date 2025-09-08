'use client';

import { Badge } from '@/components/ui/Badge';
import type { Book } from '@/lib/supabase';

interface QuickFiltersProps {
  books: Book[];
  selectedCategory: string;
  availableOnly: boolean;
  onCategoryChange: (category: string) => void;
  onAvailabilityChange: (availableOnly: boolean) => void;
  className?: string;
}

export function QuickFilters({ 
  books, 
  selectedCategory,
  availableOnly,
  onCategoryChange, 
  onAvailabilityChange,
  className = '' 
}: QuickFiltersProps) {
  // Извлекаем уникальные категории из книг
  const categories = [...new Set(books.map(book => book.category_id).filter(Boolean) as string[])].sort();
  
  // Подсчитываем количество книг в каждой категории
  const categoryCounts = categories.reduce((acc, category) => {
    acc[category] = books.filter(book => book.category_id === category).length;
    return acc;
  }, {} as Record<string, number>);

  const availableCount = books.filter(book => book.available).length;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Фильтр доступности */}
      <div>
        <h3 className="text-body-sm font-semibold text-gray-700 mb-3">Доступність</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onAvailabilityChange(false)}
            className={`px-4 py-2 rounded-2xl text-body-sm font-medium transition-all duration-200 ${
              !availableOnly 
                ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300'
            }`}
          >
            Всі книги ({books.length})
          </button>
          <button
            onClick={() => onAvailabilityChange(true)}
            className={`px-4 py-2 rounded-2xl text-body-sm font-medium transition-all duration-200 ${
              availableOnly 
                ? 'bg-green-100 text-green-800 border border-green-300' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300'
            }`}
          >
            Доступні ({availableCount})
          </button>
        </div>
      </div>

      {/* Фильтр категорий */}
      {categories.length > 0 && (
        <div>
          <h3 className="text-body-sm font-semibold text-gray-700 mb-3">Категорії</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onCategoryChange('')}
              className={`px-4 py-2 rounded-2xl text-body-sm font-medium transition-all duration-200 ${
                !selectedCategory 
                  ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300'
              }`}
            >
              Всі категорії
            </button>
            {categories.slice(0, 8).map(category => (
              <button
                key={category}
                onClick={() => onCategoryChange(category)}
                className={`px-4 py-2 rounded-2xl text-body-sm font-medium transition-all duration-200 ${
                  selectedCategory === category 
                    ? 'bg-blue-100 text-blue-800 border border-blue-300' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300'
                }`}
              >
                {category} ({categoryCounts[category]})
              </button>
            ))}
          </div>
          {categories.length > 8 && (
            <p className="text-caption text-gray-500 mt-2">
              Показано перші 8 категорій з {categories.length}
            </p>
          )}
        </div>
      )}

      {/* Активные фильтры */}
      {(selectedCategory || availableOnly) && (
        <div>
          <h3 className="text-body-sm font-semibold text-gray-700 mb-3">Активні фільтри</h3>
          <div className="flex flex-wrap gap-2">
            {selectedCategory && (
              <Badge 
                variant="secondary" 
                className="cursor-pointer hover:bg-gray-200"
                onClick={() => onCategoryChange('')}
              >
                {selectedCategory} ✕
              </Badge>
            )}
            {availableOnly && (
              <Badge 
                variant="secondary"
                className="cursor-pointer hover:bg-gray-200"
                onClick={() => onAvailabilityChange(false)}
              >
                Тільки доступні ✕
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
}