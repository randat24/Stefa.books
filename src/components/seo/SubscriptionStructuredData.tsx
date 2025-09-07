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
  const jsonLd = {
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
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}