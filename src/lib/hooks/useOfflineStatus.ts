'use client';

import { useState, useEffect } from 'react';
import { logger } from '@/lib/logger';

export function useOfflineStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Проверяем начальное состояние
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      logger.info('Connection restored');
    };

    const handleOffline = () => {
      setIsOnline(false);
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

  return { isOnline, isOffline: !isOnline };
}
