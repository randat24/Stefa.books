# 🧹 Управление кешем Stefa.Books

Этот документ описывает систему принудительной очистки кеша для пользователей при деплое сайта.

## 🚀 Как работает система очистки кеша

### 1. Автоматическая генерация Build ID
- При каждом деплое генерируется уникальный Build ID на основе даты и времени
- Build ID используется для инвалидации всех кешей

### 2. HTTP заголовки
- Все страницы получают заголовок `Cache-Control: public, max-age=0, must-revalidate`
- API эндпоинты получают заголовок `Cache-Control: no-cache, no-store, must-revalidate`
- Статические ресурсы (изображения, JS, CSS) кешируются на 1 год

### 3. Service Worker
- Автоматически управляет кешем браузера
- Уведомляет пользователей об обновлениях
- Принудительно очищает старые кеши при новой версии

### 4. Уведомления пользователей
- Показывает уведомление о доступности обновления
- Позволяет пользователю обновить страницу вручную

## 📋 Команды для управления кешем

### Основные команды
```bash
# Принудительная очистка кеша перед деплоем
npm run clear-cache

# Деплой с принудительной очисткой кеша
npm run deploy:force-cache-clear

# Предварительная очистка (автоматически запускается перед деплоем)
npm run predeploy
```

### Ручная очистка
```bash
# Очистка всех временных файлов
npm run clean

# Полная очистка с переустановкой зависимостей
npm run clean:full
```

## 🔧 Настройка для разработчиков

### Файлы конфигурации
- `next.config.js` - основные настройки кеширования
- `vercel.json` - дополнительные заголовки для Vercel
- `public/sw.js` - Service Worker для управления кешем
- `scripts/clear-cache.js` - скрипт принудительной очистки

### Переменные окружения
```bash
# Build ID генерируется автоматически
NEXT_PUBLIC_BUILD_ID=20241220-1430

# Версия из Vercel (если доступна)
VERCEL_GIT_COMMIT_SHA=abc123...
```

## 🎯 Стратегии кеширования

### HTML страницы
- **Стратегия**: Network First
- **TTL**: 0 (всегда проверять обновления)
- **Заголовки**: `Cache-Control: public, max-age=0, must-revalidate`

### API эндпоинты
- **Стратегия**: No Cache
- **TTL**: 0
- **Заголовки**: `Cache-Control: no-cache, no-store, must-revalidate`

### Статические ресурсы
- **Стратегия**: Cache First
- **TTL**: 1 год
- **Заголовки**: `Cache-Control: public, max-age=31536000, immutable`

### Изображения
- **Стратегия**: Cache First
- **TTL**: 7 дней (настраивается в next.config.js)
- **Оптимизация**: WebP, AVIF форматы

## 🚨 Экстренная очистка кеша

Если нужно принудительно очистить кеш у всех пользователей:

1. **Запустите скрипт очистки**:
   ```bash
   npm run clear-cache
   ```

2. **Деплойте новую версию**:
   ```bash
   npm run deploy:force-cache-clear
   ```

3. **Проверьте результат**:
   - Откройте сайт в режиме инкогнито
   - Проверьте заголовки ответа в DevTools
   - Убедитесь, что Service Worker обновился

## 🔍 Мониторинг и отладка

### Проверка кеша в браузере
```javascript
// В консоли браузера
// Проверить версию Service Worker
navigator.serviceWorker.getRegistration().then(reg => {
  console.log('SW версия:', reg.active?.scriptURL);
});

// Очистить все кеши
caches.keys().then(names => {
  names.forEach(name => caches.delete(name));
});
```

### Проверка заголовков
```bash
# Проверить заголовки главной страницы
curl -I https://stefa-books.com.ua

# Проверить заголовки API
curl -I https://stefa-books.com.ua/api/books
```

### Логи Vercel
- Проверьте логи деплоя в Vercel Dashboard
- Убедитесь, что Build ID обновился
- Проверьте, что все заголовки применились

## 📱 Поддержка браузеров

### Service Worker
- ✅ Chrome 40+
- ✅ Firefox 44+
- ✅ Safari 11.1+
- ✅ Edge 17+

### Fallback для старых браузеров
- Автоматическое определение поддержки
- Graceful degradation без Service Worker
- HTTP заголовки работают везде

## 🎛️ Настройка для разных окружений

### Development
```javascript
// В next.config.js
const isDev = process.env.NODE_ENV === 'development';

if (isDev) {
  // Отключаем агрессивное кеширование в dev
  config.headers = [];
}
```

### Production
```javascript
// Все настройки кеширования активны
// Build ID генерируется автоматически
// Service Worker активен
```

## 🔧 Кастомизация

### Изменение TTL для изображений
```javascript
// В next.config.js
images: {
  minimumCacheTTL: 60 * 60 * 24 * 7, // 7 дней
}
```

### Добавление новых путей для кеширования
```javascript
// В next.config.js headers()
{
  source: '/api/special/:path*',
  headers: [
    {
      key: 'Cache-Control',
      value: 'public, max-age=3600', // 1 час
    },
  ],
}
```

## 📞 Поддержка

При возникновении проблем с кешем:

1. Проверьте логи в Vercel Dashboard
2. Убедитесь, что Build ID обновился
3. Проверьте заголовки ответов
4. Очистите кеш браузера вручную
5. Проверьте работу Service Worker

---

**Важно**: После каждого деплоя проверяйте, что пользователи видят новую версию сайта. Если проблема сохраняется, используйте команду `npm run deploy:force-cache-clear` для принудительной очистки.
