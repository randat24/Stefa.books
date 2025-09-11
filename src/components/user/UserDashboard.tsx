'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  BookOpen, 
  Calendar, 
  Clock, 
  Star, 
  TrendingUp, 
  Settings,
  Bell,
  CreditCard,
  History,
  RefreshCw,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/progress';
import type { User, ActiveRental, RentalHistory, UserSubscription } from '@/types/user';

interface UserDashboardProps {
  className?: string;
}

interface DashboardData {
  user: User;
  subscription: UserSubscription | null;
  activeRentals: ActiveRental[];
  rentalHistory: RentalHistory[];
  stats: {
    totalBooksRead: number;
    currentRentals: number;
    totalRentals: number;
    daysActive: number;
  };
}

export default function UserDashboard({ className = '' }: UserDashboardProps) {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/user/dashboard');
      const result = await response.json();

      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error || 'Failed to load dashboard data');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleRenewSubscription = async () => {
    try {
      const response = await fetch('/api/user/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'renew',
          planId: data?.subscription?.plan || 'basic_monthly'
        })
      });

      const result = await response.json();
      if (result.success && result.data.paymentUrl) {
        window.location.href = result.data.paymentUrl;
      }
    } catch (err) {
      console.error('Error renewing subscription:', err);
    }
  };

  const handleReturnBook = async (rentalId: string, bookId: string) => {
    try {
      const response = await fetch('/api/user/rentals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'return',
          rentalId,
          bookId
        })
      });

      const result = await response.json();
      if (result.success) {
        loadDashboardData(); // Refresh data
      }
    } catch (err) {
      console.error('Error returning book:', err);
    }
  };

  const handleExchangeBook = (rentalId: string) => {
    router.push(`/catalog?exchange=${rentalId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin text-brand-accent" />
        <span className="ml-2">Завантаження...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <AlertCircle className="h-8 w-8 text-red-500" />
        <span className="ml-2 text-red-600">{error}</span>
      </div>
    );
  }

  if (!data) return null;

  const { user, subscription, activeRentals, rentalHistory, stats } = data;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">
            Привіт, {user.name}! 👋
          </h1>
          <p className="text-neutral-600 mt-1">
            Ваш особистий кабінет Stefa.Books
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Налаштування
          </Button>
          <Button variant="outline" size="sm">
            <Bell className="h-4 w-4 mr-2" />
            Сповіщення
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-neutral-600">Прочитано книг</p>
                <p className="text-2xl font-bold text-neutral-900">{stats.totalBooksRead}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-neutral-600">Активних оренд</p>
                <p className="text-2xl font-bold text-neutral-900">{stats.currentRentals}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <History className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-neutral-600">Всього оренд</p>
                <p className="text-2xl font-bold text-neutral-900">{stats.totalRentals}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-neutral-600">Днів з нами</p>
                <p className="text-2xl font-bold text-neutral-900">{stats.daysActive}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subscription Status */}
      {subscription && (
        <Card className={subscription.status === 'expired' ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Статус підписки
              <Badge variant={subscription.status === 'active' ? 'default' : 'destructive'}>
                {subscription.status === 'active' ? 'Активна' : 'Закінчилася'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-lg">
                  {subscription.plan === 'mini' ? '🌟 Mini' : 
                   subscription.plan === 'maxi' ? '🚀 Maxi' : 
                   subscription.plan === 'premium' ? '👑 Premium' : 
                   subscription.plan === 'family' ? '🔥 Family' : subscription.plan}
                </p>
                <p className="text-sm text-neutral-600">
                  {subscription.status === 'active' 
                    ? `Залишилось днів: ${subscription.days_left}`
                    : `Закінчилася: ${new Date(subscription.end_date).toLocaleDateString('uk-UA')}`
                  }
                </p>
              </div>
              {subscription.status === 'expired' && (
                <Button onClick={handleRenewSubscription} className="bg-brand-accent hover:bg-brand-accent-light">
                  Продовжити підписку
                </Button>
              )}
            </div>
            {subscription.status === 'active' && (
              <div className="mt-4">
                <div className="flex justify-between text-sm text-neutral-600 mb-1">
                  <span>Прогрес підписки</span>
                  <span>{subscription.days_left} днів</span>
                </div>
                <Progress value={(subscription.days_left / 30) * 100} className="h-2" />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Active Rentals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Активні оренди ({activeRentals.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeRentals.length === 0 ? (
            <div className="text-center py-8 text-neutral-500">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-neutral-300" />
              <p>У вас немає активних оренд</p>
              <Button 
                className="mt-4" 
                onClick={() => router.push('/catalog')}
              >
                Переглянути каталог
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {activeRentals.map((rental) => (
                <div key={rental.id} className="flex items-center gap-4 p-4 border rounded-lg">
                  <img 
                    src={rental.book_cover_url || '/placeholder-book.jpg'} 
                    alt={rental.book_title}
                    className="w-16 h-20 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{rental.book_title}</h3>
                    <p className="text-neutral-600">{rental.book_author}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <Badge variant={rental.is_overdue ? 'destructive' : 'default'}>
                        {rental.is_overdue ? 'Прострочено' : `${rental.days_left} днів`}
                      </Badge>
                      <span className="text-sm text-neutral-500">
                        Повернути до: {new Date(rental.return_by).toLocaleDateString('uk-UA')}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {rental.can_exchange && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleExchangeBook(rental.id)}
                      >
                        Обміняти
                      </Button>
                    )}
                    {rental.can_return && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleReturnBook(rental.id, rental.book_id)}
                      >
                        Повернути
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Останні оренди ({rentalHistory.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {rentalHistory.length === 0 ? (
            <div className="text-center py-8 text-neutral-500">
              <History className="h-12 w-12 mx-auto mb-4 text-neutral-300" />
              <p>Історія оренд порожня</p>
            </div>
          ) : (
            <div className="space-y-3">
              {rentalHistory.slice(0, 5).map((rental) => (
                <div key={rental.id} className="flex items-center gap-4 p-3 border rounded-lg">
                  <img 
                    src={rental.book_cover_url || '/placeholder-book.jpg'} 
                    alt={rental.book_title}
                    className="w-12 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium">{rental.book_title}</h4>
                    <p className="text-sm text-neutral-600">{rental.book_author}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" size="sm">
                        {rental.final_status === 'returned' ? 'Повернено' : 'Обмінено'}
                      </Badge>
                      <span className="text-xs text-neutral-500">
                        {rental.returned_at 
                          ? new Date(rental.returned_at).toLocaleDateString('uk-UA')
                          : new Date(rental.rented_at).toLocaleDateString('uk-UA')
                        }
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {rental.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="text-sm">{rental.rating}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
