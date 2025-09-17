'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email) {
      setError('Email обов\'язковий');
      return;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Неправильний формат email');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await resetPassword(email);
      
      if (response.success) {
        setIsSubmitted(true);
      } else {
        setError(response.error || 'Не вдалося надіслати лист для скидання пароля');
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
            <CardTitle className="text-2xl text-center">Перевірте пошту</CardTitle>
            <CardDescription className="text-center">
              Ми надіслали посилання для скидання пароля на {email}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-neutral-600">
              Не отримали лист? Перевірте папку &ldquo;Спам&rdquo; або{' '}
              <button 
                onClick={() => setIsSubmitted(false)}
                className="text-brand-accent-light hover:text-brand-accent-light/80"
              >
                спробуйте знову
              </button>
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/auth/login" className="w-full">
              <Button className="w-full">Назад до входу</Button>
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
          <CardTitle className="text-2xl text-center">Скидання пароля</CardTitle>
          <CardDescription className="text-center">
            Введіть свою електронну пошту, і ми надішлемо вам посилання для скидання пароля
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
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setEmail(e.target.value)}
                placeholder="your@email.com"
                disabled={isLoading}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col">
            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading ? 'Надсилання...' : 'Надіслати посилання'}
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