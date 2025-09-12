"use client";

import { useEffect, useMemo } from "react";

interface Book {
  id: string;
  title: string;
  author: string;
  description?: string;
  cover_url?: string;
  published_date?: string;
  isbn?: string;
  pages?: number;
  language?: string;
  category?: string;
  rating?: number;
  review_count?: number;
  age_min?: number;
  age_max?: number;
  available?: boolean;
  price?: number;
  currency?: string;
}

interface BookStructuredDataProps {
  book: Book;
  baseUrl?: string;
}

export function BookStructuredData({ book, baseUrl = 'https://stefa-books.com.ua' }: BookStructuredDataProps) {
  const jsonLd = useMemo(() => {
    const bookUrl = `${baseUrl}/books/${book.id}`;
    const coverImage = book.cover_url || `${baseUrl}/images/default-book-cover.jpg`;
    
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Book",
      "name": book.title,
      "author": {
        "@type": "Person",
        "name": book.author
      },
      "description": book.description || `Книга "${book.title}" автора ${book.author}`,
      "image": coverImage,
      "url": bookUrl,
      "isbn": book.isbn,
      "numberOfPages": book.pages,
      "inLanguage": book.language || "uk",
      "datePublished": book.published_date,
      "genre": book.category,
      "bookFormat": "Hardcover",
      "publisher": {
        "@type": "Organization",
        "name": "Stefa.books",
        "url": baseUrl
      },
      "offers": {
        "@type": "Offer",
        "url": bookUrl,
        "priceCurrency": book.currency || "UAH",
        "price": book.price || 0,
        "availability": book.available ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        "seller": {
          "@type": "Organization",
          "name": "Stefa.books"
        }
      },
      "aggregateRating": book.rating ? {
        "@type": "AggregateRating",
        "ratingValue": book.rating,
        "reviewCount": book.review_count || 0,
        "bestRating": 5,
        "worstRating": 1
      } : undefined,
      "audience": {
        "@type": "Audience",
        "audienceType": "Children",
        "suggestedMinAge": book.age_min,
        "suggestedMaxAge": book.age_max
      },
      "keywords": [
        "дитячі книги",
        "українські книги",
        book.category,
        book.author,
        "читання для дітей"
      ].filter(Boolean)
    };

    // Remove undefined properties
    return JSON.parse(JSON.stringify(structuredData, (key, value) => 
      value === undefined ? undefined : value
    ));
  }, [book, baseUrl]);

  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(jsonLd);
    script.id = `book-structured-data-${book.id}`;
    
    // Remove existing script if any
    const existingScript = document.getElementById(`book-structured-data-${book.id}`);
    if (existingScript) {
      existingScript.remove();
    }
    
    document.head.appendChild(script);

    return () => {
      const scriptToRemove = document.getElementById(`book-structured-data-${book.id}`);
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [jsonLd, book.id]);

  return null;
}