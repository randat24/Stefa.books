'use client';

import React, { useState, useMemo } from 'react';
import { BookOpen, Share2, Heart } from 'lucide-react';
import type { Book } from '@/lib/supabase';
import Link from 'next/link';
import { BookPreviewModal } from '@/components/BookPreviewModal';
import Image from 'next/image';
import CachedImage from '@/components/ui/CachedImage';
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
        className="group relative bg-[var(--card,#FFFFFF)] rounded-[var(--radius-xl,24px)] shadow-[var(--shadow-md,0_6px_16px_rgba(15,23,42,0.08))] hover:shadow-[var(--shadow-lg,0_12px_28px_rgba(15,23,42,0.12))] transition-all duration-300 overflow-hidden border border-[var(--line,#E5E7EB)] h-full flex flex-col hover:-translate-y-1"
        style={{ minHeight: '400px' }}
        role="article"
        aria-labelledby={`book-title-${memoizedBook.id}`}
        aria-describedby={`book-author-${memoizedBook.id}`}
      >
        {/* Обложка без отступов */}
        <Link 
          href={`/books/${memoizedBook.id}`} 
          className="flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2"
          aria-label={`Переглянути деталі книги: ${memoizedBook.title} автора ${memoizedBook.author}`}
          onClick={handleBookClick}
        >
          <div className="relative w-full" style={{ height: '280px' }}>
            {/* Book Cover with Cached Image */}
            <CachedImage
              src={memoizedBook.cover_url || '/images/book-placeholder.svg'}
              alt={`Обкладинка книги: ${memoizedBook.title}`}
              width={200}
              height={280}
              className="object-cover"
              priority={priorityLoading}
              enableCache={true}
              showRefreshButton={false}
            />
            
            {/* Overlay при наведении */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-all duration-300 group-hover:opacity-100" aria-hidden="true" />
          </div>
        </Link>
        
        {/* Статус-бейдж */}
        <span 
          className={`absolute left-3 top-3 rounded-[var(--radius-lg,18px)] px-3 py-1.5 text-xs font-semibold shadow-lg backdrop-blur-sm border ${
            memoizedBook.available 
              ? "text-[var(--success,#10B981)] bg-[var(--surface,#FFFFFF)]/95 border-[var(--success,#10B981)]/20" 
              : "text-[var(--error,#EF4444)] bg-[var(--surface,#FFFFFF)]/95 border-[var(--error,#EF4444)]/20"
          }`}
          aria-label={`Статус книги: ${memoizedBook.available ? 'Доступна' : 'Видана'}`}
        >
          {memoizedBook.available ? "✓ Доступна" : "✗ Видана"}
        </span>

        {/* Быстрые действия */}
        {showActions && (
          <div className="absolute right-3 top-3 flex gap-2">
            <button
              className="rounded-[var(--radius-lg,18px)] bg-[var(--surface,#FFFFFF)]/95 border border-[var(--line,#E5E7EB)]/50 p-2.5 shadow-lg backdrop-blur-sm hover:bg-[var(--surface,#FFFFFF)] hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[var(--accent,#111827)] focus:ring-offset-2 transition-all duration-300"
              aria-label={`Додати книгу "${memoizedBook.title}" в обране`}
              type="button"
            >
              <Heart className="h-4 w-4 text-[var(--text-muted,#6B7280)]" aria-hidden="true" />
            </button>
            <button
              className="rounded-[var(--radius-lg,18px)] bg-[var(--surface,#FFFFFF)]/95 border border-[var(--line,#E5E7EB)]/50 p-2.5 shadow-lg backdrop-blur-sm hover:bg-[var(--surface,#FFFFFF)] hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[var(--accent,#111827)] focus:ring-offset-2 transition-all duration-300"
              aria-label={`Поділитися книгою "${memoizedBook.title}"`}
              type="button"
            >
              <Share2 className="h-4 w-4 text-[var(--text-muted,#6B7280)]" aria-hidden="true" />
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
        <div className="flex flex-1 flex-col gap-2 p-4">
          <h3 
            id={`book-title-${memoizedBook.id}`}
            className="h3 line-clamp-2 text-gray-900"
          >
            {memoizedBook.title}
          </h3>

          <p 
            id={`book-author-${memoizedBook.id}`}
            className="small text-gray-700"
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