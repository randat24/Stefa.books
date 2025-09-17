'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { logger } from '@/lib/logger';
import { ExternalLink, CreditCard, Loader2, CheckCircle, XCircle, Clock } from 'lucide-react';

interface MonobankPaymentProps {
  amount: number;
  description: string;
  currency?: string;
  customerEmail?: string;
  customerName?: string;
  onPaymentSuccess?: (paymentData: any) => void;
  onPaymentError?: (error: string) => void;
  returnUrl?: string;
}

interface PaymentData {
  invoice_id: string;
  status: string;
  payment_url: string;
  amount: number;
  currency: string;
  description: string;
  expires_at: string;
  created_at: string;
}

export default function MonobankPayment({
  amount,
  description,
  currency = 'UAH',
  customerEmail,
  customerName,
  onPaymentSuccess,
  onPaymentError,
  returnUrl
}: MonobankPaymentProps) {
  const [payment, setPayment] = useState<PaymentData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  type PaymentStatus = 'pending' | 'success' | 'failed' | 'checking'
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('pending');

  // Створюємо платіж
  const createPayment = async () => {
    setLoading(true);
    setError(null);

    try {
      logger.info('Creating Monobank payment', {
        amount,
        description,
        currency,
        customerEmail
      });

      const response = await fetch('/api/payments/monobank', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount,
          description,
          currency,
          customer_email: customerEmail,
          customer_name: customerName,
          order_id: `order-${Date.now()}`,
          return_url: returnUrl
        })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Помилка створення платежу');
      }

      setPayment(data.payment);
      
      logger.info('Monobank payment created', {
        invoice_id: data.payment.invoice_id,
        payment_url: data.payment.payment_url
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Невідома помилка';
      setError(errorMessage);
      onPaymentError?.(errorMessage);
      
      logger.error('Failed to create Monobank payment', {
        error: errorMessage,
        amount,
        description
      });
    } finally {
      setLoading(false);
    }
  };

  // Перевіряємо статус платежу
  const checkPaymentStatus = async (invoiceId: string) => {
    setPaymentStatus('checking');
    
    try {
      const response = await fetch(`/api/payments/monobank?invoice_id=${invoiceId}`);
      const data = await response.json();

      if (data.success && data.payment) {
        const status = (data.payment.status as PaymentStatus) || 'pending';
        setPaymentStatus(status);

        if (status === 'success') {
          onPaymentSuccess?.(data.payment);
          logger.info('Payment successful', { invoiceId });
        } else if (status === 'failed') {
          onPaymentError?.('Платіж не вдався');
          logger.warn('Payment failed', { invoiceId });
        }
      }
    } catch (err) {
      logger.error('Failed to check payment status', { error: err, invoiceId });
    }
  };

  // Автоматична перевірка статусу кожні 5 секунд, якщо платіж очікує
  useEffect(() => {
    if (payment && paymentStatus === 'pending') {
      const interval = setInterval(() => {
        checkPaymentStatus(payment.invoice_id);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [payment, paymentStatus]);

  const getStatusIcon = () => {
    switch (paymentStatus) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'checking':
        return <Loader2 className="h-5 w-5 animate-spin text-blue-600" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getStatusText = () => {
    switch (paymentStatus) {
      case 'success':
        return 'Платіж успішний';
      case 'failed':
        return 'Платіж не вдався';
      case 'checking':
        return 'Перевіряємо статус...';
      default:
        return 'Очікує оплату';
    }
  };

  const getStatusColor = () => {
    switch (paymentStatus) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'checking':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <XCircle className="h-5 w-5" />
            Помилка платежу
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-red-600">{error}</p>
          <Button onClick={createPayment} variant="outline">
            Спробувати знову
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!payment) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Оплата через Monobank
          </CardTitle>
          <CardDescription>
            Безпечна оплата банківською картою через Monobank
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Сума:</span>
              <span className="font-semibold">{amount} {currency}</span>
            </div>
            <div className="flex justify-between">
              <span>Опис:</span>
              <span className="text-sm">{description}</span>
            </div>
          </div>
          
          <Button 
            onClick={createPayment} 
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Створюємо платіж...
              </>
            ) : (
              'Сплатити через Monobank'
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Платіж Monobank
        </CardTitle>
        <CardDescription>
          Завершіть оплату, перейшовши за посиланням
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span>Статус:</span>
            <Badge className={getStatusColor()}>
              <div className="flex items-center gap-1">
                {getStatusIcon()}
                {getStatusText()}
              </div>
            </Badge>
          </div>
          
          <div className="flex justify-between">
            <span>Сума:</span>
            <span className="font-semibold">{payment.amount} {payment.currency}</span>
          </div>
          
          <div className="flex justify-between">
            <span>Номер платежу:</span>
            <span className="text-sm font-mono">{payment.invoice_id}</span>
          </div>
          
          <div className="flex justify-between text-sm text-gray-600">
            <span>Дійсний до:</span>
            <span>{new Date(payment.expires_at).toLocaleString('uk-UA')}</span>
          </div>
        </div>

        {(paymentStatus === 'pending' || paymentStatus === 'checking') && (
          <div className="space-y-3">
            <Button
              asChild
              className="w-full"
              size="lg"
            >
              <a
                href={payment.payment_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2"
              >
                Перейти до оплати Monobank
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>

            <div className="text-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => checkPaymentStatus(payment.invoice_id)}
                disabled={paymentStatus === 'checking'}
              >
                {paymentStatus === 'checking' ? (
                  <>
                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                    Перевіряємо...
                  </>
                ) : (
                  'Перевірити статус'
                )}
              </Button>
            </div>
          </div>
        )}

        {paymentStatus === 'success' && (
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-5 w-5" />
              <span className="font-semibold">
                Платіж успішно завершено!
              </span>
            </div>
            <p className="text-green-700 text-sm mt-1">
              Дякуємо за оплату! Ваш платіж оброблено через Monobank.
            </p>
          </div>
        )}

        {paymentStatus === 'failed' && (
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <div className="flex items-center gap-2 text-red-800">
              <XCircle className="h-5 w-5" />
              <span className="font-semibold">Платіж не вдався</span>
            </div>
            <p className="text-red-700 text-sm mt-1">
              Сталася помилка під час обробки платежу. Спробуйте знову.
            </p>
            <Button 
              onClick={createPayment} 
              variant="outline" 
              size="sm"
              className="mt-2"
            >
              Створити новий платіж
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}