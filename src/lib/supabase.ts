import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Create a fallback client if environment variables are missing
const createFallbackClient = () => {
  return createClient('https://placeholder.supabase.co', 'placeholder-key', {
    auth: {
      persistSession: false,
    },
  });
};

export const supabase = (supabaseUrl && supabaseKey)
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
      global: {
        headers: {
          'apikey': supabaseKey,
        },
      },
    })
  : createFallbackClient();

// Type-safe database types
export type Book = Database['public']['Tables']['books']['Row'];
export type BookInsert = Database['public']['Tables']['books']['Insert'];
export type BookUpdate = Database['public']['Tables']['books']['Update'];

// User types
export type User = Database['public']['Tables']['users']['Row'];
export type UserInsert = Database['public']['Tables']['users']['Insert'];
export type UserUpdate = Database['public']['Tables']['users']['Update'];

// Extended book type with author and category relations
export type BookWithAuthor = Book & {
  author_info?: {
    id: string;
    name: string;
  } | null;
  category_info?: {
    id: string;
    name: string;
  } | null;
  subcategory_info?: {
    id: string;
    name: string;
  } | null;
};
// Простые типы вместо database типов для несуществующих таблиц
export type Category = {
  id: string;
  name: string;
  slug: string;
  parent_id?: string | null;
  sort_order?: number | null;
  is_active?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type CategoryInsert = Omit<Category, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type CategoryUpdate = Partial<CategoryInsert>;

export type SearchQuery = {
  id: string;
  query: string;
  count: number;
  created_at: string;
};

// Extended types for category hierarchy
export type CategoryWithParent = Category & {
  parent_name?: string;
  parent_slug?: string;
};

export type CategoryTree = Category & {
  level: number;
  path: string[];
  children?: CategoryTree[];
};

export type CategoryBreadcrumb = {
  id: string;
  name: string;
  slug: string;
  level: number;
};