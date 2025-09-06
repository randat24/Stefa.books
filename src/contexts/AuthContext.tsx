"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService, type AuthResponse, type UserProfile } from '@/lib/auth/auth-service';
import type { User } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: { email: string; password: string }) => Promise<AuthResponse>;
  register: (data: { email: string; password: string; firstName: string; lastName: string; phone?: string }) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/auth/me', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.user) {
            setUser(result.user);
            setIsAuthenticated(true);
            setProfile(result.profile);
          } else {
            setUser(null);
            setProfile(null);
            setIsAuthenticated(false);
          }
        } else {
          setUser(null);
          setProfile(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        logger.error('AuthContext: Error checking auth status', { error });
        setUser(null);
        setProfile(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = useCallback(async (data: { email: string; password: string }) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success && result.user) {
        setUser(result.user);
        setIsAuthenticated(true);
        setProfile(result.profile);
      }

      return result;
    } catch (error) {
      logger.error('Login error', { error });
      return { success: false, error: 'Помилка підключення' };
    }
  }, []);

  const register = useCallback(async (data: { email: string; password: string; firstName: string; lastName: string; phone?: string }) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success && result.user) {
        setUser(result.user);
        setIsAuthenticated(true);
        setProfile(result.profile);
      }

      return result;
    } catch (error) {
      logger.error('Register error', { error });
      return { success: false, error: 'Помилка підключення' };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      logger.error('Logout error', { error });
    } finally {
      setUser(null);
      setProfile(null);
      setIsAuthenticated(false);
    }
  }, []);

  const updateProfile = useCallback(async (data: Partial<UserProfile>) => {
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }
    
    const response = await authService.updateUserProfile(user.id, data);
    
    if (response.success) {
      // Update local profile state
      setProfile(prev => prev ? { ...prev, ...data, updated_at: new Date().toISOString() } : null);
    }
    
    return response;
  }, [user]);

  const resetPassword = useCallback(async (email: string) => {
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      return await response.json();
    } catch (error) {
      logger.error('Reset password error', { error });
      return { success: false, error: 'Помилка підключення' };
    }
  }, []);

  const updatePassword = useCallback(async (newPassword: string) => {
    return await authService.updatePassword(newPassword);
  }, []);

  const value = {
    user,
    profile,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    resetPassword,
    updatePassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}