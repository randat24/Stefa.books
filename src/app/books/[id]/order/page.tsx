import { notFound } from "next/navigation";
import Link from "next/link";
import { fetchBook } from "@/lib/api/books";
import { BookOrderFlow } from "@/components/BookOrderFlow";
import { ChevronRight } from "lucide-react";
import type { Metadata } from "next";

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const response = await fetchBook(id);
  if (!response.success || !response.data) return { title: "Книга не знайдена" };
  
  const book = response.data;
  const title = `Оформити замовлення: ${book.title} | Stefa.books`;
  const description = `Оформіть замовлення на книгу "${book.title}" від ${book.author}. Виберіть зручний спосіб отримання та підтвердіть замовлення.`;
  
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'uk_UA',
      url: `https://stefa-books.com.ua/books/${id}/order`,
      siteName: 'Stefa.books',
      images: book.cover_url ? [
        {
          url: book.cover_url,
          width: 300,
          height: 400,
          alt: `${book.title} - обкладинка книги`
        }
      ] : [
        {
          url: '/images/og-image.jpg',
          width: 1200,
          height: 630,
          alt: 'Stefa.books - Дитяча бібліотека книг'
        }
      ]
    },
    alternates: {
      canonical: `https://stefa-books.com.ua/books/${id}/order`
    }
  };
}

export default async function BookOrderPage({ params }: { params: Params }) {
  const { id } = await params;
  const bookResponse = await fetchBook(id);
  if (!bookResponse.success || !bookResponse.data) return notFound();

  const book = bookResponse.data;

  return (
    <>
      {/* Breadcrumbs */}
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center space-x-2 text-body-sm text-gray-600">
          <Link href="/" className="hover:text-gray-900">Головна</Link>
          <ChevronRight className="h-4 w-4" />
          <Link href="/catalog" className="hover:text-gray-900">Каталог</Link>
          <ChevronRight className="h-4 w-4" />
          <Link href={`/books/${book.id}`} className="hover:text-gray-900">
            {book.title}
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-gray-900 font-medium">Оформлення замовлення</span>
        </nav>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-h1 text-gray-900 mb-8">
            Оформлення замовлення
          </h1>
          
          <BookOrderFlow book={book} />
        </div>
      </div>
    </>
  );
}