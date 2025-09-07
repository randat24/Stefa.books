import Image from 'next/image';
import { Star, BookOpen, Calendar, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import type { Book } from '@/lib/supabase';

interface BookReturnInfoProps {
  book: Book;
}

export function BookReturnInfo({ book }: BookReturnInfoProps) {
  return (
    <div className="space-y-6">
      {/* Book Cover */}
      <div className="aspect-[3/4] relative rounded-lg overflow-hidden bg-gray-100">
        {book.cover_url ? (
          <Image
            src={book.cover_url}
            alt={book.title}
            fill
            className="object-cover"
            unoptimized={true}
            sizes="(max-width: 768px) 100vw, 300px"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <BookOpen className="h-16 w-16" />
          </div>
        )}
      </div>

      {/* Book Details */}
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{book.title}</h1>
          <p className="text-lg text-gray-700 mb-3">{book.author}</p>
          
          {/* Rating */}
          {book.rating && book.rating_count && (
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`h-4 w-4 ${
                      i < Math.floor(book.rating!) 
                        ? 'text-brand-yellow-light fill-current' 
                        : 'text-gray-300'
                    }`} 
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">
                {book.rating.toFixed(1)} ({book.rating_count} відгуків)
              </span>
            </div>
          )}

          {/* Status Badge */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="outline" className="text-xs text-orange-700 bg-orange-100">
              <AlertCircle className="h-3 w-3 mr-1" />
              Потребує повернення
            </Badge>
            {book.category_id && (
              <Badge variant="secondary" className="text-xs">
                {book.category_id}
              </Badge>
            )}
            {book.age_range && (
              <Badge variant="outline" className="text-xs">
                {book.age_range}
              </Badge>
            )}
          </div>
        </div>

        {/* Return Status */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-4 w-4 text-orange-600" />
            <span className="font-semibold text-orange-900">Статус оренди</span>
          </div>
          <p className="text-sm text-orange-800">
            Книга знаходиться у вас на руках. Будь ласка, поверніть її згідно з умовами оренди.
          </p>
        </div>

        {/* Book Details */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900">Деталі книги</h3>
          
          <div className="space-y-2 text-sm">
            {book.publisher && (
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">Видавництво:</span>
                <span className="text-gray-900">{book.publisher}</span>
              </div>
            )}
            
            {book.publication_year && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">Рік видання:</span>
                <span className="text-gray-900">{book.publication_year}</span>
              </div>
            )}
            
            {book.pages && (
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">Сторінок:</span>
                <span className="text-gray-900">{book.pages}</span>
              </div>
            )}
            
            {book.language && (
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">Мова:</span>
                <span className="text-gray-900">{book.language}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
