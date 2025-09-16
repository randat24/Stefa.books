'use client';

import { useEffect } from 'react';
import { registerCacheInvalidationWorker, BUILD_ID } from '@/lib/cache-buster';

/**
 * Компонент для автоматической очистки кеша при обновлении версии сайта
 * Срабатывает только когда пользователь заходит с устаревшей версией
 */
export function CacheInvalidator() {
  useEffect(() => {
    // Проверяем, нужна ли принудительная очистка кеша
    const lastVersion = localStorage.getItem('app_version');
    const currentVersion = BUILD_ID;

    // Если версия изменилась или это первый визит
    if (!lastVersion || lastVersion !== currentVersion) {
      console.log('🧹 Обнаружена новая версия сайта, очищаем кеш...');

      try {
        // Очищаем все кеши
        if ('caches' in window) {
          caches.keys().then(cacheNames => {
            console.log('Удаляем кеши:', cacheNames);
            return Promise.all(
              cacheNames.map(cacheName => caches.delete(cacheName))
            );
          }).then(() => {
            console.log('✅ Все кеши успешно очищены');
          });
        }

        // Очищаем localStorage кроме важных данных
        const importantKeys = ['user_preferences', 'auth_token'];
        const keysToRemove: string[] = [];

        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && !importantKeys.includes(key)) {
            keysToRemove.push(key);
          }
        }

        keysToRemove.forEach(key => localStorage.removeItem(key));

        // Очищаем sessionStorage
        sessionStorage.clear();

        // Обновляем версию
        localStorage.setItem('app_version', currentVersion);
        localStorage.setItem('cache_cleared_at', new Date().toISOString());

        console.log(`✅ Кеш обновлен до версии: ${currentVersion}`);

        // Показываем уведомление пользователю
        const notification = document.createElement('div');
        notification.innerHTML = `
          <div style="
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4ade80;
            color: white;
            padding: 16px 24px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 9999;
            font-family: system-ui, -apple-system, sans-serif;
            font-size: 14px;
            max-width: 300px;
            animation: slideIn 0.3s ease;
          ">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span>🔄</span>
              <div>
                <div style="font-weight: 600;">Сайт оновлено!</div>
                <div style="opacity: 0.9; font-size: 12px; margin-top: 4px;">
                  Кеш очищено, контент актуальний
                </div>
              </div>
            </div>
          </div>
        `;

        // Добавляем стили анимации
        const style = document.createElement('style');
        style.textContent = `
          @keyframes slideIn {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
        `;
        document.head.appendChild(style);
        document.body.appendChild(notification);

        // Убираем уведомление через 5 секунд
        setTimeout(() => {
          notification.style.animation = 'slideIn 0.3s ease reverse';
          setTimeout(() => {
            document.body.removeChild(notification);
            document.head.removeChild(style);
          }, 300);
        }, 5000);

      } catch (error) {
        console.error('Ошибка при очистке кеша:', error);
      }
    }

    // Регистрируем обычный cache invalidation worker
    registerCacheInvalidationWorker();

  }, []);

  return null; // Компонент ничего не рендерит
}