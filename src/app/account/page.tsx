'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  BookOpen, 
  Clock, 
  CheckCircle, 
  RotateCcw, 
  Settings, 
  Heart,
  History,
  Bell,
  CreditCard
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface Rental {
  id: string;
  book_id: string;
  status: string;
  start_date: string;
  end_date: string;
  created_at: string;
  book: {
    id: string;
    title: string;
    author: string;
    cover_url?: string;
  };
}

interface Return {
  id: string;
  book_id: string;
  status: string;
  return_method: string;
  book_condition: string;
  created_at: string;
  book: {
    id: string;
    title: string;
    author: string;
    cover_url?: string;
  };
}

export default function AccountPage() {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [returns, setReturns] = useState<Return[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated && user?.email) {
      fetchUserData();
    }
  }, [isAuthenticated, user?.email]);

  const fetchUserData = async () => {
    try {
      // Fetch rentals
      const rentalsResponse = await fetch(`/api/rentals?email=${user?.email}`);
      const rentalsData = await rentalsResponse.json();
      if (rentalsData.success) {
        setRentals(rentalsData.rentals || []);
      }

      // Fetch returns
      const returnsResponse = await fetch(`/api/return?email=${user?.email}`);
      const returnsData = await returnsResponse.json();
      if (returnsData.success) {
        setReturns(returnsData.returns || []);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string, type: 'rental' | 'return') => {
    const statuses = {
      rental: {
        pending: { label: 'Очікує підтвердження', variant: 'secondary' as const },
        confirmed: { label: 'Підтверджено', variant: 'default' as const },
        active: { label: 'Активна', variant: 'default' as const },
        completed: { label: 'Завершено', variant: 'default' as const },
        cancelled: { label: 'Скасовано', variant: 'destructive' as const }
      },
      return: {
        pending: { label: 'Очікує підтвердження', variant: 'secondary' as const },
        confirmed: { label: 'Підтверджено', variant: 'default' as const },
        in_progress: { label: 'В процесі', variant: 'default' as const },
        completed: { label: 'Завершено', variant: 'default' as const },
        cancelled: { label: 'Скасовано', variant: 'destructive' as const }
      }
    };
    
    const statusConfig = statuses[type][status as keyof typeof statuses[type]];
    return statusConfig || { label: status, variant: 'secondary' as const };
  };

  if (!isAuthenticated) {
    return (
      <div className="container py-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="h-8 w-8 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Вхід необхідний</h1>
          <p className="text-gray-600 mb-6">
            Будь ласка, увійдіть в систему, щоб переглянути свій кабінет
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild>
              <Link href="/auth/login">Увійти</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/auth/register">Зареєструватися</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-accent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Мій кабінет</h1>
        <p className="text-gray-600">
          Ласкаво просимо, {user?.user_metadata?.first_name || user?.email}!
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Огляд</TabsTrigger>
          <TabsTrigger value="rentals">Оренди</TabsTrigger>
          <TabsTrigger value="returns">Повернення</TabsTrigger>
          <TabsTrigger value="favorites">Улюблені</TabsTrigger>
          <TabsTrigger value="settings">Налаштування</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Active Rentals */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Активні оренди</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {rentals.filter(r => r.status === 'active').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Книг на руках
                </p>
              </CardContent>
            </Card>

            {/* Pending Returns */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Очікують повернення</CardTitle>
                <RotateCcw className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {returns.filter(r => r.status === 'pending').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Заявок на повернення
                </p>
              </CardContent>
            </Card>

            {/* Total Rentals */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Всього оренд</CardTitle>
                <History className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{rentals.length}</div>
                <p className="text-xs text-muted-foreground">
                  За весь час
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Остання активність</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {rentals.slice(0, 3).map((rental) => (
                  <div key={rental.id} className="flex items-center gap-4">
                    {rental.book.cover_url ? (
                      <Image
                        src={rental.book.cover_url}
                        alt={rental.book.title}
                        width={40}
                        height={60}
                        className="rounded object-cover"
                      />
                    ) : (
                      <div className="w-10 h-15 bg-gray-100 rounded flex items-center justify-center">
                        <BookOpen className="h-4 w-4 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h4 className="font-medium">{rental.book.title}</h4>
                      <p className="text-sm text-gray-600">{rental.book.author}</p>
                    </div>
                    <Badge variant={getStatusBadge(rental.status, 'rental').variant}>
                      {getStatusBadge(rental.status, 'rental').label}
                    </Badge>
                  </div>
                ))}
                {rentals.length === 0 && (
                  <p className="text-gray-500 text-center py-4">Немає недавньої активності</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rentals Tab */}
        <TabsContent value="rentals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Мої оренди</CardTitle>
            </CardHeader>
            <CardContent>
              {rentals.length > 0 ? (
                <div className="space-y-4">
                  {rentals.map((rental) => (
                    <div key={rental.id} className="flex items-center gap-4 p-4 border rounded-lg">
                      {rental.book.cover_url ? (
                        <Image
                          src={rental.book.cover_url}
                          alt={rental.book.title}
                          width={60}
                          height={90}
                          className="rounded object-cover"
                        />
                      ) : (
                        <div className="w-15 h-22 bg-gray-100 rounded flex items-center justify-center">
                          <BookOpen className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1">
                        <h4 className="font-semibold">{rental.book.title}</h4>
                        <p className="text-sm text-gray-600">{rental.book.author}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span>Початок: {new Date(rental.start_date).toLocaleDateString('uk-UA')}</span>
                          <span>Кінець: {new Date(rental.end_date).toLocaleDateString('uk-UA')}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={getStatusBadge(rental.status, 'rental').variant}>
                          {getStatusBadge(rental.status, 'rental').label}
                        </Badge>
                        {rental.status === 'active' && (
                          <Button variant="outline" size="sm" className="mt-2" asChild>
                            <Link href={`/books/${rental.book_id}/return`}>
                              Повернути
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Немає оренд</h3>
                  <p className="text-gray-600 mb-4">Ви ще не орендували жодної книги</p>
                  <Button asChild>
                    <Link href="/catalog">Переглянути каталог</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Returns Tab */}
        <TabsContent value="returns" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Мої повернення</CardTitle>
            </CardHeader>
            <CardContent>
              {returns.length > 0 ? (
                <div className="space-y-4">
                  {returns.map((returnItem) => (
                    <div key={returnItem.id} className="flex items-center gap-4 p-4 border rounded-lg">
                      {returnItem.book.cover_url ? (
                        <Image
                          src={returnItem.book.cover_url}
                          alt={returnItem.book.title}
                          width={60}
                          height={90}
                          className="rounded object-cover"
                        />
                      ) : (
                        <div className="w-15 h-22 bg-gray-100 rounded flex items-center justify-center">
                          <BookOpen className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1">
                        <h4 className="font-semibold">{returnItem.book.title}</h4>
                        <p className="text-sm text-gray-600">{returnItem.book.author}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span>Спосіб: {returnItem.return_method === 'pickup' ? 'Самовивіз' : 'Кур\'єр'}</span>
                          <span>Стан: {returnItem.book_condition}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={getStatusBadge(returnItem.status, 'return').variant}>
                          {getStatusBadge(returnItem.status, 'return').label}
                        </Badge>
                        <p className="text-sm text-gray-500 mt-1">
                          {new Date(returnItem.created_at).toLocaleDateString('uk-UA')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <RotateCcw className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Немає повернень</h3>
                  <p className="text-gray-600 mb-4">Ви ще не повертали жодної книги</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Favorites Tab */}
        <TabsContent value="favorites" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Улюблені книги</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Немає улюблених</h3>
                <p className="text-gray-600 mb-4">Додайте книги до улюблених, щоб швидко знаходити їх</p>
                <Button asChild>
                  <Link href="/catalog">Переглянути каталог</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Налаштування профілю</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Ім'я</label>
                  <p className="text-sm text-gray-900">{user?.user_metadata?.first_name || 'Не вказано'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Прізвище</label>
                  <p className="text-sm text-gray-900">{user?.user_metadata?.last_name || 'Не вказано'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <p className="text-sm text-gray-900">{user?.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Телефон</label>
                  <p className="text-sm text-gray-900">{user?.user_metadata?.phone || 'Не вказано'}</p>
                </div>
              </div>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Редагувати профіль
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Сповіщення</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Email сповіщення</h4>
                    <p className="text-sm text-gray-600">Отримувати сповіщення про статус оренд</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Bell className="h-4 w-4 mr-2" />
                    Налаштувати
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}