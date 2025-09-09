import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
// Temporarily disabled Supabase imports to fix Edge Runtime issues
// import { createClient } from '@supabase/supabase-js';
// import { canAccessAdminPanel } from '@/lib/auth/roles';

export async function middleware(request: NextRequest) {
  // Handle markdown generation for specific routes
  const pathname = request.nextUrl.pathname;
  
  // Skip middleware for error pages to prevent build issues
  if (pathname === '/404' || pathname === '/500' || pathname.startsWith('/_error')) {
    return new Response();
  }
  
  // Temporarily disabled: Auto-generate markdown versions for book pages
  // if (pathname.startsWith('/books/') && pathname.endsWith('.md')) {
  //   const bookId = pathname.replace('/books/', '').replace('.md', '');
  //   const apiUrl = new URL(`/api/books/${bookId}/markdown`, request.url);
  //   
  //   // Redirect to API endpoint for markdown generation
  //   return NextResponse.rewrite(apiUrl);
  // }
  
  // TEMPORARILY DISABLED: Authentication check for protected routes
  // This is causing "self is not defined" error in Edge Runtime
  // Will need to implement auth check in page components instead
  
  const protectedRoutes = [
    '/admin',
    '/account', 
    '/profile',
    '/orders',
    '/my-rentals',
    '/favorites',
    '/subscription',
    '/rent',
    '/return'
  ];

  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  );

  if (isProtectedRoute) {
    // Create response with headers for protected routes
    const response = new Response();
    
    // Disable caching for protected routes
    response.headers.set('Cache-Control', 'no-cache, no-store, max-age=0, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    // TODO: Implement client-side auth check in page components
    // For now, let the pages handle authentication
    return response;
  }
  
  return new Response();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
    '/account/:path*',
    '/profile/:path*',
    '/orders/:path*',
    '/my-rentals/:path*',
    '/favorites/:path*',
    '/subscription/:path*',
    '/rent/:path*',
    '/return/:path*',
    '/books/:path*'
  ]
};