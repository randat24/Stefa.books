import "./globals.css";
import Providers from "@/components/Providers";
import { ErrorBoundary } from "@/components/error-boundary";
import { ClientLayoutWrapper } from "@/components/layouts/ClientLayoutWrapper";
import { Metadata } from "next";
import { OrganizationStructuredData } from "@/components/seo/OrganizationStructuredData";
import { LocalBusinessStructuredData } from "@/components/seo/LocalBusinessStructuredData";
import { BookRentalServiceSchema } from "@/components/seo/BookRentalServiceSchema";
import { CanonicalAndHreflang } from "@/components/seo/CanonicalAndHreflang";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import CookieConsent from "@/components/analytics/CookieConsent";
import WebVitalsTracker from "@/components/performance/WebVitalsTracker";
import { OfflineIndicator } from "@/components/offline/OfflineIndicator";
// SpeedInsights removed - using Netlify
import { CacheInvalidator } from "@/components/cache/CacheInvalidator";
import { MetaRefresh } from "@/components/cache/MetaRefresh";
import UpdateNotification from "@/components/ui/UpdateNotification";
import { Favicon } from "@/components/Favicon";

// Force dynamic rendering to prevent static generation issues
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'stefa-books.com.ua'),
  title: 'Stefa.books - Оренда дитячих книг у Миколаєві | Дитяча бібліотека з підпискою',
  description: 'Оренда дитячих книг у Миколаєві з підпискою та доставкою додому. Перша українська книжкова бібліотека за підпискою в місті. Від 299 грн/місяць. Безкоштовна доставка по всьому Миколаєву.',
  keywords: [
    'оренда дитячих книг Миколаїв',
    'дитячі книги з доставкою Миколаїв',
    'книжкова підписка Миколаїв',
    'українські дитячі книги',
    'бібліотека дитячих книг',
    'доставка книг додому Миколаїв',
    'дитяче читання Миколаїв',
    'книги для дітей Миколаїв',
    'підписка на книги Україна',
    'оренда книг з доставкою',
    'українська література для дітей',
    'розвиток дитини через читання',
    'дешева оренда книг',
    'міколаївська дитяча бібліотека'
  ],
  authors: [{ name: 'Stefa.books Team' }],
  creator: 'Stefa.books',
  publisher: 'Stefa.books',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-48x48.png', sizes: '48x48', type: 'image/png' },
      { url: '/favicon-64x64.png', sizes: '64x64', type: 'image/png' }
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ],
    shortcut: '/favicon.ico'
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1 }
  },
  openGraph: {
    type: 'website',
    locale: 'uk_UA',
    url: 'https://stefa-books.com.ua',
    title: 'Stefa.books - Оренда дитячих книг у Миколаєві | Дитяча бібліотека з підпискою',
    description: 'Орендуй книги легко й вигідно в онлайн-бібліотеці з великим вибором жанрів. Економ на покупці та відкривай нові історії щодня. Безкоштовна доставка по Миколаєву.',
    siteName: 'Stefa.books - Дитяча бібліотека',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Stefa.books - Оренда дитячих книг у Миколаєві'
      },
      {
        url: '/logo-text.svg',
        width: 200,
        height: 200,
        alt: 'Stefa.books логотип'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Stefa.books - Оренда дитячих книг у Миколаєві | Дитяча бібліотека з підпискою',
    description: 'Орендуй книги легко й вигідно в онлайн-бібліотеці з великим вибором жанрів. Економ на покупці та відкривай нові історії щодня.',
    images: ['/images/og-image.jpg'],
    site: '@stefabooksua',
    creator: '@stefabooksua' } };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uk" suppressHydrationWarning>
      <head>
        <Favicon />
      </head>
      <body className="min-h-screen flex flex-col bg-[var(--app-bg)] text-[var(--text)]" suppressHydrationWarning>
        <ErrorBoundary>
          <GoogleAnalytics />
        </ErrorBoundary>
        <ErrorBoundary>
          <CookieConsent />
        </ErrorBoundary>
        <ErrorBoundary>
          <WebVitalsTracker />
        </ErrorBoundary>
        <ErrorBoundary>
          <OrganizationStructuredData />
        </ErrorBoundary>
        <ErrorBoundary>
          <LocalBusinessStructuredData />
        </ErrorBoundary>
        <ErrorBoundary>
          <BookRentalServiceSchema />
        </ErrorBoundary>
        <ErrorBoundary>
          <CanonicalAndHreflang 
            locale="uk" 
            alternateLocales={[
              { locale: "ru", url: "https://stefa-books.com.ua/ru" },
              { locale: "en", url: "https://stefa-books.com.ua/en" }
            ]} 
          />
        </ErrorBoundary>
        <ErrorBoundary>
          <OfflineIndicator />
        </ErrorBoundary>
        <ErrorBoundary>
          {/* SpeedInsights removed - using Netlify */}
        </ErrorBoundary>
        <ErrorBoundary>
          <CacheInvalidator />
        </ErrorBoundary>
        <ErrorBoundary>
          <MetaRefresh />
        </ErrorBoundary>
        <ErrorBoundary>
          <UpdateNotification />
        </ErrorBoundary>
        <ErrorBoundary>
          <Providers>
            <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
          </Providers>
        </ErrorBoundary>
        <script src="/cache-clear.js" async></script>
      </body>
    </html>
  );
}