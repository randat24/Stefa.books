'use client'

import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'

export const supabaseBrowser = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)


