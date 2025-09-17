'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/Badge';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface MonobankStatus {
  hasToken: boolean;
  tokenValid: boolean;
  error?: string;
  clientInfo?: any;
}

export default function MonobankStatusPage() {
  const [status, setStatus] = useState<MonobankStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkMonobankStatus();
  }, []);

  const checkMonobankStatus = async () => {
    try {
      const response = await fetch('/api/monobank/client-info');
      const data = await response.json();

      if (response.ok) {
        setStatus({
          hasToken: true,
          tokenValid: true,
          clientInfo: data
        });
      } else {
        setStatus({
          hasToken: true,
          tokenValid: false,
          error: data.error || 'Невідома помилка'
        });
      }
    } catch (error) {
      setStatus({
        hasToken: false,
        tokenValid: false,
        error: 'Токен не налаштований або недоступний'
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = () => {
    if (!status) return null;

    if (!status.hasToken) {
      return (
        <Badge className="bg-red-100 text-red-800">
          <XCircle className="h-4 w-4 mr-1" />
          Токен відсутній
        </Badge>
      );
    }

    if (!status.tokenValid) {
      return (
        <Badge className="bg-orange-100 text-orange-800">
          <AlertTriangle className="h-4 w-4 mr-1" />
          Токен невалідний
        </Badge>
      );
    }

    return (
      <Badge className="bg-green-100 text-green-800">
        <CheckCircle className="h-4 w-4 mr-1" />
        Все працює
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Статус Monobank API
        </h1>
        <p className="text-gray-600">
          Перевірка налаштування системи оплати
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Загальний статус
              {getStatusBadge()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {status?.error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-red-800 font-medium">Помилка:</p>
                <p className="text-red-700">{status.error}</p>
              </div>
            )}

            {!status?.hasToken && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h3 className="font-medium text-orange-800 mb-2">
                  Як налаштувати Monobank токен:
                </h3>
                <ol className="list-decimal list-inside text-orange-700 space-y-1">
                  <li>Зайдіть в особистий кабінет Monobank для бізнесу</li>
                  <li>Перейдіть в розділ "API" або "Інтеграції"</li>
                  <li>Створіть або скопіюйте токен</li>
                  <li>Додайте змінну MONOBANK_TOKEN в .env.local</li>
                  <li>Перезапустіть сервер</li>
                </ol>
              </div>
            )}

            {status?.tokenValid && status.clientInfo && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-medium text-green-800 mb-2">
                  Інформація про клієнта:
                </h3>
                <div className="space-y-2 text-green-700">
                  <p><strong>Ім'я:</strong> {status.clientInfo.name || 'Не вказано'}</p>
                  <p><strong>Статус:</strong> Активний</p>
                  <p><strong>Тип:</strong> {status.clientInfo.type || 'Бізнес'}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Інструкції по налаштуванню</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <h3>Для продакшену:</h3>
              <ol>
                <li>Переконайтеся що у вас є дійсний токен Monobank</li>
                <li>Додайте токен в змінні середовища на сервері</li>
                <li>Демо-режим ВІДКЛЮЧЕНО - всі платежі реальні</li>
                <li>Перевірте webhook URL для обробки платежів</li>
              </ol>

              <h3>Змінні середовища:</h3>
              <pre className="bg-gray-100 p-4 rounded">
{`MONOBANK_TOKEN=your_real_token_here
NEXT_PUBLIC_SITE_URL=https://your-domain.com`}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}