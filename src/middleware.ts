import type { NextRequest } from 'next/server';

// Use build ID from environment or generate one for development
const BUILD_ID = process.env.NEXT_PUBLIC_BUILD_ID || new Date().toISOString().split('T')[0];

/**
 * Middleware to handle various site-wide concerns:
 * - Cache control headers for assets
 * - Build ID injection for cache busting
 * - Security headers
 */
export function middleware(request: NextRequest) {
  // Get the path
  const url = request.nextUrl.pathname;
  
  // Set headers for response
  const headers = new Headers();
  
  // Add build ID header for cache busting reference
  headers.set('X-Build-ID', BUILD_ID || 'development');

  // Assets cache control
  if (url.match(/\.(js|css|woff2?|ttf|otf|eot)$/)) {
    // Cache longer for static assets with build ID in the URL
    const cacheControl = url.includes(BUILD_ID)
      ? 'public, max-age=31536000, immutable' // 1 year for versioned assets
      : 'public, max-age=86400, stale-while-revalidate=604800'; // 1 day, stale for 1 week
    
    headers.set('Cache-Control', cacheControl);
  } 
  // Images cache control
  else if (url.match(/\.(jpe?g|png|gif|ico|svg|webp|avif)$/)) {
    // Cache for images with version parameter
    const cacheControl = url.includes('v=') || url.includes('_cb=')
      ? 'public, max-age=31536000, immutable' // 1 year for versioned images
      : 'public, max-age=86400, stale-while-revalidate=604800'; // 1 day, stale for 1 week
    
    headers.set('Cache-Control', cacheControl);
  }
  // API endpoints
  else if (url.startsWith('/api/')) {
    // Short cache for API responses
    headers.set('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600');
  }
  // HTML pages
  else if (!url.includes('.')) {
    // No caching for HTML pages to ensure fresh content
    headers.set('Cache-Control', 'public, max-age=0, must-revalidate');
  }

  // Add security headers
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('X-Frame-Options', 'DENY');
  headers.set('X-XSS-Protection', '1; mode=block');

  // Let the request continue without modification, just adding headers
  return new Response(null, {
    status: 200,
    headers,
  });
}

// Only run middleware on specific paths
export const config = {
  matcher: [
    // Apply to all routes except these
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
};