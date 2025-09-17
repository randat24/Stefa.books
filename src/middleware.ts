import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  try {
    // Получаем pathname из URL текущего запроса
    const pathname = request.nextUrl.pathname;

    // Создаем базовый ответ
    const response = NextResponse.next({ request });

    // Проверяем, идет ли запрос к API (исключая админ)
    if (pathname.startsWith('/api/') && !pathname.startsWith('/api/admin/')) {
      // Получаем токен из кук безопасно
      const supabaseToken = request.cookies.get('sb-access-token')?.value;
      const apiKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      // Добавляем заголовки для API Supabase, если токен доступен
      if (apiKey) {
        response.headers.set('apikey', apiKey);
      }

      if (supabaseToken) {
        response.headers.set('Authorization', `Bearer ${supabaseToken}`);
      }
    }

    return response;
  } catch (error) {
    // В случае ошибки, просто продолжаем без модификации
    console.error('Middleware error:', error);
    return NextResponse.next({ request });
  }
}

// Указываем, для каких маршрутов применять middleware
export const config = {
  matcher: [
    '/api/:path*',
  ]
};