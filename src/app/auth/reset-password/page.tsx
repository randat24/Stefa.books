'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState('');

  // Check if we have the necessary tokens
  useEffect(() => {
    const accessToken = searchParams?.get('access_token');
    const refreshToken = searchParams?.get('refresh_token');
    
    if (!accessToken || !refreshToken) {
      setError('Недійсне посилання для скидання пароля');
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    // Clear general error
    if (error) {
      setError('');
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.password) {
      newErrors.password = 'Пароль обов\'язковий';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Пароль має містити принаймні 6 символів';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Підтвердження пароля обов\'язкове';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Паролі не співпадають';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${searchParams?.get('access_token')}` },
        body: JSON.stringify({
          password: formData.password,
          confirmPassword: formData.confirmPassword }) });

      const result = await response.json();

      if (result.success) {
        setIsSubmitted(true);
      } else {
        setError(result.error || 'Не вдалося оновити пароль');
      }
    } catch (error) {
      console.error('Password reset error:', error);
      setError('Помилка підключення');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="container flex h-screen w-screen flex-col items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Пароль оновлено</CardTitle>
            <CardDescription className="text-center">
              Ваш пароль успішно оновлено. Тепер ви можете увійти з новим паролем.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-neutral-600">
              Перейдіть на сторінку входу, щоб увійти до свого облікового запису.
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/auth/login" className="w-full">
              <Button className="w-full">Увійти</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Новий пароль</CardTitle>
          <CardDescription className="text-center">
            Введіть новий пароль для вашого облікового запису
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="grid gap-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="grid gap-2">
              <Label htmlFor="password">Новий пароль</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
                placeholder="••••••••"
              />
              {errors.password && <p className="text-body-sm text-red-500">{errors.password}</p>}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Підтвердіть пароль</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={isLoading}
                placeholder="••••••••"
              />
              {errors.confirmPassword && <p className="text-body-sm text-red-500">{errors.confirmPassword}</p>}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col">
            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading ? 'Оновлення...' : 'Оновити пароль'}
            </Button>
            <p className="mt-4 text-center text-body-sm text-neutral-500">
              Пам&apos;ятаєте пароль?{' '}
              <Link href="/auth/login" className="text-brand-accent-light hover:text-brand-accent-light/80">
                Увійти
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}