'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/Badge';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

export default function MonobankTest() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [testAmount, setTestAmount] = useState('299');

  const testCurrencyRates = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/monobank?action=currency-rates');
      const data = await response.json();
      setResults({ type: 'currency-rates', data: data.data });
    } catch (err) {
      setError('Ошибка получения курсов валют');
    } finally {
      setLoading(false);
    }
  };

  const testUsdRate = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/monobank?action=usd-rate');
      const data = await response.json();
      setResults({ type: 'usd-rate', data: data.data });
    } catch (err) {
      setError('Ошибка получения курса USD');
    } finally {
      setLoading(false);
    }
  };

  const testClientInfo = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/monobank?action=client-info');
      const data = await response.json();
      setResults({ type: 'client-info', data: data.data });
    } catch (err) {
      setError('Ошибка получения информации о клиенте');
    } finally {
      setLoading(false);
    }
  };

  const testPaymentCheck = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/monobank', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'check-payment',
          account: '5408810041850776',
          amount: parseInt(testAmount),
          description: 'Перевірка платежу'
        })
      });
      const data = await response.json();
      setResults({ type: 'payment-check', data: data.data });
    } catch (err) {
      setError('Помилка перевірки платежу');
    } finally {
      setLoading(false);
    }
  };

  const testConvertUahToUsd = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/monobank', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'convert-uah-to-usd',
          uahAmount: parseInt(testAmount)
        })
      });
      const data = await response.json();
      setResults({ type: 'convert', data: data.data });
    } catch (err) {
      setError('Ошибка конвертации валют');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Badge variant="secondary">Monobank API</Badge>
            Статус інтеграції
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Button 
              onClick={testCurrencyRates} 
              disabled={loading}
              variant="outline"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Курсы валют'}
            </Button>
            
            <Button 
              onClick={testUsdRate} 
              disabled={loading}
              variant="outline"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Курс USD'}
            </Button>
            
            <Button 
              onClick={testClientInfo} 
              disabled={loading}
              variant="outline"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Инфо клиента'}
            </Button>
            
            <Button 
              onClick={testConvertUahToUsd} 
              disabled={loading}
              variant="outline"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Конвертация'}
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <Label htmlFor="testAmount">Сумма для теста:</Label>
            <Input
              id="testAmount"
              type="number"
              value={testAmount}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTestAmount(e.target.value)}
              className="w-32"
            />
            <Button 
              onClick={testPaymentCheck} 
              disabled={loading}
              variant="outline"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Перевірити платіж'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-700">
              <XCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {results && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-5 w-5" />
              Результат теста: {results.type}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm bg-white p-4 rounded border overflow-auto max-h-96">
              {JSON.stringify(results.data, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Інформація про налаштування</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p><strong>Токен:</strong> {'✅ Налаштовано (продакшн)'}</p>
          <p><strong>Номер картки:</strong> 5408 8100 4185 0776</p>
          <p><strong>API Base URL:</strong> https://api.monobank.ua</p>
          <p><strong>Режим:</strong> <span className="text-green-600 font-semibold">Продакшн</span></p>
        </CardContent>
      </Card>
    </div>
  );
}
