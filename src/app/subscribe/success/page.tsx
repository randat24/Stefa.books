'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SubscribeSuccessPage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'pending'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!searchParams) return;
    
    const requestId = searchParams.get('requestId');
    const statusParam = searchParams.get('status');
    
    if (statusParam === 'success') {
      setStatus('success');
      setMessage('Оплата успішно проведена! Ваша підписка активована.');
    } else if (statusParam === 'error') {
      setStatus('error');
      setMessage('Помилка при проведенні оплати. Спробуйте ще раз.');
    } else if (statusParam === 'pending') {
      setStatus('pending');
      setMessage('Оплата в обробці. Ми повідомимо вас про результат.');
    } else {
      setStatus('success');
      setMessage('Заявку успішно надіслано! Ми зв\'яжемося з вами найближчим часом.');
    }
  }, [searchParams]);

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-16 w-16 text-green-600" />;
      case 'error':
        return <XCircle className="h-16 w-16 text-red-600" />;
      case 'pending':
        return <Clock className="h-16 w-16 text-yellow-600" />;
      default:
        return <CheckCircle className="h-16 w-16 text-green-600" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'pending':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-green-50 border-green-200';
    }
  };

  if (status === 'loading') {
    return (
      <div className="section-sm">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <div className="animate-spin rounded-2xl h-8 w-8 border-b-2 border-brand-accent mx-auto mb-4"></div>
            <p className="text-text-muted">Завантаження...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="section-sm">
      <div className="container">
        <div className="max-w-2xl mx-auto">
          <Card className={`${getStatusColor()}`}>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                {getStatusIcon()}
              </div>
              <CardTitle className="text-2xl">
                {status === 'success' && 'Оплата успішна!'}
                {status === 'error' && 'Помилка оплати'}
                {status === 'pending' && 'Оплата в обробці'}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <p className="text-lg text-text-muted">
                {message}
              </p>
              
              <div className="space-y-4">
                <Button asChild className="w-full">
                  <Link href="/books">
                    Переглянути каталог книг
                  </Link>
                </Button>
                
                <Button variant="outline" asChild className="w-full">
                  <Link href="/profile">
                    Перейти до профілю
                  </Link>
                </Button>
                
                {status === 'error' && (
                  <Button variant="outline" asChild className="w-full">
                    <Link href="/subscribe">
                      Спробувати ще раз
                    </Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}