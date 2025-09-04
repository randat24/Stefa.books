'use client';

// Direct import test
import BookCard from '@/components/BookCard';

export default function TestDirectImportPage() {
  console.log('BookCard imported:', BookCard);
  console.log('Type of BookCard:', typeof BookCard);
  
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

  // Test if we can create a JSX element
  let element;
  try {
    element = <BookCard book={sampleBook} />;
    console.log('Successfully created BookCard element');
  } catch (error) {
    console.error('Error creating BookCard element:', error);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Direct Import Test</h1>
      <div className="max-w-sm">
        {BookCard && typeof BookCard === 'function' ? (
          <BookCard book={sampleBook} />
        ) : (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            Error: BookCard is not a valid function. Type: {typeof BookCard}
          </div>
        )}
      </div>
    </div>
  );
}