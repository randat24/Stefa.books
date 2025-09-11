'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PaymentStatus {
  status: 'loading' | 'success' | 'failed' | 'pending';
  message: string;
  invoice_id?: string;
  plan_name?: string;
  amount?: number;
}

export default function SubscriptionSuccessPage() {
  const router = useRouter();
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>({
    status: 'loading',
    message: 'Перевіряємо статус платежу...'
  });

  useEffect(() => {
    checkPaymentStatus();
  }, []);

  const checkPaymentStatus = async () => {
    try {
      // Получаем данные о платеже из localStorage
      const pendingPayment = localStorage.getItem('pending_payment');
      if (!pendingPayment) {
        setPaymentStatus({
          status: 'failed',
          message: 'Дані про платеж не знайдені'
        });
        return;
      }

      const { invoice_id, plan_id, amount } = JSON.parse(pendingPayment);

      // Проверяем статус платежа
      const response = await fetch(`/api/payments/monobank?invoice_id=${invoice_id}`);
      const result = await response.json();

      if (result.success && result.payment) {
        const { status } = result.payment;
        
        if (status === 'success') {
          setPaymentStatus({
            status: 'success',
            message: 'Платіж успішно проведено! Підписка активована.',
            invoice_id,
            plan_name: plan_id.toUpperCase(),
            amount: amount / 100 // конвертируем обратно в гривны
          });
          
          // Очищаем localStorage
          localStorage.removeItem('pending_payment');
        } else if (status === 'failed') {
          setPaymentStatus({
            status: 'failed',
            message: 'Платіж не вдався. Спробуйте ще раз.',
            invoice_id
          });
        } else {
          setPaymentStatus({
            status: 'pending',
            message: 'Платіж обробляється. Оновіть сторінку через кілька хвилин.',
            invoice_id
          });
        }
      } else {
        setPaymentStatus({
          status: 'failed',
          message: 'Помилка при перевірці статусу платежу'
        });
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
      setPaymentStatus({
        status: 'failed',
        message: 'Помилка при перевірці статусу платежу'
      });
    }
  };

  const getStatusIcon = () => {
    switch (paymentStatus.status) {
      case 'success':
        return <CheckCircle className="h-16 w-16 text-green-600" />;
      case 'failed':
        return <AlertCircle className="h-16 w-16 text-red-600" />;
      case 'pending':
        return <Loader2 className="h-16 w-16 text-yellow-600 animate-spin" />;
      default:
        return <Loader2 className="h-16 w-16 text-blue-600 animate-spin" />;
    }
  };

  const getStatusColor = () => {
    switch (paymentStatus.status) {
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'failed':
        return 'border-red-200 bg-red-50';
      case 'pending':
        return 'border-yellow-200 bg-yellow-50';
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };

  return (
    <div className="container py-8">
      <div className="max-w-2xl mx-auto">
        <Card className={`${getStatusColor()}`}>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              {getStatusIcon()}
            </div>
            <CardTitle className="text-2xl">
              {paymentStatus.status === 'success' && 'Платіж успішний!'}
              {paymentStatus.status === 'failed' && 'Платіж не вдався'}
              {paymentStatus.status === 'pending' && 'Обробка платежу'}
              {paymentStatus.status === 'loading' && 'Перевірка платежу'}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="text-center space-y-4">
            <p className="text-lg text-neutral-700">
              {paymentStatus.message}
            </p>

            {paymentStatus.invoice_id && (
              <div className="bg-white p-4 rounded-lg border">
                <p className="text-sm text-neutral-600">
                  <strong>ID платежу:</strong> {paymentStatus.invoice_id}
                </p>
                {paymentStatus.plan_name && (
                  <p className="text-sm text-neutral-600">
                    <strong>План:</strong> {paymentStatus.plan_name}
                  </p>
                )}
                {paymentStatus.amount && (
                  <p className="text-sm text-neutral-600">
                    <strong>Сума:</strong> {paymentStatus.amount} ₴
                  </p>
                )}
              </div>
            )}

            <div className="flex gap-4 justify-center">
              {paymentStatus.status === 'success' && (
                <>
                  <Button onClick={() => router.push('/profile')}>
                    Мій профіль
                  </Button>
                  <Button variant="outline" onClick={() => router.push('/catalog')}>
                    Переглянути каталог
                  </Button>
                </>
              )}
              
              {paymentStatus.status === 'failed' && (
                <>
                  <Button onClick={() => router.push('/subscription')}>
                    Спробувати знову
                  </Button>
                  <Button variant="outline" onClick={() => router.push('/contact')}>
                    Зв&apos;язатися з підтримкою
                  </Button>
                </>
              )}
              
              {paymentStatus.status === 'pending' && (
                <>
                  <Button onClick={checkPaymentStatus}>
                    Перевірити знову
                  </Button>
                  <Button variant="outline" onClick={() => router.push('/subscription')}>
                    Назад до підписок
                  </Button>
                </>
              )}
              
              {paymentStatus.status === 'loading' && (
                <Button variant="outline" onClick={() => router.push('/subscription')}>
                  Назад до підписок
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
