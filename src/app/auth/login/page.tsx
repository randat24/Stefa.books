"use client";

import React, { useState } from 'react';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';

export default function LoginPage() {
  const [view, setView] = useState<'login' | 'register' | 'forgot'>('login');

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {view === 'login' && (
          <LoginForm 
            onSwitchToRegister={() => setView('register')}
            onForgotPassword={() => setView('forgot')}
          />
        )}
        
        {view === 'register' && (
          <RegisterForm 
            onSwitchToLogin={() => setView('login')}
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