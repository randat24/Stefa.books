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
                {book.category}{book.age_range ? ` • ${book.age_range}` : ""}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleShare}
                disabled={isSharing}
                className={`p-2 rounded-full relative ${isSharing ? 'bg-slate-200' : 'bg-slate-100 hover:bg-slate-200'}`} 
                title={isSharing ? "Обробка..." : "Поділитися"}
              >
                {isSharing ? (
                  <div className="h-5 w-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                ) : shareSuccess ? (
                  <Check className="h-5 w-5 text-green-600" />
                ) : copySuccess ? (
                  <Copy className="h-5 w-5 text-green-600" />
                ) : (
                  <Share2 className="h-5 w-5 text-slate-700" />
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
                      ? "text-yellow-500 fill-yellow-500" 
                      : "text-gray-300"
                  }`} />
                ))}
              </div>
              <span className="text-sm text-gray-600">
                {rating.toFixed(1)} {book.rating_count && `(${book.rating_count})`}
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-3">
            <div className="text-xl font-semibold text-[--ink]">
              {book.price_uah && `${book.price_uah} ₴`}
            </div>
          </div>

          {/* Availability - removed from here */}

          {/* Short description */}
          {book.short_description && (
            <div className="bg-slate-50 rounded-lg p-4 border-l-4 border-yellow-500">
              <p className="text-[--ink] text-sm leading-relaxed">{book.short_description}</p>
            </div>
          )}

          {/* Action buttons */}
          <div>
            {/* Rent and Details buttons */}
            <div className="grid grid-cols-2 gap-4">
              <Button 
                onClick={onClose}
                className="w-full"
              >
                Взяти в оренду
              </Button>
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