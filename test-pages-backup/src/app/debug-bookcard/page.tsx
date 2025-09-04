'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// Dynamically import BookCard to see if there's a module resolution issue
const BookCard = dynamic(() => import('@/components/BookCard'), {
  ssr: false,
  loading: () => <p>Loading BookCard...</p>
});

export default function DebugBookCardPage() {
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
      <h1 className="text-2xl font-bold mb-6">Debug BookCard Component</h1>
      <div className="max-w-sm">
        <React.Suspense fallback={<p>Loading...</p>}>
          <BookCard book={sampleBook} />
        </React.Suspense>
      </div>
    </div>
  );
}