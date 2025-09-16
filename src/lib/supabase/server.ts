import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'

// Временная версия без зависимости от @supabase/ssr
export async function createSupabaseServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  return createClient<Database>(
    supabaseUrl, 
    supabaseAnonKey,
    {
      auth: {
        persistSession: false,
      }
    }
  )
}

