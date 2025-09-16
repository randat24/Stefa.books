'use client';

import { useState } from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';
import { logger } from '@/lib/logger';
import { useOfflineStatus } from '@/lib/hooks/useOfflineStatus';

export function OfflineIndicator() {
  const { isOnline } = useOfflineStatus();
  const [isReconnecting, setIsReconnecting] = useState(false);

  const handleRetry = async () => {
    setIsReconnecting(true);
    
    try {
      // Проверяем соединение
      const response = await fetch('/api/health', {
        method: 'GET',
        cache: 'no-cache'
      });
      
      if (response.ok) {
        logger.info('Connection test successful');
        // Перезагружаем страницу для обновления состояния
        window.location.reload();
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
    <div className="fixed top-0 left-0 right-0 z-40 bg-red-600 text-neutral-0 shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <WifiOff className="w-5 h-5" />
            <div>
              <p className="font-medium">Немає з&apos;єднання з інтернетом</p>
              <p className="text-body-sm text-red-100">
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
            <span className="text-body-sm font-medium">
              {isReconnecting ? 'Перевірка...' : 'Спробувати знову'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
