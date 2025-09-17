'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { logger } from '@/lib/logger';
import { 
  CreditCard, 
  User, 
  Building2, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle, 
  Info,
  Loader2 
} from 'lucide-react';

interface ClientInfo {
  clientId: string;
  name: string;
  webHookUrl?: string;
  permissions: string[];
  accounts: Array<{
    id: string;
    sendId: string;
    balance: number;
    creditLimit: number;
    type: string;
    currencyCode: number;
    cashbackType?: string;
  }>;
}

interface StatementItem {
  id: string;
  time: number;
  description: string;
  mcc: number;
  amount: number;
  operationAmount: number;
  currencyCode: number;
  commissionRate: number;
  cashbackAmount: number;
  balance: number;
  hold: boolean;
}

export default function MonobankInfo() {
  const [clientInfo, setClientInfo] = useState<ClientInfo | null>(null);
  const [statements, setStatements] = useState<StatementItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Отримуємо інформацію про клієнта
  const fetchClientInfo = async () => {
    setLoading(true);
    setError(null);

    try {
      logger.info('Fetching Monobank client info');
      
      const response = await fetch('/api/monobank/client-info');
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Помилка отримання даних');
      }

      setClientInfo(data.data);
      setLastUpdate(new Date());
      
      logger.info('Client info received', { 
        clientId: data.data.clientId,
        accountsCount: data.data.accounts?.length 
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Невідома помилка';
      setError(errorMessage);
      logger.error('Failed to fetch client info', { error: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  // Отримуємо виписку по рахунку
  const fetchStatement = async (accountId: string) => {
    if (!clientInfo) return;

    setLoading(true);
    setError(null);

    try {
      // Отримуємо виписку за останні 30 днів
      const fromDate = Math.floor((Date.now() - 30 * 24 * 60 * 60 * 1000) / 1000);
      
      const response = await fetch(`/api/monobank/statement?account=${accountId}&from=${fromDate}`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Помилка отримання виписки');
      }

      setStatements(data.data || []);
      logger.info('Statement received', { 
        accountId,
        transactionsCount: data.data?.length 
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Невідома помилка';
      setError(errorMessage);
      logger.error('Failed to fetch statement', { error: errorMessage, accountId });
    } finally {
      setLoading(false);
    }
  };

  // Форматування валюти
  const formatCurrency = (amount: number, currencyCode: number = 980) => {
    const currency = currencyCode === 980 ? 'UAH' : 
                    currencyCode === 840 ? 'USD' : 
                    currencyCode === 978 ? 'EUR' : 'UAH';
    
    return new Intl.NumberFormat('uk-UA', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2 }).format(amount / 100);
  };

  // Форматування дати
  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString('uk-UA');
  };

  // Автоматично завантажуємо дані при монтуванні
  useEffect(() => {
    fetchClientInfo();
  }, []);

  return (
    <div className="space-y-6">
      {/* Заголовок та контроли */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">
            Інтеграція з Monobank
          </h2>
          <p className="text-neutral-600">
            Інформація про ваш Monobank акаунт через особистий API
          </p>
        </div>
        
        <Button
          onClick={fetchClientInfo}
          disabled={loading}
          variant="outline"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Оновити
        </Button>
      </div>

      {/* Статус API */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Статус інтеграції
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                <span>Особистий API</span>
              </div>
              <Badge className="bg-blue-100 text-blue-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Активний
              </Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-orange-600" />
                <span>Комерційний API</span>
              </div>
              <Badge className="bg-orange-100 text-orange-800">
                <AlertCircle className="h-3 w-3 mr-1" />
                Не налаштовано
              </Badge>
            </div>
          </div>
          
          {lastUpdate && (
            <p className="text-sm text-neutral-500 mt-3">
              Останнє оновлення: {lastUpdate.toLocaleString('uk-UA')}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Помилка */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-5 w-5" />
              <span className="font-semibold">Помилка</span>
            </div>
            <p className="text-red-700 mt-1">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Інформація про клієнта */}
      {clientInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Інформація про клієнта
            </CardTitle>
            <CardDescription>
              Дані з особистого API Monobank
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-neutral-600">Ім&apos;я клієнта</label>
                  <p className="text-neutral-900">{clientInfo.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-600">ID клієнта</label>
                  <p className="text-neutral-900 font-mono text-sm">{clientInfo.clientId}</p>
                </div>
              </div>
              
              {clientInfo.webHookUrl && (
                <div>
                  <label className="text-sm font-medium text-neutral-600">Webhook URL</label>
                  <p className="text-neutral-900 text-sm break-all">{clientInfo.webHookUrl}</p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-neutral-600">Дозволи</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {clientInfo.permissions.map((permission) => (
                    <Badge key={permission} variant="secondary">
                      {permission}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Рахунки */}
      {clientInfo?.accounts && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Рахунки ({clientInfo.accounts.length})
            </CardTitle>
            <CardDescription>
              Ваші банківські рахунки та картки
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {clientInfo.accounts.map((account) => (
                <div
                  key={account.id}
                  className="border rounded-lg p-4 hover:bg-neutral-50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-neutral-600" />
                      <span className="font-medium">
                        {account.type === 'black' ? 'Чорна картка' :
                         account.type === 'white' ? 'Біла картка' :
                         account.type === 'platinum' ? 'Платинова картка' :
                         account.type}
                      </span>
                    </div>
                    <Badge 
                      className={
                        account.balance >= 0 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }
                    >
                      {formatCurrency(account.balance, account.currencyCode)}
                    </Badge>
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <label className="text-neutral-600">ID рахунку</label>
                      <p className="font-mono text-xs">{account.id}</p>
                    </div>
                    <div>
                      <label className="text-neutral-600">Send ID</label>
                      <p className="font-mono text-xs">{account.sendId}</p>
                    </div>
                    <div>
                      <label className="text-neutral-600">Кредитний ліміт</label>
                      <p>{formatCurrency(account.creditLimit, account.currencyCode)}</p>
                    </div>
                  </div>
                  
                  <div className="mt-3 flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => fetchStatement(account.id)}
                      disabled={loading}
                    >
                      Показати виписку
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Виписка */}
      {statements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Виписка по рахунку</CardTitle>
            <CardDescription>
              Останні {statements.length} операцій за 30 днів
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {statements.slice(0, 10).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.description}</p>
                    <p className="text-xs text-neutral-500">
                      {formatDate(item.time)} • MCC: {item.mcc}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${
                      item.amount > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(item.amount, item.currencyCode)}
                    </p>
                    <p className="text-xs text-neutral-500">
                      Баланс: {formatCurrency(item.balance, item.currencyCode)}
                    </p>
                  </div>
                </div>
              ))}
              
              {statements.length > 10 && (
                <p className="text-center text-sm text-neutral-500 pt-2">
                  ... та ще {statements.length - 10} операцій
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Інформація про продакшн режим */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <CheckCircle className="h-5 w-5" />
            Продакшн режим платежів
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-green-700 space-y-2">
            <p>
              Система налаштована для реальних платежів через Monobank:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Платіжні посилання ведуть на реальну сторінку Monobank</li>
              <li>Всі платежі обробляються через справжню платіжну систему</li>
              <li>Webhook&apos;и налаштовані для обробки реальних платежів</li>
              <li>Кошти списуються з реальних карток клієнтів</li>
            </ul>
            <p className="text-sm font-medium">
              Система готова для прийому реальних платежів через Monobank.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}