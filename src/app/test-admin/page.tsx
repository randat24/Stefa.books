"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Shield } from 'lucide-react';

export default function TestAdminPage() {
  const [email, setEmail] = useState('admin@stefa-books.com.ua');
  const [password, setPassword] = useState('oqP_Ia5VMO2wy46p');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<any>(null);
  
  const router = useRouter();

  const handleTestLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setIsLoading(true);

    try {
      // Тестируем API login
      const loginResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }) });

      const loginResult = await loginResponse.json();
      setResult({ login: loginResult });

      if (loginResult.success) {
        // Тестируем API me
        const meResponse = await fetch('/api/auth/me', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(loginResult.session?.access_token && {
              'Authorization': `Bearer ${loginResult.session.access_token}`
            })
          } });

        const meResult = await meResponse.json();
        setResult(prev => ({ ...prev, me: meResult }));

        if (meResult.success) {
          // Проверяем права доступа к админ-панели
          const canAccess = meResult.user?.email === 'admin@stefa-books.com.ua' || 
                           meResult.profile?.role === 'admin';
          
          setResult(prev => ({ 
            ...prev, 
            canAccessAdmin: canAccess,
            adminCheck: {
              email: meResult.user?.email,
              profileRole: meResult.profile?.role,
              userMetadata: loginResult.user?.user_metadata,
              appMetadata: loginResult.user?.app_metadata
            }
          }));
        }
      } else {
        setError(loginResult.error || 'Ошибка входа');
      }
    } catch (err) {
      setError('Ошибка подключения: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  const goToAdmin = () => {
    router.push('/admin');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-amber-50 to-orange-50">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
            <Shield className="h-8 w-8 text-amber-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Тест входа в админ-панель
          </CardTitle>
          <CardDescription>
            Проверка работы аутентификации и прав доступа
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <form onSubmit={handleTestLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                placeholder="admin@stefa-books.com.ua"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                placeholder="Пароль админа"
                required
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Тестирование...
                </>
              ) : (
                'Тестировать вход'
              )}
            </Button>
          </form>

          {result && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">Результат тестирования:</h3>
                <pre className="text-xs overflow-auto max-h-96">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>

              {result.canAccessAdmin && (
                <Button onClick={goToAdmin} className="w-full">
                  Перейти в админ-панель
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
