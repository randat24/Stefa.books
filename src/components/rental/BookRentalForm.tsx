'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, MapPin, User, Phone, Mail, CreditCard } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { Book } from '@/lib/supabase';

interface BookRentalFormProps {
  book: Book;
}

const RENTAL_PLANS = [
  { id: 'basic', name: 'Базова оренда (7 днів)', price: 50 },
  { id: 'extended', name: 'Розширена оренда (14 днів)', price: 80 },
  { id: 'premium', name: 'Преміум оренда (30 днів)', price: 120 }
];

const DELIVERY_METHODS = [
  { id: 'pickup', name: 'Самовивіз з бібліотеки', price: 0 },
  { id: 'kyiv', name: 'Доставка по Києву', price: 0 },
  { id: 'ukraine', name: 'Доставка по Україні', price: 30 }
];

export function BookRentalForm({ book }: BookRentalFormProps) {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    plan: 'extended',
    deliveryMethod: 'kyiv',
    firstName: user?.user_metadata?.first_name || '',
    lastName: user?.user_metadata?.last_name || '',
    email: user?.email || '',
    phone: user?.user_metadata?.phone || '',
    address: '',
    city: 'Київ',
    postalCode: '',
    notes: '',
    paymentMethod: 'card'
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const selectedPlan = RENTAL_PLANS.find(plan => plan.id === formData.plan) || RENTAL_PLANS[1];
  const selectedDelivery = DELIVERY_METHODS.find(method => method.id === formData.deliveryMethod) || DELIVERY_METHODS[1];
  const totalPrice = selectedPlan.price + selectedDelivery.price;

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      // Check if user is authenticated
      if (!isAuthenticated) {
        router.push('/auth/login?redirect=/books/' + book.id + '/rent');
        return;
      }

      // Validate required fields
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
        setError('Будь ласка, заповніть всі обов\'язкові поля');
        return;
      }

      // Submit rental request
      const response = await fetch('/api/rent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          book_id: book.id,
          plan: formData.plan,
          delivery_method: formData.deliveryMethod,
          customer_info: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            city: formData.city,
            postal_code: formData.postalCode,
            notes: formData.notes
          },
          payment_method: formData.paymentMethod,
          total_price: totalPrice
        })
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(true);
        // Redirect to confirmation page
        setTimeout(() => {
          router.push(`/rent/confirmation?rental_id=${result.rental_id}`);
        }, 2000);
      } else {
        setError(result.error || 'Помилка при оформленні оренди');
      }
    } catch (error) {
      console.error('Error submitting rental:', error);
      setError('Помилка при оформленні оренди. Спробуйте ще раз.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-body-lg font-semibold text-neutral-900 mb-2">Оренда оформлена!</h3>
            <p className="text-neutral-600 mb-4">
              Ваша заявка на оренду книги &ldquo;{book.title}&rdquo; успішно відправлена.
            </p>
            <p className="text-body-sm text-neutral-500">
              Перенаправляємо на сторінку підтвердження...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Оформити оренду
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert className="mb-6" variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rental Plan */}
          <div>
            <Label htmlFor="plan" className="text-body font-medium">План оренди</Label>
            <Select value={formData.plan} onValueChange={(value) => handleInputChange('plan', value)}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RENTAL_PLANS.map((plan) => (
                  <SelectItem key={plan.id} value={plan.id}>
                    {plan.name} - {plan.price}₴
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Delivery Method */}
          <div>
            <Label htmlFor="deliveryMethod" className="text-body font-medium">Спосіб доставки</Label>
            <Select value={formData.deliveryMethod} onValueChange={(value) => handleInputChange('deliveryMethod', value)}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DELIVERY_METHODS.map((method) => (
                  <SelectItem key={method.id} value={method.id}>
                    {method.name} {method.price > 0 && `(+${method.price}₴)`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Customer Information */}
          <div className="space-y-4">
            <h3 className="text-body-lg font-semibold text-neutral-900 flex items-center gap-2">
              <User className="h-5 w-5" />
              Контактна інформація
            </h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">Ім&apos;я *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Прізвище *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="phone">Телефон *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          {formData.deliveryMethod !== 'pickup' && (
            <div className="space-y-4">
              <h3 className="text-body-lg font-semibold text-neutral-900 flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Адреса доставки
              </h3>
              
              <div>
                <Label htmlFor="address">Адреса</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="mt-1"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">Місто</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="postalCode">Поштовий індекс</Label>
                  <Input
                    id="postalCode"
                    value={formData.postalCode}
                    onChange={(e) => handleInputChange('postalCode', e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Payment Method */}
          <div>
            <Label htmlFor="paymentMethod" className="text-body font-medium">Спосіб оплати</Label>
            <Select value={formData.paymentMethod} onValueChange={(value) => handleInputChange('paymentMethod', value)}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="card">Банківська картка</SelectItem>
                <SelectItem value="cash">Готівка при отриманні</SelectItem>
                <SelectItem value="bank">Банківський переказ</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Додаткові примітки</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Будь-які додаткові побажання щодо доставки або оренди..."
              className="mt-1"
              rows={3}
            />
          </div>

          {/* Total Price */}
          <div className="bg-neutral-50 p-4 rounded-lg">
            <div className="flex justify-between items-center text-body-lg font-semibold">
              <span>Загальна сума:</span>
              <span>{totalPrice} ₴</span>
            </div>
            <div className="text-body-sm text-neutral-600 mt-1">
              {selectedPlan.name} + {selectedDelivery.name}
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full"
            size="lg"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-2xl h-4 w-4 border-b-2 border-neutral-0 mr-2" />
                Оформляємо оренду...
              </>
            ) : (
              <>
                <CreditCard className="h-4 w-4 mr-2" />
                Оформити оренду за {totalPrice} ₴
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
