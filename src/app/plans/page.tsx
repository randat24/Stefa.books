import { Metadata } from 'next';
import { SubscriptionStructuredData } from '@/components/seo/SubscriptionStructuredData';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

export async function generateMetadata(): Promise<Metadata> {
  const title = 'Тарифи підписки на дитячі книги у Миколаєві | від 300 грн/міс';
  const description = 'Оберіть зручний тариф підписки на українські дитячі книги з безкоштовною доставкою у Миколаєві. Від 300 грн/міс, без прихованих платежів. Гнучкі умови скасування підписки.';
  
  return {
    title,
    description,
    keywords: [
      'підписка на дитячі книги',
      'оренда книг Миколаїв',
      'тарифи на книги',
      'дитяча бібліотека',
      'доставка книг',
      'українські книги для дітей',
      'абонемент на книги',
      'книжковий клуб',
      'дитяче читання'
    ],
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'uk_UA',
      url: 'https://stefa-books.com.ua/plans',
      siteName: 'Stefa.books - Дитяча бібліотека',
      images: [
        {
          url: '/images/plans-og-image.jpg',
          width: 1200,
          height: 630,
          alt: 'Тарифи підписки на дитячі книги у Миколаєві від 300 грн/міс - Stefa.books'
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/images/plans-og-image.jpg'],
      site: '@stefabooksua',
      creator: '@stefabooksua',
    }
  };
}

export default function PlansPage() {
	return (
		<div className="container-default py-8">
			<SubscriptionStructuredData 
				name="Підписка на дитячі книги"
				description="Орендуйте українські дитячі книги онлайн з доставкою"
				price={300}
				currency="UAH"
			/>
			{/* Breadcrumbs */}
			<div className="mb-6">
				<nav className="flex items-center space-x-2 text-body-sm text-neutral-600">
					<Link href="/" className="hover:text-neutral-900">Головна</Link>
					<ChevronRight className="h-4 w-4" />
					<span className="text-neutral-900 font-medium">Тарифи</span>
				</nav>
			</div>
			
			<h1 className="h1">Тарифи підписки</h1>
			<div className="grid md:grid-cols-2 gap-6 mt-6">
				<div className="card p-6">
					<h3 className="text-body-lg font-semibold">Mini</h3>
					<p className="text-h1 text-brand-accent-light mt-2">300 ₴/міс</p>
					<p className="text-muted mt-2">1 книга за раз</p>
					<ul className="mt-4 space-y-2">
						<li>✓ Безкоштовна доставка</li>
						<li>✓ Можна змінювати книгу</li>
						<li>✓ Скасування в будь-який час</li>
					</ul>
				</div>
				<div className="card p-6">
					<h3 className="text-body-lg font-semibold">Maxi</h3>
					<p className="text-h1 text-brand-accent-light mt-2">500 ₴/міс</p>
					<p className="text-muted mt-2">2 книги за раз</p>
					<ul className="mt-4 space-y-2">
						<li>✓ Безкоштовна доставка</li>
						<li>✓ Можна змінювати книгу</li>
						<li>✓ Скасування в будь-який час</li>
						<li>✓ Пріоритетна підтримка</li>
					</ul>
				</div>
			</div>
		</div>
	)
}