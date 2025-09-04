/**
 * Font optimization utilities
 */

// Preload critical fonts
export function preloadCriticalFonts(): void {
  if (typeof window === 'undefined') return;

  // Define critical fonts to preload
  const criticalFonts = [
    {
      family: 'Inter',
      weights: ['400', '500', '600', '700'],
      styles: ['normal', 'italic']
    }
  ];

  // Create link tags for font preloading
  criticalFonts.forEach(font => {
    font.weights.forEach(() => {
      font.styles.forEach(() => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'font';
        link.type = 'font/woff2';
        link.crossOrigin = 'anonymous';
        // In a real implementation, you would point to actual font files
        // link.href = `/fonts/inter-${weight}-${style}.woff2`;
        document.head.appendChild(link);
      });
    });
  });
}

// Optimize font loading with font-display
export function optimizeFontLoading(): void {
  if (typeof window === 'undefined') return;

  // Add font-display: swap to all font-face rules
  const style = document.createElement('style');
  style.textContent = `
    @font-face {
      font-display: swap;
    }
  `;
  document.head.appendChild(style);
}

// Implement font fallback strategy
export function implementFontFallback(): void {
  if (typeof window === 'undefined') return;

  // Add CSS for font fallbacks
  const style = document.createElement('style');
  style.textContent = `
    body {
      font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 
                   "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", 
                   sans-serif, "Apple Color Emoji", "Segoe UI Emoji", 
                   "Segoe UI Symbol", "Noto Color Emoji";
    }
  `;
  document.head.appendChild(style);
}