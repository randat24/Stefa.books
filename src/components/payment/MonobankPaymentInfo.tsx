'use client';

import { useState, useEffect } from 'react';
import { Copy, Check, CreditCard, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface MonobankPaymentInfoProps {
  amount: number;
  currency: string;
  description?: string;
  orderId?: string;
  className?: string;
}

export default function MonobankPaymentInfo({
  amount,
  currency,
  description,
  orderId,
  className = ''
}: MonobankPaymentInfoProps) {
  const [cardCopied, setCardCopied] = useState(false);
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [uahAmount, setUahAmount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // Номер карты для переводов
  const cardNumber = '5408 8100 4185 0776';
  const cardNumberRaw = '5408810041850776';

  // Копирование номера карты
  const copyCardNumber = async () => {
    try {
      await navigator.clipboard.writeText(cardNumberRaw);
      setCardCopied(true);
      setTimeout(() => setCardCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy card number:', err);
    }
  };

  // Получение курса валют и конвертация
  useEffect(() => {
    const fetchExchangeRate = async () => {
      if (currency === 'USD' && amount) {
        setLoading(true);
        try {
          const response = await fetch('/api/monobank?action=usd-rate');
          const data = await response.json();
          
          if (data.success && data.data.rate) {
            const rate = 1 / data.data.rate; // Конвертируем из UAH/USD в USD/UAH
            setExchangeRate(rate);
            setUahAmount(Math.round(amount * rate * 100) / 100);
          }
        } catch (error) {
          console.error('Error fetching exchange rate:', error);
        } finally {
          setLoading(false);
        }
      } else if (currency === 'UAH') {
        setUahAmount(amount);
      }
    };

    fetchExchangeRate();
  }, [amount, currency]);

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-green-600" />
          Оплата через Monobank
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Информация о сумме */}
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700">Сума до сплати:</p>
              <p className="text-2xl font-bold text-green-900">
                {uahAmount ? `${uahAmount} UAH` : `${amount} ${currency}`}
              </p>
              {exchangeRate && currency === 'USD' && (
                <p className="text-xs text-green-600">
                  Курс: 1 USD = {exchangeRate.toFixed(2)} UAH
                </p>
              )}
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Monobank
            </Badge>
          </div>
        </div>

        {/* Реквизиты для перевода */}
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900">Реквізити для переказу:</h4>
          
          {/* Номер карты */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Номер картки:</p>
                <p className="font-mono text-lg font-semibold">{cardNumber}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={copyCardNumber}
              className="flex items-center gap-2"
            >
              {cardCopied ? (
                <>
                  <Check className="h-4 w-4 text-green-600" />
                  Скопійовано
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Копіювати
                </>
              )}
            </Button>
          </div>

          {/* Описание платежа */}
          {description && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Призначення:</strong> {description}
              </p>
              {orderId && (
                <p className="text-xs text-blue-600 mt-1">
                  ID замовлення: {orderId}
                </p>
              )}
            </div>
          )}

          {/* Инструкции */}
          <div className="p-3 bg-yellow-50 rounded-lg">
            <h5 className="font-semibold text-yellow-800 mb-2">Інструкція:</h5>
            <ol className="text-sm text-yellow-700 space-y-1 list-decimal list-inside">
              <li>Скопіюйте номер картки вище</li>
              <li>Відкрийте додаток Monobank</li>
              <li>Перейдіть до розділу &quot;Перекази&quot;</li>
              <li>Введіть номер картки та суму</li>
              <li>Вкажіть призначення платежу</li>
              <li>Підтвердіть переказ</li>
            </ol>
          </div>
        </div>

        {/* Статус загрузки курса */}
        {loading && (
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
            <span className="ml-2 text-sm text-gray-600">Отримання курсу валют...</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
