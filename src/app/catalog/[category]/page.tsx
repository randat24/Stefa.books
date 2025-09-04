import { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, BookOpen } from 'lucide-react';
import BookCard from '@/components/BookCard';

type Params = Promise<{ category: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { category } = await params;
  const categorySlug = decodeURIComponent(category);
  
  try {
    const { data: categoryData } = await supabase
      .from('categories')
      .select('name, description')
      .eq('slug', categorySlug)
      .single();
    
    const categoryDataTyped = categoryData as any; // Временное решение для типизации
    const categoryName = categoryDataTyped?.name || categorySlug;
    const title = `${categoryName} - Дитячі книги | Stefa.books`;
    const description = categoryDataTyped?.description || 
      `Книги категорії "${categoryName}" для дітей. Великий вибір українських дитячих книг для різних вікових категорій в бібліотеці Stefa.books.`;
    
    return {
      title,
      description,
      keywords: [
        categoryName,
        'дитячі книги',
        'українські книги',
        'книги для дітей',
        'каталог книг',
        'дитяча література',
        'оренда книг',
        'читання для дітей',
        'Stefa.books'
      ],
      openGraph: {
        title,
        description,
        type: 'website',
        locale: 'uk_UA',
        url: `https://stefa-books.com.ua/catalog/${categorySlug}`,
        siteName: 'Stefa.books',
        images: [
          {
            url: '/images/og-image.jpg',
            width: 1200,
            height: 630,
            alt: `Книги категорії "${categoryName}" - Stefa.books`
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
        canonical: `https://stefa-books.com.ua/catalog/${categorySlug}`
      }
    };
  } catch (error) {
    console.error('Error generating metadata for category:', error);
    return {
      title: 'Категорія | Stefa.books',
      description: 'Книги категорії в бібліотеці Stefa.books'
    };
  }
}

export default async function CategoryPage({ params }: { params: Params }) {
  const { category } = await params;
  const categorySlug = decodeURIComponent(category);
  
  try {
    // Получаем данные категории
    const { data: categoryData } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', categorySlug)
      .single();
    
    if (!categoryData) {
      notFound();
    }
    
    const categoryDataTyped = categoryData as any; // Временное решение для типизации
    
    // Получаем книги этой категории
    const { data: books } = await supabase
      .from('books')
      .select('*')
      .eq('category_id', categoryDataTyped.id)
      .eq('available', true)
      .order('title');
    
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumbs */}
          <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
            <Link href="/" className="hover:text-gray-900">Главная</Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/catalog" className="hover:text-gray-900">Каталог</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-gray-900 font-medium">{categoryDataTyped.name}</span> 
          </nav>
          
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-blue-600" />
              {categoryDataTyped.name}
            </h1>
            {categoryDataTyped.description && (
              <p className="text-lg text-gray-600 max-w-3xl">
                {categoryDataTyped.description}
              </p>
            )}
            <p className="text-sm text-gray-500 mt-2">
              Знайдено книг: {books?.length || 0}
            </p>
          </div>
          
          {/* Books Grid */}
          {books && books.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {books.map((book: any) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Книги не знайдено
              </h3>
              <p className="text-gray-600 mb-6">
                В цій категорії поки що немає доступних книг.
              </p>
              <Link 
                href="/catalog"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Переглянути всі книги
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error loading category page:', error);
    notFound();
  }
}
