import { Metadata } from 'next';
import { Suspense } from 'react';
import { SearchProvider } from '@/components/search/SearchProvider';
import { EnhancedSearch } from '@/components/search/EnhancedSearch';

// Force dynamic rendering for pages that use context
export const dynamic = 'force-dynamic';

export async function generateMetadata({ searchParams }: { 
  searchParams: Promise<{ q?: string; category?: string; age?: string }> 
}): Promise<Metadata> {
  const params = await searchParams;
  const query = params.q || '';
  const category = params.category || '';
  const age = params.age || '';
  
  let title = 'Пошук книг | Stefa.books';
  let description = 'Пошук українських дитячих книг в каталозі Stefa.books. Знайдіть потрібну книгу за назвою, автором або категорією.';
  
  if (query) {
    title = `Пошук: "${query}" | Stefa.books`;
    description = `Результати пошуку за запитом "${query}" в каталозі дитячих книг Stefa.books.`;
  }
  
  if (category) {
    title = `Книги категорії "${category}" | Stefa.books`;
    description = `Книги категорії "${category}" для дітей. Українські дитячі книги в бібліотеці Stefa.books.`;
  }
  
  if (age) {
    title = `Книги для віку ${age} років | Stefa.books`;
    description = `Книги для дітей ${age} років. Підходящі за віком українські дитячі книги.`;
  }
  
  return {
    title,
    description,
    keywords: [
      'пошук книг',
      'дитячі книги',
      'українські книги',
      'книги для дітей',
      'каталог книг',
      'Stefa.books',
      'фільтри книг',
      'сортування книг',
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
    <div className="min-h-screen bg-neutral-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-h1 text-neutral-900 mb-4">
              Поиск книг
            </h1>
            <p className="text-body-lg text-neutral-600">
              Найдите нужную книгу по названию, автору или категории
            </p>
          </div>
          
          <Suspense fallback={<div>Загрузка поиска...</div>}>
            <SearchProvider>
              <EnhancedSearch />
            </SearchProvider>
          </Suspense>
        </div>
      </div>
    </div>
  );
}
