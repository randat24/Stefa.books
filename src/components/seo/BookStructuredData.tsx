"use client";

import { Book } from "@/lib/supabase";
import { useEffect, useMemo } from "react";

interface BookStructuredDataProps {
  book: Book;
}

export function BookStructuredData({ book }: BookStructuredDataProps) {
  const jsonLd = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "Book",
    "name": book.title,
    "author": book.author,
    "isbn": book.isbn || undefined,
    "bookFormat": "https://schema.org/Paperback",
    "numberOfPages": book.pages || undefined,
    "inLanguage": "uk",
    "publisher": book.publisher || undefined,
    "datePublished": book.publication_year ? `${book.publication_year}-01-01` : undefined,
    "description": book.short_description || book.description,
    "genre": book.category_id,
    "image": book.cover_url || undefined,
    ...(book.rating && book.rating_count && {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": book.rating,
        "reviewCount": book.rating_count
      }
    })
  }), [book]);

  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(jsonLd);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [jsonLd]);

  return null;
}