'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { canAccessAdminPanel } from '@/lib/auth/roles';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Shield, AlertTriangle } from 'lucide-react';

interface AdminGuardProps {
  children: React.ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
  const { user, profile, isAuthenticated, isLoading } = useAuth();
  const [isChecking, setIsChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAdminAccess = async () => {
      if (isLoading) return;

      setIsChecking(false);

      // If not authenticated, redirect to login
      if (!isAuthenticated || !user) {
        router.push('/auth/login?redirect=/admin');
        return;
      }

      // Check if user can access admin panel
      if (!canAccessAdminPanel(user, profile)) {
        // User is authenticated but not admin
        return;
      }
    };

    checkAdminAccess();
  }, [isAuthenticated, user, profile, isLoading, router]);

  // Show loading state
  if (isLoading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Перевірка доступу...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If not authenticated, show nothing (redirect will happen)
  if (!isAuthenticated || !user) {
    return null;
  }

  // Check if user can access admin panel
  if (!canAccessAdminPanel(user, profile)) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10">
              <Shield className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle className="text-h2">Доступ заборонено</CardTitle>
            <CardDescription>
              У вас немає прав для доступу до адмін-панелі
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted p-4">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div className="text-body-sm text-muted-foreground">
                  <p>Для доступу до адмін-панелі потрібні права адміністратора.</p>
                  <p className="mt-1">Зверніться до адміністратора системи.</p>
                </div>
              </div>
            </div>
            <div className="flex flex-col space-y-2">
              <Button 
                onClick={() => router.push('/')}
                className="w-full"
              >
                Повернутися на головну
              </Button>
              <Button 
                variant="outline" 
                onClick={() => router.push('/auth/login')}
                className="w-full"
              >
                Увійти як інший користувач
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // User is admin, render children
  return <>{children}</>;
}
