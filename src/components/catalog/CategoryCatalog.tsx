'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchCategoryTree } from '@/lib/api/categories';
// import type { CategoryTree } from '@/lib/supabase'; // Will be used for future features
import { logger } from '@/lib/logger';

// Тип категории для каталога (совместим с mock и реальными данными)
interface CategoryWithDetails {
  id: string;
  name: string;
  parent_id?: string | null;
  slug?: string;
  icon?: string | null;
  color?: string | null;
  sort_order?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  level?: number;
  path?: string[];
  children?: CategoryWithDetails[];
}

interface CategoryCatalogProps {
  onCategorySelect?: (category: CategoryWithDetails) => void;
  showBooksCount?: boolean;
  className?: string;
}

export function CategoryCatalog({ 
  onCategorySelect, 
  showBooksCount = false,
  className = "" 
}: CategoryCatalogProps) {
  const [categoryTree, setCategoryTree] = useState<CategoryWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('CategoryCatalog: useEffect triggered');
    loadCategories();
  }, []);

  const loadCategories = async () => {
    console.log('CategoryCatalog: loadCategories started');
    try {
      setLoading(true);
      setError(null);

      const response = await fetchCategoryTree();
      console.log('CategoryCatalog: API response:', response);
      
      if (response.success) {
        console.log('CategoryCatalog: Loaded categories:', response.data.length, response.data.map(c => c.name));
        setCategoryTree(response.data as CategoryWithDetails[]);
      } else {
        console.error('CategoryCatalog: Failed to load categories:', response.error);
        setError(response.error || 'Помилка завантаження категорій');
      }
    } catch (err) {
      console.error('CategoryCatalog: Exception:', err);
      const errorMessage = err instanceof Error ? err.message : 'Невідома помилка';
      setError(errorMessage);
      logger.error('Error loading category catalog', err);
    } finally {
      console.log('CategoryCatalog: Setting loading to false');
      setLoading(false);
    }
  };

  const handleCategoryClick = (category: CategoryWithDetails, event: React.MouseEvent) => {
    if (onCategorySelect) {
      event.preventDefault();
      onCategorySelect(category);
    }
  };

  const renderCategoryGroup = (category: CategoryWithDetails) => {
    const hasChildren = category.children && category.children.length > 0;
    
    return (
      <div key={category.id} className="mb-6">
        {/* Если категория без детей - показываем как обычную ссылку */}
        {!hasChildren ? (
          <Link
            href={`/books?category=${category.slug || category.name}`}
            onClick={(e) => handleCategoryClick(category, e)}
            className="flex items-center gap-3 p-4 rounded-xl hover:bg-neutral-50 transition-colors group"
            style={{ 
              backgroundColor: category.color ? `${category.color}20` : '#F8FAFC',
              borderLeft: `4px solid ${category.color || '#64748B'}` 
            }}
          >
            <span className="text-h2" role="img" aria-label={category.name}>
              {category.icon || '📚'}
            </span>
            <h3 className="text-body-lg font-semibold text-neutral-800 group-hover:text-neutral-900">
              {category.name}
            </h3>
            {showBooksCount && (
              <span className="ml-auto text-body-sm text-neutral-500 bg-neutral-100 px-2 py-1 rounded-2xl">
                {/* TODO: Add books count from stats */}
                5
              </span>
            )}
          </Link>
        ) : (
          <div>
            {/* Заголовок группы */}
            <div 
              className="flex items-center gap-3 mb-4 p-3 rounded-xl"
              style={{ 
                backgroundColor: category.color ? `${category.color}20` : '#F8FAFC',
                borderLeft: `4px solid ${category.color || '#64748B'}` 
              }}
            >
              <span className="text-h2" role="img" aria-label={category.name}>
                {category.icon || '📚'}
              </span>
              <h3 className="text-body-lg font-semibold text-neutral-800">
                {category.name}
              </h3>
            </div>

            {/* Подкатегории */}
            <div className="space-y-2 ml-6">
              {category.children!.map((subcategory) => (
                <Link
                  key={subcategory.id}
                  href={`/books?category=${subcategory.slug || subcategory.name}`}
                  onClick={(e) => handleCategoryClick(subcategory, e)}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-50 transition-colors group"
                >
                  <span className="w-6 h-6 flex items-center justify-center text-neutral-400 group-hover:text-neutral-600">
                    📄
                  </span>
                  <span className="text-neutral-700 group-hover:text-neutral-900 font-medium">
                    {subcategory.name}
                  </span>
                  {showBooksCount && (
                    <span className="ml-auto text-body-sm text-neutral-500 bg-neutral-100 px-2 py-1 rounded-2xl">
                      {/* TODO: Add books count from stats */}
                      12
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center py-12 ${className}`}>
        <div className="flex items-center gap-3 text-neutral-600">
          <div className="w-5 h-5 border-2 border-neutral-300 border-t-slate-600 rounded-2xl animate-spin"></div>
          <span>Завантаження каталогу...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="text-red-600 mb-4">❌ {error}</div>
        <button
          onClick={loadCategories}
          className="px-4 py-2 bg-neutral-900 text-neutral-0 rounded-2xl hover:bg-neutral-800 transition-colors"
        >
          Спробувати знову
        </button>
      </div>
    );
  }

  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      {/* Заголовок каталога */}
      <div className="flex items-center gap-3 mb-8">
        <span className="text-3xl">📚</span>
        <h2 className="text-h2 text-neutral-900">Повний каталог</h2>
      </div>

      {/* Категории */}
      <div className="space-y-8">
        {categoryTree.map(renderCategoryGroup)}
      </div>

      {/* Если нет категорий */}
      {categoryTree.length === 0 && (
        <div className="text-center py-12 text-neutral-500">
          <span className="text-display mb-4 block">📭</span>
          <p>Категорії поки що не налаштовані</p>
        </div>
      )}
    </div>
  );
}