'use client';

import BookCard from '@/components/BookCard';

export default function MinimalTestPage() {
  const books = [
    {
      id: '1',
      code: 'test-1',
      title: 'Тестова книга 1',
      author: 'Автор 1',
      category: 'Категорія 1',
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
    },
    {
      id: '2',
      code: 'test-2',
      title: 'Тестова книга 2',
      author: 'Автор 2',
      category: 'Категорія 2',
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
      status: 'unavailable',
      available: false,
      qty_total: 0,
      qty_available: 0,
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
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Minimal Test</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {books.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>
    </div>
  );
}