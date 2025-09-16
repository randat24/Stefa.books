'use client';

import { useEffect } from 'react';

/**
 * Компонент для добавления meta refresh и cache control headers
 * Заставляет браузеры проверять обновления на сервере
 */
export function MetaRefresh() {
  useEffect(() => {
    // Добавляем meta теги для принудительного обновления кеша
    const metaTags = [
      { name: 'cache-control', content: 'no-cache, no-store, must-revalidate' },
      { name: 'pragma', content: 'no-cache' },
      { name: 'expires', content: '0' },
      { name: 'version', content: '2025-09-16-phone-update' }
    ];

    const addedTags: HTMLMetaElement[] = [];

    metaTags.forEach(({ name, content }) => {
      // Удаляем существующий тег если есть
      const existing = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
      if (existing) {
        existing.remove();
      }

      // Добавляем новый тег
      const meta = document.createElement('meta');
      meta.name = name;
      meta.content = content;
      document.head.appendChild(meta);
      addedTags.push(meta);
    });

    // Добавляем timestamp в title для отладки
    const originalTitle = document.title;
    if (!originalTitle.includes('[v:')) {
      document.title = `${originalTitle} [v:2025-09-16]`;
    }

    return () => {
      // Очистка при размонтировании
      addedTags.forEach(tag => {
        if (tag.parentNode) {
          tag.parentNode.removeChild(tag);
        }
      });

      // Восстанавливаем оригинальный title
      if (document.title.includes('[v:')) {
        document.title = originalTitle;
      }
    };
  }, []);

  return null;
}