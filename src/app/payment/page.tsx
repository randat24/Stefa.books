'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MonobankPayment from '@/components/payment/MonobankPayment';
import { CheckCircle, CreditCard, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface SubscriptionPlan {
  id: 'mini' | 'maxi';
  name: string;
  price: number;
  description: string;
  features: string[];
}

const SUBSCRIPTION_PLANS: Record<string, SubscriptionPlan> = {
  mini: {
    id: 'mini',
    name: 'MINI',
    price: 300,
    description: 'Базова підписка',
    features: ['До 5 книг на місяць', 'Доставка по Україні', 'Підтримка 24/7']
  },
  maxi: {
    id: 'maxi',
    name: 'MAXI',
    price: 500,
    description: 'Розширена підписка',
    features: ['Необмежена кількість книг', 'Швидка доставка', 'Пріоритетна підтримка', 'Ексклюзивні новинки']
  }
};

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [paymentData, setPaymentData] = useState<{
    plan: SubscriptionPlan;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    amount: number;
    description: string;
  } | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const planType = searchParams.get('plan') as 'mini' | 'maxi';
    const name = searchParams.get('name') || '';
    const email = searchParams.get('email') || '';
    const phone = searchParams.get('phone') || '';

    if (!planType || !SUBSCRIPTION_PLANS[planType] || !name || !email) {
      // Если параметры неполные - перенаправляем на страницу подписки
      router.push('/subscribe');
      return;
    }

    const plan = SUBSCRIPTION_PLANS[planType];
    setPaymentData({
      plan,
      customerName: name,
      customerEmail: email,
      customerPhone: phone,
      amount: plan.price,
      description: `Підписка ${plan.name} - ${plan.price} ₴`
    });
    setLoading(false);
  }, [searchParams, router]);

  const handlePaymentSuccess = async (paymentResult: any) => {
    console.log('Payment successful:', paymentResult);

    // Перенаправляем на страницу успеха с информацией о платеже
    router.push(`/payment/success?payment_id=${paymentResult.invoice_id}&plan=${paymentData?.plan.id}`);
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment failed:', error);
    alert(`Помилка оплати: ${error}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Завантаження...</p>
        </div>
      </div>
    );
  }

  if (!paymentData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Параметри оплати не знайдено</p>
          <Link href="/subscribe">
            <Button>Повернутися до підписки</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Хлебные крошки */}
        <div className="mb-6">
          <Link href="/subscribe" className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Повернутися до вибору підписки
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
              <CreditCard className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Оплата підписки
            </h1>
            <p className="text-gray-600">
              Безпечна оплата через Monobank
            </p>
          </div>

          {/* План и детали */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-gray-900 mb-4 text-lg">Деталі замовлення:</h3>

            {/* Выбранный план */}
            <div className="bg-white rounded-lg p-4 mb-4 border-2 border-blue-200">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-bold text-xl text-blue-600">Підписка {paymentData.plan.name}</h4>
                <span className="font-bold text-2xl text-gray-900">{paymentData.plan.price} ₴</span>
              </div>
              <p className="text-gray-600 mb-3">{paymentData.plan.description}</p>
              <div className="flex flex-wrap gap-2">
                {paymentData.plan.features.map((feature, index) => (
                  <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {feature}
                  </span>
                ))}
              </div>
            </div>

            {/* Информация о клиенте */}
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-600 text-sm">Ім'я:</span>
                  <p className="font-semibold">{paymentData.customerName}</p>
                </div>
                <div>
                  <span className="text-gray-600 text-sm">Email:</span>
                  <p className="font-semibold">{paymentData.customerEmail}</p>
                </div>
              </div>
              {paymentData.customerPhone && (
                <div>
                  <span className="text-gray-600 text-sm">Телефон:</span>
                  <p className="font-semibold">{paymentData.customerPhone}</p>
                </div>
              )}
              <div className="pt-3 border-t">
                <div className="flex justify-between items-center text-lg">
                  <span className="font-semibold">До сплати:</span>
                  <span className="font-bold text-2xl text-blue-600">{paymentData.amount} ₴</span>
                </div>
              </div>
            </div>
          </div>

          {/* Компонент оплаты Monobank */}
          <MonobankPayment
            amount={paymentData.amount}
            description={paymentData.description}
            currency="UAH"
            customerEmail={paymentData.customerEmail}
            customerName={paymentData.customerName}
            onPaymentSuccess={handlePaymentSuccess}
            onPaymentError={handlePaymentError}
            returnUrl={`${process.env.NEXT_PUBLIC_SITE_URL}/payment/success`}
          />

          {/* Безопасность */}
          <div className="mt-8 p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center mb-2">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <span className="font-semibold text-green-800">Безпечна оплата</span>
            </div>
            <p className="text-green-700 text-sm">
              Ваші дані захищені 256-бітним SSL шифруванням. Платіж обробляється через надійну платіжну систему Monobank.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}