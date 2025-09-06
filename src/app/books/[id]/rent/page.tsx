import { notFound } from "next/navigation";
import { fetchBook } from "@/lib/api/books";

export const dynamic = 'force-dynamic'
import { BookRentalForm } from "@/components/rental/BookRentalForm";
import { BookRentalInfo } from "@/components/rental/BookRentalInfo";
import { BookRentalPricing } from "@/components/rental/BookRentalPricing";
import { BookRentalTerms } from "@/components/rental/BookRentalTerms";
import { ChevronLeft, BookOpen } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  
  try {
    const response = await fetchBook(id);
    
    if (!response.success || !response.data) {
      return {
        title: 'Книга не найдена | Stefa.books',
        description: 'Запрашиваемая книга не найдена в нашей библиотеке'
      };
    }

    const book = response.data;

    return {
      title: `Оренда "${book.title}" | Stefa.books`,
      description: `Орендуйте книгу "${book.title}" автора ${book.author} в Stefa.books. Доставка по Україні.`,
      keywords: [
        'оренда книг',
        'дитячі книги',
        'українські книги',
        book.title,
        book.author,
        'Stefa.books'
      ],
      openGraph: {
        title: `Оренда "${book.title}" | Stefa.books`,
        description: `Орендуйте книгу "${book.title}" автора ${book.author} в Stefa.books.`,
        type: 'website',
        url: `https://stefa-books.com.ua/books/${id}/rent`,
        images: [
          {
            url: book.cover_url || '/images/default-book-cover.jpg',
            width: 400,
            height: 600,
            alt: `Обложка книги "${book.title}"`
          }
        ]
      }
    };
  } catch {
    return {
      title: 'Оренда книги | Stefa.books',
      description: 'Орендуйте дитячі книги в Stefa.books'
    };
  }
}

export default async function BookRentalPage({ params }: { params: Params }) {
  const { id } = await params;
  
  try {
    const response = await fetchBook(id);
    
    if (!response.success || !response.data) {
      return notFound();
    }

    const book = response.data;

    if (!book.available) {
      return (
        <div className="container py-8">
          <div className="max-w-2xl mx-auto text-center">
            <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Книга недоступна для оренди</h1>
            <p className="text-gray-600 mb-6">
              На жаль, книга &quot;{book.title}&quot; зараз видана іншому читачу.
            </p>
            <div className="flex gap-4 justify-center">
              <Button asChild>
                <Link href={`/books/${id}`}>
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Повернутися до книги
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/catalog">
                  Переглянути інші книги
                </Link>
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="container py-8">
        {/* Breadcrumbs */}
        <div className="mb-6">
          <nav className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-gray-900">Головна</Link>
            <ChevronLeft className="h-4 w-4" />
            <Link href="/catalog" className="hover:text-gray-900">Каталог</Link>
            <ChevronLeft className="h-4 w-4" />
            <Link href={`/books/${id}`} className="hover:text-gray-900">{book.title}</Link>
            <ChevronLeft className="h-4 w-4" />
            <span className="text-gray-900 font-medium">Оренда</span>
          </nav>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Book Info */}
          <div className="lg:col-span-1">
            <BookRentalInfo book={book} />
          </div>

          {/* Rental Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Pricing */}
            <BookRentalPricing book={book} />

            {/* Rental Form */}
            <BookRentalForm book={book} />

            {/* Terms */}
            <BookRentalTerms />
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error loading book for rental:', error);
    return notFound();
  }
}
