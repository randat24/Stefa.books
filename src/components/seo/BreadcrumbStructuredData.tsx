"use client";

import { useEffect, useMemo } from "react";

interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

interface BreadcrumbStructuredDataProps {
  items: BreadcrumbItem[];
  baseUrl?: string;
}

export function BreadcrumbStructuredData({ 
  items, 
  baseUrl = 'https://stefa-books.com.ua' 
}: BreadcrumbStructuredDataProps) {
  const jsonLd = useMemo(() => {
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": items.map((item, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": item.label,
        "item": item.href ? `${baseUrl}${item.href}` : undefined
      })).filter(item => item.item) // Remove items without href
    };

    return structuredData;
  }, [items, baseUrl]);

  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(jsonLd);
    script.id = 'breadcrumb-structured-data';
    
    // Remove existing script if any
    const existingScript = document.getElementById('breadcrumb-structured-data');
    if (existingScript) {
      existingScript.remove();
    }
    
    document.head.appendChild(script);

    return () => {
      const scriptToRemove = document.getElementById('breadcrumb-structured-data');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [jsonLd]);

  return null;
}