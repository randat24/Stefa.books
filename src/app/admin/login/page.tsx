'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { canAccessAdminPanel } from '@/lib/auth/roles';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Shield, Eye, EyeOff } from 'lucide-react';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, isAuthenticated, user, profile } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirectTo = searchParams?.get('redirect') || '/admin';
  const accessDenied = searchParams?.get('error') === 'access_denied';

  useEffect(() => {
    // If already authenticated and can access admin panel, redirect
    if (isAuthenticated && user && canAccessAdminPanel(user, profile)) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, user, profile, router, redirectTo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await login({ email, password });
      
      if (response.success && response.user) {
        // Check if user can access admin panel using the response profile
        if (canAccessAdminPanel(response.user, response.profile)) {
          // Wait a bit for the context to update
          await new Promise(resolve => setTimeout(resolve, 200));
          router.push(redirectTo);
          router.refresh();
        } else {
          setError('У вас немає прав для доступу до адмін-панелі');
        }
      } else {
        setError(response.error || 'Помилка входу');
      }
    } catch {
      setError('Сталася неочікувана помилка');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-amber-50 to-orange-50">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <div>
            <CardTitle className="text-h2">Адмін-панель</CardTitle>
            <CardDescription>
              Увійдіть для доступу до панелі управління
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent>
          {accessDenied && (
            <Alert className="mb-4 border-destructive">
              <AlertDescription>
                У вас немає прав для доступу до адмін-панелі
              </AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Введіть email адміністратора"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="h-11"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Введіть пароль"
                  value={password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-11 pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="md"
                  className="absolute right-0 top-0 h-11 px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              className="w-full h-11" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Вхід...
                </>
              ) : (
                'Увійти'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-body-sm text-muted-foreground">
            <p>Потрібен доступ? Зверніться до адміністратора</p>
            <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-body-sm font-medium text-blue-800">Тестові дані для входу:</p>
              <p className="text-caption text-blue-600 mt-1">
                Email: <span className="font-mono">admin@stefa-books.com.ua</span>
              </p>
              <p className="text-caption text-blue-600">
                Password: <span className="font-mono">oqP_Ia5VMO2wy46p</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
