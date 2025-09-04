/**
 * Rate Limiter Utility
 * Provides rate limiting functionality for API routes
 */

import { NextRequest } from 'next/server';

type RateLimitConfig = {
  maxRequests: number;
  windowMs: number;
  keyPrefix?: string;
};

type RateLimitInfo = {
  count: number;
  resetTime: number;
};

// In-memory store for rate limiting (in production, you might want to use Redis)
const rateLimitStore = new Map<string, RateLimitInfo>();

/**
 * Check if a request is within rate limits
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const storeKey = `${config.keyPrefix || 'rate-limit'}:${key}`;

  // Clean up old entries
  for (const [k, info] of rateLimitStore.entries()) {
    if (info.resetTime < now) {
      rateLimitStore.delete(k);
    }
  }

  const rateLimitInfo = rateLimitStore.get(storeKey);

  // If no existing record or window has expired, create new
  if (!rateLimitInfo || rateLimitInfo.resetTime < now) {
    const newInfo = {
      count: 1,
      resetTime: now + config.windowMs
    };
    rateLimitStore.set(storeKey, newInfo);
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime: newInfo.resetTime
    };
  }

  // If within limit, increment count
  if (rateLimitInfo.count < config.maxRequests) {
    rateLimitInfo.count++;
    return {
      allowed: true,
      remaining: config.maxRequests - rateLimitInfo.count,
      resetTime: rateLimitInfo.resetTime
    };
  }

  // Rate limit exceeded
  return {
    allowed: false,
    remaining: 0,
    resetTime: rateLimitInfo.resetTime
  };
}

/**
 * Higher-order function to wrap API handlers with rate limiting
 */
export function withRateLimit(
  handler: (request: NextRequest) => Promise<Response>,
  maxRequests: number,
  windowMs: number,
  keyExtractor?: (request: NextRequest) => string
) {
  return async function (request: NextRequest): Promise<Response> {
    // Extract key (default to IP address)
    const key = keyExtractor 
      ? keyExtractor(request) 
      : request.headers.get('x-forwarded-for') || 
        request.headers.get('x-real-ip') || 
        'unknown';

    const config: RateLimitConfig = {
      maxRequests,
      windowMs,
      keyPrefix: 'api'
    };

    const rateLimitResult = checkRateLimit(key, config);

    if (!rateLimitResult.allowed) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Rate limit exceeded. Please try again later.'
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': maxRequests.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString()
          }
        }
      );
    }

    // Add rate limit headers to response
    const response = await handler(request);
    
    // Clone response to modify headers
    const newResponse = new Response(response.body, response);
    
    newResponse.headers.set('X-RateLimit-Limit', maxRequests.toString());
    newResponse.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
    newResponse.headers.set('X-RateLimit-Reset', new Date(rateLimitResult.resetTime).toISOString());
    
    return newResponse;
  };
}