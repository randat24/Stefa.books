/**
 * Утилиты для SEO оптимизации
 */

import { Metadata } from 'next';
import { generateOGImageUrl } from './og';

/**
 * Генерация мета-тегов для страницы
 */
export function generateMetaTags({
  title,
  description,
  keywords = [],
  canonical,
  ogImage,
  ogType = 'website',
  twitterCard = 'summary_large_image',
  noindex = false,
  nofollow = false,
  author = 'Stefa.books Team',
  publishedTime,
  modifiedTime,
  section,
  tags = []
}: {
  title: string;
  description: string;
  keywords?: string[];
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  twitterCard?: string;
  noindex?: boolean;
  nofollow?: boolean;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
}) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://stefa-books.com.ua';
  const fullCanonical = canonical ? `${baseUrl}${canonical}` : baseUrl;
  const fullOgImage = ogImage ? 
    (ogImage.startsWith('http') ? ogImage : `${baseUrl}${ogImage}`) : 
    generateOGImageUrl({ title, description });

  return {
    title,
    description,
    keywords: keywords.join(', '),
    canonical: fullCanonical,
    robots: {
      index: !noindex,
      follow: !nofollow,
      googleBot: {
        index: !noindex,
        follow: !nofollow,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      }
    },
    authors: [{ name: author }],
    creator: 'Stefa.books',
    publisher: 'Stefa.books',
    openGraph: {
      type: ogType,
      title,
      description,
      url: fullCanonical,
      siteName: 'Stefa.books',
      locale: 'uk_UA',
      images: [
        {
          url: fullOgImage,
          width: 1200,
          height: 630,
          alt: title
        }
      ],
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
      ...(section && { section }),
      ...(tags.length > 0 && { tags })
    },
    twitter: {
      card: twitterCard,
      title,
      description,
      images: [fullOgImage]
    },
    alternates: {
      canonical: fullCanonical
    }
  };
}

/**
 * Генерация структурированных данных для книги
 */
export function generateBookStructuredData(book: {
  id: string;
  title: string;
  author: string;
  description?: string;
  cover_url?: string;
  published_date?: string;
  isbn?: string;
  pages?: number;
  language?: string;
  category?: string;
  rating?: number;
  review_count?: number;
  price?: number;
  currency?: string;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://stefa-books.com.ua';
  const bookUrl = `${baseUrl}/books/${book.id}`;
  const ogImage = book.cover_url || '/images/book-placeholder.svg';
  const fullOgImage = ogImage.startsWith('http') ? ogImage : `${baseUrl}${ogImage}`;

  return {
    "@context": "https://schema.org",
    "@type": "Book",
    "name": book.title,
    "author": {
      "@type": "Person",
      "name": book.author
    },
    "description": book.description,
    "image": fullOgImage,
    "url": bookUrl,
    "isbn": book.isbn,
    "numberOfPages": book.pages,
    "inLanguage": book.language || "uk",
    "datePublished": book.published_date,
    "genre": book.category,
    "aggregateRating": book.rating ? {
      "@type": "AggregateRating",
      "ratingValue": book.rating,
      "reviewCount": book.review_count || 0,
      "bestRating": 5,
      "worstRating": 1
    } : undefined,
    "publisher": {
      "@type": "Organization",
      "name": "Stefa.books",
      "url": baseUrl
    },
    "offers": {
      "@type": "Offer",
      "availability": "https://schema.org/InStock",
      "price": book.price || "0",
      "priceCurrency": book.currency || "UAH",
      "url": bookUrl,
      "seller": {
        "@type": "Organization",
        "name": "Stefa.books"
      }
    }
  };
}

/**
 * Генерация структурированных данных для каталога
 */
export function generateCatalogStructuredData({
  books,
  category,
  author,
  searchQuery,
  currentPage = 1,
  totalPages = 1
}: {
  books: Array<{
    id: string;
    title: string;
    author: string;
    cover_url?: string;
    description?: string;
  }>;
  category?: string;
  author?: string;
  searchQuery?: string;
  currentPage?: number;
  totalPages?: number;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://stefa-books.com.ua';
  
  let name = 'Каталог книг';
  let description = 'Переглядайте каталог дитячих книг на Stefa.books';
  
  if (category) {
    name = `Книги категорії "${category}"`;
    description = `Книги категорії "${category}" на Stefa.books`;
  } else if (author) {
    name = `Книги автора ${author}`;
    description = `Книги автора ${author} на Stefa.books`;
  } else if (searchQuery) {
    name = `Результати пошуку "${searchQuery}"`;
    description = `Результати пошуку "${searchQuery}" на Stefa.books`;
  }

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": name,
    "description": description,
    "url": `${baseUrl}/books`,
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": books.length,
      "itemListElement": books.map((book, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "Book",
          "name": book.title,
          "author": {
            "@type": "Person",
            "name": book.author
          },
          "url": `${baseUrl}/books/${book.id}`,
          "image": book.cover_url ? 
            (book.cover_url.startsWith('http') ? book.cover_url : `${baseUrl}${book.cover_url}`) : 
            `${baseUrl}/images/book-placeholder.svg`,
          "description": book.description
        }
      }))
    }
  };
}

/**
 * Генерация sitemap.xml
 */
export function generateSitemap({
  baseUrl = 'https://stefa-books.com.ua',
  pages = [],
  books = [],
  categories = []
}: {
  baseUrl?: string;
  pages?: Array<{
    url: string;
    lastmod?: string;
    changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
    priority?: number;
  }>;
  books?: Array<{
    id: string;
    updated_at?: string;
  }>;
  categories?: Array<{
    slug: string;
    updated_at?: string;
  }>;
}) {
  const allPages = [
    // Статические страницы
    { url: '/', lastmod: new Date().toISOString().split('T')[0], changefreq: 'daily' as const, priority: 1.0 },
    { url: '/books', lastmod: new Date().toISOString().split('T')[0], changefreq: 'daily' as const, priority: 0.9 },
    { url: '/about', lastmod: new Date().toISOString().split('T')[0], changefreq: 'monthly' as const, priority: 0.7 },
    { url: '/contact', lastmod: new Date().toISOString().split('T')[0], changefreq: 'monthly' as const, priority: 0.6 },
    { url: '/privacy', lastmod: new Date().toISOString().split('T')[0], changefreq: 'yearly' as const, priority: 0.3 },
    { url: '/terms', lastmod: new Date().toISOString().split('T')[0], changefreq: 'yearly' as const, priority: 0.3 },
    
    // Категории
    ...categories.map(cat => ({
      url: `/books?category=${cat.slug}`,
      lastmod: cat.updated_at ? cat.updated_at.split('T')[0] : new Date().toISOString().split('T')[0],
      changefreq: 'weekly' as const,
      priority: 0.8
    })),
    
    // Книги
    ...books.map(book => ({
      url: `/books/${book.id}`,
      lastmod: book.updated_at ? book.updated_at.split('T')[0] : new Date().toISOString().split('T')[0],
      changefreq: 'monthly' as const,
      priority: 0.7
    })),
    
    // Дополнительные страницы
    ...pages
  ];

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(page => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;
}

/**
 * Генерация robots.txt
 */
export function generateRobotsTxt({
  baseUrl = 'https://stefa-books.com.ua',
  allowAll = true,
  disallowPaths = ['/admin', '/api', '/_next'],
  sitemapUrl = '/sitemap.xml'
}: {
  baseUrl?: string;
  allowAll?: boolean;
  disallowPaths?: string[];
  sitemapUrl?: string;
}) {
  return `User-agent: *
${allowAll ? 'Allow: /' : 'Disallow: /'}
${disallowPaths.map(path => `Disallow: ${path}`).join('\n')}

Sitemap: ${baseUrl}${sitemapUrl}`;
}

/**
 * Оптимизация заголовка для SEO
 */
export function optimizeTitle(title: string, maxLength = 60): string {
  if (title.length <= maxLength) return title;
  
  const words = title.split(' ');
  let optimized = '';
  
  for (const word of words) {
    if ((optimized + ' ' + word).length <= maxLength) {
      optimized += (optimized ? ' ' : '') + word;
    } else {
      break;
    }
  }
  
  return optimized || title.substring(0, maxLength - 3) + '...';
}

/**
 * Оптимизация описания для SEO
 */
export function optimizeDescription(description: string, maxLength = 160): string {
  if (description.length <= maxLength) return description;
  
  const optimized = description.substring(0, maxLength - 3);
  const lastSpace = optimized.lastIndexOf(' ');
  
  if (lastSpace > maxLength * 0.8) {
    return optimized.substring(0, lastSpace) + '...';
  }
  
  return optimized + '...';
}

/**
 * Генерация ключевых слов для страницы
 */
export function generateKeywords({
  primary,
  secondary = [],
  category,
  author,
  tags = []
}: {
  primary: string[];
  secondary?: string[];
  category?: string;
  author?: string;
  tags?: string[];
}): string[] {
  const keywords = [
    ...primary,
    ...secondary,
    'дитячі книги',
    'українські книги',
    'читання для дітей',
    'дитяча бібліотека',
    'Stefa.books'
  ];
  
  if (category) keywords.push(category);
  if (author) keywords.push(author);
  if (tags.length > 0) keywords.push(...tags);
  
  // Удаляем дубликаты и ограничиваем количество
  return [...new Set(keywords)].slice(0, 20);
}

/**
 * Проверка SEO метрик страницы
 */
export function checkSEOMetrics({
  title,
  description,
  keywords,
  content
}: {
  title: string;
  description: string;
  keywords: string[];
  content: string;
}) {
  const issues: string[] = [];
  const suggestions: string[] = [];
  
  // Проверка заголовка
  if (title.length < 30) {
    issues.push('Заголовок слишком короткий (менее 30 символов)');
  } else if (title.length > 60) {
    issues.push('Заголовок слишком длинный (более 60 символов)');
  }
  
  // Проверка описания
  if (description.length < 120) {
    issues.push('Описание слишком короткое (менее 120 символов)');
  } else if (description.length > 160) {
    issues.push('Описание слишком длинное (более 160 символов)');
  }
  
  // Проверка ключевых слов
  if (keywords.length < 5) {
    suggestions.push('Добавьте больше ключевых слов (рекомендуется 5-10)');
  } else if (keywords.length > 20) {
    suggestions.push('Слишком много ключевых слов (рекомендуется не более 20)');
  }
  
  // Проверка контента
  if (content.length < 300) {
    issues.push('Контент слишком короткий (менее 300 символов)');
  }
  
  // Проверка плотности ключевых слов
  const contentLower = content.toLowerCase();
  const keywordDensity = keywords.reduce((density, keyword) => {
    const matches = (contentLower.match(new RegExp(keyword.toLowerCase(), 'g')) || []).length;
    return density + (matches / content.split(' ').length) * 100;
  }, 0);
  
  if (keywordDensity < 1) {
    suggestions.push('Низкая плотность ключевых слов (менее 1%)');
  } else if (keywordDensity > 3) {
    issues.push('Слишком высокая плотность ключевых слов (более 3%)');
  }
  
  return {
    score: Math.max(0, 100 - issues.length * 20 - suggestions.length * 5),
    issues,
    suggestions
  };
}
