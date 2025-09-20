'use client';

import { useState, useEffect } from 'react';
import BookCard from '@/components/BookCard';
import { fetchBooks } from '@/lib/api/books';
import type { Book } from '@/lib/supabase';

export default function ReplicateErrorPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [displayedBooks, setDisplayedBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const booksResponse = await fetchBooks({ limit: 10 });
        
        if (booksResponse.success && booksResponse.data) {
          setBooks(booksResponse.data);
          setDisplayedBooks(booksResponse.data);
        }
      } catch (err) {
        console.error('Error loading books:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Replicate Error Test</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {(displayedBooks || []).map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>
    </div>
  );
}