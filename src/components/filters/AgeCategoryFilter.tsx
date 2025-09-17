'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/cn';

interface AgeCategory {
  id: string;
  name: string;
  slug: string;
  min_age: number | null;
  max_age: number | null;
  description: string | null;
}

interface AgeCategoryFilterProps {
  selectedAgeCategories: string[];
  onAgeCategoriesChange: (categories: string[]) => void;
  className?: string;
}

export function AgeCategoryFilter({ 
  selectedAgeCategories, 
  onAgeCategoriesChange,
  className = ''
}: AgeCategoryFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [ageCategories, setAgeCategories] = useState<AgeCategory[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch age categories
  useEffect(() => {
    const fetchAgeCategories = async () => {
      try {
        const response = await fetch('/api/age-categories');
        if (response.ok) {
          const data = await response.json();
          setAgeCategories(data);
        }
      } catch (error) {
        console.error('Error fetching age categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAgeCategories();
  }, []);

  const handleToggleCategory = (categoryId: string) => {
    if (selectedAgeCategories.includes(categoryId)) {
      onAgeCategoriesChange(selectedAgeCategories.filter(id => id !== categoryId));
    } else {
      onAgeCategoriesChange([...selectedAgeCategories, categoryId]);
    }
  };

  const handleClearAll = () => {
    onAgeCategoriesChange([]);
  };

  const getSelectedCount = () => {
    return selectedAgeCategories.length;
  };

  const getSelectedNames = () => {
    return selectedAgeCategories
      .map(id => ageCategories.find(cat => cat.id === id)?.name)
      .filter(Boolean)
      .join(', ');
  };

  if (loading) {
    return (
      <div className={cn('relative', className)}>
        <div className="w-full h-12 bg-neutral-100 rounded-lg animate-pulse" />
      </div>
    );
  }

  return (
    <div className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full flex items-center justify-between px-4 py-3 text-left',
          'bg-white border border-neutral-200 rounded-lg',
          'hover:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent',
          'transition-colors duration-200'
        )}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <div className="flex-1 min-w-0">
          <span className="block text-sm font-medium text-neutral-900">
            Вікова категорія
          </span>
          {getSelectedCount() > 0 ? (
            <span className="block text-xs text-neutral-500 truncate">
              {getSelectedNames()}
            </span>
          ) : (
            <span className="block text-xs text-neutral-400">
              Оберіть вікову категорію
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2 ml-2">
          {getSelectedCount() > 0 && (
            <button
              type="button"
              onClick={(e: React.MouseEvent<HTMLInputElement>) => {
                e.stopPropagation();
                handleClearAll();
              }}
              className="p-1 hover:bg-neutral-100 rounded transition-colors"
              aria-label="Очистити всі"
            >
              <X className="h-4 w-4 text-neutral-400" />
            </button>
          )}
          <ChevronDown 
            className={cn(
              'h-4 w-4 text-neutral-400 transition-transform duration-200',
              isOpen && 'rotate-180'
            )} 
          />
        </div>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
          <div className="p-2">
            {ageCategories.map((category) => (
              <label
                key={category.id}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer',
                  'hover:bg-neutral-50 transition-colors duration-150'
                )}
              >
                <input
                  type="checkbox"
                  checked={selectedAgeCategories.includes(category.id)}
                  onChange={() => handleToggleCategory(category.id)}
                  className="h-4 w-4 text-accent focus:ring-accent border-neutral-300 rounded"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-neutral-900">
                    {category.name}
                  </div>
                  {category.description && (
                    <div className="text-xs text-neutral-500">
                      {category.description}
                    </div>
                  )}
                </div>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
