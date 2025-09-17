'use client';

import { useState, useEffect } from 'react';
import { X, BookOpen, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface Book {
  id: string;
  title: string;
  author: string;
  cover_url?: string;
  category: string;
  age_range: string;
  available: boolean;
}

interface BookExchangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRentalId: string;
  currentBook: {
    id: string;
    title: string;
    author: string;
    cover_url?: string;
  };
}

export default function BookExchangeModal({
  isOpen,
  onClose,
  currentRentalId,
  currentBook
}: BookExchangeModalProps) {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [exchanging, setExchanging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadAvailableBooks();
    }
  }, [isOpen]);

  const loadAvailableBooks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/books?available=true&limit=20');
      const result = await response.json();

      if (result.success) {
        setBooks(result.data || []);
      } else {
        setError('Не вдалося завантажити каталог книг');
      }
    } catch (err) {
      setError('Помилка мережі');
    } finally {
      setLoading(false);
    }
  };

  const handleExchange = async () => {
    if (!selectedBook) return;

    try {
      setExchanging(true);
      const response = await fetch('/api/user/rentals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'exchange',
          rentalId: currentRentalId,
          bookId: selectedBook.id
        })
      });

      const result = await response.json();
      if (result.success) {
        onClose();
        // Refresh the page or redirect
        window.location.reload();
      } else {
        setError(result.error || 'Не вдалося обміняти книгу');
      }
    } catch (err) {
      setError('Помилка мережі');
    } finally {
      setExchanging(false);
    }
  };

  const filteredBooks = books.filter(book => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      book.title.toLowerCase().includes(query) ||
      book.author.toLowerCase().includes(query) ||
      book.category.toLowerCase().includes(query)
    );
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-semibold">Обмін книги</CardTitle>
          <Button variant="ghost"  onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Book */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Поточна книга</h3>
            <div className="flex items-center gap-4">
              <img 
                src={currentBook.cover_url || '/placeholder-book.jpg'} 
                alt={currentBook.title}
                className="w-16 h-20 object-cover rounded"
              />
              <div>
                <h4 className="font-medium">{currentBook.title}</h4>
                <p className="text-sm text-blue-700">{currentBook.author}</p>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <Input
              placeholder="Пошук книги для обміну..."
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Books List */}
          <div className="max-h-96 overflow-y-auto space-y-3">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-accent mx-auto mb-4"></div>
                <p className="text-neutral-600">Завантаження книг...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={loadAvailableBooks} variant="outline">
                  Спробувати знову
                </Button>
              </div>
            ) : filteredBooks.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-neutral-300" />
                <p className="text-neutral-600">
                  {searchQuery ? 'Нічого не знайдено' : 'Немає доступних книг для обміну'}
                </p>
              </div>
            ) : (
              filteredBooks.map((book: any) => (
                <div
                  key={book.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedBook?.id === book.id
                      ? 'border-brand-accent bg-brand-accent/10'
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                  onClick={() => setSelectedBook(book)}
                >
                  <div className="flex items-center gap-4">
                    <img 
                      src={book.cover_url || '/placeholder-book.jpg'} 
                      alt={book.title}
                      className="w-16 h-20 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-lg">{book.title}</h4>
                      <p className="text-neutral-600 mb-2">{book.author}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" >
                          {book.category}
                        </Badge>
                        <Badge variant="outline" >
                          {book.age_range}
                        </Badge>
                        <Badge 
                          variant={book.available ? 'default' : 'secondary'}
                        >
                          {book.available ? 'Доступна' : 'Недоступна'}
                        </Badge>
                      </div>
                    </div>
                    {selectedBook?.id === book.id && (
                      <CheckCircle className="h-6 w-6 text-brand-accent" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-neutral-600">
              {selectedBook ? (
                <span>Вибрано: <strong>{selectedBook.title}</strong></span>
              ) : (
                <span>Оберіть книгу для обміну</span>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Скасувати
              </Button>
              <Button 
                onClick={handleExchange}
                disabled={!selectedBook || exchanging || !selectedBook.available}
                className="bg-brand-accent hover:bg-brand-accent-light"
              >
                {exchanging ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Обмінюємо...
                  </>
                ) : (
                  <>
                    <BookOpen className="h-4 w-4 mr-2" />
                    Обміняти книгу
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
