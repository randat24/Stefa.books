'use client';

import React from 'react';

/**
 * Компонент для структурированных данных организации
 */
export function OrganizationStructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Stefa.books",
    "url": "https://stefa-books.com.ua",
    "logo": "https://stefa-books.com.ua/logo.svg",
    "description": "Дитяча бібліотека книг з підпискою та орендою",
    "foundingDate": "2024",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+380-XX-XXX-XXXX",
      "contactType": "customer service",
      "availableLanguage": "Ukrainian"
    },
    "sameAs": [
      "https://www.facebook.com/stefabooks",
      "https://www.instagram.com/stefabooks",
      "https://t.me/stefabooks"
    ],
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "UA",
      "addressLocality": "Київ"
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData)
      }}
    />
  );
}

/**
 * Компонент для структурированных данных веб-сайта
 */
export function WebsiteStructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Stefa.books",
    "url": "https://stefa-books.com.ua",
    "description": "Дитяча бібліотека книг з підпискою та орендою",
    "publisher": {
      "@type": "Organization",
      "name": "Stefa.books"
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://stefa-books.com.ua/books?search={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData)
      }}
    />
  );
}

/**
 * Компонент для структурированных данных книги
 */
interface BookStructuredDataProps {
  book: {
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
    price?: number;
    currency?: string;
  };
}

export function BookStructuredData({ book }: BookStructuredDataProps) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://stefa-books.com.ua';
  const bookUrl = `${baseUrl}/books/${book.id}`;
  const ogImage = book.cover_url || '/images/book-placeholder.jpg';
  const fullOgImage = ogImage.startsWith('http') ? ogImage : `${baseUrl}${ogImage}`;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Book",
    "name": book.title,
    "author": {
      "@type": "Person",
      "name": book.author
    },
    "description": book.description,
    "image": fullOgImage,
    "url": bookUrl,
    "isbn": book.isbn,
    "numberOfPages": book.pages,
    "inLanguage": book.language || "uk",
    "datePublished": book.published_date,
    "genre": book.category,
    "aggregateRating": book.rating ? {
      "@type": "AggregateRating",
      "ratingValue": book.rating,
      "reviewCount": book.review_count || 0,
      "bestRating": 5,
      "worstRating": 1
    } : undefined,
    "publisher": {
      "@type": "Organization",
      "name": "Stefa.books",
      "url": baseUrl
    },
    "offers": {
      "@type": "Offer",
      "availability": "https://schema.org/InStock",
      "price": book.price || "0",
      "priceCurrency": book.currency || "UAH",
      "url": bookUrl,
      "seller": {
        "@type": "Organization",
        "name": "Stefa.books"
      }
    },
    "workExample": {
      "@type": "Book",
      "name": book.title,
      "author": {
        "@type": "Person",
        "name": book.author
      },
      "isbn": book.isbn,
      "bookFormat": "https://schema.org/EBook"
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData)
      }}
    />
  );
}

/**
 * Компонент для структурированных данных каталога
 */
interface CatalogStructuredDataProps {
  books: Array<{
    id: string;
    title: string;
    author: string;
    cover_url?: string;
    description?: string;
  }>;
  category?: string;
  author?: string;
  searchQuery?: string;
  currentPage?: number;
  totalPages?: number;
}

export function CatalogStructuredData({
  books,
  category,
  author,
  searchQuery,
  currentPage = 1,
  totalPages = 1
}: CatalogStructuredDataProps) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://stefa-books.com.ua';
  
  let name = 'Каталог книг';
  let description = 'Переглядайте каталог дитячих книг на Stefa.books';
  
  if (category) {
    name = `Книги категорії "${category}"`;
    description = `Книги категорії "${category}" на Stefa.books`;
  } else if (author) {
    name = `Книги автора ${author}`;
    description = `Книги автора ${author} на Stefa.books`;
  } else if (searchQuery) {
    name = `Результати пошуку "${searchQuery}"`;
    description = `Результати пошуку "${searchQuery}" на Stefa.books`;
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": name,
    "description": description,
    "url": `${baseUrl}/books`,
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": books.length,
      "itemListElement": books.map((book, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "Book",
          "name": book.title,
          "author": {
            "@type": "Person",
            "name": book.author
          },
          "url": `${baseUrl}/books/${book.id}`,
          "image": book.cover_url ? 
            (book.cover_url.startsWith('http') ? book.cover_url : `${baseUrl}${book.cover_url}`) : 
            `${baseUrl}/images/book-placeholder.jpg`,
          "description": book.description
        }
      }))
    },
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Головна",
          "item": baseUrl
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Книги",
          "item": `${baseUrl}/books`
        },
        ...(category ? [{
          "@type": "ListItem",
          "position": 3,
          "name": category,
          "item": `${baseUrl}/books?category=${encodeURIComponent(category)}`
        }] : []),
        ...(author ? [{
          "@type": "ListItem",
          "position": 3,
          "name": author,
          "item": `${baseUrl}/books?author=${encodeURIComponent(author)}`
        }] : [])
      ]
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData)
      }}
    />
  );
}

/**
 * Компонент для структурированных данных FAQ
 */
interface FAQStructuredDataProps {
  faqs: Array<{
    question: string;
    answer: string;
  }>;
}

export function FAQStructuredData({ faqs }: FAQStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData)
      }}
    />
  );
}

/**
 * Компонент для структурированных данных отзывов
 */
interface ReviewStructuredDataProps {
  reviews: Array<{
    id: string;
    author: string;
    rating: number;
    reviewBody: string;
    datePublished: string;
  }>;
  itemName: string;
  itemType?: 'Book' | 'Service';
}

export function ReviewStructuredData({ reviews, itemName, itemType = 'Book' }: ReviewStructuredDataProps) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://stefa-books.com.ua';
  
  const structuredData = {
    "@context": "https://schema.org",
    "@type": itemType,
    "name": itemName,
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length,
      "reviewCount": reviews.length,
      "bestRating": 5,
      "worstRating": 1
    },
    "review": reviews.map(review => ({
      "@type": "Review",
      "author": {
        "@type": "Person",
        "name": review.author
      },
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": review.rating,
        "bestRating": 5,
        "worstRating": 1
      },
      "reviewBody": review.reviewBody,
      "datePublished": review.datePublished
    }))
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData)
      }}
    />
  );
}
