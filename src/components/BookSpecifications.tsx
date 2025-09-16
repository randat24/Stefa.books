import { 
  Search as Globe, 
  FileText, 
  Calendar, 
  Building, 
  Hash, 
  Users, 
  MapPin, 
  BookOpen as Layers, 
  Tag, 
  Clock, 
  Package as Truck
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import type { Book } from "@/lib/supabase";

interface BookSpecificationsProps {
  book: Book;
}

export function BookSpecifications({ book }: BookSpecificationsProps) {
  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <div>
        <h3 className="text-body-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Основна інформація
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Hash className="h-4 w-4 text-neutral-500" />
            <span className="text-neutral-600">Код книги:</span>
            <span className="font-medium font-mono">{book.code}</span>
          </div>
          
          {book.language && (
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-neutral-500" />
              <span className="text-neutral-600">Мова:</span>
              <span className="font-medium">{book.language}</span>
            </div>
          )}
          
          {book.pages && (
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-neutral-500" />
              <span className="text-neutral-600">Сторінок:</span>
              <span className="font-medium">{book.pages}</span>
            </div>
          )}
          
          {book.age_range && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-neutral-500" />
              <span className="text-neutral-600">Вікова група:</span>
              <Badge variant="outline" className="text-xs">{book.age_range}</Badge>
            </div>
          )}
        </div>
      </div>

      {/* Publishing Information */}
      {(book.publisher || book.publication_year || book.isbn) && (
        <div>
          <h3 className="text-body-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
            <Building className="h-5 w-5" />
            Видавнича інформація
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            {book.publisher && (
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-neutral-500" />
                <span className="text-neutral-600">Видавництво:</span>
                <span className="font-medium">{book.publisher}</span>
              </div>
            )}
            
            {book.publication_year && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-neutral-500" />
                <span className="text-neutral-600">Рік видання:</span>
                <span className="font-medium">{book.publication_year}</span>
              </div>
            )}
            
            {book.isbn && (
              <div className="flex items-center gap-2 sm:col-span-2">
                <Hash className="h-4 w-4 text-neutral-500" />
                <span className="text-neutral-600">ISBN:</span>
                <span className="font-medium font-mono text-xs">{book.isbn}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Availability Information */}
      <div>
        <h3 className="text-body-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
          <Truck className="h-5 w-5" />
          Доступність
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-neutral-500" />
            <span className="text-neutral-600">У наявності:</span>
            <span className="font-medium">
              {book.qty_available} з {book.qty_total} екземплярів
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-2xl text-caption font-medium ${
              book.is_active 
                ? "text-green-700 bg-green-100" 
                : "text-red-700 bg-red-100"
            }`}>
              {book.is_active ? "✓ Доступна для оренди" : "✗ Усі екземпляри видані"}
            </span>
          </div>
          
          {book.location && (
            <div className="flex items-center gap-2 sm:col-span-2">
              <MapPin className="h-4 w-4 text-neutral-500" />
              <span className="text-neutral-600">Розташування:</span>
              <span className="font-medium">{book.location}</span>
            </div>
          )}
        </div>
      </div>

      {/* Categories and Tags */}
      {(book.category || book.subcategory || book.tags?.length) && (
        <div>
          <h3 className="text-body-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Категорії та теги
          </h3>
          <div className="space-y-3">
            {(book.category || book.subcategory) && (
              <div className="flex items-start gap-2">
                <Tag className="h-4 w-4 text-neutral-500 mt-0.5" />
                <div>
                  <span className="text-neutral-600">Категорія:</span>
                  <div className="flex gap-2 mt-1">
                    {book.category && (
                      <Badge variant="secondary" className="text-xs">
                        {book.category}
                      </Badge>
                    )}
                    {book.subcategory && (
                      <Badge variant="outline" className="text-xs">
                        {book.subcategory}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {book.tags?.length && (
              <div className="flex items-start gap-2">
                <Tag className="h-4 w-4 text-neutral-500 mt-0.5" />
                <div>
                  <span className="text-neutral-600">Теги:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {book.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}