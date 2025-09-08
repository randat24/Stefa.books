import { notFound } from "next/navigation";
import { fetchBook } from "@/lib/api/books";
import { BookReturnForm } from "@/components/return/BookReturnForm";
import { BookReturnInfo } from "@/components/return/BookReturnInfo";
import { BookReturnInstructions } from "@/components/return/BookReturnInstructions";
import { ChevronLeft, BookOpen, RotateCcw } from "lucide-react";
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
      title: `Повернення "${book.title}" | Stefa.books`,
      description: `Поверніть книгу "${book.title}" автора ${book.author} в Stefa.books.`,
      keywords: [
        'повернення книг',
        'дитячі книги',
        'українські книги',
        book.title,
        book.author,
        'Stefa.books'
      ],
      openGraph: {
        title: `Повернення "${book.title}" | Stefa.books`,
        description: `Поверніть книгу "${book.title}" автора ${book.author} в Stefa.books.`,
        type: 'website',
        url: `https://stefa-books.com.ua/books/${id}/return`,
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
      title: 'Повернення книги | Stefa.books',
      description: 'Поверніть дитячі книги в Stefa.books'
    };
  }
}

export default async function BookReturnPage({ params }: { params: Params }) {
  const { id } = await params;
  
  try {
    const response = await fetchBook(id);
    
    if (!response.success || !response.data) {
      return notFound();
    }

    const book = response.data;

    return (
      <div className="container py-8">
        {/* Breadcrumbs */}
        <div className="mb-6">
          <nav className="flex items-center space-x-2 text-body-sm text-gray-600">
            <Link href="/" className="hover:text-gray-900">Головна</Link>
            <ChevronLeft className="h-4 w-4" />
            <Link href="/catalog" className="hover:text-gray-900">Каталог</Link>
            <ChevronLeft className="h-4 w-4" />
            <Link href={`/books/${id}`} className="hover:text-gray-900">{book.title}</Link>
            <ChevronLeft className="h-4 w-4" />
            <span className="text-gray-900 font-medium">Повернення</span>
          </nav>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Book Info */}
          <div className="lg:col-span-1">
            <BookReturnInfo book={book} />
          </div>

          {/* Return Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Instructions */}
            <BookReturnInstructions />

            {/* Return Form */}
            <BookReturnForm book={book} />
          </div>
        </div>
      </div>
    );
  } catch {
    return notFound();
  }
}
