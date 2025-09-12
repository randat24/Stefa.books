'use client';

import React, { useState, useMemo, memo } from 'react';
import { BookOpen, Share2, Heart } from 'lucide-react';
import type { Book } from '@/lib/supabase';
import Link from 'next/link';
import { BookPreviewModal } from '@/components/BookPreviewModal';
import { BookCoverImage } from '@/components/ui/OptimizedImage';
import { useAnalytics } from '@/hooks/useAnalytics';

export type OptimizedBookCardProps = {
  book: Book;
  showActions?: boolean;
  priorityLoading?: boolean;
  className?: string;
}

// Мемоизированный компонент для предотвращения лишних ре-рендеров
export const OptimizedBookCard = memo(function OptimizedBookCard({ 
  book, 
  showActions = true,
  priorityLoading = false,
  className = ''
}: OptimizedBookCardProps) {
  const [showPreview, setShowPreview] = useState(false);
  const { trackBookView } = useAnalytics();

  // Мемоизируем обработчики событий
  const handleQuickView = useMemo(() => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowPreview(true);
    trackBookView(book.title, book.id.toString());
  }, [book.title, book.id, trackBookView]);

  const handleBookClick = useMemo(() => () => {
    trackBookView(book.title, book.id.toString());
  }, [book.title, book.id, trackBookView]);

  // Мемоизируем статус доступности
  const availabilityStatus = useMemo(() => {
    if (book.is_active) {
      return { text: 'Доступна', className: 'text-green-600 bg-green-50' };
    }
    return { text: 'Зайнята', className: 'text-red-600 bg-red-50' };
  }, [book.is_active]);

  // Мемоизируем рейтинг
  const rating = useMemo(() => {
    return book.rating || 0;
  }, [book.rating]);

  return (
    <>
      <article 
        className={`book-card group ${className}`}
        role="article"
        aria-labelledby={`book-title-${book.id}`}
        aria-describedby={`book-author-${book.id}`}
      >
        {/* Обложка с оптимизированным изображением */}
        <Link 
          href={`/books/${book.id}`}
          onClick={handleBookClick}
          className="block relative overflow-hidden rounded-lg bg-surface-2"
        >
          <BookCoverImage
            src={book.cover_url || '/images/book-placeholder.jpg'}
            alt={`Обложка книги "${book.title}"`}
            priority={priorityLoading}
            className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Overlay с действиями */}
          {showActions && (
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
              <div className="flex gap-2">
                <button
                  onClick={handleQuickView}
                  className="p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-colors"
                  aria-label={`Быстрый просмотр книги "${book.title}"`}
                >
                  <BookOpen className="w-4 h-4 text-accent" />
                </button>
                <button
                  className="p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-colors"
                  aria-label={`Поделиться книгой "${book.title}"`}
                >
                  <Share2 className="w-4 h-4 text-accent" />
                </button>
                <button
                  className="p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-colors"
                  aria-label={`Добавить в избранное "${book.title}"`}
                >
                  <Heart className="w-4 h-4 text-accent" />
                </button>
              </div>
            </div>
          )}

          {/* Статус доступности */}
          <div className="absolute top-2 right-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${availabilityStatus.className}`}>
              {availabilityStatus.text}
            </span>
          </div>
        </Link>

        {/* Информация о книге */}
        <div className="p-4 space-y-2">
          <h3 
            id={`book-title-${book.id}`}
            className="font-semibold text-accent line-clamp-2 group-hover:text-brand-accent transition-colors"
          >
            {book.title}
          </h3>
          
          <p 
            id={`book-author-${book.id}`}
            className="text-sm text-text-muted line-clamp-1"
          >
            {book.author}
          </p>

          {/* Рейтинг */}
          {rating > 0 && (
            <div className="flex items-center gap-1">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className={`text-sm ${
                      i < Math.floor(rating) 
                        ? 'text-yellow-400' 
                        : 'text-gray-300'
                    }`}
                  >
                    ★
                  </span>
                ))}
              </div>
              <span className="text-xs text-text-muted">({rating})</span>
            </div>
          )}

          {/* Категория */}
          {book.category_id && (
            <div className="text-xs text-brand-accent font-medium">
              Категорія: {book.category_id}
            </div>
          )}

          {/* Кнопка аренды */}
          <Link
            href={`/books/${book.id}/rent`}
            className="block w-full mt-3 px-4 py-2 bg-brand-accent text-white text-center rounded-lg hover:bg-brand-accent/90 transition-colors font-medium"
          >
            {book.is_active ? 'Орендувати' : 'Переглянути'}
          </Link>
        </div>
      </article>

      {/* Модальное окно предварительного просмотра */}
      {showPreview && (
        <BookPreviewModal
          book={book}
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
        />
      )}
    </>
  );
});

// Экспортируем как default для обратной совместимости
export default OptimizedBookCard;
