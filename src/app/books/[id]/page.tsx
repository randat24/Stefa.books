import { notFound } from "next/navigation";
import Link from "next/link";

export const dynamic = 'force-dynamic'
import { FavoriteButton } from "@/components/favorites/FavoriteButton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookCard } from "@/components/BookCard";
import { BookViewTracker } from "@/components/BookViewTracker";
import { BookImageGallery } from "@/components/BookImageGallery";
import { BookSpecifications } from "@/components/BookSpecifications";
import {
  BookOpen,
  Award,
  Star,
  Hash,
  FileText,
  Heart,
  ShoppingCart
} from "lucide-react";
import type { Metadata } from "next";
import { supabase } from "@/lib/supabase";

import { BookStructuredData } from "@/components/seo/BookStructuredData";
import { BookBreadcrumbs } from "@/components/BookBreadcrumbs";
import { generateBookOGImage } from "@/lib/og";
import { transformDatabaseBookToBook } from "@/lib/book-utils";

type Params = Promise<{ id: string }>;


export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  
  try {
    const { data: book } = await supabase
      .from('books')
      .select('*')
      .eq('id', id)
      .single();
    
    if (!book) {
      return {
        title: 'Книга не найдена | Stefa.books',
        description: 'Запрашиваемая книга не найдена в нашей библиотеке'
      };
    }
    
    const bookData = book as any; // Временное решение для типизации
    const title = `${bookData.title} - ${bookData.author} | Stefa.books`;
    const description = bookData.description || 
      `Читайте "${bookData.title}" автора ${bookData.author}. Українська дитяча книга для оренди онлайн в бібліотеці Stefa.books.`;
    
    const ogImage = generateBookOGImage({
      title: bookData.title,
      author: bookData.author,
      description: bookData.description
    });
    
    return {
      title,
      description,
      keywords: [
        bookData.title,
        bookData.author,
        'дитячі книги',
        'українські книги',
        'книги для дітей',
        bookData.category?.name || 'дитяча література',
        'оренда книг',
        'читання онлайн',
        'Stefa.books'
      ],
      openGraph: {
        title,
        description,
        type: 'book',
        locale: 'uk_UA',
        url: `https://stefa-books.com.ua/books/${bookData.id}`,
        siteName: 'Stefa.books',
        images: [
          {
            url: ogImage,
            width: 1200,
            height: 630,
            alt: `Обкладинка книги "${bookData.title}"`
          }
        ]
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [ogImage],
      },
      alternates: {
        canonical: `https://stefa-books.com.ua/books/${bookData.id}`
      }
    };
  } catch (error) {
    console.error('Error generating metadata for book:', error);
    return {
      title: 'Книга | Stefa.books',
      description: 'Детская книга в библиотеке Stefa.books'
    };
  }
}


export default async function BookPage({ params }: { params: Params }) {
  const { id } = await params;
  
  // Use direct Supabase access instead of API calls for SSR
  const { data: book, error } = await supabase
    .from('books')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !book) {
    return notFound();
  }

  // Transform database book to our Book interface
  const transformedBook = transformDatabaseBookToBook(book);

  // Get related books using direct Supabase access
  const { data: relatedBooksData } = await supabase
    .from('books')
    .select('*')
    .eq('category_id', book.category_id || '')
    .neq('id', book.id)
    .eq('available', true)
    .limit(5);
    
  const relatedBooks = relatedBooksData || [];

  // Use description from database, with fallback
  const fullDescription = book.description || 
    book.short_description || 
    "Захоплююча дитяча книга, що поєднує в собі пригоди, навчання та розваги. Ідеально підходить для читання разом з батьками або самостійного вивчення. Допоможе розвинути фантазію та мовні навички.";

  // Breadcrumb data will be created in client component

  return (
    <>
      <BookViewTracker bookId={book.id} book={book} />
      
      {/* Structured Data */}
      <BookStructuredData book={transformedBook} />
      
      {/* Breadcrumbs */}
      <BookBreadcrumbs 
        title={book.title}
        category={book.category_id || undefined}
        category_slug={book.category_id?.toLowerCase() || undefined}
      />

      <div className="container mx-auto px-4 py-8 space-y-12">
        {/* Main book info section */}
        <div className="grid gap-8 lg:grid-cols-[400px_1fr]">
          {/* Book Cover Gallery */}
          <div className="space-y-4">
            <BookImageGallery 
              title={book.title}
              cover_url={book.cover_url}
            />
            
          </div>
          
          {/* Book Details */}
          <div className="space-y-6">
            {/* Header */}
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h1 className="text-h1 text-neutral-900 mb-2">
                    {book.title}
                  </h1>
                  <p className="text-h4 text-neutral-700 mb-2">{book.author}</p>
                  
                  {/* Rating */}
                  {book.rating && book.rating_count && (
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-4 w-4 ${
                              i < Math.floor(book.rating!) 
                                ? 'text-accent-light fill-current' 
                                : 'text-neutral-300'
                            }`} 
                          />
                        ))}
                      </div>
                      <span className="text-body-sm text-neutral-600">
                        {book.rating.toFixed(1)} ({book.rating_count} відгуків)
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-4 text-body-sm text-neutral-600 mb-4">
                    <span className="flex items-center gap-1">
                      <Hash className="h-4 w-4" />
                      {book.code}
                    </span>
                    {book.category_id && (
                      <Badge variant="secondary" className="text-xs">
                        {book.category_id}
                      </Badge>
                    )}
                    {book.age_range && (
                      <Badge variant="outline" className="text-xs">
                        {book.age_range}
                      </Badge>
                    )}
                    <span className={`px-3 py-1 rounded-2xl text-caption font-medium ${
                      book.is_active 
                        ? "text-green-700 bg-green-100" 
                        : "text-red-700 bg-red-100"
                    }`}>
                      {book.is_active ? "✓ Доступна" : "✗ Видана"}
                    </span>
                  </div>
                </div>
                <FavoriteButton id={book.id} />
              </div>
              <p className="text-body text-neutral-600 leading-relaxed text-left">
                {book.short_description}
              </p>

              {/* Full Description */}
              {fullDescription && (
                <div className="mt-6 p-6 bg-neutral-50 rounded-xl border border-neutral-200">
                  <h3 className="text-h3 text-neutral-900 mb-4 flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Детальний опис
                  </h3>
                  <div className="prose prose-slate max-w-none">
                    {fullDescription.split('\n\n').map((paragraph, i) => (
                      <p key={i} className="text-readable text-neutral-700 mb-4 last:mb-0">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Order Button */}
              {book.is_active && (
                <div className="pt-4">
                  <Button asChild size="lg" className="w-full sm:w-auto">
                    <Link href={`/books/${book.id}/order`}>
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      Оформити замовлення
                    </Link>
                  </Button>
                </div>
              )}
            </div>

            {/* Badges */}
            {book.badges && book.badges.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-body-sm font-medium text-neutral-700">Нагороди та відзнаки</h4>
                <div className="flex flex-wrap gap-2">
                  {book.badges.map((badge, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      <Award className="h-3 w-3 mr-1" />
                      {badge}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Additional Information */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Specifications */}
          <div className="card p-8">
            <h2 className="text-h2 text-neutral-900 mb-6 flex items-center gap-2">
              <FileText className="h-6 w-6" />
              Характеристики
            </h2>
            <BookSpecifications book={book} />
          </div>

          {/* Author Info */}
          <div className="card p-8">
            <h2 className="text-h2 text-neutral-900 mb-6 flex items-center gap-2">
              <Heart className="h-6 w-6" />
              Про автора
            </h2>
            <div className="flex items-start gap-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center">
                <span className="text-h2 text-brand-accent-light">
                  {book.author.charAt(0)}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="text-body-lg font-semibold text-neutral-900 mb-2">{book.author}</h3>
                <p className="text-neutral-600 leading-relaxed">
                  Детальна інформація про автора буде додана пізніше.
                  Поки що ви можете знайти більше книг цього автора в нашому каталозі.
                </p>
                <Button variant="outline" size="md" className="mt-3 h-8 text-xs">
                  Всі книги автора
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Related books */}
        {relatedBooks.length > 0 && (
          <div className="card p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-h2 text-neutral-900 flex items-center gap-2">
                <BookOpen className="h-6 w-6" />
                Схожі книги
              </h2>
              <Button variant="outline" size="md" asChild>
                <Link href={`/categories/${(book.category_id || 'uncategorized').toLowerCase()}`}>
                  Дивитися всі
                </Link>
              </Button>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {relatedBooks.map((relatedBook) => (
                <BookCard key={relatedBook.id} book={relatedBook} />
              ))}
            </div>
            
            {/* Additional books notice */}
            <div className="mt-6 text-center">
              <p className="text-neutral-600 mb-4">
                Знайдіть ще більше книг у категорії &quot;{book.category_id}&quot;
              </p>
              <Button variant="outline" asChild>
                <Link href={`/categories/${(book.category_id || 'uncategorized').toLowerCase()}`}>
                  Переглянути категорію
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}