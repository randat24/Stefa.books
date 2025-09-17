'use client'

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { logger } from '@/lib/logger';

interface PasswordStrength {
  valid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong';
}

export default function SetupPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    valid: false,
    errors: [],
    strength: 'weak'
  });

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
      validateToken(tokenParam);
    } else {
      setError('Посилання недійсне. Токен не знайдено.');
    }
  }, [searchParams]);

  // Проверка надежности пароля
  useEffect(() => {
    if (password) {
      const strength = validatePasswordStrength(password);
      setPasswordStrength(strength);
    } else {
      setPasswordStrength({ valid: false, errors: [], strength: 'weak' });
    }
  }, [password]);

  const validateToken = async (tokenValue: string) => {
    try {
      const response = await fetch('/api/auth/validate-password-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token: tokenValue })
      });

      const result = await response.json();

      if (response.ok && result.valid) {
        setTokenValid(true);
      } else {
        setTokenValid(false);
        setError(result.error || 'Посилання недійсне або прострочене');
      }
    } catch (err) {
      logger.error('Token validation error', err);
      setTokenValid(false);
      setError('Помилка при перевірці посилання');
    }
  };

  const validatePasswordStrength = (pwd: string): PasswordStrength => {
    const errors: string[] = [];
    let score = 0;

    if (pwd.length < 6) {
      errors.push('Пароль повинен містити принаймні 6 символів');
    } else {
      score += 1;
    }

    if (pwd.length >= 8) score += 1;
    if (/[a-z]/.test(pwd)) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/\d/.test(pwd)) score += 1;
    if (/[!@#$%^&*(),.?\":{}|<>]/.test(pwd)) score += 1;

    let strength: 'weak' | 'medium' | 'strong' = 'weak';
    if (score >= 4) strength = 'medium';
    if (score >= 6) strength = 'strong';

    return {
      valid: errors.length === 0,
      errors,
      strength
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!token) {
      setError('Токен не знайдено');
      return;
    }

    if (!passwordStrength.valid) {
      setError('Пароль не відповідає вимогам безпеки');
      return;
    }

    if (password !== confirmPassword) {
      setError('Паролі не збігаються');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/setup-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token,
          password
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSuccess('Пароль успішно встановлено! Тепер ви можете увійти в свій акаунт.');
        setTimeout(() => {
          router.push('/auth/login?message=password_set');
        }, 2000);
      } else {
        setError(result.error || 'Помилка при встановленні паролю');
      }
    } catch (err) {
      logger.error('Password setup error', err);
      setError('Помилка при встановленні паролю');
    } finally {
      setIsLoading(false);
    }
  };

  if (tokenValid === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <CardTitle className="text-xl text-red-600">Посилання недійсне</CardTitle>
            <CardDescription>
              Час дії посилання закінчився або воно було використане
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button
              onClick={() => router.push('/auth/login')}
              className="w-full"
              variant="outline"
            >
              Перейти до входу
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (tokenValid === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Перевірка посилання...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-6 h-6 text-amber-600" />
          </div>
          <CardTitle className="text-xl">Встановлення паролю</CardTitle>
          <CardDescription>
            Встановіть свій пароль для доступу до акаунта Stefa.books
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert className="mb-4" variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-4">
              <AlertDescription className="text-green-700">{success}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="password">Новий пароль</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  placeholder="Введіть новий пароль"
                  required
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>

              {password && (
                <div className="mt-2 space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="text-sm text-gray-600">Надійність:</div>
                    <div className={`text-sm font-medium ${
                      passwordStrength.strength === 'strong' ? 'text-green-600' :
                      passwordStrength.strength === 'medium' ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {passwordStrength.strength === 'strong' ? 'Висока' :
                       passwordStrength.strength === 'medium' ? 'Середня' : 'Низька'}
                    </div>
                  </div>
                  {passwordStrength.errors.length > 0 && (
                    <ul className="text-sm text-red-600 space-y-1">
                      {passwordStrength.errors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="confirmPassword">Підтвердження паролю</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                  placeholder="Підтвердіть новий пароль"
                  required
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="text-sm text-red-600 mt-1">Паролі не збігаються</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !passwordStrength.valid || password !== confirmPassword}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Встановлення...
                </>
              ) : (
                'Встановити пароль'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Уже маєте пароль?{' '}
              <button
                onClick={() => router.push('/auth/login')}
                className="text-amber-600 hover:text-amber-700 font-medium"
              >
                Увійти в акаунт
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}