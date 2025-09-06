# 📊 Настройка Google Analytics для Stefa.Books

## 🚀 Быстрый старт

### 1. Создайте файл `.env.local`

В корне проекта создайте файл `.env.local` и добавьте:

```bash
# Google Analytics
NEXT_PUBLIC_GA_ID=G-0GRMFJQS12

# Остальные переменные (добавьте ваши ключи)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
NEXT_PUBLIC_SITE_URL=http://stefa-books.com.ua
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NODE_ENV=development
```

### 2. Настройка для продакшена (Vercel)

1. Перейдите в **Settings → Environment Variables**
2. Добавьте переменную `NEXT_PUBLIC_GA_ID` для Production среды
3. Установите значение `G-0GRMFJQS12`

## 🔧 Что уже настроено

### ✅ Компоненты
- `GoogleAnalytics` - основной компонент аналитики
- `CookieConsent` - уведомление о cookies
- `useAnalytics` - хук для отслеживания событий

### ✅ Отслеживаемые события
- Просмотр книг (`book_view`)
- Аренда книг (`book_rental`)
- Подписки (`subscription`)
- Поиск (`search`)
- Регистрация (`sign_up`)
- Вход в систему (`login`)

### ✅ GDPR соответствие
- Согласие на cookies
- Анонимизация IP
- Отключение рекламных функций

## 📈 Использование аналитики

### Базовое использование

```typescript
import { useAnalytics } from '@/hooks/useAnalytics'

export default function MyComponent() {
  const { trackEvent, trackBookView } = useAnalytics()

  const handleClick = () => {
    trackEvent('button_click', 'engagement', 'header_cta')
  }

  const handleBookView = (bookTitle: string, bookId: string) => {
    trackBookView(bookTitle, bookId)
  }

  return (
    <button onClick={handleClick}>
      Нажми меня
    </button>
  )
}
```

### Доступные методы

```typescript
const {
  trackEvent,           // Общее событие
  trackPageView,        // Просмотр страницы
  trackBookView,        // Просмотр книги
  trackBookRental,      // Аренда книги
  trackSubscription,    // Подписка
  trackSearch,          // Поиск
  trackUserRegistration, // Регистрация
  trackUserLogin        // Вход
} = useAnalytics()
```

## 🧪 Тестирование

### 1. Локальное тестирование

```bash
# Запустите проект
pnpm dev

# Откройте браузер
open http://localhost:3000
```

### 2. Проверка в браузере

1. Откройте **Developer Tools → Network**
2. Найдите запросы к `googletagmanager.com`
3. Проверьте, что Google Analytics загружается

### 3. Проверка в Google Analytics

1. Перейдите в **Realtime → Overview**
2. Выполните действия на сайте
3. Проверьте, что события появляются в реальном времени

## 🔍 Отладка

### Проверка переменных окружения

```bash
# Проверьте, что переменная установлена
echo $NEXT_PUBLIC_GA_ID

# Или в браузере
console.log(process.env.NEXT_PUBLIC_GA_ID)
```

### Проверка в консоли браузера

```javascript
// Проверьте, что gtag загружен
console.log(typeof window.gtag)

// Проверьте dataLayer
console.log(window.dataLayer)
```

## 📊 Настройка целей в Google Analytics

### 1. Создание целей

1. Перейдите в **Admin → Goals**
2. Создайте новые цели:
   - **Просмотр книги** (Event: `book_view`)
   - **Аренда книги** (Event: `book_rental`)
   - **Подписка** (Event: `subscription`)
   - **Регистрация** (Event: `sign_up`)

### 2. Настройка воронки конверсии

1. **Просмотр каталога** → **Просмотр книги** → **Аренда/Подписка**
2. Настройте отслеживание каждого шага

## 🛡️ Безопасность и приватность

### Настройки конфиденциальности

- ✅ IP анонимизация включена
- ✅ Рекламные функции отключены
- ✅ Согласие на cookies
- ✅ GDPR соответствие

### Дополнительные настройки

```typescript
// В GoogleAnalytics.tsx уже настроено:
gtag('config', 'GA_ID', {
  anonymize_ip: true,
  allow_google_signals: true,
  allow_ad_personalization_signals: false
})
```

## 🚨 Устранение проблем

### Google Analytics не загружается

1. Проверьте `NEXT_PUBLIC_GA_ID` в `.env.local`
2. Перезапустите сервер разработки
3. Проверьте консоль браузера на ошибки

### События не отслеживаются

1. Проверьте, что пользователь принял cookies
2. Убедитесь, что `useAnalytics` используется в клиентском компоненте
3. Проверьте, что `window.gtag` доступен

### Проблемы с продакшеном

1. Убедитесь, что переменная добавлена в Vercel
2. Проверьте, что значение правильное
3. Дождитесь развертывания (может занять несколько минут)

## 📚 Дополнительные ресурсы

- [Google Analytics 4 Documentation](https://developers.google.com/analytics/devguides/collection/ga4)
- [Next.js Script Component](https://nextjs.org/docs/basic-features/script)
- [GDPR Compliance Guide](https://support.google.com/analytics/answer/9019185)

---

**Статус**: ✅ Google Analytics полностью настроен и готов к работе!

*Последнее обновление: Декабрь 2024*
