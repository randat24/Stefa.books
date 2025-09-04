"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

interface CanonicalAndHreflangProps {
  locale?: string;
  alternateLocales?: { locale: string; url: string }[];
}

export function CanonicalAndHreflang({ 
  locale = "uk", 
  alternateLocales = [] 
}: CanonicalAndHreflangProps) {
  const pathname = usePathname();
  const baseUrl = "https://stefa-books.com.ua";
  const canonicalUrl = `${baseUrl}${pathname}`;

  useEffect(() => {
    // Remove existing canonical and hreflang tags
    const existingCanonical = document.querySelector('link[rel="canonical"]');
    if (existingCanonical) {
      existingCanonical.remove();
    }

    const existingHreflang = document.querySelectorAll('link[rel="alternate"][hreflang]');
    existingHreflang.forEach(link => link.remove());

    // Add canonical tag
    const canonicalLink = document.createElement('link');
    canonicalLink.rel = 'canonical';
    canonicalLink.href = canonicalUrl;
    document.head.appendChild(canonicalLink);

    // Add hreflang tags
    const hreflangLink = document.createElement('link');
    hreflangLink.rel = 'alternate';
    hreflangLink.hreflang = locale;
    hreflangLink.href = canonicalUrl;
    document.head.appendChild(hreflangLink);

    // Add alternate language versions
    alternateLocales.forEach(alternate => {
      const alternateLink = document.createElement('link');
      alternateLink.rel = 'alternate';
      alternateLink.hreflang = alternate.locale;
      alternateLink.href = alternate.url;
      document.head.appendChild(alternateLink);
    });

    // Add x-default hreflang
    const xDefaultLink = document.createElement('link');
    xDefaultLink.rel = 'alternate';
    xDefaultLink.hreflang = 'x-default';
    xDefaultLink.href = canonicalUrl;
    document.head.appendChild(xDefaultLink);

    return () => {
      canonicalLink.remove();
      hreflangLink.remove();
      alternateLocales.forEach(() => {
        const links = document.querySelectorAll('link[rel="alternate"]');
        links.forEach(link => link.remove());
      });
      xDefaultLink.remove();
    };
  }, [canonicalUrl, locale, alternateLocales]);

  return null;
}