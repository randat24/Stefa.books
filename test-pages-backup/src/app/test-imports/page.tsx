'use client';

import BookCardDefault from '@/components/BookCard';
import { BookCard as BookCardNamed } from '@/components/BookCard';

export default function TestImportsPage() {
  // Sample book data for testing
  const sampleBook = {
    id: 'test-id',
    code: 'test-code',
    title: 'Тестова книга',
    author: 'Тестовий автор',
    category: 'Тестова категорія',
    subcategory: null,
    description: null,
    short_description: null,
    isbn: null,
    pages: null,
    age_range: null,
    language: null,
    publisher: null,
    publication_year: null,
    cover_url: '/images/book-placeholder.svg',
    status: 'available',
    available: true,
    qty_total: 1,
    qty_available: 1,
    price_uah: null,
    full_price_uah: null,
    location: null,
    rating: null,
    rating_count: null,
    badges: null,
    tags: null,
    search_vector: null,
    search_text: null,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Тест імпорту BookCard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Default Import</h2>
          <div className="border p-4 rounded">
            {typeof BookCardDefault === "function" ? (
              <div>
                <p className="text-green-600 mb-2">Default import successful: BookCard is defined</p>
                <BookCardDefault book={sampleBook} />
              </div>
            ) : (
              <p className="text-red-600">Default import failed: BookCard is undefined</p>
            )}
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Named Import</h2>
          <div className="border p-4 rounded">
            {typeof BookCardNamed === "function" ? (
              <div>
                <p className="text-green-600 mb-2">Named import successful: BookCard is defined</p>
                <BookCardNamed book={sampleBook} />
              </div>
            ) : (
              <p className="text-red-600">Named import failed: BookCard is undefined</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}