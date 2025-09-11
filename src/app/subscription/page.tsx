'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/Badge';
import { 
  Crown, 
  CheckCircle, 
  Star, 
  Gift, 
  CreditCard,
  BookOpen,
  Users,
  Zap
} from 'lucide-react';
import Link from 'next/link';

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number; // in months
  features: string[];
  popular?: boolean;
  icon: React.ReactNode;
  color: string;
}

const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'mini',
    name: 'Mini',
    description: 'Ідеально для початківців',
    price: 300,
    duration: 1,
    features: [
      '1 книга з можливістю обміну',
      'Самовивіз з точки',
      'Підтримка 24/7',
      'Мобільний додаток'
    ],
    icon: <BookOpen className="h-6 w-6" />,
    color: 'blue'
  },
  {
    id: 'maxi',
    name: 'Maxi',
    description: 'Найпопулярніший вибір',
    price: 500,
    duration: 1,
    features: [
      '2 книги з можливістю обміну',
      'Самовивіз з точки',
      'Пріоритетна підтримка',
      'Ексклюзивні книги',
      'Персональний куратор'
    ],
    popular: true,
    icon: <Crown className="h-6 w-6" />,
    color: 'purple'
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'Для всієї родини',
    price: 1500,
    duration: 6,
    features: [
      '2 книги з можливістю обміну',
      'Самовивіз з точки',
      'VIP підтримка',
      'Всі категорії книг',
      'Сімейний кабінет',
      'Персональні рекомендації',
      'Економія 500₴ за півроку'
    ],
    icon: <Users className="h-6 w-6" />,
    color: 'green'
  }
];

const BENEFITS = [
  {
    icon: <BookOpen className="h-5 w-5" />,
    title: 'Великий вибір книг',
    description: 'Понад 10,000 дитячих книг українською мовою'
  },
  {
    icon: <Zap className="h-5 w-5" />,
    title: 'Швидка доставка',
    description: 'Доставляємо книги в день замовлення'
  },
  {
    icon: <Gift className="h-5 w-5" />,
    title: 'Безкоштовна доставка',
    description: 'Доставка безкоштовна для всіх підписок'
  },
  {
    icon: <Star className="h-5 w-5" />,
    title: 'Якісні книги',
    description: 'Тільки перевірені видавництва та автори'
  }
];

export default function SubscriptionPage() {
  const { user, isAuthenticated } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentSubscription = useCallback(async () => {
    try {
      const response = await fetch(`/api/subscription?email=${user?.email}`);
      const result = await response.json();
      
      if (result.success) {
        setCurrentSubscription(result.subscription);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.email]);

  useEffect(() => {
    if (isAuthenticated && user?.email) {
      fetchCurrentSubscription();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user?.email, fetchCurrentSubscription]);

  const handleSubscribe = async (planId: string) => {
    if (!isAuthenticated) {
      // Redirect to login
      window.location.href = '/auth/login?redirect=/subscription';
      return;
    }

    setSelectedPlan(planId);
    
    try {
      // Создаем платеж через Монобанк
      const paymentResponse = await fetch('/api/payments/monobank', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: getPlanPrice(planId) * 100, // конвертируем в копейки
          currency: 'UAH',
          description: `Підписка Stefa.books - ${planId.toUpperCase()}`,
          order_id: `sub_${Date.now()}_${planId}`,
          customer_email: user?.email,
          customer_name: (user as any)?.name || 'Користувач',
          return_url: `${window.location.origin}/subscription/success`,
          webhook_url: `${window.location.origin}/api/payments/monobank/webhook`
        })
      });

      const paymentResult = await paymentResponse.json();
      
      if (paymentResult.success && paymentResult.payment) {
        // Сохраняем информацию о платеже
        localStorage.setItem('pending_payment', JSON.stringify({
          invoice_id: paymentResult.payment.invoice_id,
          plan_id: planId,
          amount: paymentResult.payment.amount
        }));

        // Перенаправляем на страницу оплаты
        window.location.href = paymentResult.payment.payment_url;
      } else {
        alert(paymentResult.error || 'Помилка при створенні платежу');
      }
    } catch (error) {
      console.error('Error subscribing:', error);
      alert('Помилка при оформленні підписки');
    } finally {
      setSelectedPlan(null);
    }
  };

  const getPlanPrice = (planId: string): number => {
    const prices = {
      mini: 300,
      maxi: 500,
      premium: 1500
    };
    return prices[planId as keyof typeof prices] || 0;
  };

  const getPlanColor = (color: string) => {
    const colors = {
      blue: 'border-blue-200 bg-blue-50',
      purple: 'border-purple-200 bg-purple-50',
      green: 'border-green-200 bg-green-50'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const getPlanIconColor = (color: string) => {
    const colors = {
      blue: 'text-blue-600',
      purple: 'text-purple-600',
      green: 'text-green-600'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-2xl h-8 w-8 border-b-2 border-brand-accent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-h1 text-neutral-900 mb-4">
          Оберіть підписку
        </h1>
        <p className="text-body-lg text-neutral-600 max-w-2xl mx-auto">
          Отримайте необмежений доступ до нашої бібліотеки дитячих книг
        </p>
      </div>

      {/* Current Subscription */}
      {currentSubscription && (
        <Card className="mb-8 border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <div>
                  <h3 className="font-semibold text-green-900">
                    Активна підписка: {currentSubscription.plan_name}
                  </h3>
                  <p className="text-body-sm text-green-700">
                    Дійсна до {new Date(currentSubscription.end_date).toLocaleDateString('uk-UA')}
                  </p>
                </div>
              </div>
              <Badge variant="default" className="bg-green-100 text-green-800">
                Активна
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Benefits */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {BENEFITS.map((benefit, index) => (
          <div key={index} className="text-center">
            <div className="w-12 h-12 bg-brand-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <div className="text-brand-accent">
                {benefit.icon}
              </div>
            </div>
            <h3 className="font-semibold text-neutral-900 mb-2">{benefit.title}</h3>
            <p className="text-body-sm text-neutral-600">{benefit.description}</p>
          </div>
        ))}
      </div>

      {/* Subscription Plans */}
      <div className="grid md:grid-cols-3 gap-8 mb-12">
        {SUBSCRIPTION_PLANS.map((plan) => (
          <Card 
            key={plan.id} 
            className={`relative ${plan.popular ? 'border-brand-accent shadow-lg scale-105' : ''} ${getPlanColor(plan.color)}`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-brand-accent text-neutral-0 px-4 py-1">
                  Популярний
                </Badge>
              </div>
            )}
            
            <CardHeader className="text-center pb-4">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${getPlanColor(plan.color)}`}>
                <div className={getPlanIconColor(plan.color)}>
                  {plan.icon}
                </div>
              </div>
              <CardTitle className="text-h2">{plan.name}</CardTitle>
              <p className="text-neutral-600">{plan.description}</p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-h1 text-neutral-900">
                  {plan.price}₴
                </div>
                <div className="text-neutral-600">
                  {plan.duration === 6 ? 'за півроку' : 'на місяць'}
                </div>
                {plan.duration === 6 && (
                  <div className="text-body-sm text-green-600 mt-1">
                    Економія 500₴
                  </div>
                )}
              </div>

              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span className="text-body-sm text-neutral-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button 
                className="w-full" 
                variant={plan.popular ? 'primary' : 'outline'}
                onClick={() => handleSubscribe(plan.id)}
                disabled={selectedPlan === plan.id}
              >
                {selectedPlan === plan.id ? (
                  <>
                    <div className="animate-spin rounded-2xl h-4 w-4 border-b-2 border-neutral-0 mr-2" />
                    Оформляємо...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Обрати план
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* FAQ */}
      <div className="max-w-3xl mx-auto">
        <h2 className="text-h2 text-neutral-900 text-center mb-8">
          Часті питання
        </h2>
        
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold text-neutral-900 mb-2">
                Як працює підписка?
              </h3>
              <p className="text-neutral-600">
                Ви обираєте план, оплачуєте щомісячну абонплату та отримуєте доступ 
                до оренди книг згідно з обраним планом. Книги доставляються безкоштовно.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold text-neutral-900 mb-2">
                Чи можна скасувати підписку?
              </h3>
              <p className="text-neutral-600">
                Так, ви можете скасувати підписку в будь-який час. 
                Підписка діятиме до кінця поточного періоду.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold text-neutral-900 mb-2">
                Що робити, якщо книга пошкоджена?
              </h3>
              <p className="text-neutral-600">
                При незначних пошкодженнях ми не стягуємо додаткових коштів. 
                При серйозних пошкодженнях стягується вартість книги.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center mt-12">
        <p className="text-neutral-600 mb-4">
          Є питання? Зв&apos;яжіться з нами
        </p>
        <div className="flex gap-4 justify-center">
          <Button variant="outline" asChild>
            <Link href="/contact">Контакти</Link>
          </Button>
          <Button asChild>
            <Link href="/catalog">Переглянути каталог</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
