'use client';

import { useState, useEffect } from 'react';
import { Bell, BellOff, CheckCircle, XCircle } from 'lucide-react';
import { logger } from '@/lib/logger';

interface NotificationState {
  isSupported: boolean;
  permission: NotificationPermission;
  isSubscribed: boolean;
  subscription: PushSubscription | null;
}

export function NotificationManager() {
  const [state, setState] = useState<NotificationState>({
    isSupported: false,
    permission: 'default',
    isSubscribed: false,
    subscription: null
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    checkNotificationSupport();
  }, []);

  const checkNotificationSupport = async () => {
    if (!('Notification' in window)) {
      setState(prev => ({ ...prev, isSupported: false }));
      return;
    }

    if (!('serviceWorker' in navigator)) {
      setState(prev => ({ ...prev, isSupported: false }));
      return;
    }

    const permission = Notification.permission;
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    setState({
      isSupported: true,
      permission,
      isSubscribed: !!subscription,
      subscription
    });
  };

  const requestPermission = async () => {
    if (!state.isSupported) return;

    setIsLoading(true);
    try {
      const permission = await Notification.requestPermission();
      setState(prev => ({ ...prev, permission }));
      
      if (permission === 'granted') {
        setMessage({ type: 'success', text: 'Дозвіл на сповіщення надано!' });
        await subscribeToNotifications();
      } else {
        setMessage({ type: 'error', text: 'Дозвіл на сповіщення відхилено' });
      }
    } catch (error) {
      logger.error('Error requesting notification permission:', error);
      setMessage({ type: 'error', text: 'Помилка при запиті дозволу' });
    } finally {
      setIsLoading(false);
    }
  };

  const subscribeToNotifications = async () => {
    if (!state.isSupported || state.permission !== 'granted') return;

    setIsLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      
      // VAPID ключ для push уведомлений (в реальном проекте должен быть в .env)
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_KEY || 'BEl62iUYgUivxIkv69yViEuiBIa40HI8F8jWQJ3l7FdbjKvT8HgP_s1JYIV8w0sSHUxXcHDlD5vqO0g5YuoJGk';
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidPublicKey
      });

      // Отправляем подписку на сервер
      const response = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription: subscription.toJSON()
        })
      });

      if (response.ok) {
        setState(prev => ({ 
          ...prev, 
          isSubscribed: true, 
          subscription 
        }));
        setMessage({ type: 'success', text: 'Підписка на сповіщення активована!' });
        logger.info('Successfully subscribed to push notifications');
      } else {
        throw new Error('Failed to save subscription');
      }
    } catch (error) {
      logger.error('Error subscribing to notifications:', error);
      setMessage({ type: 'error', text: 'Помилка при підписці на сповіщення' });
    } finally {
      setIsLoading(false);
    }
  };

  const unsubscribeFromNotifications = async () => {
    if (!state.subscription) return;

    setIsLoading(true);
    try {
      await state.subscription.unsubscribe();
      
      // Уведомляем сервер об отписке
      await fetch('/api/notifications/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          endpoint: state.subscription.endpoint
        })
      });

      setState(prev => ({ 
        ...prev, 
        isSubscribed: false, 
        subscription: null 
      }));
      setMessage({ type: 'success', text: 'Підписка на сповіщення скасована' });
      logger.info('Successfully unsubscribed from push notifications');
    } catch (error) {
      logger.error('Error unsubscribing from notifications:', error);
      setMessage({ type: 'error', text: 'Помилка при скасуванні підписки' });
    } finally {
      setIsLoading(false);
    }
  };

  const testNotification = async () => {
    if (!state.isSubscribed) return;

    try {
      await fetch('/api/notifications/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      setMessage({ type: 'success', text: 'Тестове сповіщення відправлено!' });
    } catch (error) {
      logger.error('Error sending test notification:', error);
      setMessage({ type: 'error', text: 'Помилка при відправці тестового сповіщення' });
    }
  };

  if (!state.isSupported) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800 text-sm">
          Ваш браузер не підтримує push-сповіщення
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Статус уведомлений */}
      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
        <div className="flex items-center gap-3">
          {state.isSubscribed ? (
            <CheckCircle className="w-5 h-5 text-green-500" />
          ) : (
            <BellOff className="w-5 h-5 text-slate-400" />
          )}
          <div>
            <p className="font-medium text-slate-900">
              {state.isSubscribed ? 'Сповіщення увімкнено' : 'Сповіщення вимкнено'}
            </p>
            <p className="text-sm text-slate-600">
              {state.isSubscribed 
                ? 'Ви отримуватимете сповіщення про нові книги'
                : 'Увімкніть сповіщення, щоб дізнаватися про новинки'
              }
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          {state.isSubscribed ? (
            <>
              <button
                onClick={testNotification}
                className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                disabled={isLoading}
              >
                Тест
              </button>
              <button
                onClick={unsubscribeFromNotifications}
                className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                disabled={isLoading}
              >
                Вимкнути
              </button>
            </>
          ) : (
            <button
              onClick={state.permission === 'granted' ? subscribeToNotifications : requestPermission}
              className="px-4 py-2 bg-slate-900 text-white rounded-md hover:bg-slate-800 transition-colors flex items-center gap-2"
              disabled={isLoading}
            >
              <Bell className="w-4 h-4" />
              {isLoading ? 'Завантаження...' : 'Увімкнути сповіщення'}
            </button>
          )}
        </div>
      </div>

      {/* Сообщения */}
      {message && (
        <div className={`p-3 rounded-lg flex items-center gap-2 ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <XCircle className="w-4 h-4" />
          )}
          <span className="text-sm">{message.text}</span>
        </div>
      )}

      {/* Информация о разрешениях */}
      {state.permission === 'denied' && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">
            Сповіщення заблоковані. Розблокуйте їх у налаштуваннях браузера.
          </p>
        </div>
      )}
    </div>
  );
}
