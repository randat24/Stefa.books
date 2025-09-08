"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function PaymentSuccessPage() {
  return (
    <div className="container-default py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-h2">Оплата успішна!</CardTitle>
          <CardDescription>
            Ваш платіж було успішно оброблено
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-body-lg mb-4">
            Дякуємо за вашу підписку! Ви отримаєте доступ до всіх переваг обраного плану.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
            <h3 className="font-semibold mb-2">Що далі?</h3>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Ваша підписка активована та дійсна до кінця терміну</li>
              <li>Ви можете переглядати та замовляти книги в каталозі</li>
              <li>Статус вашої підписки доступний в особистому кабінеті</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button asChild className="w-full">
            <Link href="/catalog">
              Перейти до каталогу
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/account">
              Особистий кабінет
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}