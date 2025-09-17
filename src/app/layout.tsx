import "./globals.css";
import Providers from "@/components/Providers";
import { ErrorBoundary } from "@/components/error-boundary";
import { ClientLayoutWrapper } from "@/components/layouts/ClientLayoutWrapper";
import { Metadata } from "next";
import { OrganizationStructuredData } from "@/components/seo/OrganizationStructuredData";
import { LocalBusinessStructuredData } from "@/components/seo/LocalBusinessStructuredData";
import { CanonicalAndHreflang } from "@/components/seo/CanonicalAndHreflang";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import CookieConsent from "@/components/analytics/CookieConsent";
import WebVitalsTracker from "@/components/performance/WebVitalsTracker";
import { OfflineIndicator } from "@/components/offline/OfflineIndicator";
// SpeedInsights removed - using Netlify
import { CacheInvalidator } from "@/components/cache/CacheInvalidator";
import { MetaRefresh } from "@/components/cache/MetaRefresh";
import UpdateNotification from "@/components/ui/UpdateNotification";

// Force dynamic rendering to prevent static generation issues
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  title: 'Stefa.books - Оренда дитячих книг у Миколаєві | Дитяча бібліотека з підпискою',
  description: 'Орендуй книги легко й вигідно в онлайн-бібліотеці з великим вибором жанрів. Економ на покупці та відкривай нові історії щодня. Безкоштовна доставка по Миколаєву.',
  keywords: [
    'дитячі книги',
    'українські книги',
    'оренда книг Миколаїв',
    'підписка на книги',
    'читання для дітей',
    'українська література',
    'дитяча бібліотека',
    'книги для дітей',
    'доставка книг',
    'книги українською',
    'розвиток дитини',
    'дитяче читання'
  ],
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