"use client";

import { useEffect, useMemo } from "react";

export function OrganizationStructuredData() {
  const jsonLd = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Stefa.books",
    "alternateName": "Стефа букс",
    "description": "Оренда дитячих книг у Миколаєві з підпискою та доставкою додому",
    "url": "https://stefa-books.com.ua",
    "logo": {
      "@type": "ImageObject",
      "url": "https://stefa-books.com.ua/logo.svg",
      "width": "200",
      "height": "200"
    },
    "image": [
      "https://stefa-books.com.ua/logo.svg",
      "https://stefa-books.com.ua/favicon.ico"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+38-073-408-56-60",
      "contactType": "customer service",
      "areaServed": "UA",
      "availableLanguage": "Ukrainian"
    },
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "вул. Маріупольська 13/2",
      "addressLocality": "Миколаїв",
      "addressRegion": "Миколаївська область",
      "postalCode": "54000",
      "addressCountry": "UA"
    },
    "areaServed": {
      "@type": "GeoCircle",
      "geoMidpoint": {
        "@type": "GeoCoordinates",
        "latitude": "46.9659",
        "longitude": "32.0048"
      },
      "geoRadius": "50000"
    },
    "founder": {
      "@type": "Person",
      "name": "Команда Stefa.books"
    },
    "foundingDate": "2024",
    "slogan": "Читайте більше - платіть менше",
    "serviceArea": {
      "@type": "City",
      "name": "Миколаїв"
    },
    "sameAs": [
      "https://facebook.com/stefabooks",
      "https://instagram.com/stefa.books",
      "https://t.me/stefabooks"
    ]
  }), []);

  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(jsonLd);
    document.head.appendChild(script);

    return () => {
      // Safely remove only if the node is still connected to the DOM
      if (script && (script as any).isConnected) {
        script.remove();
        return;
      }
      if (script && script.parentNode && script.parentNode.contains(script)) {
        script.parentNode.removeChild(script);
      }
    };
  }, [jsonLd]);

  return null;
}