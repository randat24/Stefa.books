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
      "telephone": "+38-073-408-56-60",
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
      // Safely remove only if the node is still connected to the DOM
      if (script && (script as any).isConnected) {
        script.remove();
        return;
      }
      if (script.parentNode && script.parentNode.contains(script)) {
        script.parentNode.removeChild(script);
      }
    };
  }, [jsonLd]);

  return null;
}