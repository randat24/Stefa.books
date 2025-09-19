"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { Modal } from "@/components/ui/modal";
import { Button } from "./ui/button";
import { Badge } from "@/components/ui/badge";
import { FavoriteButton } from "@/components/favorites/FavoriteButton";
import { Star, ExternalLink, Check, Copy, BookOpen } from "lucide-react";
import type { Book } from "@/lib/supabase";
import Link from "next/link";
import { useUserSubscription } from "@/lib/hooks/useUserSubscription";

interface BookPreviewModalProps {
  book: Book | null;
  isOpen: boolean;
  onClose: () => void;
}

export function BookPreviewModal({ book, isOpen, onClose }: BookPreviewModalProps) {
  const [shareSuccess, setShareSuccess] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const userSubscription = useUserSubscription();
  
  
  // Move the hook call outside of conditional logic
  const handleShare = useCallback(async () => {
    // Prevent multiple concurrent share operations
    if (isSharing || !book) return;
    
    setIsSharing(true);
    try {
      const shareData = {
        title: book.title,
        text: `${book.title} - ${book.author || 'Stefa.books'}`,
        url: `${window.location.origin}/books/${book.id}`
      };
      
      // Check if Web Share API is available
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 2000);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(
          `${book.title} - ${book.author || 'Stefa.books'}\n${window.location.origin}/books/${book.id}`
        );
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      }
    } catch (error) {
      console.error('Sharing failed:', error);
    } finally {
      setIsSharing(false);
    }
  }, [book, isSharing]);

  if (!book) return null;
  
  const rating = book.rating ?? 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Швидкий перегляд" className="max-w-4xl bg-white">
      <div className="grid md:grid-cols-[250px_1fr] gap-6">
        {/* Book cover */}
        <div className="mx-auto md:mx-0">
          <div className="relative aspect-[3/4] w-full max-w-[250px] rounded-lg overflow-hidden shadow-lg">
            <img 
              src={book.cover_url || '/images/book-placeholder.svg'} 
              alt={book.title} 
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Book info */}
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
        {book.is_active && (
          <div className="mb-2">
            <span className="text-caption font-medium text-green-700 bg-green-100 px-2 py-1 rounded-2xl">
              ✓ Доступна для оренди
            </span>
          </div>
        )}
              <h3 className="text-h2 text-[--text] mb-2">{book.title}</h3>
              <p className="text-body-lg text-[--text-muted] mb-1">{book.author}</p>
              <p className="text-body-sm text-[--text-muted]">
                {book.category}{book.age_range ? ` • ${book.age_range}` : ""}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleShare}
                disabled={isSharing}
                className={`p-2 rounded-2xl relative ${isSharing ? 'bg-neutral-200' : 'bg-neutral-100 hover:bg-neutral-200'}`} 
                title={isSharing ? "Обробка..." : "Поділитися"}
              >
                {isSharing ? (
                  <div className="h-5 w-5 border-2 border-neutral-400 border-t-transparent rounded-2xl animate-spin" />
                ) : shareSuccess ? (
                  <Check className="h-5 w-5 text-green-600" />
                ) : copySuccess ? (
                  <Copy className="h-5 w-5 text-green-600" />
                ) : (
                  <ExternalLink className="h-5 w-5 text-neutral-700" />
                )}
              </button>
              <FavoriteButton id={book.id} />
            </div>
          </div>

          {/* Badges */}
          {book.badges && book.badges.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {book.badges.map((badge, index) => (
                <Badge key={index} variant="secondary">
                  {badge}
                </Badge>
              ))}
            </div>
          )}

          {/* Rating */}
          {rating > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-4 w-4 ${
                    i < Math.floor(rating) 
                      ? "text-accent fill-yellow-500" 
                      : "text-neutral-300"
                  }`} />
                ))}
              </div>
              <span className="text-body-sm text-neutral-600">
                {rating.toFixed(1)} {book.rating_count && `(${book.rating_count})`}
              </span>
            </div>
          )}

          {/* Subscription Info */}
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg p-4 border border-amber-200">
            <h4 className="font-semibold text-amber-900 mb-2">Оренда за підпискою</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-amber-700">Mini:</span>
                <span className="font-medium text-amber-900">300₴/міс (1 книга)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-amber-700">Maxi:</span>
                <span className="font-medium text-amber-900">500₴/міс (2 книги)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-amber-700">Premium:</span>
                <span className="font-medium text-amber-900">1500₴/6 міс (2 книги)</span>
              </div>
            </div>
            <Link 
              href="/subscription" 
              className="inline-block mt-3 text-[var(--brand)] hover:text-[var(--brand-600)] text-body-sm font-medium"
            >
              Переглянути всі плани →
            </Link>
          </div>

          {/* Availability - removed from here */}

          {/* Short description */}
          {book.short_description && (
            <div className="bg-neutral-50 rounded-lg p-4 border-l-4 border-accent">
              <p className="text-[--text] text-body-sm leading-relaxed">{book.short_description}</p>
            </div>
          )}

          {/* Action buttons */}
          <div>
            {/* Conditional buttons based on user subscription status */}
            <div className="grid grid-cols-2 gap-4">
              {userSubscription.hasActiveSubscription ? (
                // Пользователь с активной подпиской видит кнопку аренды
                <>
                  {userSubscription.canRent && book.is_active ? (
                    <Link href={`/books/${book.id}/rent`} className="w-full">
                      <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                        <BookOpen className="w-4 h-4 mr-2" />
                        Взяти в оренду
                      </Button>
                    </Link>
                  ) : (
                    <Button disabled className="w-full bg-gray-300 text-gray-500 cursor-not-allowed">
                      {!book.is_active ? 'Книга недоступна' :
                       userSubscription.currentRentals >= userSubscription.maxRentals ?
                       'Ліміт аренди вичерпано' : 'Недоступно'}
                    </Button>
                  )}
                </>
              ) : (
                // Неавторизованный пользователь или без подписки видит кнопку подписки
                <Link href="/subscription" className="w-full">
                  <Button className="w-full bg-[var(--brand)] text-[#111827] hover:bg-[var(--brand-600)]">
                    {userSubscription.isAuthenticated ? 'Оформити підписку' : 'Увійти та підписатися'}
                  </Button>
                </Link>
              )}

              <Link href={`/books/${book.id}`} className="w-full">
                <Button variant="secondary" className="w-full">
                  Детальніше про книгу
                </Button>
              </Link>
            </div>

            {/* Показываем информацию о статусе подписки */}
            {userSubscription.hasActiveSubscription && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-sm text-blue-800">
                  <p className="font-medium">
                    Підписка {userSubscription.subscriptionType?.toUpperCase()} активна
                  </p>
                  <p className="text-blue-600">
                    Орендовано: {userSubscription.currentRentals} з {userSubscription.maxRentals} книг
                  </p>
                </div>
              </div>
            )}

            {/* Показываем информацию о загрузке */}
            {userSubscription.isLoading && (
              <div className="mt-3 text-center">
                <div className="inline-flex items-center gap-2 text-sm text-gray-500">
                  <div className="h-4 w-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                  Перевіряємо статус підписки...
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default BookPreviewModal;