'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/Badge';
import BookCard from '@/components/BookCard';
import { fetchBooksByCategory } from '@/lib/api/books';
import type { Book } from '@/lib/supabase';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function CategoryPage() {
  const params = useParams();
  const categoryName = decodeURIComponent(params.id as string);
  
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    const loadBooks = async () => {
      try {
        setLoading(true);
        const response = await fetchBooksByCategory(categoryName);
        if (response.success) {
          setBooks(response.data);
        }
      } catch (error) {
        console.error('Error loading books:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadBooks();
  }, [categoryName]);
  
  const filteredBooks = books.filter(book => 
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <div className="mb-6">
        <nav className="flex items-center space-x-2 text-sm text-gray-600">
          <Link href="/" className="hover:text-gray-900">Головна</Link>
          <ChevronRight className="h-4 w-4" />
          <Link href="/catalog" className="hover:text-gray-900">Каталог</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-gray-900 font-medium">{categoryName}</span>
        </nav>
      </div>
      
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{categoryName}</h1>
          <p className="text-gray-600 mt-1">Українські дитячі книги категорії &quot;{categoryName}&quot;</p>
        </div>
        <Badge variant="secondary" className="text-lg py-2 px-4 mt-4 md:mt-0">
          {filteredBooks.length} {filteredBooks.length === 1 ? 'книга' : 'книг'}
        </Badge>
      </div>
      
      {/* Search */}
      <div className="mb-8">
        <Label htmlFor="search" className="sr-only">Пошук книг в категорії {categoryName}</Label>
        <Input
          id="search"
          placeholder={`Пошук книг в категорії "${categoryName}"...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="text-lg text-gray-600">Завантаження книг...</div>
        </div>
      ) : (
        <>
          {/* Books Grid - matching the books page layout */}
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredBooks.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
          
          {filteredBooks.length === 0 && !loading && (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Книги не знайдені</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm 
                  ? 'Спробуйте змінити пошуковий запит' 
                  : 'В цій категорії поки немає доступних книг'
                }
              </p>
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="px-4 py-2 bg-brand-yellow text-gray-900 rounded-lg hover:bg-brand-yellow-light transition-colors"
                >
                  Очистити пошук
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}