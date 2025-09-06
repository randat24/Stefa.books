import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { canAccessAdminPanel } from '@/lib/auth/roles';

export async function middleware(request: NextRequest) {
  // Create response with proper headers
  const response = NextResponse.next();
  
  // Handle markdown generation for specific routes
  const pathname = request.nextUrl.pathname;
  
  // Skip middleware for error pages to prevent build issues
  if (pathname === '/404' || pathname === '/500' || pathname.startsWith('/_error')) {
    return response;
  }
  
  // Temporarily disabled: Auto-generate markdown versions for book pages
  // if (pathname.startsWith('/books/') && pathname.endsWith('.md')) {
  //   const bookId = pathname.replace('/books/', '').replace('.md', '');
  //   const apiUrl = new URL(`/api/books/${bookId}/markdown`, request.url);
  //   
  //   // Redirect to API endpoint for markdown generation
  //   return NextResponse.rewrite(apiUrl);
  // }
  
  // Check authentication for protected routes
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
    // Disable caching for protected routes
    response.headers.set('Cache-Control', 'no-cache, no-store, max-age=0, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    // Check for Supabase session
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Get the session from cookies
    const token = request.cookies.get('sb-access-token')?.value;
    
    if (!token) {
      const redirectUrl = new URL('/auth/login', request.url);
      redirectUrl.searchParams.set('redirect', request.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }

    try {
      // Verify the session
      const { data: { user }, error } = await supabase.auth.getUser(token);
      
      if (error || !user) {
        const redirectUrl = new URL('/auth/login', request.url);
        redirectUrl.searchParams.set('redirect', request.nextUrl.pathname);
        return NextResponse.redirect(redirectUrl);
      }

      // For admin routes, check admin permissions
      if (request.nextUrl.pathname.startsWith('/admin')) {
        // Get user profile to check role
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        // Check if user can access admin panel
        if (!canAccessAdminPanel(user, profile)) {
          return NextResponse.redirect(new URL('/auth/login?error=access_denied', request.url));
        }
      }
    } catch (error) {
      console.error('Middleware auth error:', error);
      const redirectUrl = new URL('/auth/login', request.url);
      redirectUrl.searchParams.set('redirect', request.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }
  }
  
  return response;
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