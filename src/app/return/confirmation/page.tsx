'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/Badge';
import { CheckCircle, BookOpen, Clock, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface ReturnData {
  id: string;
  book_id: string;
  return_method: string;
  book_condition: string;
  status: string;
  created_at: string;
  notes?: string;
  book?: {
    id: string;
    title: string;
    author: string;
    cover_url?: string;
  };
}

export default function ReturnConfirmationPage() {
  const searchParams = useSearchParams();
  const returnId = searchParams.get('return_id');
  
  const [returnData, setReturnData] = useState<ReturnData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (returnId) {
      fetchReturnDetails(returnId);
    } else {
      setError('ID повернення не знайдено');
      setLoading(false);
    }
  }, [returnId]);

  const fetchReturnDetails = async (id: string) => {
    try {
      const response = await fetch(`/api/return?return_id=${id}`);
      const result = await response.json();
      
      if (result.success) {
        setReturnData(result.return);
      } else {
        setError(result.error || 'Помилка при завантаженні деталей повернення');
      }
    } catch (error) {
      console.error('Error fetching return details:', error);
      setError('Помилка при завантаженні деталей повернення');
    } finally {
      setLoading(false);
    }
  };

  const getReturnMethodName = (method: string) => {
    const methods = {
      pickup: 'Самовивіз в бібліотеку',
      courier: 'Кур\'єрська доставка'
    };
    return methods[method as keyof typeof methods] || method;
  };

  const getConditionName = (condition: string) => {
    const conditions = {
      excellent: 'Відмінний стан',
      good: 'Хороший стан',
      fair: 'Задовільний стан',
      damaged: 'Пошкоджена'
    };
    return conditions[condition as keyof typeof conditions] || condition;
  };

  const getStatusBadge = (status: string) => {
    const statuses = {
      pending: { label: 'Очікує підтвердження', variant: 'secondary' as const },
      confirmed: { label: 'Підтверджено', variant: 'default' as const },
      in_progress: { label: 'В процесі', variant: 'default' as const },
      completed: { label: 'Завершено', variant: 'default' as const },
      cancelled: { label: 'Скасовано', variant: 'destructive' as const }
    };
    return statuses[status as keyof typeof statuses] || { label: status, variant: 'secondary' as const };
  };

  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-accent"></div>
        </div>
      </div>
    );
  }

  if (error || !returnData) {
    return (
      <div className="container py-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Помилка</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button asChild>
            <Link href="/catalog">Перейти до каталогу</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Повернення оформлено!</h1>
        <p className="text-gray-600">
          Ваша заявка на повернення успішно відправлена. Ми зв&apos;яжемося з вами найближчим часом.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {/* Return Details */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RotateCcw className="h-5 w-5" />
                Деталі повернення
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Номер заявки:</span>
                <span className="font-mono text-sm">#{returnData.id.slice(-8)}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Статус:</span>
                <Badge variant={getStatusBadge(returnData.status).variant}>
                  {getStatusBadge(returnData.status).label}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Спосіб повернення:</span>
                <span className="text-sm font-medium">{getReturnMethodName(returnData.return_method)}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Стан книги:</span>
                <span className="text-sm font-medium">{getConditionName(returnData.book_condition)}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Дата створення:</span>
                <span className="text-sm font-medium">
                  {new Date(returnData.created_at).toLocaleDateString('uk-UA')}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Наступні кроки
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-blue-600">1</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Підтвердження заявки</p>
                  <p className="text-xs text-gray-600">Ми зв&apos;яжемося з вами протягом 24 годин</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-blue-600">2</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Повернення книги</p>
                  <p className="text-xs text-gray-600">
                    {returnData.return_method === 'pickup' 
                      ? 'Принесіть книгу в бібліотеку згідно з графіком роботи'
                      : 'Кур\'єр забере книгу за вказаною адресою'
                    }
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Підтвердження повернення</p>
                  <p className="text-xs text-gray-600">Отримайте підтвердження про успішне повернення</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Book Info */}
        <div className="space-y-6">
          {returnData.book && (
            <Card>
              <CardHeader>
                <CardTitle>Повертається книга</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  {returnData.book.cover_url ? (
                    <Image
                      src={returnData.book.cover_url}
                      alt={returnData.book.title}
                      width={80}
                      height={120}
                      className="rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-20 h-30 bg-gray-100 rounded-lg flex items-center justify-center">
                      <BookOpen className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{returnData.book.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{returnData.book.author}</p>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/books/${returnData.book.id}`}>
                        Переглянути книгу
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Return Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>Інструкції по поверненню</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {returnData.return_method === 'pickup' ? (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Самовивіз в бібліотеку</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>Адреса:</strong> вул. Книжкова, 1, Київ</p>
                    <p><strong>Графік роботи:</strong> Пн-Пт 9:00-18:00, Сб 10:00-16:00</p>
                    <p><strong>Телефон:</strong> +380 (44) 123-45-67</p>
                  </div>
                </div>
              ) : (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Кур&apos;єрська доставка</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>Вартість:</strong> 50₴</p>
                    <p><strong>Час забрання:</strong> 1-2 робочі дні</p>
                    <p><strong>Контакт:</strong> +380 (44) 123-45-67</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle>Контакти</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="text-gray-600">
                Маєте питання? Зв&apos;яжіться з нами:
              </p>
              <p className="font-medium">📞 +380 (44) 123-45-67</p>
              <p className="font-medium">📧 returns@stefa-books.com.ua</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-center gap-4 mt-8">
        <Button asChild>
          <Link href="/catalog">Переглянути інші книги</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/account">Мій кабінет</Link>
        </Button>
      </div>
    </div>
  );
}
