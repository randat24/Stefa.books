'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/Badge';
import SubscriptionPayment from '@/components/payment/SubscriptionPayment';
import { CheckCircle, XCircle } from 'lucide-react';

export default function TestPaymentPage() {
  const [selectedTest, setSelectedTest] = useState<'mini' | 'maxi' | null>(null);
  const [result, setResult] = useState<'success' | 'error' | null>(null);
  const [resultData, setResultData] = useState<any>(null);

  const handleSubscriptionSuccess = (data: any) => {
    setResult('success');
    setResultData(data);
    console.log('Payment Success:', data);
  };

  const handleSubscriptionError = (error: string) => {
    setResult('error');
    setResultData({ error });
    console.error('Payment Error:', error);
  };

  const resetTest = () => {
    setSelectedTest(null);
    setResult(null);
    setResultData(null);
  };

  if (result) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {result === 'success' ? (
                <CheckCircle className="h-6 w-6 text-green-600" />
              ) : (
                <XCircle className="h-6 w-6 text-red-600" />
              )}
              {result === 'success' ? 'Тест успішний!' : 'Тест не пройшов'}
            </CardTitle>
            <CardDescription>
              Результат тестування платежної системи
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {result === 'success' && (
              <div className="space-y-3">
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h3 className="font-semibold text-green-800 mb-2">
                    Платіж успішно оброблено
                  </h3>
                  <div className="space-y-2 text-sm text-green-700">
                    <p><strong>План:</strong> {resultData.plan?.name} - {resultData.plan?.price} UAH</p>
                    <p><strong>Клієнт:</strong> {resultData.customer?.name}</p>
                    <p><strong>Email:</strong> {resultData.customer?.email}</p>
                    <p><strong>Invoice ID:</strong> {resultData.payment?.invoice_id}</p>
                  </div>
                </div>
              </div>
            )}

            {result === 'error' && (
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <h3 className="font-semibold text-red-800 mb-2">
                  Помилка при обробці платежу
                </h3>
                <p className="text-sm text-red-700">
                  {resultData?.error || 'Невідома помилка'}
                </p>
              </div>
            )}

            <div className="bg-gray-50 p-4 rounded-lg border">
              <h3 className="font-semibold mb-2">Данні тесту:</h3>
              <pre className="text-xs overflow-auto">
                {JSON.stringify(resultData, null, 2)}
              </pre>
            </div>

            <Button onClick={resetTest} className="w-full">
              Запустити новий тест
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (selectedTest) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Button variant="outline" onClick={resetTest}>
            ← Назад до вибору тесту
          </Button>
        </div>

        <SubscriptionPayment
          defaultPlan={selectedTest}
          onSubscriptionSuccess={handleSubscriptionSuccess}
          onSubscriptionError={handleSubscriptionError}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Тестування платежної системи Monobank</CardTitle>
          <CardDescription>
            Оберіть тариф для тестування інтеграції з Monobank API
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <Card
              className="cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => setSelectedTest('mini')}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Mini Plan</CardTitle>
                  <Badge variant="secondary">300 UAH</Badge>
                </div>
                <CardDescription>Тест оплати тарифу Mini (300 грн/міс)</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1 text-sm">
                  <li>• 1 книга за раз</li>
                  <li>• Безкоштовна доставка</li>
                  <li>• Можливість обміну</li>
                </ul>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => setSelectedTest('maxi')}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Maxi Plan</CardTitle>
                  <Badge variant="default" className="bg-green-600">500 UAH</Badge>
                </div>
                <CardDescription>Тест оплати тарифу Maxi (500 грн/міс)</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1 text-sm">
                  <li>• До 2 книг за раз</li>
                  <li>• Безкоштовна доставка</li>
                  <li>• Пріоритетна підтримка</li>
                  <li>• Доступ до нових надходжень</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Інструкції для тестування</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold">1. Режим роботи</h3>
            <p className="text-sm text-gray-600">
              Якщо в .env.local налаштована змінна <code>MONOBANK_TOKEN</code>,
              система працюватиме з реальним Monobank API. Інакше - в демо-режимі.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">2. Демо-режим</h3>
            <p className="text-sm text-gray-600">
              У демо-режимі ви побачите кнопку "Імітувати оплату", яка симулюватиме успішний платіж.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">3. Реальний режим</h3>
            <p className="text-sm text-gray-600">
              У реальному режимі система створить справжній платіж через Monobank і перенаправить на сторінку оплати.
            </p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-2">Увага!</h3>
            <p className="text-sm text-blue-700">
              У реальному режимі будуть створені справжні платежі.
              Переконайтеся, що використовуєте тестовий токен або готові до справжніх транзакцій.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}