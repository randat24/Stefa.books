'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/Badge';
import { CheckCircle, Crown, Calendar, CreditCard, BookOpen, Gift } from 'lucide-react';
import Link from 'next/link';

interface SubscriptionData {
  id: string;
  customer_email: string;
  plan_id: string;
  plan_name: string;
  price: number;
  max_books: number;
  status: string;
  start_date: string;
  end_date: string;
  created_at: string;
}

const PLAN_ICONS = {
  basic: <BookOpen className="h-8 w-8" />,
  premium: <Crown className="h-8 w-8" />,
  family: <Gift className="h-8 w-8" />
};

const PLAN_COLORS = {
  basic: 'text-blue-600 bg-blue-100',
  premium: 'text-purple-600 bg-purple-100',
  family: 'text-green-600 bg-green-100'
};

export default function SubscriptionConfirmationPage() {
  const searchParams = useSearchParams();
  const subscriptionId = searchParams.get('subscription_id');
  
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (subscriptionId) {
      fetchSubscriptionDetails(subscriptionId);
    } else {
      setError('ID підписки не знайдено');
      setLoading(false);
    }
  }, [subscriptionId]);

  const fetchSubscriptionDetails = async (id: string) => {
    try {
      const response = await fetch(`/api/subscription?subscription_id=${id}`);
      const result = await response.json();
      
      if (result.success) {
        setSubscriptionData(result.subscription);
      } else {
        setError(result.error || 'Помилка при завантаженні деталей підписки');
      }
    } catch (error) {
      console.error('Error fetching subscription details:', error);
      setError('Помилка при завантаженні деталей підписки');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statuses = {
      pending: { label: 'Очікує оплати', variant: 'secondary' as const },
      active: { label: 'Активна', variant: 'default' as const },
      cancelled: { label: 'Скасована', variant: 'destructive' as const },
      paused: { label: 'Призупинена', variant: 'secondary' as const }
    };
    return statuses[status as keyof typeof statuses] || { label: status, variant: 'secondary' as const };
  };

  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-accent"></div>
        </div>
      </div>
    );
  }

  if (error || !subscriptionData) {
    return (
      <div className="container py-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Помилка</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button asChild>
            <Link href="/subscription">Повернутися до підписок</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Підписка оформлена!
        </h1>
        <p className="text-gray-600">
          Ваша підписка &quot;{subscriptionData.plan_name}&quot; успішно створена
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {/* Subscription Details */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Деталі підписки
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Номер підписки:</span>
                <span className="font-mono text-sm">#{subscriptionData.id.slice(-8)}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">План:</span>
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${PLAN_COLORS[subscriptionData.plan_id as keyof typeof PLAN_COLORS]}`}>
                    {PLAN_ICONS[subscriptionData.plan_id as keyof typeof PLAN_ICONS]}
                  </div>
                  <span className="text-sm font-medium">{subscriptionData.plan_name}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Статус:</span>
                <Badge variant={getStatusBadge(subscriptionData.status).variant}>
                  {getStatusBadge(subscriptionData.status).label}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Вартість:</span>
                <span className="text-sm font-medium">{subscriptionData.price}₴/місяць</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Максимум книг:</span>
                <span className="text-sm font-medium">{subscriptionData.max_books} одночасно</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Початок:</span>
                <span className="text-sm font-medium">
                  {new Date(subscriptionData.start_date).toLocaleDateString('uk-UA')}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Кінець:</span>
                <span className="text-sm font-medium">
                  {new Date(subscriptionData.end_date).toLocaleDateString('uk-UA')}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Наступні кроки
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-blue-600">1</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Оплата підписки</p>
                  <p className="text-xs text-gray-600">
                    {subscriptionData.status === 'pending' 
                      ? 'Завершіть оплату для активації підписки'
                      : 'Підписка активна та готова до використання'
                    }
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-blue-600">2</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Оренда книг</p>
                  <p className="text-xs text-gray-600">
                    Переглядайте каталог та орендуйте до {subscriptionData.max_books} книг одночасно
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Насолоджуйтесь читанням</p>
                  <p className="text-xs text-gray-600">
                    Книги доставляються безкоштовно згідно з вашим планом
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Plan Benefits */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Переваги вашого плану</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${PLAN_COLORS[subscriptionData.plan_id as keyof typeof PLAN_COLORS]}`}>
                    {PLAN_ICONS[subscriptionData.plan_id as keyof typeof PLAN_ICONS]}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{subscriptionData.plan_name}</h3>
                    <p className="text-sm text-gray-600">
                      {subscriptionData.max_books} книг одночасно • {subscriptionData.price}₴/місяць
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">Включено в план:</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• До {subscriptionData.max_books} книг одночасно</li>
                    <li>• Безкоштовна доставка</li>
                    <li>• Підтримка 24/7</li>
                    <li>• Мобільний додаток</li>
                    {subscriptionData.plan_id === 'premium' && (
                      <>
                        <li>• Пріоритетна підтримка</li>
                        <li>• Ексклюзивні книги</li>
                      </>
                    )}
                    {subscriptionData.plan_id === 'family' && (
                      <>
                        <li>• VIP підтримка</li>
                        <li>• Всі категорії книг</li>
                        <li>• Сімейний кабінет</li>
                        <li>• Персональні рекомендації</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Info */}
          {subscriptionData.status === 'pending' && (
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="text-orange-900">Очікує оплати</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-orange-800 mb-4">
                  Ваша підписка створена, але очікує оплати для активації.
                </p>
                <Button className="w-full">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Завершити оплату
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle>Контакти</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="text-gray-600">
                Маєте питання щодо підписки?
              </p>
              <p className="font-medium">📞 +380 (44) 123-45-67</p>
              <p className="font-medium">📧 support@stefa-books.com.ua</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-center gap-4 mt-8">
        <Button asChild>
          <Link href="/catalog">Переглянути каталог</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/account">Мій кабінет</Link>
        </Button>
      </div>
    </div>
  );
}
