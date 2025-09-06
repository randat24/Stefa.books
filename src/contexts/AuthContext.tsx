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
        const currentUser = await authService.getCurrentUser();
        
        if (currentUser) {
          setUser(currentUser);
          setIsAuthenticated(true);
          
          // Fetch user profile
          const userProfile = await authService.getUserProfile(currentUser.id);
          setProfile(userProfile);
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
    const response = await authService.login(data);
    
    if (response.success && response.user) {
      setUser(response.user);
      setIsAuthenticated(true);
      
      // Fetch user profile
      const userProfile = await authService.getUserProfile(response.user.id);
      setProfile(userProfile);
    }
    
    return response;
  }, []);

  const register = useCallback(async (data: { email: string; password: string; firstName: string; lastName: string; phone?: string }) => {
    const response = await authService.register(data);
    
    if (response.success && response.user) {
      setUser(response.user);
      setIsAuthenticated(true);
      
      // Fetch user profile
      const userProfile = await authService.getUserProfile(response.user.id);
      setProfile(userProfile);
    }
    
    return response;
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
    setProfile(null);
    setIsAuthenticated(false);
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
    return await authService.resetPassword(email);
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