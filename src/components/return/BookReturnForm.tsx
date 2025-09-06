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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { MapPin, Package, User, Phone, Mail, RotateCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { Book } from '@/lib/supabase';

interface BookReturnFormProps {
  book: Book;
}

const RETURN_METHODS = [
  { id: 'pickup', name: 'Самовивіз в бібліотеку', description: 'Принесіть книгу безпосередньо в бібліотеку' },
  { id: 'courier', name: 'Кур&apos;єрська доставка', description: 'Замовить кур&apos;єра для забрання книги (50₴)' }
];

const BOOK_CONDITIONS = [
  { id: 'excellent', name: 'Відмінний стан', description: 'Книга в ідеальному стані' },
  { id: 'good', name: 'Хороший стан', description: 'Незначні ознаки використання' },
  { id: 'fair', name: 'Задовільний стан', description: 'Помітні ознаки використання' },
  { id: 'damaged', name: 'Пошкоджена', description: 'Книга має пошкодження' }
];

export function BookReturnForm({ book }: BookReturnFormProps) {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    returnMethod: 'pickup',
    bookCondition: 'excellent',
    firstName: user?.user_metadata?.first_name || '',
    lastName: user?.user_metadata?.last_name || '',
    email: user?.email || '',
    phone: user?.user_metadata?.phone || '',
    address: '',
    city: 'Київ',
    postalCode: '',
    notes: '',
    agreeToTerms: false
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      // Check if user is authenticated
      if (!isAuthenticated) {
        router.push('/auth/login?redirect=/books/' + book.id + '/return');
        return;
      }

      // Validate required fields
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
        setError('Будь ласка, заповніть всі обов\'язкові поля');
        return;
      }

      if (!formData.agreeToTerms) {
        setError('Будь ласка, погодьтеся з умовами повернення');
        return;
      }

      // Submit return request
      const response = await fetch('/api/return', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          book_id: book.id,
          return_method: formData.returnMethod,
          book_condition: formData.bookCondition,
          customer_info: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            city: formData.city,
            postal_code: formData.postalCode,
            notes: formData.notes
          }
        })
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(true);
        // Redirect to confirmation page
        setTimeout(() => {
          router.push(`/return/confirmation?return_id=${result.return_id}`);
        }, 2000);
      } else {
        setError(result.error || 'Помилка при оформленні повернення');
      }
    } catch (error) {
      console.error('Error submitting return:', error);
      setError('Помилка при оформленні повернення. Спробуйте ще раз.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Повернення оформлено!</h3>
            <p className="text-gray-600 mb-4">
              Ваша заявка на повернення книги &quot;{book.title}&quot; успішно відправлена.
            </p>
            <p className="text-sm text-gray-500">
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
          <RotateCcw className="h-5 w-5" />
          Оформити повернення
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert className="mb-6" variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Return Method */}
          <div>
            <Label className="text-base font-medium">Спосіб повернення</Label>
            <RadioGroup 
              value={formData.returnMethod} 
              onValueChange={(value) => handleInputChange('returnMethod', value)}
              className="mt-2"
            >
              {RETURN_METHODS.map((method) => (
                <div key={method.id} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value={method.id} id={method.id} />
                  <div className="flex-1">
                    <Label htmlFor={method.id} className="font-medium cursor-pointer">
                      {method.name}
                    </Label>
                    <p className="text-sm text-gray-600">{method.description}</p>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Book Condition */}
          <div>
            <Label className="text-base font-medium">Стан книги</Label>
            <RadioGroup 
              value={formData.bookCondition} 
              onValueChange={(value) => handleInputChange('bookCondition', value)}
              className="mt-2"
            >
              {BOOK_CONDITIONS.map((condition) => (
                <div key={condition.id} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value={condition.id} id={condition.id} />
                  <div className="flex-1">
                    <Label htmlFor={condition.id} className="font-medium cursor-pointer">
                      {condition.name}
                    </Label>
                    <p className="text-sm text-gray-600">{condition.description}</p>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Customer Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
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
          {formData.returnMethod === 'courier' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Адреса забрання
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

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Додаткові примітки</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Будь-які додаткові коментарі щодо повернення книги..."
              className="mt-1"
              rows={3}
            />
          </div>

          {/* Terms Agreement */}
          <div className="flex items-start space-x-2">
            <input
              type="checkbox"
              id="agreeToTerms"
              checked={formData.agreeToTerms}
              onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
              className="mt-1"
            />
            <Label htmlFor="agreeToTerms" className="text-sm text-gray-600">
              Я погоджуюся з умовами повернення книг та підтверджую, що стан книги відповідає зазначеному вище
            </Label>
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
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Оформляємо повернення...
              </>
            ) : (
              <>
                <RotateCcw className="h-4 w-4 mr-2" />
                Оформити повернення
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
