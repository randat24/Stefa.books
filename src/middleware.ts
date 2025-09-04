import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Create response with proper headers
  const response = NextResponse.next();
  
  // Disable caching for admin routes to prevent static generation issues
  if (request.nextUrl.pathname.startsWith('/admin')) {
    response.headers.set('Cache-Control', 'no-cache, no-store, max-age=0, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    const authToken = request.cookies.get('admin_token');
    
    // For development, allow access without authentication
    if (process.env.NODE_ENV === 'development') {
      return response;
    }
    
    // In production, check for valid auth token
    if (!authToken || !isValidToken(authToken.value)) {
      // Redirect to login page (would need to be implemented)
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  
  return response;
}

function isValidToken(token: string): boolean {
  // Simplified token validation - in production use proper JWT validation
  return token === process.env.ADMIN_JWT_SECRET;
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*'
  ]
};