'use client';

import { useState, useEffect } from 'react';
import { supabaseBrowser } from '@/lib/supabase/client';

export interface UserSubscriptionStatus {
  isAuthenticated: boolean;
  isLoading: boolean;
  hasActiveSubscription: boolean;
  subscriptionType: 'mini' | 'maxi' | null;
  maxRentals: number;
  currentRentals: number;
  canRent: boolean;
  error: string | null;
}

export function useUserSubscription(): UserSubscriptionStatus {
  const [status, setStatus] = useState<UserSubscriptionStatus>({
    isAuthenticated: false,
    isLoading: true,
    hasActiveSubscription: false,
    subscriptionType: null,
    maxRentals: 0,
    currentRentals: 0,
    canRent: false,
    error: null,
  });

  useEffect(() => {
    let mounted = true;

    async function checkUserStatus() {
      try {
        const supabase = supabaseBrowser;

        // Проверяем аутентификацию
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
          if (mounted) {
            setStatus(prev => ({
              ...prev,
              isLoading: false,
              isAuthenticated: false,
              hasActiveSubscription: false,
              error: authError?.message || null,
            }));
          }
          return;
        }

        // Пользователь аутентифицирован, проверяем подписку
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('subscription_type, status, subscription_status')
          .eq('auth_id', user.id)
          .single();

        if (userError || !userData) {
          if (mounted) {
            setStatus(prev => ({
              ...prev,
              isLoading: false,
              isAuthenticated: true,
              hasActiveSubscription: false,
              error: userError?.message || 'User not found in database',
            }));
          }
          return;
        }

        // Проверяем активность подписки
        const hasActiveSubscription =
          userData.status === 'active' &&
          userData.subscription_status === 'active' &&
          ['mini', 'maxi'].includes(userData.subscription_type);

        const maxRentals = userData.subscription_type === 'mini' ? 1 :
                          userData.subscription_type === 'maxi' ? 2 : 0;

        // Получаем текущие активные аренды
        const { count: activeRentalsCount, error: rentalsError } = await supabase
          .from('rentals')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('status', 'active');

        const currentRentals = rentalsError ? 0 : (activeRentalsCount || 0);
        const canRent = hasActiveSubscription && currentRentals < maxRentals;

        if (mounted) {
          setStatus({
            isAuthenticated: true,
            isLoading: false,
            hasActiveSubscription,
            subscriptionType: userData.subscription_type as 'mini' | 'maxi' | null,
            maxRentals,
            currentRentals,
            canRent,
            error: null,
          });
        }

      } catch (error) {
        if (mounted) {
          setStatus(prev => ({
            ...prev,
            isLoading: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          }));
        }
      }
    }

    checkUserStatus();

    return () => {
      mounted = false;
    };
  }, []);

  return status;
}