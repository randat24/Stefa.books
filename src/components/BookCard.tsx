'use client';

import React, { useState, useMemo } from 'react';
import { BookOpen, Bookmark, Share2 } from 'lucide-react';
import type { Book } from '@/lib/supabase';
import Link from 'next/link';
import { BookPreviewModal } from '@/components/BookPreviewModal';
import Image from 'next/image';
// Animation components removed for build fix
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
      <article 
        className="group relative bg-neutral-0 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-neutral-200 h-full flex flex-col"
        style={{ minHeight: '400px' }}
        role="article"
        aria-labelledby={`book-title-${memoizedBook.id}`}
        aria-describedby={`book-author-${memoizedBook.id}`}
      >
        <Link 
          href={`/books/${memoizedBook.id}`} 
          className="flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-brand-accent focus:ring-offset-2 rounded-2xl"
          aria-label={`Переглянути деталі книги: ${memoizedBook.title} автора ${memoizedBook.author}`}
          onClick={handleBookClick}
        >
          <div className="relative" style={{ height: '280px' }}>
            {/* Book Cover with Optimized Image */}
            <Image
              src={memoizedBook.cover_url || '/images/book-placeholder.svg'}
              alt={`Обкладинка книги: ${memoizedBook.title}`}
              fill
              className="object-cover rounded-t-2xl"
              priority={priorityLoading}
            />
            
            {/* Overlay при наведении */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-all duration-300 group-hover:opacity-100 rounded-t-2xl" aria-hidden="true" />
          </div>
        </Link>
        
        {/* Статус-бейдж - скрытый по умолчанию, появляется при hover */}
        <span 
          className={`absolute left-3 top-3 rounded-2xl px-3 py-1.5 text-caption font-semibold shadow-lg backdrop-blur-sm border opacity-0 group-hover:opacity-100 transition-all duration-300 ${
            memoizedBook.available 
              ? "text-emerald-700 bg-emerald-50/95 border-emerald-200" 
              : "text-rose-700 bg-rose-50/95 border-rose-200"
          }`}
          aria-label={`Статус книги: ${memoizedBook.available ? 'Доступна' : 'Видана'}`}
        >
          {memoizedBook.available ? "✓ Доступна" : "✗ Видана"}
        </span>

        {/* Быстрые действия - скрытые по умолчанию, появляются при hover */}
        {showActions && (
          <div className="absolute right-3 top-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
            <button
              className="rounded-2xl bg-neutral-0/95 border border-neutral-200/50 p-2.5 shadow-lg backdrop-blur-sm hover:bg-neutral-0 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-brand-accent focus:ring-offset-2 transition-all duration-300"
              aria-label={`Додати книгу "${memoizedBook.title}" в обране`}
              type="button"
            >
              <Bookmark className="h-4 w-4 text-neutral-600" aria-hidden="true" />
            </button>
            <button
              className="rounded-2xl bg-neutral-0/95 border border-neutral-200/50 p-2.5 shadow-lg backdrop-blur-sm hover:bg-neutral-0 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-brand-accent focus:ring-offset-2 transition-all duration-300"
              aria-label={`Поділитися книгою "${memoizedBook.title}"`}
              type="button"
            >
              <Share2 className="h-4 w-4 text-neutral-600" aria-hidden="true" />
            </button>
          </div>
        )}

        {/* Кнопка "Переглянути" по центру обложки - появляется при hover */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 transition-all duration-300 group-hover:opacity-100">
          <button 
            onClick={handleQuickView}
            className="inline-flex items-center gap-2 rounded-2xl bg-neutral-0/95 backdrop-blur-sm px-6 py-3 text-body-sm font-semibold text-neutral-900 shadow-xl border border-neutral-200/50 hover:bg-neutral-0 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-brand-accent focus:ring-offset-2 transition-all duration-300"
            aria-label={`Швидкий перегляд книги: ${memoizedBook.title}`}
            type="button"
          >
            <BookOpen className="h-4 w-4" aria-hidden="true" />
            Переглянути
          </button>
        </div>

        {/* Контент - название и автор */}
        <div className="flex flex-1 flex-col gap-2 px-5 py-4 bg-neutral-0">
          <h3 
            id={`book-title-${memoizedBook.id}`}
            className="line-clamp-2 book-title"
          >
            {memoizedBook.title}
          </h3>

          <p 
            id={`book-author-${memoizedBook.id}`}
            className="book-author"
          >
            {memoizedBook.author}
          </p>
        </div>
      </article>
      
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