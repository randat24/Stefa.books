import "./globals.css";
import Providers from "@/components/Providers";
import { ErrorBoundary } from "@/components/error-boundary";
import { ClientLayoutWrapper } from "@/components/layouts/ClientLayoutWrapper";
import { Metadata } from "next";
import { OrganizationStructuredData } from "@/components/seo/OrganizationStructuredData";
import { CanonicalAndHreflang } from "@/components/seo/CanonicalAndHreflang";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { OfflineIndicator } from "@/components/offline/OfflineIndicator";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  title: {
    default: 'Stefa.books - Дитяча бібліотека книг з підпискою та орендою',
    template: '%s | Stefa.books'
  },
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
  openGraph: {
    type: 'website',
    locale: 'uk_UA',
    url: 'https://stefa-books.com.ua',
    title: 'Stefa.books - Дитяча бібліотека книг з підпискою та орендою',
    description: 'Орендуйте та читайте українські дитячі книги онлайн. Великий каталог українських дитячих книг для різних вікових категорій. Підписка та окрема оренда книг.',
    siteName: 'Stefa.books',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Stefa.books - Дитяча бібліотека книг'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Stefa.books - Дитяча бібліотека книг з підпискою та орендою',
    description: 'Орендуйте та читайте українські дитячі книги онлайн. Великий каталог українських дитячих книг для різних вікових категорій. Підписка та окрема оренда книг.',
    images: ['/images/og-image.jpg'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uk" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col bg-white text-gray-900" suppressHydrationWarning>
        <GoogleAnalytics />
        <OrganizationStructuredData />
        <CanonicalAndHreflang 
          locale="uk" 
          alternateLocales={[
            { locale: "ru", url: "https://stefa-books.com.ua/ru" },
            { locale: "en", url: "https://stefa-books.com.ua/en" }
          ]} 
        />
        <OfflineIndicator />
        <ErrorBoundary>
          <Providers>
            <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}