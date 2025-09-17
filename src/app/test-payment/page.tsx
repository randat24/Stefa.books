'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, CreditCard, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function TestPaymentPage() {
  const searchParams = useSearchParams();
  const [paymentData, setPaymentData] = useState<{
    amount: string | null;
    description: string | null;
  }>({ amount: null, description: null });

  useEffect(() => {
    const amount = searchParams.get('amount');
    const description = searchParams.get('description');
    setPaymentData({ amount, description });
  }, [searchParams]);

  const handlePayment = () => {
    // Имитируем успешную оплату
    alert('Тестовая оплата успешна! В реальной версии здесь будет интеграция с Monobank.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
              <CreditCard className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Тестовая оплата
            </h1>
            <p className="text-gray-600">
              Это тестовая страница для демонстрации процесса оплаты
            </p>
          </div>

          {/* Payment Details */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Детали платежа:</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Сумма:</span>
                <span className="font-semibold">{paymentData.amount} ₴</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Описание:</span>
                <span className="text-sm text-gray-700">{paymentData.description}</span>
              </div>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
              <div>
                <h4 className="font-semibold text-yellow-800 mb-1">Тестовый режим</h4>
                <p className="text-sm text-yellow-700">
                  В реальной версии здесь будет интеграция с Monobank. 
                  Для настройки реальных платежей нужно добавить MONOBANK_API_TOKEN в переменные окружения.
                </p>
              </div>
            </div>
          </div>

          {/* Payment Button */}
          <Button 
            onClick={handlePayment}
            className="w-full mb-4"
            size="lg"
          >
            <CreditCard className="h-5 w-5 mr-2" />
            Оплатити {paymentData.amount} ₴
          </Button>

          {/* Back Button */}
          <Button 
            variant="outline" 
            asChild 
            className="w-full"
          >
            <Link href="/subscribe">
              Назад до форми
            </Link>
          </Button>

          {/* Success Message (hidden by default) */}
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg hidden" id="success-message">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
              <div>
                <h4 className="font-semibold text-green-800">Оплата успішна!</h4>
                <p className="text-sm text-green-700">
                  Ваша підписка активована. Дякуємо за довіру!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}