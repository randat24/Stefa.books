'use client';

/**
 * Cache-busting utility to ensure users always get the most up-to-date assets
 * 
 * This utility helps add version parameters to static assets to force browser cache invalidation.
 * It's especially useful after deployments to ensure users don't see stale content.
 */

// Current build timestamp used for cache-busting (updated on each build)
// Force cache invalidation for phone number update
export const BUILD_ID = process.env.NEXT_PUBLIC_BUILD_ID || '2025-09-16-phone-update';

/**
 * Add cache-busting parameter to URL
 * 
 * @param url - The URL of the asset to cache-bust
 * @param useRandomParam - Whether to use a random parameter for additional cache invalidation
 * @returns The URL with cache-busting parameter
 */
export function withCacheBuster(url: string, useRandomParam: boolean = false): string {
  try {
    if (!url) return url;
    
    // Skip URLs that already have cache parameters
    if (url.includes('_cb=') || url.includes('v=')) return url;
    
    // Skip URLs that don't need busting (e.g., data URLs)
    if (url.startsWith('data:')) return url;
    
    // Add unique cache-busting parameter
    const separator = url.includes('?') ? '&' : '?';
    const cacheBuster = `_cb=${BUILD_ID}`;
    const randomParam = useRandomParam ? `&_r=${Math.random().toString(36).substring(2, 8)}` : '';
    
    return `${url}${separator}${cacheBuster}${randomParam}`;
  } catch (e) {
    console.warn('Error adding cache-buster to URL:', e);
    return url;
  }
}

/**
 * Add daily cache-busting parameter to static assets like logos and icons
 * This ensures they get refreshed at least once per day
 * 
 * @param url - The URL of the asset
 * @returns The URL with daily cache-busting parameter
 */
export function withDailyCacheBuster(url: string): string {
  try {
    if (!url) return url;
    
    // Skip URLs that don't need busting
    if (url.startsWith('data:')) return url;
    
    // Create daily timestamp for cache-busting
    const today = new Date().toISOString().split('T')[0];
    const separator = url.includes('?') ? '&' : '?';
    
    return `${url}${separator}v=${today}`;
  } catch (e) {
    console.warn('Error adding daily cache-buster to URL:', e);
    return url;
  }
}

/**
 * Service worker registration utility to handle cache invalidation
 * This can be used in _app.tsx or layout.tsx to register a service worker
 * that manages cache invalidation
 */
export function registerCacheInvalidationWorker() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  // Clear local storage cache on new version
  const lastVersion = localStorage.getItem('app_version');
  if (lastVersion !== BUILD_ID) {
    console.log('New version detected, clearing cache...');
    // Clear session storage
    sessionStorage.clear();
    // Update stored version
    localStorage.setItem('app_version', BUILD_ID);
    // Clear relevant cache items
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('image_cache_') || key?.startsWith('data_cache_')) {
        localStorage.removeItem(key);
      }
    }
  }
}

/**
 * FORCE CACHE INVALIDATION - для принудительной очистки кеша у всех пользователей
 * Вызывать эту функцию при критических обновлениях (например, смене номера телефона)
 */
export function forceCacheInvalidation() {
  if (typeof window === 'undefined') return;

  console.log('🧹 Принудительная очистка кеша...');

  try {
    // 1. Очищаем localStorage
    localStorage.clear();

    // 2. Очищаем sessionStorage
    sessionStorage.clear();

    // 3. Очищаем Service Worker кеш если доступен
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        if (registration.active) {
          registration.active.postMessage({ type: 'SKIP_WAITING' });
        }
      });

      // Удаляем все кеши
      if ('caches' in window) {
        caches.keys().then(cacheNames => {
          cacheNames.forEach(cacheName => {
            caches.delete(cacheName);
          });
        });
      }
    }

    // 4. Принудительно перезагружаем страницу без кеша
    if (location.search.includes('cache_cleared=true')) {
      // Избегаем бесконечной перезагрузки
      return;
    }

    // Добавляем параметр и перезагружаем
    const separator = location.search ? '&' : '?';
    const newUrl = `${location.href}${separator}cache_cleared=true&t=${Date.now()}`;

    setTimeout(() => {
      window.location.href = newUrl;
    }, 100);

  } catch (error) {
    console.error('Ошибка при очистке кеша:', error);
    // В случае ошибки просто перезагружаем страницу
    window.location.reload();
  }
}
