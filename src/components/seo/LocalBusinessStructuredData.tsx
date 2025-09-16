"use client";

import { useEffect, useMemo } from "react";

export function LocalBusinessStructuredData() {
  const jsonLd = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "LibraryService",
    "name": "Stefa.books",
    "alternateName": "Stefa.books - Дитяча бібліотека",
    "description": "Оренда дитячих книг у Миколаєві. Великий вибір українських книг для дітей різного віку.",
    "url": "https://stefa-books.com.ua",
    "logo": "https://stefa-books.com.ua/logo.svg",
    "image": "https://stefa-books.com.ua/images/og-image.jpg",
    "telephone": "+38-073-408-56-60",
    "email": "info@stefa-books.com.ua",
    "priceRange": "₴₴",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "вул. Маріупольська 13/2",
      "addressLocality": "Миколаїв",
      "postalCode": "54000",
      "addressCountry": "UA",
      "addressRegion": "Миколаївська область"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "46.975033",
      "longitude": "31.994583"
    },
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "opens": "09:00",
        "closes": "18:00"
      },
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": "Saturday",
        "opens": "10:00",
        "closes": "16:00"
      }
    ],
    "sameAs": [
      "https://www.facebook.com/stefa.books",
      "https://www.instagram.com/stefa.books"
    ],
    "areaServed": {
      "@type": "City",
      "name": "Миколаїв"
    },
    "serviceType": ["Оренда книг", "Дитяча бібліотека", "Доставка книг"],
    "availableLanguage": {
      "@type": "Language",
      "name": "Ukrainian"
    },
    "paymentAccepted": ["Готівка", "Банківська картка", "Онлайн-оплата"],
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Каталог дитячих книг",
      "itemListElement": [
        {
          "@type": "OfferCatalog",
          "name": "Книги для дошкільнят",
          "itemListElement": []
        },
        {
          "@type": "OfferCatalog",
          "name": "Книги для молодшої школи",
          "itemListElement": []
        },
        {
          "@type": "OfferCatalog",
          "name": "Книги для підлітків",
          "itemListElement": []
        }
      ]
    }
  }), []);

  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(jsonLd);
    script.id = 'local-business-structured-data';
    
    // Remove existing script if any
    const existingScript = document.getElementById('local-business-structured-data');
    if (existingScript) {
      existingScript.remove();
    }
    
    document.head.appendChild(script);

    return () => {
      const scriptToRemove = document.getElementById('local-business-structured-data');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [jsonLd]);

  return null;
}
