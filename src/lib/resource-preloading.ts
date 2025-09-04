/**
 * Resource preloading utilities for improved performance
 */

// Preload critical resources
export function preloadCriticalResources(): void {
  if (typeof window === 'undefined') return;


  // Preload critical JavaScript chunks
  const criticalJS: string[] = [
    // Add paths to critical JS files
  ];

  criticalJS.forEach(src => {
    const script = document.createElement('link');
    script.rel = 'preload';
    script.as = 'script';
    script.href = src;
    document.head.appendChild(script);
  });

  // Preload common book images
  const commonImages = [
    '/images/book-placeholder.svg',
    '/images/og-image.jpg'
  ];

  commonImages.forEach(src => {
    const img = document.createElement('link');
    img.rel = 'preload';
    img.as = 'image';
    img.href = src;
    document.head.appendChild(img);
  });
}

// Implement resource hints for faster navigation
export function implementResourceHints(): void {
  if (typeof window === 'undefined') return;

  // Add DNS prefetch for external domains
  const externalDomains = [
    'https://images.unsplash.com',
    'https://res.cloudinary.com'
  ];

  externalDomains.forEach(domain => {
    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = domain;
    document.head.appendChild(link);
  });

  // Add preconnect for critical external resources
  const criticalDomains = [
    'https://res.cloudinary.com'
  ];

  criticalDomains.forEach(domain => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = domain;
    document.head.appendChild(link);
  });
}

// Predictive resource preloading based on user behavior
export function preloadPredictiveResources(): void {
  if (typeof window === 'undefined') return;

  // Preload resources likely to be needed based on current page
  const currentPath = window.location.pathname;
  
  // For homepage, preload catalog resources
  if (currentPath === '/') {
    const catalogResources = [
      '/api/books',
      '/api/categories'
    ];
    
    catalogResources.forEach(url => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.as = 'fetch';
      link.href = url;
      link.setAttribute('crossorigin', 'anonymous');
      document.head.appendChild(link);
    });
  }
  
  // For catalog page, preload book detail resources
  if (currentPath.startsWith('/books')) {
    // This would be implemented with more specific logic in a real app
  }
  
  // For book detail pages, preload common components
  if (currentPath.match(/^\/books\/[^\/]+$/)) {
    const bookResources = [
      '/api/books',
      '/images/book-placeholder.svg'
    ];
    
    bookResources.forEach(url => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.as = 'fetch';
      link.href = url;
      link.setAttribute('crossorigin', 'anonymous');
      document.head.appendChild(link);
    });
  }
}