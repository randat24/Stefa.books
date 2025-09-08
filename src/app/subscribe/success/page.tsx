"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SubscribeSuccessPage() {
  const searchParams = useSearchParams();
  const requestId = searchParams?.get('requestId');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Симулируем загрузку для лучшего UX
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-yellow mx-auto mb-4"></div>
          <p className="text-gray-600">Обробляємо вашу заявку...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          {/* Иконка успеха */}
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>

          {/* Заголовок */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Заявку успішно надіслано!
          </h1>

          {/* Описание */}
          <div className="space-y-4 mb-8">
            <p className="text-gray-600">
              Дякуємо за ваш інтерес до нашої бібліотеки! 
              Ми отримали вашу заявку на підписку.
            </p>
            
            {requestId && (
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-1">Номер заявки:</p>
                <p className="font-mono text-sm text-gray-800">{requestId}</p>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Що далі?</h3>
              <ul className="text-sm text-blue-800 space-y-1 text-left">
                <li>• Ми зв'яжемося з вами протягом 24 годин</li>
                <li>• Підтвердимо деталі підписки</li>
                <li>• Надішлемо інструкції по доступу</li>
              </ul>
            </div>
          </div>

          {/* Кнопки действий */}
          <div className="space-y-3">
            <Button asChild className="w-full bg-brand-yellow hover:bg-brand-yellow-dark text-gray-900">
              <Link href="/catalog">
                Переглянути каталог книг
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="w-full">
              <Link href="/" className="flex items-center justify-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Повернутися на головну
              </Link>
            </Button>
          </div>

          {/* Контактная информация */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-2">Маєте питання?</p>
            <div className="space-y-1 text-sm text-gray-600">
              <p>📧 Email: info@stefa.books.com.ua</p>
              <p>📱 Telegram: @stefa_books</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
