'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Logger } from '@/lib/logger';

const logger = new Logger('UserProfile');

interface UserData {
  id: string;
  email: string;
  name: string;
  phone?: string;
  address?: string;
  subscription_type?: string;
  subscription_start?: string;
  subscription_end?: string;
  status?: string;
  created_at?: string;
}

export default function UserProfilePage() {
  const params = useParams();
  const userId = params.id as string;
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      fetchUserData(userId);
    }
  }, [userId]);

  const fetchUserData = async (id: string) => {
    try {
      logger.info('Загружаем данные пользователя:', id);

      // Имитируем получение данных пользователя
      // В реальном приложении это был бы запрос к API
      const response = await fetch(`/api/users/${id}`);

      if (!response.ok) {
        throw new Error('Користувач не знайдений');
      }

      const data = await response.json();
      setUserData(data);

    } catch (error) {
      logger.error('Ошибка загрузки данных пользователя:', error);
      setError(error instanceof Error ? error.message : 'Помилка завантаження даних');
    } finally {
      setLoading(false);
    }
  };

  const getSubscriptionStatus = () => {
    if (!userData?.subscription_type) {
      return { label: 'Немає підписки', variant: 'secondary' as const };
    }

    const endDate = userData.subscription_end ? new Date(userData.subscription_end) : null;
    const now = new Date();

    if (endDate && endDate < now) {
      return { label: 'Підписка закінчилась', variant: 'destructive' as const };
    }

    const planName = userData.subscription_type === 'mini' ? 'Mini' : 'Maxi';
    return { label: `Підписка ${planName}`, variant: 'primary' as const };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Завантаження...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Помилка</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button asChild>
            <Link href="/subscription">Оформити підписку</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!userData) {
    return null;
  }

  const subscriptionStatus = getSubscriptionStatus();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Заголовок */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Привіт, {userData.name}!
          </h1>
          <p className="text-gray-600">
            Ваш особистий кабінет Stefa Books
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Основная информация */}
          <div className="lg:col-span-2">
            {/* Профиль */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Профіль</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Ім'я</label>
                  <p className="text-lg">{userData.name}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Email</label>
                  <p className="text-lg">{userData.email}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Телефон</label>
                  <p className="text-lg">{userData.phone || 'Не вказано'}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Статус</label>
                  <div className="mt-1">
                    <Badge variant={subscriptionStatus.variant}>
                      {subscriptionStatus.label}
                    </Badge>
                  </div>
                </div>
              </div>

              {userData.address && (
                <div className="mt-4">
                  <label className="text-sm font-medium text-gray-600">Адреса доставки</label>
                  <p className="text-lg">{userData.address}</p>
                </div>
              )}
            </div>

            {/* Подписка */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Підписка</h2>

              {userData.subscription_type ? (
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Тип підписки</label>
                      <p className="text-lg font-semibold">
                        {userData.subscription_type === 'mini' ? 'Mini (199 ₴/міс)' : 'Maxi (499 ₴/міс)'}
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-600">Статус</label>
                      <div className="mt-1">
                        <Badge variant={subscriptionStatus.variant}>
                          {subscriptionStatus.label}
                        </Badge>
                      </div>
                    </div>

                    {userData.subscription_start && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Початок</label>
                        <p className="text-lg">
                          {new Date(userData.subscription_start).toLocaleDateString('uk-UA')}
                        </p>
                      </div>
                    )}

                    {userData.subscription_end && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Кінець</label>
                        <p className="text-lg">
                          {new Date(userData.subscription_end).toLocaleDateString('uk-UA')}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="bg-blue-50 rounded-lg p-4 mb-4">
                    <h3 className="font-medium text-blue-900 mb-2">Ваші переваги:</h3>
                    <ul className="space-y-1 text-sm text-blue-800">
                      <li>• {userData.subscription_type === 'mini' ? '1 книга' : '3 книги'} одночасно</li>
                      <li>• Безкоштовна доставка по Україні</li>
                      <li>• Підтримка 24/7</li>
                      {userData.subscription_type === 'maxi' && (
                        <>
                          <li>• Пріоритетна підтримка</li>
                          <li>• Ранній доступ до новинок</li>
                        </>
                      )}
                    </ul>
                  </div>

                  <div className="flex gap-3">
                    <Button asChild>
                      <Link href="/catalog">Обрати книги</Link>
                    </Button>
                    <Button variant="outline">
                      Змінити план
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-600 mb-4">У вас немає активної підписки</p>
                  <Button asChild>
                    <Link href="/subscription">Оформити підписку</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Боковая панель */}
          <div className="space-y-6">
            {/* Быстрые действия */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Швидкі дії</h2>

              <div className="space-y-3">
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link href="/catalog">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    Каталог книг
                  </Link>
                </Button>

                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link href="/help">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Довідка
                  </Link>
                </Button>

                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link href="/contact">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 7.89a2 2 0 002.83 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Підтримка
                  </Link>
                </Button>
              </div>
            </div>

            {/* Информация о подписке */}
            {userData.subscription_type && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4">Інформація</h2>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Учасник з:</span>
                    <span className="font-medium">
                      {userData.created_at
                        ? new Date(userData.created_at).toLocaleDateString('uk-UA')
                        : 'Новий користувач'
                      }
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Тип підписки:</span>
                    <span className="font-medium capitalize">{userData.subscription_type}</span>
                  </div>

                  {userData.subscription_end && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Дні до кінця:</span>
                      <span className="font-medium">
                        {Math.max(0, Math.ceil((new Date(userData.subscription_end).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Помощь */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Потрібна допомога?</h2>

              <p className="text-gray-600 text-sm mb-4">
                Наша команда підтримки готова допомогти вам 24/7
              </p>

              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">Email:</span>
                  <a href="mailto:support@stefa-books.com.ua" className="text-blue-600 hover:underline ml-1">
                    support@stefa-books.com.ua
                  </a>
                </div>

                <div>
                  <span className="text-gray-600">Телефон:</span>
                  <a href="tel:+380123456789" className="text-blue-600 hover:underline ml-1">
                    +38 (012) 345-67-89
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}