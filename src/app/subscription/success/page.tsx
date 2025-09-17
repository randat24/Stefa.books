'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Logger } from '@/lib/logger';

const logger = new Logger('SubscriptionSuccess');

export default function SubscriptionSuccessPage() {
  const searchParams = useSearchParams();
  const subscriptionId = searchParams.get('subscription');
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (subscriptionId) {
      fetchSubscriptionDetails(subscriptionId);
    } else {
      setError('Не знайдено ID підписки');
      setLoading(false);
    }
  }, [subscriptionId]);

  const fetchSubscriptionDetails = async (id: string) => {
    try {
      logger.info('Загружаем детали подписки:', id);

      // В реальном приложении здесь был бы запрос к API
      // Пока просто имитируем успешную подписку
      setTimeout(() => {
        setSubscriptionData({
          id: id,
          type: 'mini', // или получить из параметров
          status: 'active',
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // +30 дней
          plan: {
            name: 'Mini підписка',
            price: 199,
            features: ['1 книга одночасно', 'Безкоштовна доставка', 'Підтримка 24/7']
          }
        });
        setLoading(false);
      }, 1000);

    } catch (error) {
      logger.error('Ошибка загрузки деталей подписки:', error);
      setError('Помилка завантаження даних підписки');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Завантаження даних підписки...</p>
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
            <Link href="/subscription">Повернутися до підписки</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        {/* Успешное сообщение */}
        <div className="bg-white rounded-lg shadow-lg p-8 text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Підписка успішно оформлена!
          </h1>

          <p className="text-lg text-gray-600 mb-6">
            Дякуємо за довіру! Ваша підписка активна і ви вже можете почати обирати книги.
          </p>

          {subscriptionData && (
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Деталі підписки</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                <div>
                  <span className="text-gray-600">План:</span>
                  <div className="font-semibold">{subscriptionData.plan.name}</div>
                </div>

                <div>
                  <span className="text-gray-600">Статус:</span>
                  <div className="font-semibold text-green-600">Активна</div>
                </div>

                <div>
                  <span className="text-gray-600">Дата початку:</span>
                  <div className="font-semibold">
                    {new Date(subscriptionData.start_date).toLocaleDateString('uk-UA')}
                  </div>
                </div>

                <div>
                  <span className="text-gray-600">Дійсна до:</span>
                  <div className="font-semibold">
                    {new Date(subscriptionData.end_date).toLocaleDateString('uk-UA')}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t">
                <span className="text-gray-600">Ваші переваги:</span>
                <ul className="mt-2 space-y-1">
                  {subscriptionData.plan.features.map((feature: string, index: number) => (
                    <li key={index} className="flex items-center text-sm">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <Button size="lg" asChild>
              <Link href="/catalog">Обрати книги</Link>
            </Button>

            <Button variant="outline" size="lg" asChild>
              <Link href={`/user/${subscriptionId}`}>Особистий кабінет</Link>
            </Button>

            <div className="text-sm text-gray-600">
              <p>
                Електронний чек відправлено на вашу електронну пошту.
                Якщо у вас є питання, зв'яжіться з нашою підтримкою.
              </p>
            </div>
          </div>
        </div>

        {/* Следующие шаги */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Що далі?</h2>

          <div className="space-y-4">
            <div className="flex items-start">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4 mt-1">
                <span className="text-blue-600 font-semibold text-sm">1</span>
              </div>
              <div>
                <h3 className="font-semibold">Оберіть книги</h3>
                <p className="text-gray-600 text-sm">
                  Перегляньте наш каталог і оберіть книги, які вас цікавлять
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4 mt-1">
                <span className="text-blue-600 font-semibold text-sm">2</span>
              </div>
              <div>
                <h3 className="font-semibold">Оформіть замовлення</h3>
                <p className="text-gray-600 text-sm">
                  Додайте книги в кошик і оформіть замовлення на доставку
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4 mt-1">
                <span className="text-blue-600 font-semibold text-sm">3</span>
              </div>
              <div>
                <h3 className="font-semibold">Отримайте книги</h3>
                <p className="text-gray-600 text-sm">
                  Ми доставимо книги безкоштовно прямо до ваших дверей
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t text-center">
            <p className="text-gray-600 mb-4">Потрібна допомога?</p>
            <div className="flex gap-4 justify-center">
              <Button variant="outline" asChild>
                <Link href="/help">Довідка</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/contact">Зв'язатися з нами</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}