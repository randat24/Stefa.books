"use client";

import { useState, useMemo, useEffect } from "react";
import BookCard from "@/components/BookCard";
import { Button } from "@/components/ui/button";
import { fetchBooks } from "@/lib/api/books";
import { Sparkles, TrendingUp, Heart, Award, Loader2 } from "lucide-react";
import Link from "next/link";
import type { Book } from "@/lib/supabase";

interface BookRecommendationsProps {
  title?: string;
  subtitle?: string;
  excludeIds?: string[];
  category?: string;
  maxItems?: number;
  showCategories?: boolean;
}

type RecommendationType = "trending" | "popular" | "new" | "category";

export function BookRecommendations({ 
  title = "Рекомендації для вас",
  subtitle = "Книги, які можуть вас зацікавити",
  excludeIds = [],
  category,
  maxItems = 8,
  showCategories = true
}: BookRecommendationsProps) {
  const [activeType, setActiveType] = useState<RecommendationType>("trending");
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load books from API
  useEffect(() => {
    const loadBooks = async () => {
      try {
        setLoading(true);
        setError(null);

        

        const response = await fetchBooks({
          available_only: true,
          limit: 20 // Load more books for better recommendations
        });

        if (response.success) {
          setBooks(response.data);
          
        } else {
          throw new Error(response.error || 'Ошибка загрузки рекомендаций');
        }

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
        setError(errorMessage);
        
      } finally {
        setLoading(false);
      }
    };

    loadBooks();
  }, []);

  const recommendations = useMemo(() => {
    const filtered = books.filter(book => 
      (book.qty_available || 0) > 0 && book.is_active && 
      !excludeIds.includes(book.id) &&
      (!category || book.category_id === category)
    );

    switch (activeType) {
      case "trending":
        // Recently added books (new in database) or books with high ratings
        return filtered
          .filter(book => 
            (book.rating && book.rating >= 4.5) ||
            (book.badges && book.badges.includes('Нове'))
          )
          .slice(0, maxItems);
      
      case "popular": 
        // Books with high ratings or rating counts
        return filtered
          .filter(book => 
            (book.rating && book.rating >= 4.0) ||
            (book.rating_count && book.rating_count >= 10)
          )
          .slice(0, maxItems);
      
      case "new":
        // Recently added books (sort by created_at)
        return filtered
          .sort((a, b) => {
            const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
            const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
            return dateB - dateA;
          })
          .slice(0, maxItems);
      
      case "category":
        // Group by categories and take variety
        const categories = [...new Set(filtered.map(book => book.category_id))];
        const results: Book[] = [];
        const perCategory = Math.ceil(maxItems / categories.length);
        
        categories.forEach(cat => {
          const categoryBooks = filtered
            .filter(book => book.category_id === cat)
            .slice(0, perCategory);
          results.push(...categoryBooks);
        });
        
        return results.slice(0, maxItems);
      
      default:
        return filtered.slice(0, maxItems);
    }
  }, [activeType, excludeIds, category, maxItems, books]);

  const types = [
    { 
      key: "trending" as const, 
      label: "В тренді", 
      icon: TrendingUp, 
      description: "Найпопулярніші зараз" 
    },
    { 
      key: "popular" as const, 
      label: "Популярні", 
      icon: Heart, 
      description: "Улюблені читачів" 
    },
    { 
      key: "new" as const, 
      label: "Новинки", 
      icon: Sparkles, 
      description: "Нещодавно додані" 
    },
    ...(showCategories ? [{ 
      key: "category" as const, 
      label: "Різні жанри", 
      icon: Award, 
      description: "З усіх категорій" 
    }] : [])
  ];

  // Don't render if loading or no books
  if (loading) {
    return (
      <section className="py-16 lg:py-24 bg-gradient-to-b from-white to-neutral-50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 text-neutral-600">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="text-body-lg font-medium">Завантаження рекомендацій...</span>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return null; // Quietly fail for recommendations
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <section className="py-16 lg:py-24 bg-gradient-to-b from-white to-neutral-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8 lg:mb-12">
          <h2 className="text-h1 text-neutral-900 mb-4">
            {title}
          </h2>
          <p className="text-body-lg text-neutral-600 max-w-2xl mx-auto">
            {subtitle}
          </p>
        </div>

        {/* Filter tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {types.map((type) => {
            const Icon = type.icon;
            const isActive = activeType === type.key;
            
            return (
              <button
                key={type.key}
                onClick={() => setActiveType(type.key)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-body-sm font-medium transition-all ${
                  isActive
                    ? "bg-accent text-neutral-900 shadow-lg"
                    : "bg-white text-neutral-600 hover:bg-neutral-50 border border-neutral-200 hover:border-neutral-300"
                }`}
              >
                <Icon className="h-4 w-4" />
                {type.label}
              </button>
            );
          })}
        </div>

        {/* Current type description */}
        <div className="text-center mb-8">
          <p className="text-neutral-600">
            {types.find(t => t.key === activeType)?.description}
          </p>
        </div>

        {/* Books grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {recommendations.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>

        {/* Show more button if there are more books available */}
        {recommendations.length >= maxItems && (
          <div className="text-center mt-8">
            <Button variant="outline" asChild>
              <Link href="/books">
                Переглянути всі книги
              </Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}