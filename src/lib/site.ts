import { Metadata } from 'next';

export const siteConfig = {
  title: 'Stefa.books - Дитяча бібліотека книг з підпискою та орендою',
  description: 'Орендуйте та читайте українські дитячі книги онлайн. Великий каталог українських дитячих книг для різних вікових категорій. Підписка та окрема оренда книг.',
  keywords: [
    'дитячі книги',
    'українські книги',
    'оренда книг',
    'підписка на книги',
    'читання для дітей',
    'українська література',
    'дитяча бібліотека',
    'книги для дітей'
  ],
  url: 'https://stefa-books.com.ua',
  siteName: 'Stefa.books',
  locale: 'uk_UA',
  type: 'website',
  images: [
    {
      url: '/images/og-image.jpg',
      width: 1200,
      height: 630,
      alt: 'Stefa.books - Дитяча бібліотека книг'
    }
  ]
};

export const defaultMetadata: Metadata = {
  title: `${siteConfig.siteName} - ${siteConfig.title}`,
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: [{ name: 'Stefa.books Team' }],
  creator: 'Stefa.books',
  publisher: 'Stefa.books',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    }
  },
  alternates: {
    canonical: siteConfig.url
  }
};

export const openGraphMetadata = {
  type: siteConfig.type,
  locale: siteConfig.locale,
  url: siteConfig.url,
  title: siteConfig.title,
  description: siteConfig.description,
  siteName: siteConfig.siteName,
  images: siteConfig.images
};

export const twitterMetadata = {
  card: 'summary_large_image',
  title: siteConfig.title,
  description: siteConfig.description,
  images: siteConfig.images,
  creator: '@stefabooks'
};