'use client';

import { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import MonobankPaymentInfo from '@/components/payment/MonobankPaymentInfo';

interface SubscriptionData {
  subscription: {
    plan: string;
    status: 'active' | 'expired' | 'cancelled' | 'paused' | 'pending';
    start_date: string;
    end_date: string;
    days_left: number;
    is_expired: boolean;
    can_renew: boolean;
    next_billing_date: string;
  };
  availablePlans: Array<{
    id: string;
    name: string;
    description: string;
    price: number;
    currency: string;
    duration: string;
    features: string[];
  }>;
  userStatus: string;
}

export default function SubscriptionManager() {
  const [data, setData] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadSubscriptionData();
  }, []);

  const loadSubscriptionData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/user/subscription');
      const result = await response.json();

      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error || 'Failed to load subscription data');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: string, planId?: string) => {
    try {
      setActionLoading(action);
      const response = await fetch('/api/user/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          planId
        })
      });

      const result = await response.json();
      if (result.success) {
        if (result.data?.paymentUrl) {
          window.location.href = result.data.paymentUrl;
        } else {
          loadSubscriptionData(); // Refresh data
        }
      } else {
        setError(result.error || 'Action failed');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setActionLoading(null);
    }
  };

  const getPlanDisplayName = (planId: string) => {
    const names: Record<string, string> = {
      'basic_monthly': '🌟 Базовий план',
      'premium_monthly': '🚀 Преміум план',
      'premium_yearly': '👑 Преміум річний'
    };
    return names[planId] || planId;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Активна';
      case 'expired': return 'Закінчилася';
      case 'cancelled': return 'Скасована';
      case 'paused': return 'Призупинена';
      case 'pending': return 'Очікує активації';
      default: return status;
    }
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
      <div className="text-center py-8">
        <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-500" />
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={loadSubscriptionData} variant="outline">
          Спробувати знову
        </Button>
      </div>
    );
  }

  if (!data) return null;

  const { subscription, availablePlans } = data;

  return (
    <div className="space-y-6">
      {/* Current Subscription */}
      <Card className={subscription.is_expired ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Поточна підписка
            <Badge className={getStatusColor(subscription.status)}>
              {getStatusText(subscription.status)}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold">
                  {getPlanDisplayName(subscription.plan)}
                </h3>
                <p className="text-sm text-neutral-600">
                  {subscription.status === 'active' 
                    ? `Залишилось днів: ${subscription.days_left}`
                    : `Закінчилася: ${new Date(subscription.end_date).toLocaleDateString('uk-UA')}`
                  }
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-neutral-600">Наступний платіж</p>
                <p className="font-semibold">
                  {subscription.next_billing_date 
                    ? new Date(subscription.next_billing_date).toLocaleDateString('uk-UA')
                    : 'Не заплановано'
                  }
                </p>
              </div>
            </div>

            {subscription.status === 'active' && (
              <div>
                <div className="flex justify-between text-sm text-neutral-600 mb-1">
                  <span>Прогрес підписки</span>
                  <span>{subscription.days_left} днів</span>
                </div>
                <Progress value={(subscription.days_left / 30) * 100} className="h-2" />
              </div>
            )}

            {subscription.is_expired && (
              <div className="flex items-center gap-2 p-3 bg-red-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <span className="text-red-800">
                  Ваша підписка закінчилася. Продовжіть її для доступу до всіх функцій.
                </span>
              </div>
            )}

            <div className="flex gap-2">
              {subscription.is_expired && (
                <Button 
                  onClick={() => handleAction('renew', subscription.plan)}
                  disabled={actionLoading === 'renew'}
                  className="bg-brand-accent hover:bg-brand-accent-light"
                >
                  {actionLoading === 'renew' ? (
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  Продовжити підписку
                </Button>
              )}
              
              <Button 
                variant="outline"
                onClick={() => handleAction('upgrade', 'premium_monthly')}
                disabled={actionLoading === 'upgrade'}
              >
                {actionLoading === 'upgrade' ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <ExternalLink className="h-4 w-4 mr-2" />
                )}
                Оновити план
              </Button>

              {subscription.status === 'active' && (
                <Button 
                  variant="outline"
                  onClick={() => handleAction('cancel')}
                  disabled={actionLoading === 'cancel'}
                  className="text-red-600 hover:text-red-700"
                >
                  {actionLoading === 'cancel' ? (
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Clock className="h-4 w-4 mr-2" />
                  )}
                  Скасувати підписку
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Plans */}
      <Card>
        <CardHeader>
          <CardTitle>Доступні плани підписки</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availablePlans.map((plan) => (
              <Card key={plan.id} className="relative">
                {plan.id === subscription.plan && (
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-green-100 text-green-800">
                      Поточний план
                    </Badge>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  <div className="text-2xl font-bold text-brand-accent">
                    {plan.price} {plan.currency}
                    <span className="text-sm font-normal text-neutral-600">
                      /{plan.duration === 'month' ? 'місяць' : 'рік'}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-neutral-600 mb-4">{plan.description}</p>
                  <ul className="space-y-2 mb-4">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  {plan.id !== subscription.plan && (
                    <Button 
                      className="w-full"
                      onClick={() => handleAction('upgrade', plan.id)}
                      disabled={actionLoading === `upgrade-${plan.id}`}
                    >
                      {actionLoading === `upgrade-${plan.id}` ? (
                        <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <CreditCard className="h-4 w-4 mr-2" />
                      )}
                      {subscription.is_expired ? 'Продовжити' : 'Оновити'}
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payment Info */}
      {subscription.is_expired && (
        <MonobankPaymentInfo
          amount={availablePlans.find(p => p.id === subscription.plan)?.price || 299}
          currency="UAH"
          description={`Продовження підписки ${getPlanDisplayName(subscription.plan)}`}
          orderId={`renew_${Date.now()}`}
        />
      )}
    </div>
  );
}
