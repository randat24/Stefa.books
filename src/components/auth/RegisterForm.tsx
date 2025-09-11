"use client";

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useNotifications } from '@/lib/hooks/useNotifications';

interface RegisterFormProps {
  onSwitchToLogin?: () => void;
  onSuccess?: () => void;
}

export function RegisterForm({ onSwitchToLogin, onSuccess }: RegisterFormProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  
  const { register } = useAuth();
  const router = useRouter();
  const { showSuccess, showError, showLoading, dismiss } = useNotifications();

  const validateForm = () => {
    const errors: typeof fieldErrors = {};
    
    if (!firstName.trim()) {
      errors.firstName = 'Введіть ім\'я';
    }
    
    if (!lastName.trim()) {
      errors.lastName = 'Введіть прізвище';
    }
    
    if (!email.trim()) {
      errors.email = 'Введіть електронну пошту';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Введіть коректну електронну пошту';
    }
    
    if (phone && !/^[\+]?[0-9\s\-\(\)]{10,}$/.test(phone)) {
      errors.phone = 'Введіть коректний номер телефону';
    }
    
    if (!password.trim()) {
      errors.password = 'Введіть пароль';
    } else if (password.length < 6) {
      errors.password = 'Пароль має містити принаймні 6 символів';
    }
    
    if (!confirmPassword.trim()) {
      errors.confirmPassword = 'Підтвердіть пароль';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Паролі не співпадають';
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
    const loadingToast = showLoading('Реєструємо користувача...');

    try {
      const response = await register({ 
        email, 
        password, 
        firstName, 
        lastName,
        phone: phone || undefined
      });
      
      dismiss(loadingToast);
      
      if (response.success) {
        showSuccess('Успішна реєстрація!', 'Ваш обліковий запис створено. Тепер ви можете увійти в систему.');
        
        // Call success callback if provided, otherwise redirect
        if (onSuccess) {
          onSuccess();
        } else {
          router.push('/');
          router.refresh();
        }
      } else {
        // Handle specific error cases
        let errorMessage = 'Помилка реєстрації';
        
        if (response.error?.includes('User already registered')) {
          errorMessage = 'Користувач з таким email вже існує';
        } else if (response.error?.includes('Invalid email')) {
          errorMessage = 'Невірний формат email';
        } else if (response.error?.includes('Password should be at least')) {
          errorMessage = 'Пароль занадто короткий';
        } else if (response.error) {
          errorMessage = response.error;
        }
        
        setError(errorMessage);
        showError('Помилка реєстрації', errorMessage);
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
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Реєстрація</h2>
            <p className="text-gray-600">Створіть новий обліковий запис</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive" className="mb-4">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">Ім&apos;я</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => {
                    setFirstName(e.target.value);
                    if (fieldErrors.firstName) {
                      setFieldErrors(prev => ({ ...prev, firstName: undefined }));
                    }
                  }}
                  disabled={isLoading}
                  placeholder="Іван"
                  className={`bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors ${fieldErrors.firstName ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
                />
                {fieldErrors.firstName && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <XCircle className="h-3 w-3" />
                    {fieldErrors.firstName}
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">Прізвище</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => {
                    setLastName(e.target.value);
                    if (fieldErrors.lastName) {
                      setFieldErrors(prev => ({ ...prev, lastName: undefined }));
                    }
                  }}
                  disabled={isLoading}
                  placeholder="Петренко"
                  className={`bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors ${fieldErrors.lastName ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
                />
                {fieldErrors.lastName && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <XCircle className="h-3 w-3" />
                    {fieldErrors.lastName}
                  </p>
                )}
              </div>
            </div>
          
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">Електронна пошта</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
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
            <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Телефон (необов&apos;язково)</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                if (fieldErrors.phone) {
                  setFieldErrors(prev => ({ ...prev, phone: undefined }));
                }
              }}
              disabled={isLoading}
              placeholder="+380 50 123 45 67"
              className={`bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors ${fieldErrors.phone ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
            />
            {fieldErrors.phone && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <XCircle className="h-3 w-3" />
                {fieldErrors.phone}
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-gray-700">Пароль</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
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
          
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">Підтвердіть пароль</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (fieldErrors.confirmPassword) {
                    setFieldErrors(prev => ({ ...prev, confirmPassword: undefined }));
                  }
                }}
                disabled={isLoading}
                placeholder="••••••••"
                className={`bg-white border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors pr-10 ${fieldErrors.confirmPassword ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                disabled={isLoading}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {fieldErrors.confirmPassword && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <XCircle className="h-3 w-3" />
                {fieldErrors.confirmPassword}
              </p>
            )}
          </div>
          
          <div className="pt-4">
            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
              disabled={isLoading || !firstName.trim() || !lastName.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Реєстрація...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Зареєструватися
                </div>
              )}
            </Button>
          </div>
          
          {onSwitchToLogin && (
            <div className="text-center text-sm text-gray-600 pt-2">
              Вже маєте обліковий запис?{' '}
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                disabled={isLoading}
              >
                Увійти
              </button>
            </div>
          )}
        </form>
        </div>
      </div>
    </div>
  );
}