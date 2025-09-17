import { createSupabaseServerClient } from '@/lib/supabase/server'

export interface ServerSession {
  user: any | null;
}

/**
 * Get the current server session
 * This function is used in API routes to get the current user session
 */
export async function getServerSession(): Promise<ServerSession> {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { session } } = await supabase.auth.getSession()
    
    return {
      user: session?.user || null
    };
  } catch (error) {
    console.error('Error getting server session:', error);
    return {
      user: null
    };
  }
}