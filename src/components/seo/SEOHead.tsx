"use client";

import { usePathname } from "next/navigation";
import Head from "next/head";

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
  ogType?: "website" | "article" | "book" | "profile";
  canonicalUrl?: string;
  noIndex?: boolean;
  cityName?: string;
}

export function SEOHead({
  title,
  description,
  keywords = [],
  ogImage = "/images/og-image.jpg",
  ogType = "website",
  canonicalUrl,
  noIndex = false,
  cityName = "Миколаєві",
}: SEOHeadProps) {
  const pathname = usePathname();
  const baseUrl = "https://stefa-books.com.ua";
  const fullUrl = canonicalUrl || `${baseUrl}${pathname}`;
  
  // Улучшенный заголовок с геолокацией
  const pageTitle = title 
    ? `${title} | Stefa.books - Дитяча бібліотека`
    : `Stefa.books - Оренда дитячих книг у ${cityName} | Дитяча бібліотека з підпискою`;
  
  // Улучшенное описание с призывом к действию
  const pageDescription = description || 
    `Орендуй книги легко й вигідно в онлайн-бібліотеці з великим вибором жанрів. Економ на покупці та відкривай нові історії щодня. Безкоштовна доставка по ${cityName}.`;
  
  // Расширенные ключевые слова с геолокацией
  const extendedKeywords = [
    ...keywords,
    'дитячі книги',
    'українські книги',
    `оренда книг ${cityName}`,
    'підписка на книги',
    'читання для дітей',
    'українська література',
    'дитяча бібліотека',
    'книги для дітей',
    'доставка книг',
    'книги українською',
    'розвиток дитини',
    'дитяче читання'
  ];

  return (
    <Head>
      {/* Основные мета-теги */}
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      <meta name="keywords" content={extendedKeywords.join(', ')} />
      
      {/* Управление индексацией */}
      {noIndex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      )}
      
      {/* Open Graph теги */}
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:image" content={`${baseUrl}${ogImage}`} />
      <meta property="og:site_name" content="Stefa.books - Дитяча бібліотека" />
      <meta property="og:locale" content="uk_UA" />
      
      {/* Twitter Card теги */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content={`${baseUrl}${ogImage}`} />
      <meta name="twitter:site" content="@stefabooksua" />
      <meta name="twitter:creator" content="@stefabooksua" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={fullUrl} />
      
      {/* Дополнительные мета-теги */}
      <meta name="author" content="Stefa.books Team" />
      <meta name="publisher" content="Stefa.books" />
      <meta name="geo.region" content="UA-48" />
      <meta name="geo.placename" content={cityName} />
      
      {/* Мета-теги для мобильных устройств */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="theme-color" content="#ffffff" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
    </Head>
  );
}