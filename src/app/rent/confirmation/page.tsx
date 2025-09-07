'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/Badge';
import { CheckCircle, MapPin, Phone, Mail, BookOpen, Clock } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface RentalData {
  id: string;
  book_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address?: string;
  customer_city?: string;
  customer_postal_code?: string;
  rental_plan: string;
  delivery_method: string;
  payment_method: string;
  total_price: number;
  status: string;
  created_at: string;
  book?: {
    id: string;
    title: string;
    author: string;
    cover_url?: string;
  };
}

export default function RentalConfirmationPage() {
  const searchParams = useSearchParams();
  const rentalId = searchParams?.get('rental_id');
  
  const [rental, setRental] = useState<RentalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (rentalId) {
      fetchRentalDetails(rentalId);
    } else {
      setError('ID оренди не знайдено');
      setLoading(false);
    }
  }, [rentalId]);

  const fetchRentalDetails = async (id: string) => {
    try {
      const response = await fetch(`/api/rent?rental_id=${id}`);
      const result = await response.json();
      
      if (result.success) {
        setRental(result.rental);
      } else {
        setError(result.error || 'Помилка при завантаженні деталей оренди');
      }
    } catch (error) {
      console.error('Error fetching rental details:', error);
      setError('Помилка при завантаженні деталей оренди');
    } finally {
      setLoading(false);
    }
  };

  const getPlanName = (plan: string) => {
    const plans = {
      basic: 'Базова оренда (7 днів)',
      extended: 'Розширена оренда (14 днів)',
      premium: 'Преміум оренда (30 днів)'
    };
    return plans[plan as keyof typeof plans] || plan;
  };

  const getDeliveryName = (method: string) => {
    const methods = {
      pickup: 'Самовивіз з бібліотеки',
      kyiv: 'Доставка по Києву',
      ukraine: 'Доставка по Україні'
    };
    return methods[method as keyof typeof methods] || method;
  };

  const getPaymentName = (method: string) => {
    const methods = {
      card: 'Банківська картка',
      cash: 'Готівка при отриманні',
      bank: 'Банківський переказ'
    };
    return methods[method as keyof typeof methods] || method;
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

  if (error || !rental) {
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Оренда оформлена!</h1>
        <p className="text-gray-600">
          Ваша заявка на оренду успішно відправлена. Ми зв&apos;яжемося з вами найближчим часом.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {/* Rental Details */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Деталі оренди
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Номер заявки:</span>
                <span className="font-mono text-sm">#{rental.id.slice(-8)}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Статус:</span>
                <Badge variant={getStatusBadge(rental.status).variant}>
                  {getStatusBadge(rental.status).label}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">План оренди:</span>
                <span className="text-sm font-medium">{getPlanName(rental.rental_plan)}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Доставка:</span>
                <span className="text-sm font-medium">{getDeliveryName(rental.delivery_method)}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Оплата:</span>
                <span className="text-sm font-medium">{getPaymentName(rental.payment_method)}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Загальна сума:</span>
                <span className="text-lg font-bold text-brand-accent">{rental.total_price} ₴</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Дата створення:</span>
                <span className="text-sm font-medium">
                  {new Date(rental.created_at).toLocaleDateString('uk-UA')}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Контактна інформація
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Ім&apos;я:</span>
                <span className="text-sm font-medium">{rental.customer_name}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">{rental.customer_email}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">{rental.customer_phone}</span>
              </div>
              
              {rental.customer_address && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {rental.customer_address}
                    {rental.customer_city && `, ${rental.customer_city}`}
                    {rental.customer_postal_code && `, ${rental.customer_postal_code}`}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Book Info */}
        <div className="space-y-6">
          {rental.book && (
            <Card>
              <CardHeader>
                <CardTitle>Орендована книга</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  {rental.book.cover_url ? (
                    <Image
                      src={rental.book.cover_url}
                      alt={rental.book.title}
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
                    <h3 className="font-semibold text-gray-900 mb-1">{rental.book.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{rental.book.author}</p>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/books/${rental.book.id}`}>
                        Переглянути книгу
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

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
                  <p className="text-sm font-medium text-gray-900">Підготовка книги</p>
                  <p className="text-xs text-gray-600">Книга буде підготовлена до доставки</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-blue-600">3</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Доставка</p>
                  <p className="text-xs text-gray-600">Книга буде доставлена за вказаною адресою</p>
                </div>
              </div>
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
              <p className="font-medium">📧 info@stefa-books.com.ua</p>
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