'use client';

import { useEffect , ReactNode } from 'react';
import { registerCacheInvalidationWorker } from '@/lib/cache-buster';

interface CacheInvalidationProviderProps {
  children: React.ReactNode;
}

export function CacheInvalidationProvider({ children }: CacheInvalidationProviderProps) {
  useEffect(() => {
    // Register cache invalidation on first client load
    registerCacheInvalidationWorker();
    
    // Check if app was updated and reload if needed
    const lastBuild = localStorage.getItem('app_version');
    const currentBuild = process.env.NEXT_PUBLIC_BUILD_ID;
    
    if (lastBuild && currentBuild && lastBuild !== currentBuild) {
      console.log(`App updated: ${lastBuild} → ${currentBuild}`);
      
      // Clear cache storage to ensure fresh assets
      if ('caches' in window) {
        caches.keys().then(cacheNames => {
          cacheNames.forEach(cacheName => {
            if (cacheName.startsWith('next-data') || cacheName.startsWith('next-image')) {
              caches.delete(cacheName);
            }
          });
        });
      }
      
      // Update stored version
      localStorage.setItem('app_version', currentBuild);
      
      // Force reload on version change if needed
      // Uncomment this if you want automatic reload on updates
      // window.location.reload();
    } else if (currentBuild) {
      // First visit or same version
      localStorage.setItem('app_version', currentBuild);
    }
  }, []);

  return <>{children}</>;
}

export default CacheInvalidationProvider;
