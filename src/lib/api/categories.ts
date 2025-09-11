import { supabase } from '@/lib/supabase';
import type { Category, CategoryTree, CategoryBreadcrumb } from '@/lib/supabase';
import { logger } from '@/lib/logger';

export interface CategoriesResponse {
  success: boolean;
  data: Category[];
  error?: string;
  count?: number;
}

export interface CategoryResponse {
  success: boolean;
  data: Category | null;
  error?: string;
}

export interface CategoryTreeResponse {
  success: boolean;
  data: CategoryTree[];
  error?: string;
}

export interface CategoryBreadcrumbsResponse {
  success: boolean;
  data: CategoryBreadcrumb[];
  error?: string;
}

/**
 * Получение всех активных категорий
 */
export async function fetchCategories(): Promise<CategoriesResponse> {
  try {
    const { data, error, count } = await supabase
      .from('categories')
      .select('*', { count: 'exact' })
      .eq('is_active', true)
      .order('sort_order')
      .order('name');

    if (error) {
      logger.error('Error fetching categories', error);
      return { success: false, data: [], error: error.message };
    }

    logger.info(`✅ Fetched ${data?.length || 0} categories`);
    return { success: true, data: data || [], count: count || 0 };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Unexpected error fetching categories', { error: message });
    return { success: false, data: [], error: message };
  }
}

/**
 * Получение дерева категорий (иерархическая структура)
 */
export async function fetchCategoryTree(parentId?: string): Promise<CategoryTreeResponse> {
  try {
    // Используем новый API endpoint для категорий
    const baseUrl = typeof window === 'undefined' 
      ? process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
      : window.location.origin;
    
    const url = `${baseUrl}/api/categories?tree=true${parentId ? `&parent_id=${parentId}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Error fetching category tree');
    }

    logger.info(`✅ Fetched category tree with ${result.data?.length || 0} categories`);
    return { success: true, data: result.data || [] };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Unexpected error fetching category tree', { error: message });
    return { success: false, data: [], error: message };
  }
}

/**
 * Получение категории по ID
 */
export async function fetchCategory(id: string): Promise<CategoryResponse> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (error) {
      logger.error('Error fetching category', { id, error });
      return { success: false, data: null, error: error.message };
    }

    logger.info(`✅ Fetched category: ${(data as any)?.name || 'unknown'}`);
    return { success: true, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Unexpected error fetching category', { error: message });
    return { success: false, data: null, error: message };
  }
}

/**
 * Получение категории по slug
 */
export async function fetchCategoryBySlug(slug: string): Promise<CategoryResponse> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (error) {
      logger.error('Error fetching category by slug', { slug, error });
      return { success: false, data: null, error: error.message };
    }

    logger.info(`✅ Fetched category by slug: ${(data as any)?.name || 'unknown'}`);
    return { success: true, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Unexpected error fetching category by slug', { error: message });
    return { success: false, data: null, error: message };
  }
}

/**
 * Получение хлебных крошек для категории
 */
export async function fetchCategoryBreadcrumbs(categoryId: string): Promise<CategoryBreadcrumbsResponse> {
  try {
    // Используем новый API endpoint для хлебных крошек
    const baseUrl = typeof window === 'undefined' 
      ? process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
      : window.location.origin;
    
    const response = await fetch(`${baseUrl}/api/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: 'get_breadcrumbs',
        category_id: categoryId
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Error fetching breadcrumbs');
    }

    logger.info(`✅ Fetched breadcrumbs for category ${categoryId}`);
    return { success: true, data: result.data || [] };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Unexpected error fetching category breadcrumbs', { error: message });
    return { success: false, data: [], error: message };
  }
}

/**
 * Получение дочерних категорий
 */
export async function fetchChildCategories(parentId: string): Promise<CategoriesResponse> {
  try {
    // Используем новый API endpoint
    const baseUrl = typeof window === 'undefined' 
      ? process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
      : window.location.origin;
    
    const response = await fetch(`${baseUrl}/api/categories?parent_id=${parentId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Error fetching child categories');
    }

    logger.info(`✅ Fetched ${result.data?.length || 0} child categories for parent ${parentId}`);
    return { success: true, data: result.data || [], count: result.count || 0 };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Unexpected error fetching child categories', { error: message });
    return { success: false, data: [], error: message };
  }
}

/**
 * Получение категорий по возрасту
 */
export async function fetchAgeCategories(): Promise<CategoriesResponse> {
  try {
    const { data: ageParent } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', 'age')
      .single();

    if (!ageParent) {
      return { success: false, data: [], error: 'Age parent category not found' };
    }

    return fetchChildCategories((ageParent as any)?.id);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Unexpected error fetching age categories', { error: message });
    return { success: false, data: [], error: message };
  }
}

/**
 * Получение категорий по жанрам
 */
export async function fetchGenreCategories(): Promise<CategoriesResponse> {
  try {
    const { data: genreParent } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', 'genre')
      .single();

    if (!genreParent) {
      return { success: false, data: [], error: 'Genre parent category not found' };
    }

    return fetchChildCategories((genreParent as any)?.id);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Unexpected error fetching genre categories', { error: message });
    return { success: false, data: [], error: message };
  }
}

/**
 * Вспомогательная функция для построения дерева категорий
 */
// function buildCategoryTree(flatList: any[]): CategoryTree[] {
//   const itemsById: Record<string, any> = {};
//   const rootItems: any[] = [];

//   // Сначала создаем объекты для всех элементов
//   flatList.forEach(item => {
//     itemsById[item.id] = {
//       ...item,
//       children: []
//     };
//   });

//   // Затем строим иерархию
//   flatList.forEach(item => {
//     const currentItem = itemsById[item.id];
    
//     if (item.parent_id && itemsById[item.parent_id]) {
//       // Добавляем к родительскому элементу
//       if (!itemsById[item.parent_id].children) {
//         itemsById[item.parent_id].children = [];
//       }
//       itemsById[item.parent_id].children!.push(currentItem);
//     } else {
//       // Это корневой элемент
//       rootItems.push(currentItem);
//     }
//   });

//   // Сортируем детей по sort_order (если поле существует)
//   Object.values(itemsById).forEach(item => {
//     if (item.children && item.children.length > 0) {
//       item.children.sort((a: any, b: any) => {
//         const sortA = a.sort_order || a.display_order || 0;
//         const sortB = b.sort_order || b.display_order || 0;
//         return sortA - sortB;
//       });
//     }
//   });

//   return rootItems.sort((a: any, b: any) => {
//     const sortA = a.sort_order || a.display_order || 0;
//     const sortB = b.sort_order || b.display_order || 0;
//     return sortA - sortB;
//   });
// }

/**
 * Получение статистики по категориям (количество книг)
 */
export async function fetchCategoryStats(): Promise<{ success: boolean; data: any[]; error?: string }> {
  try {
    // Временно возвращаем пустую статистику до миграции БД
    logger.info('📊 Category stats temporarily disabled until DB migration');
    return { success: true, data: [] };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Unexpected error fetching category stats', { error: message });
    return { success: false, data: [], error: message };
  }
}