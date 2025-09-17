'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import MonobankPayment from '@/components/payment/MonobankPayment';
import { logger } from '@/lib/logger';
import { Check, Star, Loader2 } from 'lucide-react';
import { z } from 'zod';

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  duration: string;
  features: string[];
}

interface SubscriptionPaymentProps {
  defaultPlan?: 'mini' | 'maxi';
  onSubscriptionSuccess?: (data: any) => void;
  onSubscriptionError?: (error: string) => void;
}

const CustomerInfoSchema = z.object({
  name: z.string().min(2, 'Ім\'я повинно містити принаймні 2 символи'),
  email: z.string().email('Невірний формат email'),
  phone: z.string().min(10, 'Невірний формат телефону').optional() });

export default function SubscriptionPayment({
  defaultPlan,
  onSubscriptionSuccess,
  onSubscriptionError
}: SubscriptionPaymentProps) {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [showPayment, setShowPayment] = useState(false);

  // Завантажуємо плани підписки
  useEffect(() => {
    const loadPlans = async () => {
      try {
        const response = await fetch('/api/payments?action=plans');
        const data = await response.json();

        if (data.success) {
          setPlans(data.data);

          // Автоматично вибираємо план за замовчуванням
          if (defaultPlan) {
            const plan = data.data.find((p: SubscriptionPlan) => p.id === defaultPlan);
            if (plan) {
              setSelectedPlan(plan);
            }
          }
        } else {
          logger.error('Failed to load subscription plans:', data.error);
        }
      } catch (error) {
        logger.error('Error loading subscription plans:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPlans();
  }, [defaultPlan]);

  const validateCustomerInfo = () => {
    try {
      CustomerInfoSchema.parse(customerInfo);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path.length > 0) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleProceedToPayment = () => {
    if (!selectedPlan) {
      onSubscriptionError?.('Оберіть план підписки');
      return;
    }

    if (!validateCustomerInfo()) {
      return;
    }

    setShowPayment(true);
  };

  const handlePaymentSuccess = (paymentData: any) => {
    logger.info('Subscription payment successful:', {
      plan: selectedPlan?.id,
      amount: selectedPlan?.price,
      payment: paymentData
    });

    onSubscriptionSuccess?.({
      plan: selectedPlan,
      payment: paymentData,
      customer: customerInfo
    });
  };

  const handlePaymentError = (error: string) => {
    logger.error('Subscription payment failed:', { error, plan: selectedPlan?.id });
    onSubscriptionError?.(error);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Завантажуємо плани підписки...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (showPayment && selectedPlan) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Обраний план: {selectedPlan.name}</CardTitle>
            <CardDescription>
              {selectedPlan.description} — {selectedPlan.price} {selectedPlan.currency}/міс
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Клієнт:</strong> {customerInfo.name}</p>
              <p><strong>Email:</strong> {customerInfo.email}</p>
              {customerInfo.phone && <p><strong>Телефон:</strong> {customerInfo.phone}</p>}
            </div>
            <Button
              variant="outline"
              onClick={() => setShowPayment(false)}
              className="mt-4"
            >
              Змінити дані
            </Button>
          </CardContent>
        </Card>

        <MonobankPayment
          amount={selectedPlan.price}
          description={`Підписка ${selectedPlan.name} - ${selectedPlan.description}`}
          currency={selectedPlan.currency}
          customerEmail={customerInfo.email}
          customerName={customerInfo.name}
          onPaymentSuccess={handlePaymentSuccess}
          onPaymentError={handlePaymentError}
          returnUrl={`${process.env.NEXT_PUBLIC_SITE_URL || window.location.origin}/subscription/success`}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Оберіть план підписки</CardTitle>
          <CardDescription>
            Виберіть найкращий план для читання дитячих книг
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className={`cursor-pointer transition-colors ${
                  selectedPlan?.id === plan.id
                    ? 'ring-2 ring-primary bg-primary/5'
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => setSelectedPlan(plan)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                    {plan.id === 'maxi' && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        <Star className="w-3 h-3 mr-1" />
                        Популярний
                      </Badge>
                    )}
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-2xl font-bold">
                      {plan.price} {plan.currency}
                      <span className="text-base font-normal text-gray-600">/міс</span>
                    </div>

                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-sm">
                          <Check className="w-4 h-4 mr-2 text-green-600" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    {selectedPlan?.id === plan.id && (
                      <Badge variant="default" className="w-full justify-center">
                        Обрано
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedPlan && (
        <Card>
          <CardHeader>
            <CardTitle>Контактна інформація</CardTitle>
            <CardDescription>
              Вкажіть дані для оформлення підписки
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Ім'я та прізвище *</Label>
              <Input
                id="name"
                value={customerInfo.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Введіть ваше ім'я"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={customerInfo.email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                placeholder="your@email.com"
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <Label htmlFor="phone">Телефон (необов'язково)</Label>
              <Input
                id="phone"
                value={customerInfo.phone}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+380XXXXXXXXX"
                className={errors.phone ? 'border-red-500' : ''}
              />
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
            </div>

            <Button
              onClick={handleProceedToPayment}
              className="w-full"
              size="lg"
            >
              Продовжити до оплати — {selectedPlan.price} {selectedPlan.currency}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}