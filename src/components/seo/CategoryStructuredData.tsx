"use client";

import { useEffect, useMemo } from "react";

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  parent_id?: string;
  book_count?: number;
}

interface CategoryStructuredDataProps {
  category: Category;
  baseUrl?: string;
  parentCategory?: Category;
}

export function CategoryStructuredData({ 
  category, 
  baseUrl = 'https://stefa-books.com.ua',
  parentCategory 
}: CategoryStructuredDataProps) {
  const jsonLd = useMemo(() => {
    const categoryUrl = `${baseUrl}/catalog/${category.slug}`;
    const categoryImage = category.image_url || `${baseUrl}/images/category-default.jpg`;
    
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": category.name,
      "description": category.description || `Категорія "${category.name}" - дитячі книги`,
      "url": categoryUrl,
      "image": categoryImage,
      "mainEntity": {
        "@type": "ItemList",
        "name": `Книги в категорії "${category.name}"`,
        "numberOfItems": category.book_count || 0,
        "itemListElement": [] // Will be populated with books if needed
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
            "name": "Каталог",
            "item": `${baseUrl}/catalog`
          },
          ...(parentCategory ? [{
            "@type": "ListItem",
            "position": 3,
            "name": parentCategory.name,
            "item": `${baseUrl}/catalog/${parentCategory.slug}`
          }] : []),
          {
            "@type": "ListItem",
            "position": parentCategory ? 4 : 3,
            "name": category.name,
            "item": categoryUrl
          }
        ]
      },
      "isPartOf": {
        "@type": "WebSite",
        "name": "Stefa.books",
        "url": baseUrl
      },
      "keywords": [
        "дитячі книги",
        "українські книги",
        category.name,
        "категорія книг",
        "читання для дітей"
      ].filter(Boolean)
    };

    return structuredData;
  }, [category, baseUrl, parentCategory]);

  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(jsonLd);
    script.id = `category-structured-data-${category.slug}`;
    
    // Remove existing script if any
    const existingScript = document.getElementById(`category-structured-data-${category.slug}`);
    if (existingScript) {
      existingScript.remove();
    }
    
    document.head.appendChild(script);

    return () => {
      const scriptToRemove = document.getElementById(`category-structured-data-${category.slug}`);
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [jsonLd, category.slug]);

  return null;
}
