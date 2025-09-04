import { Metadata } from 'next';
import { Suspense } from 'react';
import { SearchProvider } from '@/components/search/SearchProvider';
import { SimpleSearch } from '@/components/search/SimpleSearch';

export async function generateMetadata({ searchParams }: { 
  searchParams: Promise<{ q?: string; category?: string; age?: string }> 
}): Promise<Metadata> {
  const params = await searchParams;
  const query = params.q || '';
  const category = params.category || '';
  const age = params.age || '';
  
  let title = 'Поиск книг | Stefa.books';
  let description = 'Поиск украинских детских книг в каталоге Stefa.books. Найдите нужную книгу по названию, автору или категории.';
  
  if (query) {
    title = `Поиск: "${query}" | Stefa.books`;
    description = `Результаты поиска по запросу "${query}" в каталоге детских книг Stefa.books.`;
  }
  
  if (category) {
    title = `Книги категории "${category}" | Stefa.books`;
    description = `Книги категории "${category}" для детей. Украинские детские книги в библиотеке Stefa.books.`;
  }
  
  if (age) {
    title = `Книги для возраста ${age} лет | Stefa.books`;
    description = `Книги для детей ${age} лет. Подходящие по возрасту украинские детские книги.`;
  }
  
  return {
    title,
    description,
    keywords: [
      'поиск книг',
      'дитячі книги',
      'українські книги',
      'книги для дітей',
      'каталог книг',
      'Stefa.books',
      query,
      category,
      age
    ].filter(Boolean),
    robots: {
      index: true,
      follow: true,
      noarchive: false,
    },
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'uk_UA',
      url: 'https://stefa-books.com.ua/search',
      siteName: 'Stefa.books',
      images: [
        {
          url: '/images/og-image.jpg',
          width: 1200,
          height: 630,
          alt: 'Поиск книг в Stefa.books'
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/images/og-image.jpg'],
    },
    alternates: {
      canonical: 'https://stefa-books.com.ua/search'
    }
  };
}

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Поиск книг
            </h1>
            <p className="text-lg text-gray-600">
              Найдите нужную книгу по названию, автору или категории
            </p>
          </div>
          
          <Suspense fallback={<div>Загрузка поиска...</div>}>
            <SearchProvider>
              <SimpleSearch />
            </SearchProvider>
          </Suspense>
        </div>
      </div>
    </div>
  );
}
