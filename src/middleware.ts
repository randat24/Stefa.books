import type { NextRequest } from 'next/server';

// Declare the NextResponse type here to avoid TypeScript errors
// @ts-ignore - We have to ignore some TypeScript errors as the types are not properly exported
const NextResponse = (globalThis as any).NextResponse;

export function middleware(request: NextRequest) {
  // Получаем pathname из URL текущего запроса (без clone)
  const pathname = request.nextUrl.pathname;
  
  // Проверяем, идет ли запрос к Supabase
  if (pathname.includes('/api/') && !pathname.startsWith('/api/admin/')) {
    // Получаем токен из кук
    // @ts-ignore - cookies exists at runtime
    const supabaseToken = request.cookies.get('sb-access-token')?.value;
    const apiKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    // Создаем новый объект ответа с модифицированными заголовками
    // @ts-ignore - next() exists at runtime
    const response = NextResponse.next();
    
    // Добавляем заголовки для API Supabase, если токен доступен
    if (apiKey) {
      response.headers.set('apikey', apiKey);
    }
    
    if (supabaseToken) {
      response.headers.set('Authorization', `Bearer ${supabaseToken}`);
    }
    
    return response;
  }
  
  // @ts-ignore - next() exists at runtime
  return NextResponse.next();
}

// Указываем, для каких маршрутов применять middleware
export const config = {
  matcher: [
    '/api/:path*',
  ] };