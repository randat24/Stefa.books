"use client"

// TEMPORARILY DISABLED: next/head is not compatible with Next.js App Router
// import Head from 'next/head'

interface SEOHeadProps {
  title?: string
  description?: string
  keywords?: string[]
  canonical?: string
  ogImage?: string
  ogType?: string
  twitterCard?: string
  twitterSite?: string
  twitterCreator?: string
  noindex?: boolean
  nofollow?: boolean
  structuredData?: any
  alternateHreflang?: Array<{ hreflang: string; href: string }>
}

export function SEOHead() {
  // TEMPORARILY DISABLED: This component needs to be rewritten for Next.js App Router
  // Use generateMetadata() in page components instead
  return null
}

interface Book {
  id: string
  title: string
  author: string
  description?: string
  cover_url?: string
  published_date?: string
  isbn?: string
  pages?: number
  language?: string
  category?: string
  rating?: number
  review_count?: number
}

interface BookSEOHeadProps {
  book: Book
}

export function BookSEOHead() {
  // TEMPORARILY DISABLED: This component needs to be rewritten for Next.js App Router
  return null
}

interface CatalogSEOHeadProps {
  category?: string
  author?: string
  searchQuery?: string
  currentPage?: number
  totalPages?: number
}

export function CatalogSEOHead() {
  // TEMPORARILY DISABLED: This component needs to be rewritten for Next.js App Router
  return null
}