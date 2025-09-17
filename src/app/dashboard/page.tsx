'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/button';
import { User, Calendar, BookOpen, CreditCard } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subscription_type: string | null;
  subscription_start: string | null;
  subscription_end: string | null;
  status: string | null;
  created_at: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: authUser, error: authError } = await supabase.auth.getUser();

      if (authError || !authUser.user) {
        router.push('/auth/login');
        return;
      }

      // Получаем профиль пользователя
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('email', authUser.user.email)
        .single();

      if (profileError) {
        console.error('Ошибка загрузки профиля:', profileError);
        return;
      }

      setUser(profile);
    } catch (error) {
      console.error('Ошибка проверки пользователя:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSubscriptionStatus = () => {
    if (!user?.subscription_type) {
      return { label: 'Немає підписки', color: 'bg-gray-100 text-gray-800' };
    }

    const endDate = user.subscription_end ? new Date(user.subscription_end) : null;
    const now = new Date();

    if (endDate && endDate < now) {
      return { label: 'Підписка закінчилась', color: 'bg-red-100 text-red-800' };
    }

    const planName = user.subscription_type === 'mini' ? 'MINI' : 'MAXI';
    return { label: `Підписка ${planName}`, color: 'bg-green-100 text-green-800' };
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Помилка завантаження профілю</h1>
          <Button onClick={() => router.push('/')}>На головну</Button>
        </div>
      </div>
    );
  }

  const subscriptionStatus = getSubscriptionStatus();

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">
          Особистий кабінет
        </h1>
        <Button variant="outline" onClick={handleLogout}>
          Вийти
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Профиль пользователя */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Мій профіль
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Ім'я</label>
              <p className="text-lg">{user.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Email</label>
              <p className="text-lg">{user.email}</p>
            </div>
            {user.phone && (
              <div>
                <label className="text-sm font-medium text-gray-600">Телефон</label>
                <p className="text-lg">{user.phone}</p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-gray-600">Статус</label>
              <Badge className={subscriptionStatus.color}>
                {subscriptionStatus.label}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Подписка */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Підписка
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {user.subscription_type ? (
              <>
                <div>
                  <label className="text-sm font-medium text-gray-600">Тип підписки</label>
                  <p className="text-lg font-semibold">
                    {user.subscription_type === 'mini' ? 'MINI (300 ₴)' : 'MAXI (500 ₴)'}
                  </p>
                </div>
                {user.subscription_start && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Початок підписки</label>
                    <p className="text-lg">
                      {new Date(user.subscription_start).toLocaleDateString('uk-UA')}
                    </p>
                  </div>
                )}
                {user.subscription_end && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Кінець підписки</label>
                    <p className="text-lg">
                      {new Date(user.subscription_end).toLocaleDateString('uk-UA')}
                    </p>
                  </div>
                )}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push('/books')}
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Переглянути каталог
                </Button>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">У вас ще немає активної підписки</p>
                <Button
                  onClick={() => router.push('/subscribe')}
                  className="w-full"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Оформити підписку
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* История заказов */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Історія замовлень
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 text-center py-8">
              Історія ваших замовлень поки що порожня
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}