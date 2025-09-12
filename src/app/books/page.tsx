import { Suspense, lazy } from 'react';
import { Loader2, ChevronRight } from 'lucide-react';
import Link from 'next/link';

// Lazy load the optimized catalog component
const OptimizedBooksCatalog = lazy(() => 
  import('@/components/catalog/OptimizedBooksCatalog').then(mod => ({ 
    default: mod.OptimizedBooksCatalog 
  }))
);

function BooksPageFallback() {
  return (
    <div className="py-8 flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-text-muted" />
        <p className="text-text-muted">Завантаження каталогу книг...</p>
      </div>
    </div>
  );
}

export default function BooksPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-surface py-8">
        {/* Breadcrumbs */}
        <div className="mb-6">
          <nav className="flex items-center space-x-2 text-body-sm text-text-muted">
            <Link href="/" className="hover:text-text">Головна</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-text font-medium">Книги</span>
          </nav>
        </div>
        
        <div className="mb-8 text-center">
          <h1 className="text-h1 text-text mb-4">
            Каталог книг
          </h1>
          <p className="text-body-lg text-text-muted max-w-2xl mx-auto">
            Оберіть потрібну книгу з нашого каталогу дитячих книг. 
            Використовуйте пошук та фільтри для швидкого знаходження.
          </p>
        </div>
        
        <Suspense fallback={<BooksPageFallback />}>
          <OptimizedBooksCatalog />
        </Suspense>
    </div>
  );
}