'use client'

interface BookRentalServiceSchemaProps {
  organizationName?: string
  serviceArea?: string
  priceRange?: string
  description?: string
}

export function BookRentalServiceSchema({
  organizationName = "Stefa.books",
  serviceArea = "Миколаїв, Україна",
  priceRange = "299-800 грн",
  description = "Сервіс оренди дитячих книг з підпискою та доставкою додому в Миколаєві"
}: BookRentalServiceSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Оренда дитячих книг",
    "description": description,
    "provider": {
      "@type": "Organization",
      "name": organizationName,
      "url": "https://stefa-books.com.ua",
      "logo": "https://stefa-books.com.ua/logo.svg",
      "telephone": "+380-63-123-45-67",
      "email": "info@stefa-books.com.ua",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Миколаїв",
        "addressRegion": "Миколаївська область",
        "addressCountry": "UA",
        "postalCode": "54000"
      },
      "areaServed": {
        "@type": "City",
        "name": "Миколаїв",
        "addressCountry": "UA"
      }
    },
    "serviceType": "Book Rental Service",
    "category": "Дитячі книги",
    "audience": {
      "@type": "Audience",
      "audienceType": "Батьки дітей віком 0-14 років"
    },
    "offers": [
      {
        "@type": "Offer",
        "name": "Базова підписка",
        "description": "1 книга на місяць з доставкою",
        "price": "299",
        "priceCurrency": "UAH",
        "priceSpecification": {
          "@type": "UnitPriceSpecification",
          "price": "299",
          "priceCurrency": "UAH",
          "unitText": "за місяць"
        },
        "itemOffered": {
          "@type": "Product",
          "name": "Місячна підписка на оренду книг"
        }
      },
      {
        "@type": "Offer",
        "name": "Сімейна підписка",
        "description": "3 книги на місяць з пріоритетною доставкою",
        "price": "599",
        "priceCurrency": "UAH",
        "priceSpecification": {
          "@type": "UnitPriceSpecification",
          "price": "599",
          "priceCurrency": "UAH",
          "unitText": "за місяць"
        },
        "itemOffered": {
          "@type": "Product",
          "name": "Сімейна підписка на оренду книг"
        }
      },
      {
        "@type": "Offer",
        "name": "Преміум підписка",
        "description": "5 книг на місяць з подарунками",
        "price": "800",
        "priceCurrency": "UAH",
        "priceSpecification": {
          "@type": "UnitPriceSpecification",
          "price": "800",
          "priceCurrency": "UAH",
          "unitText": "за місяць"
        },
        "itemOffered": {
          "@type": "Product",
          "name": "Преміум підписка на оренду книг"
        }
      }
    ],
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Каталог дитячих книг для оренди",
      "itemListElement": [
        {
          "@type": "Product",
          "name": "Українські дитячі книги",
          "category": "Дитяча література"
        },
        {
          "@type": "Product",
          "name": "Розвиваючі книги",
          "category": "Освітні матеріали"
        },
        {
          "@type": "Product",
          "name": "Казки та оповідання",
          "category": "Художня література"
        }
      ]
    },
    "serviceOutput": {
      "@type": "Product",
      "name": "Орендовані дитячі книги",
      "description": "Фізичні книги доставлені додому на термін оренди"
    },
    "potentialAction": {
      "@type": "OrderAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://stefa-books.com.ua/plans",
        "inLanguage": "uk",
        "actionPlatform": [
          "http://schema.org/DesktopWebPlatform",
          "http://schema.org/MobileWebPlatform"
        ]
      },
      "deliveryMethod": ["http://schema.org/OnSitePickup", "http://schema.org/DeliveryMethod"]
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "127",
      "bestRating": "5",
      "worstRating": "1"
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema, null, 2) }}
    />
  )
}