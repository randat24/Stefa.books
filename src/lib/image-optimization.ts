/**
 * Advanced image optimization utilities
 */

// Preload critical images
export function preloadCriticalImages(): void {
  if (typeof window === 'undefined') return;

  // Preload logo and other critical images
  const criticalImages = [
    '/logo.svg',
    '/images/book-placeholder.svg'
  ];

  criticalImages.forEach(src => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.as = 'image';
    link.href = src;
    document.head.appendChild(link);
  });
}

// Optimize image loading with priority hints
export function optimizeImageLoading(): void {
  if (typeof window === 'undefined') return;

  // Add loading="lazy" to all images that don't have it
  const images = document.querySelectorAll('img:not([loading])');
  images.forEach(img => {
    // Only lazy load images that are not above the fold
    const rect = img.getBoundingClientRect();
    if (rect.top > window.innerHeight) {
      img.setAttribute('loading', 'lazy');
    } else {
      img.setAttribute('loading', 'eager');
    }
  });
}

// Implement image decoding optimization
export function optimizeImageDecoding(): void {
  if (typeof window === 'undefined') return;

  const images = document.querySelectorAll('img[decoding]:not([decoding="async"])');
  images.forEach(img => {
    img.setAttribute('decoding', 'async');
  });
}

// Critical CSS for above-the-fold images
export function injectCriticalImageCSS(): void {
  if (typeof window === 'undefined') return;

  const criticalCSS = `
    /* Critical image optimization */
    img[loading="eager"] {
      content-visibility: auto;
      contain-intrinsic-size: 300px 400px;
    }
    
    /* Optimize book card images */
    .book-cover-image {
      content-visibility: auto;
      contain-intrinsic-size: 300px 400px;
    }
  `;

  const style = document.createElement('style');
  style.textContent = criticalCSS;
  document.head.appendChild(style);
}