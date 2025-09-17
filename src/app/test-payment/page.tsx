'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MonobankPayment from '@/components/payment/MonobankPayment';
import { CheckCircle, CreditCard, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function TestPaymentPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [paymentData, setPaymentData] = useState<{
    amount: number;
    description: string;
  }>({ amount: 300, description: 'Підписка MINI - 300 ₴' });

  useEffect(() => {
    const amount = searchParams.get('amount');
    const description = searchParams.get('description');
    setPaymentData({
      amount: amount ? parseInt(amount) : 300,
      description: description || 'Підписка MINI - 300 ₴'
    });
  }, [searchParams]);

  const handlePaymentSuccess = (paymentData: any) => {
    console.log('Payment successful:', paymentData);
    router.push('/payment/success');
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment failed:', error);
    alert(`Помилка оплати: ${error}`);
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
              Оплата підписки
            </h1>
            <p className="text-gray-600">
              Безпечна оплата через Monobank
            </p>
          </div>

          {/* Payment Details */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Деталі платежу:</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Сума:</span>
                <span className="font-semibold">{paymentData.amount} ₴</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Опис:</span>
                <span className="text-sm text-gray-700">{paymentData.description}</span>
              </div>
            </div>
          </div>

          {/* Real Monobank Payment Component */}
          <MonobankPayment
            amount={paymentData.amount}
            description={paymentData.description}
            currency="UAH"
            customerEmail="test@example.com"
            customerName="Тестовий користувач"
            onPaymentSuccess={handlePaymentSuccess}
            onPaymentError={handlePaymentError}
            returnUrl="https://stefa-books.com.ua/payment/success"
          />

          {/* Back Button */}
          <Button
            variant="outline"
            asChild
            className="w-full mt-4"
          >
            <Link href="/subscribe">
              Назад до форми
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}