"use client";

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/Skeleton';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePayment } from '@/hooks/use-payment';

export function SubscriptionPlans() {
  const { getSubscriptionPlans, createSubscription, loading } = usePayment();
  const [plans, setPlans] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchPlans = useCallback(async () => {
    try {
      const fetchedPlans = await getSubscriptionPlans();
      setPlans(fetchedPlans);
    } catch {
      setError('Не вдалося завантажити плани підписки');
    }
  }, [getSubscriptionPlans]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const handleSubscribe = async (planId: string) => {
    try {
      await createSubscription(planId);
      // In a real implementation, you might redirect to a success page or update UI
      toast({
        title: "Успіх",
        description: "Підписка успішно створена!",
      });
    } catch {
      // Error is handled in the hook
    }
  };

  if (loading && plans.length === 0) {
    return (
      <div className="container-default py-8">
        <h1 className="h1 mb-8">Тарифи підписки</h1>
        <div className="grid md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-1/2 mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-12 w-1/3 mb-4" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-4/5" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-default py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-800 mb-2">Помилка завантаження</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchPlans}>Спробувати знову</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-default py-8">
      <h1 className="h1 mb-8">Оберіть свій план підписки</h1>
      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card key={plan.id} className="flex flex-col">
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="text-3xl font-bold text-blue-600">
                {plan.price} ₴
                <span className="text-lg text-gray-500">/{plan.duration === 'month' ? 'міс' : plan.duration === 'year' ? 'рік' : 'квартал'}</span>
              </div>
              <ul className="mt-4 space-y-2">
                {plan.features.map((feature: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={() => handleSubscribe(plan.id)}
                disabled={loading}
              >
                {loading ? 'Обробка...' : 'Обрати план'}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}