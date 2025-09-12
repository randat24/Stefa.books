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
	// Загружаем категории через API, который правильно обрабатывает структуру БД
	let categories: any[] = [];
	let error: string | null = null;
	
	try {
		const response = await fetch('/api/categories', {
			cache: 'no-store'
		});
		
		if (response.ok) {
			const data = await response.json();
			if (data.success) {
				categories = data.data;
			} else {
				error = data.error || 'Помилка завантаження категорій';
			}
		} else {
			error = `HTTP ${response.status}: ${response.statusText}`;
		}
	} catch (err) {
		error = err instanceof Error ? err.message : 'Невідома помилка';
	}
	
	return (
		<div className="section-sm">
			<div className="container">
				{/* Breadcrumbs */}
				<div className="mb-6">
					<nav className="flex items-center space-x-2 text-small text-text-muted">
						<Link href="/" className="hover:text-text transition-colors">Головна</Link>
						<ChevronRight className="h-4 w-4" />
						<span className="text-text font-medium">Каталог</span>
					</nav>
				</div>
				
				<h1 className="h1">Каталог книг</h1>
				<p className="lead mt-2">
					Оберіть потрібну книгу. Зверніть увагу, що ми постійно оновлюємо каталог. Якщо ви не знайшли бажаної книги, напишіть нам у будь-який зручний спосіб.
				</p>
				
				{/* Server-side Categories */}
				<div className="max-w-4xl mx-auto mt-8">
					<h2 className="h2 mb-8">📚 Повний каталог</h2>
				{categories && categories.length > 0 && !error ? (
					<div className="space-y-6">
						{categories.map((category: any) => (
							<div key={category.id} className="space-y-4">
								{/* Основная категория */}
								<Link
									href={`/books?category=${encodeURIComponent(category.name)}`}
									className="flex items-center gap-3 p-4 rounded-lg hover:bg-surface transition-colors border-l-4 card"
									style={{ 
										backgroundColor: category.color ? `${category.color}20` : 'var(--surface-2)',
										borderLeftColor: category.color || 'var(--line)'
									}}
								>
									<span className="text-h2">{category.icon || '📚'}</span>
									<h3 className="h3 text-text-muted group-hover:text-text">
										{category.name}
									</h3>
									<span className="ml-auto text-small text-text-muted bg-surface px-2 py-1 rounded-lg">
										Переглянути книги →
									</span>
								</Link>
								
								{/* Подкатегории */}
								{category.subcategories && category.subcategories.length > 0 && (
									<div className="ml-6 space-y-2">
										{category.subcategories.map((subcategory: any) => (
											<Link
												key={subcategory.id}
												href={`/books?category=${encodeURIComponent(subcategory.name)}`}
												className="flex items-center gap-3 p-3 rounded-lg hover:bg-surface transition-colors text-sm"
											>
												<span className="text-lg">{subcategory.icon || '📖'}</span>
												<span className="text-text-muted hover:text-text">
													{subcategory.name}
												</span>
												<span className="ml-auto text-xs text-text-muted">
													→
												</span>
											</Link>
										))}
									</div>
								)}
							</div>
						))}
					</div>
				) : (
					<div className="text-center py-12 text-error">
						❌ Помилка завантаження категорій: {error || 'Категорії не знайдено'}
					</div>
				)}
				</div>
			</div>
		</div>
	)
}