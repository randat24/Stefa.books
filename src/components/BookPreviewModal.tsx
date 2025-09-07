"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/Badge";
import { FavoriteButton } from "@/components/favorites/FavoriteButton";
import { Star, Share2, Check, Copy } from "lucide-react";
import type { Book } from "@/lib/supabase";
import Link from "next/link";

interface BookPreviewModalProps {
  book: Book | null;
  isOpen: boolean;
  onClose: () => void;
}

export function BookPreviewModal({ book, isOpen, onClose }: BookPreviewModalProps) {
  const [shareSuccess, setShareSuccess] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  
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
    <Modal isOpen={isOpen} onClose={onClose} title="Швидкий перегляд" className="max-w-4xl">
      <div className="grid md:grid-cols-[250px_1fr] gap-6">
        {/* Book cover */}
        <div className="mx-auto md:mx-0">
          <div className="relative aspect-[3/4] w-full max-w-[250px] rounded-lg overflow-hidden shadow-lg">
            <Image 
              src={book.cover_url || '/images/book-placeholder.svg'} 
              alt={book.title} 
              fill 
              className="object-cover"
              unoptimized={true}
              priority
            />
          </div>
        </div>

        {/* Book info */}
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              {book.available && (
                <div className="mb-2">
                  <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded-full">
                    ✓ Доступна для оренди
                  </span>
                </div>
              )}
              <h3 className="text-2xl font-bold text-[--ink] mb-2">{book.title}</h3>
              <p className="text-lg text-[--muted] mb-1">{book.author}</p>
              <p className="text-sm text-[--muted]">
                {book.category_id}{book.age_range ? ` • ${book.age_range}` : ""}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleShare}
                disabled={isSharing}
                className={`p-2 rounded-full relative ${isSharing ? 'bg-gray-200' : 'bg-gray-100 hover:bg-gray-200'}`} 
                title={isSharing ? "Обробка..." : "Поділитися"}
              >
                {isSharing ? (
                  <div className="h-5 w-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                ) : shareSuccess ? (
                  <Check className="h-5 w-5 text-green-600" />
                ) : copySuccess ? (
                  <Copy className="h-5 w-5 text-green-600" />
                ) : (
                  <Share2 className="h-5 w-5 text-gray-700" />
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
                      ? "text-brand-yellow fill-yellow-500" 
                      : "text-gray-300"
                  }`} />
                ))}
              </div>
              <span className="text-sm text-gray-600">
                {rating.toFixed(1)} {book.rating_count && `(${book.rating_count})`}
              </span>
            </div>
          )}

          {/* Subscription Info */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2">Оренда за підпискою</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-700">Mini:</span>
                <span className="font-medium text-blue-900">300₴/міс (1 книга)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Maxi:</span>
                <span className="font-medium text-blue-900">500₴/міс (2 книги)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Premium:</span>
                <span className="font-medium text-blue-900">1500₴/6 міс (2 книги)</span>
              </div>
            </div>
            <Link 
              href="/subscription" 
              className="inline-block mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Переглянути всі плани →
            </Link>
          </div>

          {/* Availability - removed from here */}

          {/* Short description */}
          {book.short_description && (
            <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-brand-yellow">
              <p className="text-[--ink] text-sm leading-relaxed">{book.short_description}</p>
            </div>
          )}

          {/* Action buttons */}
          <div>
            {/* Subscription and Details buttons */}
            <div className="grid grid-cols-2 gap-4">
              <Link href="/subscription" className="w-full">
                <Button className="w-full bg-brand-yellow text-brand hover:bg-brand-yellow-light">
                  Оформити підписку
                </Button>
              </Link>
              <Link href={`/books/${book.id}`} className="w-full">
                <Button className="w-full bg-black text-white hover:bg-gray-800">
                  Детальніше про книгу
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default BookPreviewModal;