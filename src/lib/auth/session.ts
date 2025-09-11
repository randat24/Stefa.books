import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js/dist/module/index';

export interface ServerSession {
  user: User | null;
}

/**
 * Get the current server session
 * This function is used in API routes to get the current user session
 */
export async function getServerSession(): Promise<ServerSession> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
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