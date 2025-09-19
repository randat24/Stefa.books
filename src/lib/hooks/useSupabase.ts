'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../database.types';

export function useSupabase() {
  const [supabase, setSupabase] = useState<ReturnType<typeof createClient> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Missing Supabase environment variables');
      }

      // Get the token from localStorage if it exists
      const authToken = localStorage.getItem('supabase.auth.token');
      const token = authToken ? JSON.parse(authToken).access_token : null;

      // Create a new Supabase client with proper headers
      const client = createClient(supabaseUrl, supabaseKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true },
        global: {
          headers: {
            'apikey': supabaseKey,
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          } } });

      setSupabase(client);
      setIsLoading(false);
    } catch (err) {
      console.error('Error initializing Supabase client:', err);
      setError(err instanceof Error ? err : new Error('Unknown error initializing Supabase'));
      setIsLoading(false);
    }
  }, []);

  return { supabase, isLoading, error };
}
