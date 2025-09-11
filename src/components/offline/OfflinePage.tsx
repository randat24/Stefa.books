'use client';

import { useState, useEffect } from 'react';
import { WifiOff, BookOpen, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

interface OfflinePageProps {
  title?: string;
  description?: string;
  showRetry?: boolean;
  showHomeLink?: boolean;
}

export function OfflinePage({ 
  title = "Немає з'єднання",
  description = "Перевірте підключення до інтернету та спробуйте знову",
  showRetry = true,
  showHomeLink = true
}: OfflinePageProps) {
  const [isOnline, setIsOnline] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    const checkConnection = () => {
      setIsOnline(navigator.onLine);
    };

    checkConnection();
    
    window.addEventListener('online', checkConnection);
    window.addEventListener('offline', checkConnection);

    return () => {
      window.removeEventListener('online', checkConnection);
      window.removeEventListener('offline', checkConnection);
    };
  }, []);

  const handleRetry = async () => {
    setIsRetrying(true);
    
    try {
      const response = await fetch('/api/health', {
        method: 'GET',
        cache: 'no-cache'
      });
      
      if (response.ok) {
        // Если соединение восстановлено, перезагружаем страницу
        window.location.reload();
      } else {
        throw new Error('Health check failed');
      }
    } catch (error) {
      console.error('Connection test failed:', error);
      // Показываем сообщение об ошибке
      setTimeout(() => setIsRetrying(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Иконка */}
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto bg-red-100 rounded-2xl flex items-center justify-center">
            <WifiOff className="w-12 h-12 text-red-600" />
          </div>
        </div>

        {/* Заголовок */}
        <h1 className="text-h1 text-neutral-900 mb-4">
          {title}
        </h1>

        {/* Описание */}
        <p className="text-neutral-600 mb-8 leading-relaxed">
          {description}
        </p>

        {/* Действия */}
        <div className="space-y-4">
          {showRetry && (
            <button
              onClick={handleRetry}
              disabled={isRetrying}
              className="w-full bg-neutral-900 hover:bg-neutral-800 text-neutral-0 py-3 px-6 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isRetrying ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <RefreshCw className="w-5 h-5" />
              )}
              {isRetrying ? 'Перевірка з\'єднання...' : 'Спробувати знову'}
            </button>
          )}

          {showHomeLink && (
            <Link
              href="/"
              className="w-full bg-white hover:bg-neutral-50 text-neutral-900 py-3 px-6 rounded-lg font-medium border border-neutral-200 transition-colors flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              На головну
            </Link>
          )}
        </div>

        {/* Дополнительная информация */}
        <div className="mt-12 p-6 bg-blue-50 rounded-lg">
          <div className="flex items-start gap-3">
            <BookOpen className="w-6 h-6 text-brand-accent-light mt-1" />
            <div className="text-left">
              <h3 className="font-medium text-blue-900 mb-2">
                Що можна робити офлайн?
              </h3>
              <ul className="text-body-sm text-blue-800 space-y-1">
                <li>• Переглядати кешовані книги</li>
                <li>• Читати збережені сторінки</li>
                <li>• Використовувати пошук по кешу</li>
                <li>• Переглядати історію оренди</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Статус соединения */}
        <div className="mt-6 text-body-sm text-neutral-500">
          Статус: {isOnline ? (
            <span className="text-green-600 font-medium">Онлайн</span>
          ) : (
            <span className="text-red-600 font-medium">Офлайн</span>
          )}
        </div>
      </div>
    </div>
  );
}
