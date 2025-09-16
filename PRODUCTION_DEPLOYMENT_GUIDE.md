# Руководство по деплою Stefa.Books на Vercel

Это детальное руководство описывает процесс подготовки и деплоя проекта Stefa.Books на Vercel для production среды.

## 1. Предварительные требования

### 1.1. Технические требования

- Node.js 18+ (рекомендуется 20+)
- pnpm (рекомендуется версия 8+)
- Git (для управления версиями)
- Аккаунт Vercel с правами доступа к проекту
- Доступ к Supabase проекту
- Доступ к Cloudinary аккаунту

### 1.2. Необходимые переменные окружения

Для успешного деплоя необходимо настроить следующие переменные окружения в Vercel:

**Обязательные:**
- `NEXT_PUBLIC_SUPABASE_URL` - URL Supabase проекта
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Анонимный ключ API Supabase
- `SUPABASE_SERVICE_ROLE_KEY` - Сервисный ключ Supabase (для админских функций)
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` - Имя облака Cloudinary
- `CLOUDINARY_API_KEY` - API ключ Cloudinary
- `CLOUDINARY_API_SECRET` - API секрет Cloudinary
- `NEXT_PUBLIC_SITE_URL` - URL сайта (для генерации ссылок)

**Опциональные:**
- `MONOBANK_TOKEN` - Токен для интеграции с Monobank
- `NEXT_PUBLIC_GA_ID` - ID Google Analytics (если используется)
- `ADMIN_EMAIL` - Email администратора
- `ADMIN_JWT_SECRET` - JWT секрет для админ-авторизации

## 2. Процесс деплоя

### 2.1. Подготовка кода перед деплоем

1. **Проверка TypeScript:**
   ```bash
   pnpm type-check
   ```
   Убедитесь, что нет ошибок типизации.

2. **Проверка линтера:**
   ```bash
   pnpm lint
   ```
   Исправьте все ошибки и предупреждения.

3. **Локальный тестовый билд:**
   ```bash
   pnpm build
   ```
   Проверьте, что сборка проходит без ошибок.

4. **Выполнение тестов:**
   ```bash
   pnpm test
   ```
   Убедитесь, что все тесты проходят успешно.

### 2.2. Деплой через Vercel CLI

1. **Установка Vercel CLI** (если еще не установлен):
   ```bash
   npm install -g vercel
   ```

2. **Авторизация** (если еще не авторизованы):
   ```bash
   vercel login
   ```

3. **Деплой в preview окружение:**
   ```bash
   vercel
   ```
   Проверьте preview версию для финальной проверки.

4. **Деплой в production:**
   ```bash
   vercel --prod
   ```

### 2.3. Деплой через GitHub интеграцию

1. Убедитесь, что ваша ветка `main` содержит последнюю версию кода.
2. Пуш в GitHub автоматически запустит деплой через Vercel:
   ```bash
   git push origin main
   ```
3. Vercel автоматически проведет деплой в production среду для ветки `main`.

## 3. Особенности конфигурации

### 3.1. Файл vercel.json

Файл `vercel.json` настраивает специфичные для Vercel параметры:

```json
{
  "version": 2,
  "git": {
    "deploymentEnabled": {
      "main": true,
      "Lklhost": false
    }
  },
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 30
    },
    "src/app/api/payments/monobank/webhook/route.ts": {
      "maxDuration": 10
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "camera=(), microphone=(), geolocation=()"
        }
      ]
    },
    {
      "source": "/admin/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://res.cloudinary.com https://images.unsplash.com; font-src 'self' data:; connect-src 'self' https://api.cloudinary.com;"
        }
      ]
    }
  ]
}
```

### 3.2. Суббазные переменные и fallback

Важная особенность проекта: мы создали fallback для Supabase клиента, чтобы избежать ошибок при отсутствии переменных окружения:

```typescript
// src/lib/supabase.ts
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Create a fallback client if environment variables are missing
const createFallbackClient = () => {
  return createClient<Database>('https://placeholder.supabase.co', 'placeholder-key', {
    auth: {
      persistSession: false,
    },
  });
};

export const supabase = (supabaseUrl && supabaseKey) 
  ? createClient<Database>(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
      },
    })
  : createFallbackClient();
```

## 4. Проверка после деплоя

После успешного деплоя необходимо провести следующие проверки:

1. **Проверка доступности сайта:**
   - Откройте сайт по URL и проверьте, что все страницы загружаются
   - Проверьте функциональность каталога книг
   - Убедитесь, что авторизация работает

2. **Проверка админ-панели:**
   - Войдите в админ-панель
   - Проверьте доступ к управлению книгами, пользователями и заказами
   - Убедитесь, что экспорт данных работает корректно

3. **Мониторинг ошибок:**
   - Проверьте логи в Vercel Dashboard
   - Настройте оповещения о критических ошибках

## 5. Решение типичных проблем

### 5.1. Отсутствие переменных окружения

**Проблема:** Деплой падает с ошибкой "Missing Supabase environment variables".

**Решение:**
1. Проверьте, что все переменные окружения добавлены в проект в Vercel Dashboard
2. Убедитесь, что они добавлены для всех сред (Production, Preview, Development)
3. Проверьте правильность значений переменных

### 5.2. Ошибки типизации

**Проблема:** Ошибки типизации при компиляции.

**Решение:**
1. Обновите определения типов в файле `database.types.ts`
2. Исправьте несоответствия между типами и реальной структурой базы данных
3. Используйте заглушки или значения по умолчанию для необязательных полей

### 5.3. Проблемы с Supabase

**Проблема:** Ошибки при подключении к Supabase.

**Решение:**
1. Проверьте, что Supabase проект активен и доступен
2. Убедитесь, что используются правильные ключи API
3. Проверьте настройки RLS (Row Level Security)

## 6. Мониторинг и обслуживание

### 6.1. Настройка мониторинга

1. Настройте мониторинг доступности через Vercel Analytics
2. Подключите Sentry или аналогичный сервис для отслеживания ошибок
3. Настройте оповещения о критических проблемах

### 6.2. Регулярное обслуживание

1. Регулярно обновляйте зависимости проекта
2. Следите за обновлениями Next.js и Supabase
3. Проводите регулярные проверки безопасности

## 7. Контакты и поддержка

При возникновении проблем с деплоем обращайтесь:
- **Техническая поддержка:** support@stefa-books.com.ua
- **Администратор:** admin@stefa-books.com.ua

---

© 2025 Stefa.Books. Все права защищены.
