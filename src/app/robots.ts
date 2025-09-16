import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://stefa-books.com.ua'
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/books/',
          '/catalog/',
          '/about',
          '/contact',
          '/plans',
          '/search'
        ],
        disallow: [
          '/admin/',
          '/api/',
          '/_next/',
          '/private/',
          '/temp/',
          '*.json',
          '*.xml',
          '/search?*',
          '/catalog?*',
          '/draft/',
          '/error',
          '/404',
          '/500',
          '/login',
          '/logout',
          '/register',
          '/reset-password'
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/_next/',
          '/private/',
          '/temp/',
          '/draft/',
          '/error',
          '/login',
          '/logout'
        ],
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/_next/',
          '/private/',
          '/temp/',
          '/draft/',
          '/error',
          '/login',
          '/logout'
        ],
      },
      {
        userAgent: 'Yandexbot',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/_next/',
          '/private/',
          '/temp/',
          '/draft/',
          '/error',
          '/login',
          '/logout'
        ],
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl
  }
}
