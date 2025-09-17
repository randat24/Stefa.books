"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useSearchParams } from 'next/navigation';
import { usePayment } from '@/hooks/use-payment';

export function PaymentCheckout() {
  const { loading } = usePayment();
  const [paymentData, setPaymentData] = useState<any | null>(null);
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // In a real implementation, this would fetch payment details from the API
    // For now, we'll simulate with mock data
    const paymentId = searchParams?.get('paymentId');
    
    if (paymentId) {
      // Simulate fetching payment data
      setTimeout(() => {
        setPaymentData({
          amount: 299,
          currency: 'UAH',
          description: 'Підписка на базовий план',
          orderId: paymentId,
          userId: 'user_123',
          email: 'user@example.com',
          firstName: 'Іван',
          lastName: 'Петренко'
        });
      }, 500);
    } else {
      router.push('/plans');
    }
  }, [searchParams, router]);

  const handlePayment = async () => {
    if (!paymentData) return;
    
    try {
      // In a real implementation, this would call the payment provider
      // For now, we'll simulate a successful payment
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Оплата успішна",
        description: "Ваш платіж було успішно оброблено!" });
      
      // Redirect to success page
      router.push('/payment/success');
    } catch {
      toast({
        title: "Помилка оплати",
        description: "Сталася помилка під час обробки платежу",
        variant: "destructive"
      });
    }
  };

  if (!paymentData && !searchParams?.get('paymentId')) {
    return (
      <div className="container-default py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Обробка платежу</CardTitle>
            <CardDescription>Зачекайте, будь ласка...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-2xl h-12 w-12 border-b-2 border-brand-accent"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!paymentData) {
    return (
      <div className="container-default py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Помилка</CardTitle>
            <CardDescription>Не вдалося завантажити інформацію про платіж</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p>Платіж не знайдено. Перевірте посилання або зверніться до служби підтримки.</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={() => router.push('/plans')} className="w-full">
              Повернутися до планів
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container-default py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Оплата підписки</CardTitle>
          <CardDescription>
            Перевірте деталі платежу та підтвердіть оплату
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">Деталі платежу</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span className="text-muted-foreground">Опис:</span>
              <span>{paymentData.description}</span>
              
              <span className="text-muted-foreground">Сума:</span>
              <span className="font-semibold">{paymentData.amount} {paymentData.currency}</span>
              
              <span className="text-muted-foreground">Номер замовлення:</span>
              <span>{paymentData.orderId}</span>
            </div>
          </div>
          
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">Платник</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span className="text-muted-foreground">Ім&apos;я:</span>
              <span>{paymentData.firstName} {paymentData.lastName}</span>
              
              <span className="text-muted-foreground">Email:</span>
              <span>{paymentData.email}</span>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">Платіжна інформація</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="cardNumber">Номер картки</Label>
                <Input id="cardNumber" placeholder="0000 0000 0000 0000" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expiry">Термін дії</Label>
                  <Input id="expiry" placeholder="MM/YY" />
                </div>
                <div>
                  <Label htmlFor="cvv">CVV</Label>
                  <Input id="cvv" placeholder="123" />
                </div>
              </div>
              
              <div>
                <Label htmlFor="cardName">Ім&apos;я на картці</Label>
                <Input id="cardName" placeholder="Іван Петренко" />
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button 
            className="w-full" 
            size="lg"
            onClick={handlePayment}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-2xl h-4 w-4 border-b-2 border-neutral-0 mr-2"></div>
                Обробка...
              </>
            ) : (
              `Сплатити ${paymentData.amount} ${paymentData.currency}`
            )}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => router.push('/plans')}
            disabled={loading}
          >
            Скасувати
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}