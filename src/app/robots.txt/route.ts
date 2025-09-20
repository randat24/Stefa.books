// import { MetadataRoute } from 'next' // Not needed for robots.txt

export function GET(): Response {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://stefa-books.com.ua'
  
  const robotsTxt = `User-agent: *
Allow: /

# Sitemap
Sitemap: ${baseUrl}/sitemap.xml

# Disallow admin and private areas
Disallow: /admin/
Disallow: /api/
Disallow: /_next/
Disallow: /account/

# Allow search engines to crawl public content
Allow: /catalog
Allow: /books/
Allow: /categories/
Allow: /search
Allow: /plans
Allow: /about
Allow: /contact

# Crawl delay (optional)
Crawl-delay: 1
`

  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain' } })
}
