'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Logger } from '@/lib/logger';
import type { SubscriptionType } from '@/lib/types/subscription';
import { SUBSCRIPTION_PLANS } from '@/lib/types/subscription';

const logger = new Logger('SubscriptionPurchase');

const subscriptionSchema = z.object({
  email: z.string().email('Невірний формат email'),
  name: z.string().min(2, 'Ім\'я повинно містити мінімум 2 символи'),
  phone: z.string().min(10, 'Невірний формат телефону'),
  address: z.string().min(5, 'Адреса повинна містити мінімум 5 символів'),
  subscription_type: z.enum(['mini', 'maxi'])
});

type SubscriptionFormData = z.infer<typeof subscriptionSchema>;

interface SubscriptionPurchaseProps {
  selectedPlan?: SubscriptionType;
  onSuccess?: (data: { subscription_id: string; payment_url: string }) => void;
  onError?: (error: string) => void;
}

export function SubscriptionPurchase({
  selectedPlan = 'mini',
  onSuccess,
  onError
}: SubscriptionPurchaseProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<SubscriptionType>(selectedPlan);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<SubscriptionFormData>({
    resolver: zodResolver(subscriptionSchema),
    defaultValues: {
      subscription_type: selectedPlan
    }
  });

  const handlePurchase = async (data: SubscriptionFormData) => {
    try {
      setIsLoading(true);
      logger.info('Начинаем создание подписки:', data);

      const response = await fetch('/api/subscription/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          subscription_type: selectedType
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Помилка створення підписки');
      }

      logger.info('Подписка создана успешно:', result);

      // Перенаправляем на страницу оплаты
      if (result.redirect_url) {
        window.location.href = result.redirect_url;
      }

      onSuccess?.(result);

    } catch (error) {
      logger.error('Ошибка создания подписки:', error);
      const errorMessage = error instanceof Error ? error.message : 'Невідома помилка';
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const currentPlan = SUBSCRIPTION_PLANS[selectedType];

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-center mb-6">
        Підписка на Stefa Books
      </h2>

      {/* Выбор плана подписки */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => (
          <div
            key={key}
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
              selectedType === key
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setSelectedType(key as SubscriptionType)}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-semibold">{plan.name}</h3>
              <Badge variant={selectedType === key ? 'primary' : 'secondary'}>
                {plan.price} ₴/міс
              </Badge>
            </div>
            <p className="text-gray-600 text-sm mb-3">{plan.description}</p>
            <ul className="space-y-1">
              {plan.features.map((feature, index) => (
                <li key={index} className="text-sm text-gray-700 flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Форма регистрации */}
      <form onSubmit={handleSubmit(handlePurchase)} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Повне ім'я
          </label>
          <input
            {...register('name')}
            type="text"
            id="name"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Іван Петренко"
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            {...register('email')}
            type="email"
            id="email"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="ivan@example.com"
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Телефон
          </label>
          <input
            {...register('phone')}
            type="tel"
            id="phone"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="+380123456789"
          />
          {errors.phone && (
            <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
            Адреса доставки
          </label>
          <textarea
            {...register('address')}
            id="address"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="м. Київ, вул. Хрещатик 1, кв. 10"
          />
          {errors.address && (
            <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
          )}
        </div>

        <div className="border-t pt-4">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-semibold">Обрана підписка:</span>
            <span className="text-xl font-bold text-blue-600">
              {currentPlan.name} - {currentPlan.price} ₴/міс
            </span>
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Створення підписки...' : `Оплатити ${currentPlan.price} ₴`}
          </Button>
        </div>
      </form>

      <div className="mt-6 text-center text-sm text-gray-600">
        <p>
          Натиснувши "Оплатити", ви погоджуєтесь з{' '}
          <a href="/terms" className="text-blue-600 hover:underline">
            умовами користування
          </a>{' '}
          та{' '}
          <a href="/privacy" className="text-blue-600 hover:underline">
            політикою конфіденційності
          </a>
        </p>
      </div>
    </div>
  );
}