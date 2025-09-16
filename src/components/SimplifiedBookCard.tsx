'use client';

import React, { useMemo } from 'react';
// @ts-expect-error - Lucide React icon types not properly recognized
import { BookOpen, Share2, Heart } from 'lucide-react';
import type { Book } from '@/lib/supabase';
import Link from 'next/link';
import { BookCoverImage } from '@/components/ui/OptimizedImage';
import { useAnalytics } from '@/hooks/useAnalytics';
import { Button } from '@/components/ui/button';

export type SimplifiedBookCardProps = {
  book: Book;
  priorityLoading?: boolean;
  className?: string;
  showActions?: boolean;
}

// Упрощенная карточка книги - только название, автор и категория
export function SimplifiedBookCard({
  book,
  priorityLoading = false,
  className = '',
  showActions = true
}: SimplifiedBookCardProps) {
  const { trackBookView } = useAnalytics();

  // Обработчик клика по книге
  const handleBookClick = useMemo(() => () => {
    trackBookView(book.title, book.id.toString());
  }, [book.title, book.id, trackBookView]);

  // Обработчики для кнопок действий
  const handleQuickView = useMemo(() => (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    // TODO: Implement quick view functionality
    console.log('Quick view book:', book.title);
  }, [book.title]);

  const handleShare = useMemo(() => (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    // TODO: Implement share functionality
    console.log('Share book:', book.title);
  }, [book.title]);

  const handleFavorite = useMemo(() => (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    // TODO: Implement favorite functionality
    console.log('Add to favorites:', book.title);
  }, [book.title]);

  return (
    <article
      className={`book-card group flex flex-col h-full ${className}`}
      role="article"
      aria-labelledby={`book-title-${book.id}`}
      aria-describedby={`book-author-${book.id}`}
    >
      {/* Обложка с оптимизированным изображением */}
      <Link 
        href={`/books/${book.id}`}
        onClick={handleBookClick}
        className="block relative overflow-hidden rounded-t-lg rounded-b-none"
      >
        <BookCoverImage
          src={book.cover_url || '/images/book-placeholder.svg'}
          alt={`Обложка книги "${book.title}"`}
          priority={priorityLoading}
          className="w-full h-[310px] object-cover group-hover:scale-105 transition-transform duration-300 rounded-t-lg rounded-b-none"
        />
        
        {/* Overlay с действиями */}
        {showActions && (
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="flex gap-3">
              <button
                onClick={handleQuickView}
                className="p-3 bg-white/95 hover:bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
                aria-label={`Быстрый просмотр книги "${book.title}"`}
              >
                <BookOpen className="w-5 h-5 text-accent" />
              </button>
              <button
                onClick={handleShare}
                className="p-3 bg-white/95 hover:bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
                aria-label={`Поделиться книгой "${book.title}"`}
              >
                <Share2 className="w-5 h-5 text-accent" />
              </button>
              <button
                onClick={handleFavorite}
                className="p-3 bg-white/95 hover:bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
                aria-label={`Добавить в избранное "${book.title}"`}
              >
                <Heart className="w-5 h-5 text-accent" />
              </button>
            </div>
          </div>
        )}
      </Link>

      {/* Информация о книге - только название, автор и категория */}
      <div className="px-4 pt-4 pb-4 space-y-2 flex-grow">
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

        {/* Категория */}
        {book.category && (
          <p className="text-xs text-gray-500 line-clamp-1">
            {book.category}
          </p>
        )}
      </div>

      {/* Кнопка действия */}
      <div className="px-4 pb-4 mt-auto">
        <Link href={`/books/${book.id}`} className="block">
          <Button
            size="sm"
            className="w-full"
          >
            Детальніше
          </Button>
        </Link>
      </div>
    </article>
  );
}

// Экспортируем как default для обратной совместимости
export default SimplifiedBookCard;
