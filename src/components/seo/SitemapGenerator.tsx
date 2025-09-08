'use client';

import React from 'react';

interface SitemapGeneratorProps {
  baseUrl?: string;
  pages: Array<{
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
}

/**
 * Компонент для генерации sitemap.xml
 */
export function SitemapGenerator({
  baseUrl = 'https://stefa-books.com.ua',
  pages = [],
  books = [],
  categories = []
}: SitemapGeneratorProps) {
  const generateSitemap = () => {
    const allPages = [
      // Статические страницы
      { url: '/', lastmod: new Date().toISOString().split('T')[0], changefreq: 'daily', priority: 1.0 },
      { url: '/books', lastmod: new Date().toISOString().split('T')[0], changefreq: 'daily', priority: 0.9 },
      { url: '/about', lastmod: new Date().toISOString().split('T')[0], changefreq: 'monthly', priority: 0.7 },
      { url: '/contact', lastmod: new Date().toISOString().split('T')[0], changefreq: 'monthly', priority: 0.6 },
      { url: '/privacy', lastmod: new Date().toISOString().split('T')[0], changefreq: 'yearly', priority: 0.3 },
      { url: '/terms', lastmod: new Date().toISOString().split('T')[0], changefreq: 'yearly', priority: 0.3 },
      
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

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(page => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    return sitemap;
  };

  const sitemap = generateSitemap();

  return (
    <div className="p-4">
      <h2 className="text-h3 mb-4">Sitemap XML</h2>
      <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
        {sitemap}
      </pre>
    </div>
  );
}

/**
 * Компонент для генерации robots.txt
 */
export function RobotsTxtGenerator({
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
  const generateRobotsTxt = () => {
    const robots = `User-agent: *
${allowAll ? 'Allow: /' : 'Disallow: /'}
${disallowPaths.map(path => `Disallow: ${path}`).join('\n')}

Sitemap: ${baseUrl}${sitemapUrl}`;

    return robots;
  };

  const robots = generateRobotsTxt();

  return (
    <div className="p-4">
      <h2 className="text-h3 mb-4">Robots.txt</h2>
      <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
        {robots}
      </pre>
    </div>
  );
}

/**
 * Компонент для генерации мета-тегов для социальных сетей
 */
export function SocialMetaTags({
  title,
  description,
  image,
  url,
  type = 'website',
  siteName = 'Stefa.books'
}: {
  title: string;
  description: string;
  image: string;
  url: string;
  type?: string;
  siteName?: string;
}) {
  const fullImage = image.startsWith('http') ? image : `${process.env.NEXT_PUBLIC_BASE_URL || 'https://stefa-books.com.ua'}${image}`;
  const fullUrl = url.startsWith('http') ? url : `${process.env.NEXT_PUBLIC_BASE_URL || 'https://stefa-books.com.ua'}${url}`;

  return (
    <>
      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="uk_UA" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />
      <meta name="twitter:url" content={fullUrl} />
      
      {/* Additional meta tags */}
      <meta name="twitter:domain" content="stefa-books.com.ua" />
      <meta name="twitter:site" content="@stefabooks" />
      <meta name="twitter:creator" content="@stefabooks" />
    </>
  );
}

/**
 * Компонент для генерации JSON-LD для навигации
 */
export function NavigationStructuredData({
  navigationItems
}: {
  navigationItems: Array<{
    name: string;
    url: string;
    children?: Array<{
      name: string;
      url: string;
    }>;
  }>;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://stefa-books.com.ua';
  
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SiteNavigationElement",
    "name": "Main Navigation",
    "url": baseUrl,
    "hasPart": navigationItems.map(item => ({
      "@type": "SiteNavigationElement",
      "name": item.name,
      "url": item.url.startsWith('http') ? item.url : `${baseUrl}${item.url}`,
      "hasPart": item.children?.map(child => ({
        "@type": "SiteNavigationElement",
        "name": child.name,
        "url": child.url.startsWith('http') ? child.url : `${baseUrl}${child.url}`
      }))
    }))
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData)
      }}
    />
  );
}

/**
 * Компонент для генерации мета-тегов для поисковых систем
 */
export function SearchEngineMetaTags({
  title,
  description,
  keywords,
  canonical,
  noindex = false,
  nofollow = false
}: {
  title: string;
  description: string;
  keywords: string[];
  canonical: string;
  noindex?: boolean;
  nofollow?: boolean;
}) {
  const robots = noindex || nofollow ? 
    `${noindex ? 'noindex' : ''}${nofollow ? ', nofollow' : ''}`.replace(/^, /, '') : 
    'index, follow';

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(', ')} />
      <meta name="robots" content={robots} />
      <link rel="canonical" href={canonical} />
      
      {/* Additional meta tags */}
      <meta name="author" content="Stefa.books Team" />
      <meta name="publisher" content="Stefa.books" />
      <meta name="copyright" content="Stefa.books" />
      <meta name="language" content="uk" />
      <meta name="revisit-after" content="7 days" />
      <meta name="distribution" content="global" />
      <meta name="rating" content="general" />
    </>
  );
}
