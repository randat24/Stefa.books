"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';

export default function LoginPage() {
  const [view, setView] = useState<'login' | 'register' | 'forgot'>('login');
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams?.get('redirect');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push(redirect || '/account');
    }
  }, [isAuthenticated, router, redirect]);

  // Don't render if already authenticated
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {view === 'login' && (
          <LoginForm 
            onSwitchToRegister={() => setView('register')}
            onForgotPassword={() => setView('forgot')}
            onSuccess={() => {
              router.push(redirect || '/account');
            }}
          />
        )}
        
        {view === 'register' && (
          <RegisterForm 
            onSwitchToLogin={() => setView('login')}
            onSuccess={() => {
              router.push(redirect || '/account');
            }}
          />
        )}
        
        {view === 'forgot' && (
          <ForgotPasswordForm 
            onBackToLogin={() => setView('login')}
          />
        )}
      </div>
    </div>
  );
}