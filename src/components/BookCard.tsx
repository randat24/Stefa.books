'use client';

import React, { useState, useMemo } from 'react';
import { BookOpen, Share2, Heart } from 'lucide-react';
import type { Book } from '@/lib/supabase';
import Link from 'next/link';
import { BookPreviewModal } from '@/components/BookPreviewModal';
import { BookCover } from '@/components/BookCover';
import { AgeCategoryBadge } from '@/components/ui/AgeCategoryBadge';
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
        className="book-card group"
        role="article"
        aria-labelledby={`book-title-${memoizedBook.id}`}
        aria-describedby={`book-author-${memoizedBook.id}`}
      >
        {/* Обложка без отступов */}
        <Link 
          href={`/books/${memoizedBook.id}`} 
          className="flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
          aria-label={`Переглянути деталі книги: ${memoizedBook.title} автора ${memoizedBook.author}`}
          onClick={handleBookClick}
        >
          <div className="book-card-image h-[320px] relative">
            {/* Book Cover with optimized loading */}
            <BookCover
              src={memoizedBook.cover_url || '/images/book-placeholder.svg'}
              alt={`Обкладинка книги: ${memoizedBook.title}`}
              title={memoizedBook.title}
              width={300}
              height={320}
              className="w-full h-full"
              priority={priorityLoading}
              showFallback={true}
            />
            
            {/* Overlay при наведении */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-all duration-300 group-hover:opacity-100" aria-hidden="true" />
          </div>
        </Link>
        
        {/* Статус-бейдж */}
        <span 
          className={`absolute left-3 top-3 rounded-lg px-3 py-1.5 text-xs font-semibold shadow-lg backdrop-blur-sm border ${
            (memoizedBook.is_active !== false && memoizedBook.status === 'available') 
              ? "text-success bg-surface/95 border-success/20" 
              : "text-error bg-surface/95 border-error/20"
          }`}
          aria-label={`Статус книги: ${(memoizedBook.is_active !== false && memoizedBook.status === 'available') ? 'Доступна' : 'Видана'}`}
        >
          {(memoizedBook.is_active !== false && memoizedBook.status === 'available') ? "✓ Доступна" : "✗ Видана"}
        </span>

        {/* Быстрые действия (только при наведении) */}
        {showActions && (
          <div className="absolute right-3 top-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              className="rounded-lg bg-surface/95 border border-line/50 p-2.5 shadow-lg backdrop-blur-sm hover:bg-surface hover:scale-110 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 transition-all duration-300"
              aria-label={`Додати книгу "${memoizedBook.title}" в обране`}
              type="button"
            >
              <Heart className="h-4 w-4 text-text-muted" aria-hidden="true" />
            </button>
            <button
              className="rounded-lg bg-surface/95 border border-line/50 p-2.5 shadow-lg backdrop-blur-sm hover:bg-surface hover:scale-110 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 transition-all duration-300"
              aria-label={`Поділитися книгою "${memoizedBook.title}"`}
              type="button"
            >
              <Share2 className="h-4 w-4 text-text-muted" aria-hidden="true" />
            </button>
          </div>
        )}

        {/* Кнопка "Переглянути" по центру обложки */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 transition-all duration-300 group-hover:opacity-100">
          <button 
            onClick={handleQuickView}
            className="btn btn-primary btn-sm"
            aria-label={`Швидкий перегляд книги: ${memoizedBook.title}`}
            type="button"
          >
            <BookOpen className="h-4 w-4" aria-hidden="true" />
            Переглянути
          </button>
        </div>

        {/* Контент - название и автор */}
        <div className="book-card-content">
          <h3 
            id={`book-title-${memoizedBook.id}`}
            className="book-card-title"
          >
            {memoizedBook.title}
          </h3>

          <p 
            id={`book-author-${memoizedBook.id}`}
            className="book-card-author"
          >
            {memoizedBook.author}
          </p>

          {/* Возрастная категория */}
          <div className="mt-2">
            <AgeCategoryBadge 
              ageRange={memoizedBook.age_range || undefined}
              ageCategoryName={(memoizedBook as any).age_category_name}
              minAge={(memoizedBook as any).min_age}
              maxAge={(memoizedBook as any).max_age}
              variant="compact"
            />
          </div>
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