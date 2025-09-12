/**
 * Утилиты для работы с данными книг
 */

interface DatabaseBook {
  id: string;
  title: string;
  author: string;
  description?: string | null;
  cover_url?: string | null;
  published_date?: string | null;
  isbn?: string | null;
  pages?: number | null;
  language?: string | null;
  category_id?: string | null;
  rating?: number | null;
  review_count?: number | null;
  age_min?: number | null;
  age_max?: number | null;
  available?: boolean | null;
  price?: number | null;
  currency?: string | null;
  [key: string]: any;
}

interface Book {
  id: string;
  title: string;
  author: string;
  description?: string;
  cover_url?: string;
  published_date?: string;
  isbn?: string;
  pages?: number;
  language?: string;
  category?: string;
  rating?: number;
  review_count?: number;
  age_min?: number;
  age_max?: number;
  available?: boolean;
  price?: number;
  currency?: string;
}

export function transformDatabaseBookToBook(dbBook: DatabaseBook): Book {
  return {
    id: dbBook.id,
    title: dbBook.title,
    author: dbBook.author,
    description: dbBook.description || undefined,
    cover_url: dbBook.cover_url || undefined,
    published_date: dbBook.published_date || undefined,
    isbn: dbBook.isbn || undefined,
    pages: dbBook.pages || undefined,
    language: dbBook.language || undefined,
    category: dbBook.category_id || undefined,
    rating: dbBook.rating || undefined,
    review_count: dbBook.review_count || undefined,
    age_min: dbBook.age_min || undefined,
    age_max: dbBook.age_max || undefined,
    available: dbBook.available || false,
    price: dbBook.price || undefined,
    currency: dbBook.currency || undefined
  };
}
