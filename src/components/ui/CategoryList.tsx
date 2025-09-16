'use client';

import { useEffect, useState } from 'react';
import { useSupabase } from '@/lib/hooks/useSupabase';
import type { Category } from '@/lib/supabase';
import { Spinner } from './spinner';

interface CategoryListProps {
  className?: string;
  onCategorySelect?: (categoryId: string) => void;
}

export function CategoryList({ className, onCategorySelect }: CategoryListProps) {
  const { supabase, isLoading: clientLoading, error: clientError } = useSupabase();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (clientLoading || !supabase) return;

    const fetchCategories = async () => {
      try {
        setLoading(true);
        // Используем клиент Supabase с правильными заголовками
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .eq('active', true)
          .order('sort_order');

        if (error) throw error;
        
        setCategories(data || []);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch categories'));
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [supabase, clientLoading]);

  if (clientLoading || loading) {
    return <Spinner className="mx-auto my-4" />;
  }

  if (clientError || error) {
    return (
      <div className="text-red-500 p-4 bg-red-50 rounded-md">
        Помилка завантаження категорій: {(clientError || error)?.message}
      </div>
    );
  }

  if (categories.length === 0) {
    return <p className="text-neutral-500 p-4">Категорії не знайдено</p>;
  }

  return (
    <div className={className}>
      <ul className="space-y-2">
        {categories.map((category) => (
          <li key={category.id} className="transition-colors">
            <button
              onClick={() => onCategorySelect?.(category.id)}
              className="w-full text-left px-3 py-2 rounded-md hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <span className="flex items-center">
                {category.icon && (
                  <span className="mr-2 text-brand-600">{category.icon}</span>
                )}
                {category.name}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
