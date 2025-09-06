'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle, 
  RotateCcw,
  BookOpen,
  Calendar,
  MapPin,
  Phone,
  Mail
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface Order {
  id: string;
  type: 'rental' | 'return' | 'subscription';
  status: string;
  created_at: string;
  updated_at: string;
  book?: {
    id: string;
    title: string;
    author: string;
    cover_url?: string;
  };
  details: {
    start_date?: string;
    end_date?: string;
    return_method?: string;
    book_condition?: string;
    plan_name?: string;
    price?: number;
  };
}

export default function OrdersPage() {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated && user?.email) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user?.email]);

  const fetchOrders = async () => {
    try {
      // Fetch all orders (rentals, returns, subscriptions)
      const [rentalsResponse, returnsResponse, subscriptionsResponse] = await Promise.all([
        fetch(`/api/rentals?email=${user?.email}`),
        fetch(`/api/return?email=${user?.email}`),
        fetch(`/api/subscription?email=${user?.email}`)
      ]);

      const [rentalsData, returnsData, subscriptionsData] = await Promise.all([
        rentalsResponse.json(),
        returnsResponse.json(),
        subscriptionsResponse.json()
      ]);

      const allOrders: Order[] = [];

      // Process rentals
      if (rentalsData.success && rentalsData.rentals) {
        rentalsData.rentals.forEach((rental: any) => {
          allOrders.push({
            id: rental.id,
            type: 'rental',
            status: rental.status,
            created_at: rental.created_at,
            updated_at: rental.updated_at || rental.created_at,
            book: rental.book,
            details: {
              start_date: rental.start_date,
              end_date: rental.end_date
            }
          });
        });
      }

      // Process returns
      if (returnsData.success && returnsData.returns) {
        returnsData.returns.forEach((returnItem: any) => {
          allOrders.push({
            id: returnItem.id,
            type: 'return',
            status: returnItem.status,
            created_at: returnItem.created_at,
            updated_at: returnItem.updated_at || returnItem.created_at,
            book: returnItem.book,
            details: {
              return_method: returnItem.return_method,
              book_condition: returnItem.book_condition
            }
          });
        });
      }

      // Process subscriptions
      if (subscriptionsData.success && subscriptionsData.subscription) {
        const subscription = subscriptionsData.subscription;
        allOrders.push({
          id: subscription.id,
          type: 'subscription',
          status: subscription.status,
          created_at: subscription.created_at,
          updated_at: subscription.updated_at || subscription.created_at,
          details: {
            plan_name: subscription.plan_name,
            price: subscription.price
          }
        });
      }

      // Sort by creation date (newest first)
      allOrders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      setOrders(allOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string, type: string) => {
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
      },
      subscription: {
        pending: { label: 'Очікує оплати', variant: 'secondary' as const },
        active: { label: 'Активна', variant: 'default' as const },
        cancelled: { label: 'Скасована', variant: 'destructive' as const },
        paused: { label: 'Призупинена', variant: 'secondary' as const }
      }
    };
    
    const statusConfig = statuses[type as keyof typeof statuses]?.[status as keyof typeof statuses[type as keyof typeof statuses]];
    return statusConfig || { label: status, variant: 'secondary' as const };
  };

  const getOrderIcon = (type: string) => {
    const icons = {
      rental: <BookOpen className="h-5 w-5" />,
      return: <RotateCcw className="h-5 w-5" />,
      subscription: <Package className="h-5 w-5" />
    };
    return icons[type as keyof typeof icons] || <Package className="h-5 w-5" />;
  };

  const getOrderTitle = (type: string) => {
    const titles = {
      rental: 'Оренда книги',
      return: 'Повернення книги',
      subscription: 'Підписка'
    };
    return titles[type as keyof typeof titles] || 'Замовлення';
  };

  const filteredOrders = orders.filter(order => {
    if (activeTab === 'all') return true;
    return order.type === activeTab;
  });

  if (!isAuthenticated) {
    return (
      <div className="container py-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="h-8 w-8 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Вхід необхідний</h1>
          <p className="text-gray-600 mb-6">
            Будь ласка, увійдіть в систему, щоб переглянути свої замовлення
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Мої замовлення</h1>
        <p className="text-gray-600">
          Переглядайте та керуйте всіма вашими замовленнями
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">Всі ({orders.length})</TabsTrigger>
          <TabsTrigger value="rental">Оренди ({orders.filter(o => o.type === 'rental').length})</TabsTrigger>
          <TabsTrigger value="return">Повернення ({orders.filter(o => o.type === 'return').length})</TabsTrigger>
          <TabsTrigger value="subscription">Підписки ({orders.filter(o => o.type === 'subscription').length})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-6">
          {filteredOrders.length > 0 ? (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <Card key={order.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      {/* Order Icon */}
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                        {getOrderIcon(order.type)}
                      </div>

                      {/* Order Details */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {getOrderTitle(order.type)}
                            </h3>
                            {order.book && (
                              <p className="text-sm text-gray-600">
                                {order.book.title} - {order.book.author}
                              </p>
                            )}
                            {order.details.plan_name && (
                              <p className="text-sm text-gray-600">
                                План: {order.details.plan_name}
                                {order.details.price && ` (${order.details.price}₴/місяць)`}
                              </p>
                            )}
                          </div>
                          <Badge variant={getStatusBadge(order.status, order.type).variant}>
                            {getStatusBadge(order.status, order.type).label}
                          </Badge>
                        </div>

                        {/* Order Info */}
                        <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                          <div>
                            <p><strong>Створено:</strong> {new Date(order.created_at).toLocaleDateString('uk-UA')}</p>
                            {order.details.start_date && (
                              <p><strong>Початок:</strong> {new Date(order.details.start_date).toLocaleDateString('uk-UA')}</p>
                            )}
                            {order.details.end_date && (
                              <p><strong>Кінець:</strong> {new Date(order.details.end_date).toLocaleDateString('uk-UA')}</p>
                            )}
                          </div>
                          <div>
                            {order.details.return_method && (
                              <p><strong>Спосіб повернення:</strong> {order.details.return_method}</p>
                            )}
                            {order.details.book_condition && (
                              <p><strong>Стан книги:</strong> {order.details.book_condition}</p>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 mt-4">
                          {order.type === 'rental' && order.status === 'active' && (
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/books/${order.book?.id}/return`}>
                                Повернути
                              </Link>
                            </Button>
                          )}
                          {order.type === 'subscription' && order.status === 'active' && (
                            <Button variant="outline" size="sm" asChild>
                              <Link href="/account">
                                Керувати
                              </Link>
                            </Button>
                          )}
                          <Button variant="outline" size="sm">
                            Деталі
                          </Button>
                        </div>
                      </div>

                      {/* Book Cover */}
                      {order.book?.cover_url && (
                        <div className="w-16 h-24 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                          <Image
                            src={order.book.cover_url}
                            alt={order.book.title}
                            width={64}
                            height={96}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {activeTab === 'all' ? 'Немає замовлень' : `Немає ${activeTab === 'rental' ? 'оренд' : activeTab === 'return' ? 'повернень' : 'підписок'}`}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {activeTab === 'all' 
                      ? 'Ви ще не робили жодних замовлень'
                      : `Ви ще не ${activeTab === 'rental' ? 'орендували' : activeTab === 'return' ? 'повертали' : 'оформлювали підписки на'} книги`
                    }
                  </p>
                  <Button asChild>
                    <Link href="/catalog">Переглянути каталог</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
