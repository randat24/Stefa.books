import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { canAccessAdminPanel } from '@/lib/auth/roles';

export async function middleware(request: NextRequest) {
  // Create response with proper headers
  const response = NextResponse.next();
  
  // Disable caching for admin routes to prevent static generation issues
  if (request.nextUrl.pathname.startsWith('/admin')) {
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
      return NextResponse.redirect(new URL('/auth/login?redirect=/admin', request.url));
    }

    try {
      // Verify the session
      const { data: { user }, error } = await supabase.auth.getUser(token);
      
      if (error || !user) {
        return NextResponse.redirect(new URL('/auth/login?redirect=/admin', request.url));
      }

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
    } catch (error) {
      console.error('Middleware auth error:', error);
      return NextResponse.redirect(new URL('/auth/login?redirect=/admin', request.url));
    }
  }
  
  return response;
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*'
  ]
};