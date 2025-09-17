'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState('');

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
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Ім\'я обов\'язкове';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Прізвище обов\'язкове';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email обов\'язковий';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Неправильний формат email';
    }
    
    if (!formData.password) {
      newErrors.password = 'Пароль обов\'язковий';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Пароль має містити принаймні 6 символів';
    }
    
    if (formData.password !== formData.confirmPassword) {
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
      const response = await register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone || undefined
      });
      
      if (response.success) {
        // Redirect to account page after successful registration
        router.push('/account');
      } else {
        setError(response.error || 'Помилка реєстрації');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('Помилка підключення');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Реєстрація</CardTitle>
          <CardDescription className="text-center">
            Створіть новий обліковий запис
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="grid gap-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="firstName">Ім&apos;я</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Іван"
                  disabled={isLoading}
                />
                {errors.firstName && <p className="text-body-sm text-red-500">{errors.firstName}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lastName">Прізвище</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Петренко"
                  disabled={isLoading}
                />
                {errors.lastName && <p className="text-body-sm text-red-500">{errors.lastName}</p>}
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                disabled={isLoading}
              />
              {errors.email && <p className="text-body-sm text-red-500">{errors.email}</p>}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="phone">Телефон (необов&apos;язково)</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+380XXXXXXXXX"
                disabled={isLoading}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
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
              />
              {errors.confirmPassword && <p className="text-body-sm text-red-500">{errors.confirmPassword}</p>}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col">
            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading ? 'Реєстрація...' : 'Зареєструватися'}
            </Button>
            <p className="mt-4 text-center text-body-sm text-neutral-500">
              Вже маєте обліковий запис?{' '}
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