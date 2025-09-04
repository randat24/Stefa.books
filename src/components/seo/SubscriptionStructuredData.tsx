"use client";

import { useEffect, useMemo } from "react";

interface SubscriptionStructuredDataProps {
  name: string;
  description: string;
  price: number;
  currency: string;
}

export function SubscriptionStructuredData({ 
  name, 
  description, 
  price, 
  currency 
}: SubscriptionStructuredDataProps) {
  const jsonLd = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "Product",
    "name": name,
    "description": description,
    "offers": {
      "@type": "Offer",
      "price": price.toString(),
      "priceCurrency": currency,
      "availability": "https://schema.org/InStock",
      "url": "https://stefa-books.com.ua/plans"
    }
  }), [name, description, price, currency]);

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