'use client';

import { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { logger } from '@/lib/logger';

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [isReconnecting, setIsReconnecting] = useState(false);

  useEffect(() => {
    // Проверяем начальное состояние
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setIsReconnecting(false);
      logger.info('Connection restored');
    };

    const handleOffline = () => {
      setIsOnline(false);
      setIsReconnecting(false);
      logger.warn('Connection lost');
    };

    // Слушаем изменения состояния сети
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRetry = async () => {
    setIsReconnecting(true);
    
    try {
      // Проверяем соединение
      const response = await fetch('/api/health', {
        method: 'GET',
        cache: 'no-cache'
      });
      
      if (response.ok) {
        setIsOnline(true);
        logger.info('Connection test successful');
      } else {
        throw new Error('Health check failed');
      }
    } catch (error) {
      logger.error('Connection test failed:', error);
      // Показываем сообщение об ошибке
      setTimeout(() => setIsReconnecting(false), 2000);
    }
  };

  if (isOnline) {
    return null; // Не показываем индикатор когда онлайн
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <WifiOff className="w-5 h-5" />
            <div>
              <p className="font-medium">Немає з'єднання з інтернетом</p>
              <p className="text-sm text-red-100">
                Деякі функції можуть бути недоступні. Дані збережені в кеші.
              </p>
            </div>
          </div>
          
          <button
            onClick={handleRetry}
            disabled={isReconnecting}
            className="flex items-center gap-2 px-4 py-2 bg-red-700 hover:bg-red-800 rounded-md transition-colors disabled:opacity-50"
          >
            {isReconnecting ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            <span className="text-sm font-medium">
              {isReconnecting ? 'Перевірка...' : 'Спробувати знову'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
