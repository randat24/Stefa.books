"use client"

import Head from 'next/head'

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

export function SEOHead({
  title = 'Stefa.books - Дитяча бібліотека книг з підпискою та орендою',
  description = 'Орендуйте та читайте українські дитячі книги онлайн. Великий каталог українських дитячих книг для різних вікових категорій. Підписка та окрема оренда книг.',
  keywords = [
    'дитячі книги',
    'українські книги',
    'оренда книг',
    'підписка на книги',
    'читання для дітей',
    'українська література',
    'дитяча бібліотека',
    'книги для дітей'
  ],
  canonical,
  ogImage = '/images/og-image.jpg',
  ogType = 'website',
  twitterCard = 'summary_large_image',
  twitterSite,
  twitterCreator,
  noindex = false,
  nofollow = false,
  structuredData,
  alternateHreflang = []
}: SEOHeadProps) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://stefa-books.com.ua'
  const fullTitle = title.includes('Stefa.books') ? title : `${title} | Stefa.books`
  const canonicalUrl = canonical ? `${baseUrl}${canonical}` : baseUrl

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(', ')} />
      
      {canonical && <link rel="canonical" href={canonicalUrl} />}
      
      {/* Open Graph */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={`${baseUrl}${ogImage}`} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content="Stefa.books" />
      <meta property="og:locale" content="uk_UA" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`${baseUrl}${ogImage}`} />
      {twitterSite && <meta name="twitter:site" content={twitterSite} />}
      {twitterCreator && <meta name="twitter:creator" content={twitterCreator} />}
      
      {/* Robots */}
      {(noindex || nofollow) && (
        <meta 
          name="robots" 
          content={`${noindex ? 'noindex' : 'index'}, ${nofollow ? 'nofollow' : 'follow'}`} 
        />
      )}
      
      {/* Structured Data */}
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}
      
      {/* Alternate Hreflang */}
      {alternateHreflang.map(({ hreflang, href }) => (
        <link
          key={hreflang}
          rel="alternate"
          hrefLang={hreflang}
          href={`${baseUrl}${href}`}
        />
      ))}
    </Head>
  )
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

export function BookSEOHead({ book }: BookSEOHeadProps) {
  const title = `${book.title} - ${book.author}`
  const description = book.description || `Читайте "${book.title}" автора ${book.author} на Stefa.books. Дитячі книги українською мовою.`
  
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Book",
    "name": book.title,
    "author": {
      "@type": "Person",
      "name": book.author
    },
    "description": book.description,
    "image": book.cover_url,
    "datePublished": book.published_date,
    "isbn": book.isbn,
    "numberOfPages": book.pages,
    "inLanguage": book.language || "uk",
    "genre": book.category,
    "aggregateRating": book.rating ? {
      "@type": "AggregateRating",
      "ratingValue": book.rating,
      "reviewCount": book.review_count || 0
    } : undefined
  }

  return (
    <SEOHead
      title={title}
      description={description}
      canonical={`/books/${book.id}`}
      ogType="book"
      structuredData={structuredData}
    />
  )
}

interface CatalogSEOHeadProps {
  category?: string
  author?: string
  searchQuery?: string
  currentPage?: number
  totalPages?: number
}

export function CatalogSEOHead({ 
  category, 
  author, 
  searchQuery, 
  currentPage, 
  totalPages 
}: CatalogSEOHeadProps) {
  let title = 'Каталог книг'
  let description = 'Переглядайте каталог дитячих книг на Stefa.books. Великий вибір українських книг для дітей різного віку.'

  if (category) {
    title = `Книги категорії "${category}"`
    description = `Книги категорії "${category}" на Stefa.books. Дитячі книги українською мовою.`
  } else if (author) {
    title = `Книги автора ${author}`
    description = `Книги автора ${author} на Stefa.books. Дитячі книги українською мовою.`
  } else if (searchQuery) {
    title = `Результати пошуку "${searchQuery}"`
    description = `Результати пошуку "${searchQuery}" на Stefa.books. Знайдіть потрібну книгу.`
  }

  if (currentPage && totalPages && currentPage > 1) {
    title += ` - Сторінка ${currentPage}`
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": title,
    "description": description,
    "url": "https://stefa-books.com.ua/books"
  }

  return (
    <SEOHead
      title={title}
      description={description}
      canonical="/books"
      structuredData={structuredData}
    />
  )
}