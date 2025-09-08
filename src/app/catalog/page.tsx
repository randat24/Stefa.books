import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Metadata } from 'next';
import { ChevronRight } from 'lucide-react';

export async function generateMetadata(): Promise<Metadata> {
  const title = 'Каталог книг - Stefa.books';
  const description = 'Перегляньте повний каталог українських дитячих книг. Знайдіть книги за категоріями, авторами або ключовими словами. Великий вибір книг для різних вікових категорій.';
  
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'uk_UA',
      url: 'https://stefa-books.com.ua/catalog',
      siteName: 'Stefa.books',
      images: [
        {
          url: '/images/og-image.jpg',
          width: 1200,
          height: 630,
          alt: 'Каталог українських дитячих книг - Stefa.books'
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/images/og-image.jpg'],
    }
  };
}

export default async function CatalogPage() {
	// Загружаем категории напрямую из Supabase на сервере
	const { data: categories, error } = await supabase
		.from('categories')
		.select('*')
		.order('name');
	
	return (
		<div className="container-default py-8">
			{/* Breadcrumbs */}
			<div className="mb-6">
				<nav className="flex items-center space-x-2 text-body-sm text-gray-600">
					<Link href="/" className="hover:text-gray-900">Головна</Link>
					<ChevronRight className="h-4 w-4" />
					<span className="text-gray-900 font-medium">Каталог</span>
				</nav>
			</div>
			
			<h1 className="h1">Каталог книг</h1>
			<p className="text-muted mt-2">
				Оберіть потрібну книгу. Зверніть увагу, що ми постійно оновлюємо каталог. Якщо ви не знайшли бажаної книги, напишіть нам у будь-який зручний спосіб.
			</p>
			
			{/* Server-side Categories */}
			<div className="max-w-4xl mx-auto mt-8">
				<h2 className="text-h2 text-gray-900 mb-8">📚 Повний каталог</h2>
				{categories && !error ? (
					<div className="space-y-6">
						{categories.map((category: any) => (
							<Link
								key={category.id}
								href={`/books?category=${encodeURIComponent(category.name)}`}
								className="flex items-center gap-3 p-4 rounded-xl hover:bg-gray-50 transition-colors"
								style={{ 
									backgroundColor: category.color ? `${category.color}20` : '#F8FAFC',
									borderLeft: `4px solid ${category.color || '#64748B'}` 
								}}
							>
								<span className="text-h2">{category.icon || '📚'}</span>
								<h3 className="text-body-lg font-semibold text-gray-800 group-hover:text-gray-900">
									{category.name}
								</h3>
								<span className="ml-auto text-body-sm text-gray-500 bg-white px-2 py-1 rounded-2xl">
									Переглянути книги →
								</span>
							</Link>
						))}
					</div>
				) : (
					<div className="text-center py-12 text-red-600">
						❌ Помилка завантаження категорій: {error?.message}
					</div>
				)}
			</div>
			
		</div>
	)
}