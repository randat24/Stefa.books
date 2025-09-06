'use client';

import React, { useState, useMemo } from 'react';
import { BookOpen, Bookmark, Share2 } from 'lucide-react';
import type { Book } from '@/lib/supabase';
import Link from 'next/link';
import { BookPreviewModal } from '@/components/BookPreviewModal';
import Image from 'next/image';
import { FadeIn, CardHover, IconHover, ButtonRipple } from '@/components/animations';
import { useAnalytics } from '@/hooks/useAnalytics';

export type BookCardProps = {
  book: Book;
  showActions?: boolean;
  priorityLoading?: boolean;
}

export function BookCard({ 
  book, 
  showActions = true,
  priorityLoading = false
}: BookCardProps) {
  const [showPreview, setShowPreview] = useState(false);
  const { trackBookView } = useAnalytics();

  // Memoize the book data to prevent unnecessary re-renders
  const memoizedBook = useMemo(() => book, [book]);

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowPreview(true);
    // Отслеживание просмотра книги
    trackBookView(memoizedBook.title, memoizedBook.id.toString());
  };

  const handleBookClick = () => {
    // Отслеживание клика по книге
    trackBookView(memoizedBook.title, memoizedBook.id.toString());
  };

  return (
    <>
      <FadeIn delay={Math.random() * 0.2}>
        <CardHover>
          <article 
            className="group relative bg-white rounded-xl shadow-card hover:shadow-float transition-all duration-300 overflow-hidden border border-gray-100 h-full flex flex-col"
            style={{ minHeight: '390px', maxHeight: '390px' }}
            role="article"
            aria-labelledby={`book-title-${memoizedBook.id}`}
            aria-describedby={`book-author-${memoizedBook.id}`}
          >
        <Link 
          href={`/books/${memoizedBook.id}`} 
          className="flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:ring-offset-2 rounded-xl"
          aria-label={`Переглянути деталі книги: ${memoizedBook.title} автора ${memoizedBook.author}`}
          onClick={handleBookClick}
        >
          <div className="relative" style={{ height: '280px' }}>
            {/* Book Cover with Optimized Image */}
            <Image
              src={memoizedBook.cover_url || '/images/book-placeholder.svg'}
              alt={`Обкладинка книги: ${memoizedBook.title}`}
              width={300}
              height={400}
              priority={priorityLoading}
              className="w-full h-full object-cover"
              loading={priorityLoading ? "eager" : "lazy"}
            />
            
            {/* Overlay при наведении */}
            <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100" aria-hidden="true" />
            
            {/* Кнопка "Переглянути" при наведении */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <ButtonRipple>
                <button 
                  onClick={handleQuickView}
                  className="inline-flex items-center gap-2 rounded-2xl bg-white/95 px-4 py-2 text-sm font-medium text-gray-900 shadow-lg backdrop-blur hover:bg-white focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:ring-offset-2"
                  aria-label={`Швидкий перегляд книги: ${memoizedBook.title}`}
                  type="button"
                >
                  <BookOpen className="h-4 w-4" aria-hidden="true" />
                  Переглянути
                </button>
              </ButtonRipple>
            </div>
          </div>
        </Link>
        
        {/* Статус-бейдж - показываем при наведении */}
        <span 
          className={`pointer-events-none absolute left-4 top-4 rounded-full border border-gray-200 px-3 py-1.5 text-xs font-medium shadow-sm backdrop-blur opacity-0 transition-opacity duration-300 group-hover:opacity-100 ${
            memoizedBook.available 
              ? "text-green-700 bg-green-100/90" 
              : "text-red-700 bg-red-100/90"
          }`}
          aria-label={`Статус книги: ${memoizedBook.available ? 'Доступна' : 'Видана'}`}
        >
          {memoizedBook.available ? "✓ Доступна" : "✗ Видана"}
        </span>

        {/* Быстрые действия - показываем при наведении */}
        {showActions && (
          <div className="absolute right-4 top-4 flex gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <IconHover>
              <button
                className="rounded-full border border-gray-200 bg-white/90 p-2.5 shadow-sm hover:bg-white focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:ring-offset-2"
                aria-label={`Додати книгу "${memoizedBook.title}" в обране`}
                type="button"
              >
                <Bookmark className="h-4 w-4 text-gray-700" aria-hidden="true" />
              </button>
            </IconHover>
            <IconHover>
              <button
                className="rounded-full border border-gray-200 bg-white/90 p-2.5 shadow-sm hover:bg-white focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:ring-offset-2"
                aria-label={`Поділитися книгою "${memoizedBook.title}"`}
                type="button"
              >
                <Share2 className="h-4 w-4 text-gray-700" aria-hidden="true" />
              </button>
            </IconHover>
          </div>
        )}

        {/* Контент - только название и автор */}
        <Link 
          href={`/books/${memoizedBook.id}`} 
          className="flex-grow flex flex-col focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:ring-offset-2 rounded-xl"
        >
          <div className="flex flex-1 flex-col gap-3 px-4 pb-5 pt-4">
            <h3 
              id={`book-title-${memoizedBook.id}`}
              className="line-clamp-2 text-lg font-semibold tracking-tight text-gray-900 leading-tight"
            >
              {memoizedBook.title}
            </h3>

            <p 
              id={`book-author-${memoizedBook.id}`}
              className="text-sm text-gray-600 font-medium"
            >
              {memoizedBook.author}
            </p>
          </div>
        </Link>
          </article>
        </CardHover>
      </FadeIn>
      
      {/* Book Preview Modal */}
      <BookPreviewModal 
        book={memoizedBook} 
        isOpen={showPreview} 
        onClose={() => setShowPreview(false)} 
      />
    </>
  );
}

export default BookCard;