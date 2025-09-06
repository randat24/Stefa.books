import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false, // Since we're not using authentication yet
  },
});

// Type-safe database types
export type Book = Database['public']['Tables']['books']['Row'];
export type BookInsert = Database['public']['Tables']['books']['Insert'];
export type BookUpdate = Database['public']['Tables']['books']['Update'];
export type Author = Database['public']['Tables']['authors']['Row'];

// User types
export type User = Database['public']['Tables']['users']['Row'];
export type UserInsert = Database['public']['Tables']['users']['Insert'];
export type UserUpdate = Database['public']['Tables']['users']['Update'];

// Extended book type with author and category relations
export type BookWithAuthor = Book & {
  authors?: Author | null;
  category_info?: {
    id: string;
    name: string;
  } | null;
  subcategory_info?: {
    id: string; 
    name: string;
  } | null;
};
export type Category = Database['public']['Tables']['categories']['Row'];
export type CategoryInsert = Database['public']['Tables']['categories']['Insert'];
export type CategoryUpdate = Database['public']['Tables']['categories']['Update'];
export type SearchQuery = Database['public']['Tables']['search_queries']['Row'];

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