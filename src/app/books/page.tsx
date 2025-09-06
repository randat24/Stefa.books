import { Suspense } from 'react';
import { BooksCatalog } from '@/components/catalog/BooksCatalog';
import { Loader2, ChevronRight } from 'lucide-react';
import Link from 'next/link';

function BooksPageFallback() {
  return (
    <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-600" />
        <p className="text-gray-600">Завантаження каталогу книг...</p>
      </div>
    </div>
  );
}

export default function BooksPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Breadcrumbs */}
        <div className="mb-6">
          <nav className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-gray-900">Головна</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-gray-900 font-medium">Книги</span>
          </nav>
        </div>
        
        <div className="mb-8 text-center">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Каталог книг
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Оберіть потрібну книгу з нашого каталогу дитячих книг. 
            Використовуйте пошук та фільтри для швидкого знаходження.
          </p>
        </div>
        
        <Suspense fallback={<BooksPageFallback />}>
          <BooksCatalog />
        </Suspense>
      </div>
    </div>
  );
}