"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, User } from 'lucide-react';

export default function TestAutoRegistrationPage() {
  const [formData, setFormData] = useState<{
    email: string;
    name: string;
    phone: string;
    plan: 'mini' | 'maxi';
    paymentMethod: string;
  }>({
    email: 'test@example.com',
    name: 'Test User',
    phone: '+380123456789',
    plan: 'mini',
    paymentMethod: 'Онлайн оплата'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<any>(null);
  const [paymentUrl, setPaymentUrl] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setPaymentUrl('');
    setIsLoading(true);

    try {
      // Отправляем заявку на подписку
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          privacyConsent: true
        }),
      });

      const data = await response.json();
      setResult(data);

      if (data.success) {
        if (data.paymentData?.paymentUrl) {
          setPaymentUrl(data.paymentData.paymentUrl);
        }
      } else {
        setError(data.error || 'Ошибка создания заявки');
      }
    } catch (err) {
      setError('Ошибка подключения: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  const simulatePayment = async () => {
    if (!result?.data?.id) return;
    
    setIsLoading(true);
    try {
      // Симулируем успешный платеж через webhook
      const webhookResponse = await fetch('/api/payment/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invoiceId: `test_${Date.now()}`,
          status: 'success',
          amount: formData.plan === 'mini' ? 30000 : 50000, // в копейках
          ccy: 980
        }),
      });

      const webhookResult = await webhookResponse.json();
      setResult((prev: any) => ({ ...prev, webhook: webhookResult }));
    } catch (err) {
      setError('Ошибка симуляции платежа: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
            <User className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Тест автоматической регистрации
          </CardTitle>
          <CardDescription>
            Проверка работы автоматической регистрации после оплаты
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="test@example.com"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="name">Имя</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Test User"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Телефон</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+380123456789"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="plan">План подписки</Label>
              <Select
                value={formData.plan}
                onValueChange={(value: 'mini' | 'maxi') => setFormData(prev => ({ ...prev, plan: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите план" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mini">Mini (300 ₴)</SelectItem>
                  <SelectItem value="maxi">Maxi (500 ₴)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Создание заявки...
                </>
              ) : (
                'Создать заявку на подписку'
              )}
            </Button>
          </form>

          {result && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">Результат создания заявки:</h3>
                <pre className="text-xs overflow-auto max-h-96">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>

              {paymentUrl && (
                <div className="space-y-2">
                  <Alert>
                    <AlertDescription>
                      Ссылка на оплату: <a href={paymentUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{paymentUrl}</a>
                    </AlertDescription>
                  </Alert>
                  
                  <Button onClick={simulatePayment} disabled={isLoading} className="w-full">
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Симуляция платежа...
                      </>
                    ) : (
                      'Симулировать успешный платеж'
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
