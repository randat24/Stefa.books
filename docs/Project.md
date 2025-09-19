# Stefa.Books — Проектная документация

## 1. Краткое описание

**Stefa.Books** — комплексная система аренды и подписки на детские книги для семей и образовательных учреждений в Миколаїві (Украина).

**Архитектура:**
- **Frontend**: Пользовательский веб-сайт с каталогом и системой подписки
- **Backend**: Административная панель для управления контентом, пользователями и операциями
- **Infrastructure**: Supabase (PostgreSQL + RLS), Cloudinary, Netlify

**Ключевые цели:**
- Минимальный путь от просмотра к подписке
- Полный контроль для библиотекарей
- Высокая безопасность и производительность
- Адаптивность для всех устройств

## 2. UX-принципы и дизайн-система

**Принципы:**
- Контент-центричность (книги — главные герои)
- Минимализм и скорость
- Предсказуемость интерфейса
- Без эмодзи в UI (только в контенте)

**Визуальная концепция:**
- **Стиль**: Минималистичный "книжный" дизайн
- **Палитра**: Бежево-песочная основа + изумрудные акценты
- **Типографика**: Literata (заголовки), Manrope (основной текст)
- **Компоненты**: Скругления 2xl, тени, тонкие рамки

**Quick View**: Модальное окно с полной информацией о книге и формой подписки

## 3. Технический стек

**Frontend:**
- Next.js 15.5.2 (App Router, Server Components)
- React 19.1.1 + TypeScript 5.5.4
- Tailwind CSS 3.4.10 + кастомные токены
- Radix UI + Framer Motion 12.23.12
- Lucide React (иконки)

**Backend & Database:**
- Supabase (PostgreSQL, Edge Functions, Auth)
- Row Level Security (RLS) — deny-by-default
- Cloudinary (изображения)
- Supabase Migrations + RPC функции

**Infrastructure:**
- Netlify (хостинг, Server Actions)
- GitHub Actions (CI/CD)
- Supabase local (разработка)

## 4. Архитектура проекта

```
src/
├── app/                    # App Router структура
│   ├── layout.tsx         # Корневой layout, метаданные
│   ├── page.tsx           # Главная страница
│   ├── catalog/           # Каталог книг
│   ├── admin/             # Админ-панель
│   ├── api/               # Route Handlers
│   └── globals.css        # Глобальные стили
├── components/            # React компоненты
│   ├── ui/               # Атомарные компоненты
│   ├── BookCard.tsx      # Карточка книги
│   ├── BookPreviewModal.tsx # Модальное окно
│   ├── RentalForm.tsx    # Форма аренды
│   └── sections/         # Секции страниц
├── lib/                  # Утилиты и конфигурация
│   ├── supabase.ts       # Supabase клиент
│   ├── database.types.ts # TypeScript типы
│   ├── mock.ts           # Мок-данные
│   └── utils/            # Вспомогательные функции
├── hooks/                # Кастомные хуки
├── contexts/             # React контексты
├── store/                # Zustand store
└── middleware.ts         # Защита маршрутов
```

## 5. База данных

**Основные таблицы:**
- `books` — каталог книг с метаданными
- `categories` — категории и подкатегории
- `authors` — авторы книг
- `users` — пользователи и подписки
- `rentals` — история аренд
- `payments` — платежная информация
- `subscription_requests` — заявки на подписку

**Безопасность:**
- RLS политики для всех таблиц
- Публичный доступ только на чтение
- Запись через сервисный ключ

## 6. Маршруты и страницы

**Публичные:**
- `/` — главная страница
- `/catalog` — каталог книг
- `/catalog/[slug]` — категории
- `/books/[id]` — страница книги
- `/plans` — тарифные планы
- `/subscribe` — форма подписки
- `/rent` — форма аренды

**Административные:**
- `/admin` — дашборд
- `/admin/books` — управление книгами
- `/admin/users` — пользователи
- `/admin/requests` — заявки

**API:**
- `/api/subscribe` — подписка
- `/api/rent` — аренда
- `/api/books` — каталог
- `/api/categories` — категории
- `/api/admin/*` — админ API

## 7. Безопасность

**Многоуровневая защита:**
- RLS политики в Supabase
- Middleware для админ-маршрутов
- Валидация через Zod
- CSP заголовки
- Rate limiting + honeypot
- Санитизация входных данных

## 8. Производительность

**Оптимизации:**
- SSG/ISR для статических страниц
- SSR для динамического контента
- Lazy loading изображений
- Пагинация (20-30 книг на страницу)
- Кэширование Supabase запросов
- Локальные шрифты (next/font)

## 9. Компоненты MVP

**Ключевые UI компоненты:**
- Header (навигация, поиск)
- Hero (главный блок)
- BookCard (карточка книги)
- BookPreviewModal (модальное окно)
- RentalForm (форма аренды)
- Catalog Grid (сетка книг)
- Admin Dashboard (таблицы, графики)

## 10. Дорожная карта

**v1.0 (MVP):**
- Базовый сайт + каталог
- QuickView + форма подписки
- Админ-панель

**v1.1:**
- Поиск + фильтры
- SEO оптимизация
- Пагинация

**v1.2:**
- Личный кабинет
- Авторизация пользователей

**v1.3:**
- Telegram бот
- Уведомления
- Аналитика

**v1.4:**
- Платежная система
- Автопродление

## 11. Стандарты разработки

**Код:**
- Conventional Commits
- ESLint + Prettier
- TypeScript strict mode
- SOLID принципы

**Тестирование:**
- Jest + React Testing Library
- E2E тесты (Playwright)
- Lighthouse ≥ 90

**Деплой:**
- GitHub Actions
- Netlify автоматический деплой
- Preview деплои для PR

## 12. Мониторинг и аналитика

**Инструменты:**
- Sentry (ошибки)
- Plausible/GA (аналитика)
- Supabase Dashboard
- Netlify Analytics

**Метрики:**
- Core Web Vitals
- Конверсия подписок
- Производительность поиска
- Ошибки пользователей

## 13. Переменные окружения

**Публичные (NEXT_PUBLIC_):**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
NEXT_PUBLIC_SITE_URL=https://stefa-books.com.ua
NEXT_PUBLIC_SITE_NAME=Stefa.Books
```

**Серверные:**
```bash
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
ADMIN_EMAIL=admin@stefa-books.com.ua
```

## 14. Структура данных

**Book (Книга):**
```typescript
interface Book {
  id: string;
  code: string;
  title: string;
  author: string;
  category: string;
  subcategory?: string;
  description?: string;
  short_description?: string;
  isbn?: string;
  pages?: number;
  age_range?: string;
  language: string;
  publisher?: string;
  publication_year?: number;
  cover_url?: string;
  status: 'available' | 'issued' | 'reserved' | 'lost';
  available: boolean;
  qty_total: number;
  qty_available: number;
  price_uah?: number;
  location?: string;
  rating?: number;
  rating_count?: number;
  badges?: string[];
  tags?: string[];
  created_at: string;
  updated_at: string;
}
```

**SubscriptionRequest (Заявка на подписку):**
```typescript
interface SubscriptionRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  social?: string;
  plan: string;
  paymentMethod: string;
  message?: string;
  screenshot?: string;
  privacyConsent: boolean;
  created_at: string;
}
```

## 15. API Endpoints

**Публичные API:**
- `GET /api/books` — список книг с фильтрацией
- `GET /api/books/[id]` — детали книги
- `GET /api/categories` — список категорий
- `POST /api/subscribe` — заявка на подписку
- `POST /api/rent` — заявка на аренду

**Админ API:**
- `GET /api/admin/books` — управление книгами
- `POST /api/admin/books` — создание книги
- `PUT /api/admin/books/[id]` — обновление книги
- `DELETE /api/admin/books/[id]` — удаление книги
- `GET /api/admin/requests` — заявки на подписку

## 16. Тестирование

**Unit тесты:**
- Компоненты React
- Утилиты и хуки
- API endpoints

**E2E тесты:**
- Основные пользовательские сценарии
- Формы и валидация
- Адаптивность

**Performance тесты:**
- Lighthouse CI
- Bundle анализатор
- Core Web Vitals

## 17. Деплой и CI/CD

**GitHub Actions:**
- Автоматические тесты
- Линтинг и type-check
- Сборка и деплой на Netlify

**Netlify:**
- Автоматический деплой из main
- Preview деплои для PR
- Edge Functions
- CDN и оптимизация

**Supabase:**
- Миграции базы данных
- Edge Functions
- Realtime подписки

## 18. Мониторинг и логирование

**Логирование:**
- Структурированные логи
- Уровни логирования
- Контекстная информация

**Мониторинг:**
- Ошибки и исключения
- Производительность
- Пользовательская аналитика

**Алерты:**
- Критические ошибки
- Падение производительности
- Проблемы с базой данных
