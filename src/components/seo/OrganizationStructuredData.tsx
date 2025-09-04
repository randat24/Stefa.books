"use client";

import { useEffect, useMemo } from "react";

export function OrganizationStructuredData() {
  const jsonLd = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Stefa.books",
    "url": "https://stefa-books.com.ua",
    "logo": "https://stefa-books.com.ua/logo.svg",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+38-063-856-54-14",
      "contactType": "customer service"
    },
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "вул. Маріупольська 13/2",
      "addressLocality": "Миколаїв",
      "addressCountry": "UA"
    }
  }), []);

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