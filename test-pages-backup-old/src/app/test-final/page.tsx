'use client';

// Final test with direct import
import BookCard from '@/components/BookCard';

// Test multiple import methods
import BookCardDefault from '@/components/BookCard';
import { BookCard as BookCardNamed } from '@/components/BookCard';

export default function TestFinalPage() {
  console.log('Direct import BookCard:', BookCard);
  console.log('Default import BookCardDefault:', BookCardDefault);
  console.log('Named import BookCardNamed:', BookCardNamed);
  
  console.log('Types:');
  console.log('typeof BookCard:', typeof BookCard);
  console.log('typeof BookCardDefault:', typeof BookCardDefault);
  console.log('typeof BookCardNamed:', typeof BookCardNamed);

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
      <h1 className="text-2xl font-bold mb-6">Фінальний тест BookCard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Direct Import</h2>
          <div className="border p-4 rounded">
            {BookCard && typeof BookCard === 'function' ? (
              <BookCard book={sampleBook} />
            ) : (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                Error: BookCard is not a valid function. Type: {typeof BookCard}
              </div>
            )}
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Default Import</h2>
          <div className="border p-4 rounded">
            {BookCardDefault && typeof BookCardDefault === 'function' ? (
              <BookCardDefault book={sampleBook} />
            ) : (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                Error: BookCardDefault is not a valid function. Type: {typeof BookCardDefault}
              </div>
            )}
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Named Import</h2>
          <div className="border p-4 rounded">
            {BookCardNamed && typeof BookCardNamed === 'function' ? (
              <BookCardNamed book={sampleBook} />
            ) : (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                Error: BookCardNamed is not a valid function. Type: {typeof BookCardNamed}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}