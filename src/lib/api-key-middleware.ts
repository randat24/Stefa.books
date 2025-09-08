import { NextRequest, NextResponse } from 'next/server';
import { logger } from './logger';

// List of paths that require API key authentication
const PROTECTED_PATHS = [
  '/api/books', // All methods except GET
  '/api/categories', // Write operations
  '/api/auth', // Authentication endpoints
];

// List of HTTP methods that require API key authentication
const PROTECTED_METHODS = ['POST', 'PUT', 'DELETE', 'PATCH'];

/**
 * Middleware to validate API keys for protected routes
 */
export async function apiKeyMiddleware(request: NextRequest): Promise<NextResponse | null> {
  const { pathname } = new URL(request.url);
  const method = request.method;

  // Check if this path and method requires API key authentication
  const isProtectedPath = PROTECTED_PATHS.some(path => pathname.startsWith(path));
  const isProtectedMethod = PROTECTED_METHODS.includes(method);

  // If it's a protected path and method, validate API key
  if (isProtectedPath && isProtectedMethod) {
    const apiKey = request.headers.get('x-api-key');
    
    // Check if API key is present
    if (!apiKey) {
      logger.warn('API key missing for protected route', { 
        url: request.url, 
        method,
        ip: request.headers.get('x-forwarded-for') || 'unknown'
      }, 'Auth');
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'API key is required for this endpoint' 
        },
        { status: 401 }
      );
    }

    // Check if API key is valid
    const validApiKey = process.env.API_SECRET_KEY;
    if (!validApiKey) {
      logger.error('API_SECRET_KEY not configured in environment variables', undefined, 'Auth');
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'Server configuration error' 
        },
        { status: 500 }
      );
    }

    if (apiKey !== validApiKey) {
      logger.warn('Invalid API key attempt', { 
        url: request.url, 
        method,
        ip: request.headers.get('x-forwarded-for') || 'unknown'
      }, 'Auth');
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid API key' 
        },
        { status: 403 }
      );
    }

    logger.debug('API key validated successfully', { 
      url: request.url, 
      method,
      ip: request.headers.get('x-forwarded-for') || 'unknown'
    }, 'Auth');
  }

  // Return null to indicate that the request should continue
  return null;
}
