import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

// Временная версия без зависимости от @supabase/ssr
export async function createSupabaseServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Проверяем наличие переменных окружения
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }

  // Для API routes используем простую версию без cookies
  if (typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
    return createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    });
  }

  try {
    const cookieStore = await cookies();

    return createClient(
      supabaseUrl, 
      supabaseAnonKey,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          storage: {
            getItem: (key: string) => {
              return cookieStore.get(key)?.value
            },
            setItem: (key: string, value: string) => {
              cookieStore.set({
                name: key,
                value: value,
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 60 * 60 * 24 * 7 // 7 дней
              })
            },
            removeItem: (key: string) => {
              cookieStore.set({
                name: key,
                value: '',
                maxAge: 0
              })
            }
          }
        }
      }
    )
  } catch {
    // Fallback для случаев, когда cookies() не работает
    return createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    });
  }
}

