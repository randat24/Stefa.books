'use client';

import { useEffect } from 'react';
import { optimizeImageLoading, optimizeImageDecoding, injectCriticalImageCSS } from '@/lib/image-optimization';
import { optimizeFontLoading, implementFontFallback } from '@/lib/font-optimization';

/**
 * PerformanceOptimizer - A component that applies various performance optimizations
 * 
 * This component should be placed high in the component tree to ensure optimizations
 * are applied early in the page lifecycle.
 */
export function PerformanceOptimizer() {
  useEffect(() => {
    // Apply image optimizations
    optimizeImageLoading();
    optimizeImageDecoding();
    injectCriticalImageCSS();
    
    // Apply font optimizations
    optimizeFontLoading();
    implementFontFallback();
    
    // Clean up on unmount
    return () => {
      // Any necessary cleanup can be done here
    };
  }, []);

  // This component doesn't render anything
  return null;
}