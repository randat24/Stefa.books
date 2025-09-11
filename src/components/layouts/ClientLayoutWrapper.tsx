'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { ClientHeader } from '@/components/layouts/ClientHeader';
import { Footer } from '@/components/layouts/Footer';
import { BackToTop } from '@/components/ui/BackToTop';
import { ErrorBoundary } from '@/components/error-boundary';
// PageTransitionWrapper removed for build fix
import { registerServiceWorker, checkServiceWorkerUpdate } from '@/lib/serviceWorker';
import { preloadCriticalImages } from '@/lib/image-optimization';
import { preloadCriticalFonts } from '@/lib/font-optimization';
import { preloadCriticalResources, implementResourceHints } from '@/lib/resource-preloading';
import { initializeIntersectionObserver } from '@/lib/intersection-observer';

interface ClientLayoutWrapperProps {
  children: React.ReactNode;
}

export function ClientLayoutWrapper({ children }: ClientLayoutWrapperProps) {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith('/admin');

  // Register service worker and initialize performance optimizations on mount
  useEffect(() => {
    // Initialize performance optimizations
    preloadCriticalImages();
    preloadCriticalFonts();
    preloadCriticalResources();
    implementResourceHints();
    initializeIntersectionObserver();
    
    if (process.env.NODE_ENV === 'production') {
      registerServiceWorker();
      
      // Check for updates periodically
      const updateInterval = setInterval(checkServiceWorkerUpdate, 60000); // Every minute
      
      return () => {
        clearInterval(updateInterval);
      };
    }
  }, []);

  // Для админ-панели возвращаем только children без Header/Footer
  if (isAdminPage) {
    return <>{children}</>;
  }

  // Для обычных страниц возвращаем полный layout с Header/Footer
  return (
    <>
      {/* Шапка (внутри full-bleed секции, но контент — в контейнере) */}
      <ErrorBoundary fallback={
        <header className="bg-white shadow-sm">
          <div className="container mx-auto px-4 py-4 max-w-7xl">
            <h1 className="text-h3">Stefa.books</h1>
          </div>
        </header>
      }>
        <ClientHeader />
      </ErrorBoundary>

      {/* Основной контент: ограничен контейнером */}
      <main className="flex-1">
        <ErrorBoundary>
          <div className="container mx-auto px-4 max-w-7xl">{children}</div>
        </ErrorBoundary>
      </main>

      {/* Футер: секция на всю ширину, внутри — контейнер с колонками */}
      <ErrorBoundary fallback={
        <footer className="bg-neutral-50 py-8">
          <div className="container mx-auto px-4 text-center text-neutral-500 max-w-7xl">
            <p>© 2025 Stefa.books</p>
          </div>
        </footer>
      }>
        <Footer />
      </ErrorBoundary>
      
      {/* Кнопка вверх */}
      <BackToTop />
    </>
  );
}