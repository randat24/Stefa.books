"use client";

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useNotifications } from '@/lib/hooks/useNotifications';

interface LoginFormProps {
  onSwitchToRegister?: () => void;
  onForgotPassword?: () => void;
  onSuccess?: () => void;
}

export function LoginForm({ onSwitchToRegister, onForgotPassword, onSuccess }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  
  const { login } = useAuth();
  const router = useRouter();
  const { showSuccess, showError, showLoading, dismiss } = useNotifications();

  const validateForm = () => {
    const errors: { email?: string; password?: string } = {};
    
    if (!email.trim()) {
      errors.email = 'Введіть електронну пошту';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Введіть коректну електронну пошту';
    }
    
    if (!password.trim()) {
      errors.password = 'Введіть пароль';
    } else if (password.length < 6) {
      errors.password = 'Пароль має містити принаймні 6 символів';
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    const loadingToast = showLoading('Входимо в систему...');

    try {
      const response = await login({ email, password });
      dismiss(loadingToast);
      
      if (response.success) {
        showSuccess('Успішний вхід!', 'Ви успішно увійшли в систему');
        
        // Call success callback if provided, otherwise redirect
        if (onSuccess) {
          onSuccess();
        } else {
          router.push('/');
          router.refresh();
        }
      } else {
        // Handle specific error cases
        let errorMessage = 'Помилка входу в систему';
        
        if (response.error?.includes('Invalid login credentials')) {
          errorMessage = 'Невірний email або пароль';
        } else if (response.error?.includes('Email not confirmed')) {
          errorMessage = 'Підтвердіть email перед входом';
        } else if (response.error?.includes('Too many requests')) {
          errorMessage = 'Забагато спроб входу. Спробуйте пізніше';
        } else if (response.error) {
          errorMessage = response.error;
        }
        
        setError(errorMessage);
        showError('Помилка входу', errorMessage);
      }
    } catch {
      dismiss(loadingToast);
      const errorMessage = 'Помилка підключення до сервера';
      setError(errorMessage);
      showError('Помилка', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="card rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-8">
          <div className="text-center mb-8">
            <h2 className="h2 text-accent mb-2">Вхід</h2>
            <p className="text-text-muted">Увійдіть до свого облікового запису</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive" className="mb-4">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          
          <div className="space-y-2">
            <Label htmlFor="email" className="text-small font-medium text-text">Електронна пошта</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setEmail(e.target.value);
                if (fieldErrors.email) {
                  setFieldErrors(prev => ({ ...prev, email: undefined }));
                }
              }}
              disabled={isLoading}
              placeholder="your@email.com"
              className={`bg-white border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors ${fieldErrors.email ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
            />
            {fieldErrors.email && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <XCircle className="h-3 w-3" />
                {fieldErrors.email}
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-small font-medium text-text">Пароль</Label>
              {onForgotPassword && (
                <button
                  type="button"
                  onClick={onForgotPassword}
                  className="text-small text-brand hover:text-brand-700 font-medium transition-colors"
                  disabled={isLoading}
                >
                  Забули пароль?
                </button>
              )}
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) {
                    setFieldErrors(prev => ({ ...prev, password: undefined }));
                  }
                }}
                disabled={isLoading}
                placeholder="••••••••"
                className={`bg-white border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors pr-10 ${fieldErrors.password ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <XCircle className="h-3 w-3" />
                {fieldErrors.password}
              </p>
            )}
          </div>
          
          <div className="pt-4">
            <Button 
              type="submit" 
              className="w-full bg-brand hover:bg-brand-600 text-accent font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
              disabled={isLoading || !email.trim() || !password.trim()}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Вхід...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Увійти
                </div>
              )}
            </Button>
          </div>
          
          {onSwitchToRegister && (
            <div className="text-center text-small text-text-muted pt-2">
              Немає облікового запису?{' '}
              <button
                type="button"
                onClick={onSwitchToRegister}
                className="text-brand hover:text-brand-600 font-medium transition-colors"
                disabled={isLoading}
              >
                Зареєструватися
              </button>
            </div>
          )}
        </form>
        </div>
      </div>
    </div>
  );
}