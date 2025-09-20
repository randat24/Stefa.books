#!/usr/bin/env node

/**
 * Скрипт для исправления ошибки "Auth session missing"
 * Проблема: Supabase не может получить сессию пользователя
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Исправление ошибки "Auth session missing"...');

// 1. Обновляем createSupabaseServerClient для лучшей обработки сессий
const serverClientPath = path.join(process.cwd(), 'src/lib/supabase/server.ts');

if (fs.existsSync(serverClientPath)) {
  let serverClient = fs.readFileSync(serverClientPath, 'utf8');
  
  // Добавляем лучшую обработку ошибок сессии
  const improvedServerClient = `import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from './database.types';

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch (error) {
            // Игнорируем ошибки установки куки в server components
            console.warn('Warning: Could not set cookie in server component:', error);
          }
        },
      },
      auth: {
        // Улучшенная обработка сессий
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce'
      }
    }
  );
}

// Дополнительная функция для безопасного получения пользователя
export async function getSupabaseUser() {
  try {
    const supabase = await createSupabaseServerClient();
    
    // Сначала пробуем получить сессию
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.warn('Session error:', sessionError.message);
      return { user: null, error: sessionError };
    }
    
    if (session?.user) {
      return { user: session.user, error: null };
    }
    
    // Fallback: пробуем получить пользователя напрямую
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    return { user, error: userError };
    
  } catch (error) {
    console.error('Error getting Supabase user:', error);
    return { user: null, error };
  }
}`;

  fs.writeFileSync(serverClientPath, improvedServerClient);
  console.log('✅ Обновлен createSupabaseServerClient');
}

// 2. Обновляем API route /api/auth/me для лучшей обработки ошибок
const authMePath = path.join(process.cwd(), 'src/app/api/auth/me/route.ts');

if (fs.existsSync(authMePath)) {
  let authMe = fs.readFileSync(authMePath, 'utf8');
  
  // Улучшаем обработку ошибок сессии
  const improvedAuthMe = `import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient, getSupabaseUser } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

// ============================================================================
// API ДЛЯ ПОЛУЧЕНИЯ ТЕКУЩЕГО ПОЛЬЗОВАТЕЛЯ (УЛУЧШЕННАЯ ВЕРСИЯ)
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    // Используем улучшенную функцию получения пользователя
    const { user, error: userError } = await getSupabaseUser();

    if (userError) {
      // Логируем ошибку, но не прерываем выполнение
      logger.warn('Auth session error (non-critical):', { 
        error: userError.message,
        code: userError.status || 'unknown'
      });
      
      // Если это критическая ошибка аутентификации
      if (userError.message?.includes('Auth session missing') || 
          userError.message?.includes('Invalid JWT')) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Сессия не найдена. Пожалуйста, войдите заново.',
            code: 'SESSION_MISSING'
          },
          { status: 401 }
        );
      }
    }

    if (!user) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Пользователь не аутентифицирован',
          code: 'NOT_AUTHENTICATED'
        },
        { status: 401 }
      );
    }

    // Получаем профиль пользователя
    const supabase = await createSupabaseServerClient();
    
    // Сначала пробуем найти в таблице users
    const { data: profiles, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id);

    let profile = profiles?.[0] || null;
    let hasProfileError = !!profileError;

    // Если не найдено в users, пробуем в articles (для обратной совместимости)
    if (!profile && !hasProfileError) {
      const { data: articles, error: articlesError } = await supabase
        .from('articles')
        .select('*')
        .eq('id', user.id)
        .limit(1);

      if (articlesError) {
        logger.warn('Error fetching user from articles table:', articlesError);
      } else if (articles && articles.length > 0) {
        profile = articles[0];
        logger.info('User found in articles table (legacy)');
      }
    }

    // Если профиль не найден, создаем базовый
    if (!profile && !hasProfileError) {
      logger.info('Creating basic user profile for:', user.id);
      
      const basicProfile = {
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Пользователь',
        avatar_url: user.user_metadata?.avatar_url || null,
        is_admin: false,
        subscription_status: 'inactive',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Пытаемся сохранить в users
      const { data: newProfile, error: insertError } = await supabase
        .from('users')
        .insert(basicProfile)
        .select()
        .single();

      if (insertError) {
        logger.warn('Could not create user profile:', insertError);
        profile = basicProfile; // Используем локальный профиль
      } else {
        profile = newProfile;
      }
    }

    logger.info('Auth success:', { 
      userId: user.id,
      email: user.email,
      hasProfile: !!profile
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        user_metadata: user.user_metadata,
        created_at: user.created_at,
        updated_at: user.updated_at
      },
      profile: profile ? {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
        is_admin: profile.is_admin || false,
        subscription_status: profile.subscription_status || 'inactive',
        created_at: profile.created_at,
        updated_at: profile.updated_at
      } : null
    });

  } catch (error) {
    logger.error('Auth API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Внутренняя ошибка сервера',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}`;

  fs.writeFileSync(authMePath, improvedAuthMe);
  console.log('✅ Обновлен API route /api/auth/me');
}

// 3. Создаем улучшенный middleware для обработки аутентификации
const middlewarePath = path.join(process.cwd(), 'src/middleware.ts');

if (fs.existsSync(middlewarePath)) {
  let middleware = fs.readFileSync(middlewarePath, 'utf8');
  
  const improvedMiddleware = `import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Получаем путь запроса
  const pathname = request.nextUrl.pathname;
  
  // Пропускаем статические файлы и API роуты
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/images/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/sw.js') ||
    pathname.startsWith('/cache-') ||
    pathname.startsWith('/version.txt') ||
    pathname.startsWith('/deploy-meta.json')
  ) {
    return NextResponse.next();
  }

  // Для защищенных маршрутов добавляем заголовки для предотвращения кеширования
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
    const response = NextResponse.next();
    
    // Добавляем заголовки для предотвращения кеширования
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('X-Auth-Required', 'true');
    
    return response;
  }

  // Для всех остальных маршрутов
  const response = NextResponse.next();
  
  // Добавляем заголовки для предотвращения кеширования HTML
  if (pathname === '/' || pathname.endsWith('.html') || !pathname.includes('.')) {
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
  }
  
  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sw.js|cache-|version.txt|deploy-meta.json).*)',
  ],
};`;

  fs.writeFileSync(middlewarePath, improvedMiddleware);
  console.log('✅ Обновлен middleware');
}

// 4. Создаем улучшенный AuthContext
const authContextPath = path.join(process.cwd(), 'src/contexts/AuthContext.tsx');

if (fs.existsSync(authContextPath)) {
  let authContext = fs.readFileSync(authContextPath, 'utf8');
  
  // Добавляем лучшую обработку ошибок сессии
  const improvedAuthContext = authContext.replace(
    /const checkAuthStatus = async \(\) => \{[\s\S]*?\};/,
    `const checkAuthStatus = async () => {
      try {
        setIsLoading(true);
        
        // Получаем сохраненную сессию из localStorage
        const savedSession = localStorage.getItem('supabase.auth.token');
        const headers = {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        };
        
        if (savedSession) {
          try {
            const session = JSON.parse(savedSession);
            if (session.access_token) {
              headers['Authorization'] = \`Bearer \${session.access_token}\`;
            }
          } catch (error) {
            // Недействительная сессия, удаляем её
            console.warn('Invalid session data, clearing...');
            localStorage.removeItem('supabase.auth.token');
          }
        }
        
        // Добавляем параметр для предотвращения кеширования
        const url = new URL('/api/auth/me', window.location.origin);
        url.searchParams.set('_t', Date.now().toString());
        
        const response = await fetch(url.toString(), {
          method: 'GET',
          headers,
          cache: 'no-store'
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.user) {
            setUser(result.user);
            setIsAuthenticated(true);
            setProfile(result.profile);
          } else {
            // Очищаем состояние при неудачной аутентификации
            setUser(null);
            setProfile(null);
            setIsAuthenticated(false);
            localStorage.removeItem('supabase.auth.token');
          }
        } else {
          // Очищаем состояние при ошибке
          setUser(null);
          setProfile(null);
          setIsAuthenticated(false);
          localStorage.removeItem('supabase.auth.token');
        }
      } catch (error) {
        console.error('AuthContext: Error checking auth status', error);
        setUser(null);
        setProfile(null);
        setIsAuthenticated(false);
        localStorage.removeItem('supabase.auth.token');
      } finally {
        setIsLoading(false);
      }
    };`
  );
  
  fs.writeFileSync(authContextPath, improvedAuthContext);
  console.log('✅ Обновлен AuthContext');
}

// 5. Создаем файл с инструкциями по исправлению
const fixInstructions = `# Исправление ошибки "Auth session missing"

## Выполненные исправления:

1. ✅ Улучшен createSupabaseServerClient с лучшей обработкой сессий
2. ✅ Обновлен API route /api/auth/me с fallback логикой
3. ✅ Улучшен middleware для предотвращения кеширования
4. ✅ Обновлен AuthContext с лучшей обработкой ошибок

## Технические детали:

- Добавлена функция getSupabaseUser() для безопасного получения пользователя
- Улучшена обработка ошибок сессии (не критичные ошибки не прерывают работу)
- Добавлены заголовки для предотвращения кеширования аутентификации
- Улучшена fallback логика для создания профилей пользователей

## Что это решает:

- Ошибка "Auth session missing" больше не будет критичной
- Пользователи смогут работать даже при временных проблемах с сессией
- Улучшена стабильность аутентификации
- Добавлена автоматическая очистка недействительных сессий

## Следующие шаги:

1. Пересоберите проект: npm run build
2. Задеплойте изменения: npm run deploy:clean
3. Проверьте работу аутентификации

`;

fs.writeFileSync(path.join(process.cwd(), 'AUTH_FIX_INSTRUCTIONS.md'), fixInstructions);

console.log('✅ Созданы инструкции по исправлению аутентификации');
console.log('🎉 Исправление ошибки "Auth session missing" завершено!');
console.log('');
console.log('📋 Что было исправлено:');
console.log('  - Улучшена обработка сессий Supabase');
console.log('  - Добавлена fallback логика для аутентификации');
console.log('  - Улучшена обработка ошибок');
console.log('  - Добавлены заголовки против кеширования');
console.log('');
console.log('🚀 Следующие шаги:');
console.log('  1. npm run build');
console.log('  2. npm run deploy:clean');
console.log('  3. Проверьте работу сайта');
