"use client";

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/Skeleton';
import { AlertCircle, Calendar, CreditCard, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePayment } from '@/hooks/use-payment';

export function SubscriptionManager() {
  const { getUserSubscriptions, cancelSubscription, loading } = usePayment();
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [error] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchSubscriptions = useCallback(async () => {
    try {
      const fetchedSubscriptions = await getUserSubscriptions();
      setSubscriptions(fetchedSubscriptions);
    } catch (err) {
      console.error('Error fetching subscriptions:', err);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить подписки",
        variant: "destructive"
      });
    }
  }, [toast, getUserSubscriptions]);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);


  const handleCancelSubscription = async (subscriptionId: string) => {
    try {
      await cancelSubscription(subscriptionId);
      
      // Update local state
      setSubscriptions(prev => 
        prev.map(sub => 
          sub.id === subscriptionId 
            ? { ...sub, status: 'cancelled' } 
            : sub
        )
      );
      
      toast({
        title: "Успіх",
        description: "Підписка успішно скасована",
      });
    } catch {
      // Error is handled in the hook
    }
  };

  if (loading && subscriptions.length === 0) {
    return (
      <div className="space-y-6">
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-4 w-1/4 mt-2" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-10 w-24" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-body-lg font-semibold text-red-800 mb-2">Помилка завантаження</h2>
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={fetchSubscriptions}>Спробувати знову</Button>
      </div>
    );
  }

  if (subscriptions.length === 0) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
        <CreditCard className="w-12 h-12 text-brand-accent mx-auto mb-4" />
        <h2 className="text-body-lg font-semibold text-blue-800 mb-2">У вас немає активних підписок</h2>
        <p className="text-brand-accent-light mb-4">
          Щоб отримати доступ до книг, оберіть та оплатіть один із планів підписки.
        </p>
        <Button onClick={() => window.location.href = '/plans'}>
          Обрати план
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {subscriptions.map((subscription) => (
        <Card key={subscription.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  {subscription.planName || 'Підписка'}
                </CardTitle>
                <CardDescription>
                  {subscription.planPrice ? `${subscription.planPrice} ₴/міс` : 'Преміум план'}
                </CardDescription>
              </div>
              <span className={`px-2 py-1 rounded-2xl text-caption font-medium ${
                subscription.status === 'active' 
                  ? 'bg-green-100 text-green-800' 
                  : subscription.status === 'cancelled' 
                    ? 'bg-yellow-100 text-yellow-800' 
                    : 'bg-neutral-100 text-neutral-800'
              }`}>
                {subscription.status === 'active' 
                  ? 'Активна' 
                  : subscription.status === 'cancelled' 
                    ? 'Скасована' 
                    : 'Неактивна'}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center text-sm">
                <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                <span>
                  Дійсна до: {new Date(subscription.endDate).toLocaleDateString('uk-UA')}
                </span>
              </div>
              <div className="flex items-center text-sm">
                <User className="w-4 h-4 mr-2 text-muted-foreground" />
                <span>
                  Автопродовження: {subscription.autoRenew ? 'Так' : 'Ні'}
                </span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            {subscription.status === 'active' && (
              <Button 
                variant="outline" 
                onClick={() => handleCancelSubscription(subscription.id)}
                disabled={loading}
              >
                {loading ? 'Обробка...' : 'Скасувати підписку'}
              </Button>
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}