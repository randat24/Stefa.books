import { logger } from './logger';

// Dynamic imports for code splitting
export const dynamicImports = {
  // UI Components
  BookCard: () => import('@/components/BookCard'),
  BookPreviewModal: () => import('@/components/BookPreviewModal'),
  HeaderSearch: () => import('@/components/search/HeaderSearch'),
  
  // Forms
  RentalForm: () => import('@/components/RentalForm'),
  SubscribeFormHome: () => import('@/components/subscribe/SubscribeFormHome'),
  
  // Sections
  Hero: () => import('@/components/hero/Hero'),
  Catalog: () => import('@/components/sections/Catalog'),
  Categories: () => import('@/components/sections/Categories'),
  BookRecommendations: () => import('@/components/sections/BookRecommendations'),
  
  // Admin components (lazy load for admin routes)
  BooksTable: () => import('@/app/admin/components/BooksTable'),
  AddBookDialog: () => import('@/app/admin/components/AddBookDialog'),
  EditBookDialog: () => import('@/app/admin/components/EditBookDialog'),
};

// Preload critical components
export function preloadCriticalComponents() {
  if (typeof window === 'undefined') return;

  const criticalComponents = [
    'BookCard',
    'HeaderSearch',
    'Hero',
  ];

  criticalComponents.forEach(componentName => {
    const importFn = dynamicImports[componentName as keyof typeof dynamicImports];
    if (importFn) {
      importFn().catch(error => {
        logger.warn(`Failed to preload ${componentName}`, error);
      });
    }
  });
}

// Preload components based on user interaction
export function preloadOnInteraction(componentName: keyof typeof dynamicImports) {
  const importFn = dynamicImports[componentName];
  if (importFn) {
    importFn().catch(error => {
      logger.warn(`Failed to preload ${componentName} on interaction`, error);
    });
  }
}

// Preload components based on route
export function preloadForRoute(route: string) {
  const routePreloadMap: Record<string, (keyof typeof dynamicImports)[]> = {
    '/books': ['BookCard', 'Catalog', 'Categories'],
    '/admin': ['BooksTable', 'AddBookDialog', 'EditBookDialog'],
    '/subscribe': ['SubscribeFormHome'],
    '/': ['Hero', 'BookRecommendations'],
  };

  const componentsToPreload = routePreloadMap[route] || [];
  
  componentsToPreload.forEach(componentName => {
    preloadOnInteraction(componentName);
  });
}

// Bundle analyzer helper
export function analyzeBundleSize() {
  if (typeof window === 'undefined') return;

  // Check if webpack bundle analyzer is available
  if ('webpackChunkload' in window) {
    logger.info('Webpack bundle analyzer available');
  }

  // Monitor chunk loading performance
  const originalChunkLoad = (window as any).webpackChunkload;
  if (originalChunkLoad) {
    (window as any).webpackChunkload = function(chunkId: string, moreModules: any[]) {
      const startTime = performance.now();
      
      return originalChunkLoad(chunkId, moreModules).then(() => {
        const loadTime = performance.now() - startTime;
        logger.debug('Chunk loaded', { chunkId, loadTime: `${loadTime.toFixed(2)}ms` }, 'Bundle');
      });
    };
  }
}

// Tree shaking optimization helper
export function optimizeTreeShaking() {
  // This function helps ensure proper tree shaking
  // by explicitly importing only what's needed
  
  // Example: Only import specific icons instead of the whole lucide-react package
  const iconImports = {
    Search: () => import('lucide-react').then(m => ({ default: m.Search })),
    Heart: () => import('lucide-react').then(m => ({ default: m.Heart })),
    BookOpen: () => import('lucide-react').then(m => ({ default: m.BookOpen })),
  };

  return iconImports;
}

// Memory usage optimization
export function optimizeMemoryUsage() {
  if (typeof window === 'undefined') return;

  // Monitor memory usage
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    
    setInterval(() => {
      const used = memory.usedJSHeapSize / 1024 / 1024; // MB
      const total = memory.totalJSHeapSize / 1024 / 1024; // MB
      const limit = memory.jsHeapSizeLimit / 1024 / 1024; // MB
      
      if (used > limit * 0.8) {
        logger.warn('High memory usage detected', {
          used: `${used.toFixed(2)}MB`,
          total: `${total.toFixed(2)}MB`,
          limit: `${limit.toFixed(2)}MB`,
        }, 'Memory');
      }
    }, 30000); // Check every 30 seconds
  }

  // Clean up event listeners and timers
  window.addEventListener('beforeunload', () => {
    // Clean up any remaining timers or event listeners
    logger.debug('Cleaning up before unload', undefined, 'Memory');
  });
}

// Initialize bundle optimization
export function initializeBundleOptimization() {
  preloadCriticalComponents();
  analyzeBundleSize();
  optimizeMemoryUsage();
  
  logger.info('Bundle optimization initialized', undefined, 'Bundle');
}

// Export for use in components
export { dynamicImports as default };
