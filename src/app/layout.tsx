import "./globals.css";
import Providers from "@/components/Providers";
import { ErrorBoundary } from "@/components/error-boundary";
import { ClientLayoutWrapper } from "@/components/layouts/ClientLayoutWrapper";
import UpdateNotification from "@/components/ui/UpdateNotification";
import { Metadata } from "next";

// Force dynamic rendering to prevent static generation issues
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://stefa-books.com.ua'),
  title: 'Stefa.books - Оренда дитячих книг у Миколаєві | Дитяча бібліотека з підпискою',
  description: 'Оренда дитячих книг у Миколаєві з підпискою та доставкою додому. Перша українська книжкова бібліотека за підпискою в місті. Від 299 грн/місяць. Безкоштовна доставка по всьому Миколаєву.',
  keywords: [
    'оренда дитячих книг Миколаїв',
    'дитячі книги з доставкою Миколаїв',
    'книжкова підписка Миколаїв',
    'українські дитячі книги',
    'дитяча бібліотека Миколаїв',
    'книги підписка',
    'оренда книг',
    'дитячі книги онлайн',
    'сучасні дитячі книги',
    'якісні дитячі книги'
  ],
  authors: [{ name: 'Стефа букс' }],
  creator: 'Стефа букс',
  publisher: 'Стефа букс',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/favicon.svg', sizes: 'any', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: '32x32', type: 'image/x-icon' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-48x48.png', sizes: '48x48', type: 'image/png' },
      { url: '/favicon-64x64.png', sizes: '64x64', type: 'image/png' },
      { url: '/icons/icon-144x144.png', sizes: '144x144', type: 'image/png' }
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Stefa.books',
  },
  verification: {
    google: 'your-google-verification-code', // Replace with actual code
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'uk_UA',
    url: 'https://stefa-books.com.ua',
    title: 'Stefa.books - Оренда дитячих книг у Миколаєві',
    description: 'Оренда дитячих книг у Миколаєві з підпискою та доставкою додому. Перша українська книжкова бібліотека за підпискою в місті.',
    siteName: 'Stefa.books',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Stefa.books - Дитячі книги з доставкою',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Stefa.books - Оренда дитячих книг у Миколаєві',
    description: 'Оренда дитячих книг у Миколаєві з підпискою та доставкою додому',
    images: ['/og-image.jpg'],
  },
  alternates: {
    canonical: 'https://stefa-books.com.ua',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uk">
      <body>
        <ErrorBoundary>
          <Providers>
            <ClientLayoutWrapper>
              {children}
            </ClientLayoutWrapper>
            <UpdateNotification />
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}