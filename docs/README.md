# Stefa.Books — Документация проекта

Добро пожаловать в документацию проекта **Stefa.Books** — современного сервиса аренды детских книг в Миколаїві (Украина).

## 📚 Содержание документации

- [`Project.md`](./Project.md) — Описание проекта, архитектуры, экранов и технических решений
- [`Tasktracker.md`](./Tasktracker.md) — Единый список задач и журнал выполнения
- [`Sprints.md`](./Sprints.md) — План спринтов с целями и критериями готовности
- [`Diary.md`](./Diary.md) — Технический журнал наблюдений и решений
- [`qa.md`](./qa.md) — Вопросы по продукту и архитектуре
- [`Branding.md`](./Branding.md) — Руководство по брендингу и иконкам
- [`../.cursorrules`](../.cursorrules) — Правила разработки и качества кода

## 🚀 Быстрый старт

### Предварительные требования
- Node.js 20+ LTS
- pnpm 9+ (рекомендуется)
- Аккаунты: Vercel, Supabase, Cloudinary

### Установка и запуск
```bash
# Установка зависимостей
pnpm install

# Запуск в режиме разработки
pnpm dev

# Проверка качества кода
pnpm type-check
pnpm lint

# Сборка для продакшена
pnpm build
```

### Переменные окружения
Создайте файл `.env.local` в корне проекта:
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Cloudinary (для изображений)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Сайт
NEXT_PUBLIC_SITE_URL=https://stefa-books.com.ua
NEXT_PUBLIC_SITE_NAME=Stefa.Books
```

## 🏗️ Архитектура проекта

### Технический стек
- **Frontend**: Next.js 15.5.2 (App Router), React 19.1.1, TypeScript 5.5.4
- **Styling**: Tailwind CSS 4.1.13, Framer Motion 12.23.12
- **UI Components**: Radix UI, Lucide React, shadcn/ui
- **Backend**: Supabase (PostgreSQL + Auth + Edge Functions)
- **Storage**: Cloudinary (изображения)
- **Deployment**: Vercel
- **Testing**: Jest, Playwright, React Testing Library
- **Package Manager**: pnpm 10.15.1
- **AI Integration**: mdream 0.10.1 (HTML to Markdown)

### Структура проекта
```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Корневой layout
│   ├── page.tsx           # Главная страница
│   ├── catalog/           # Каталог книг
│   ├── admin/             # Админ-панель
│   ├── api/               # Route Handlers
│   └── globals.css        # Глобальные стили
├── components/            # React компоненты
│   ├── ui/               # Атомарные UI компоненты
│   ├── BookCard.tsx      # Карточка книги
│   ├── BookPreviewModal.tsx # Модальное окно просмотра
│   ├── RentalForm.tsx    # Форма аренды
│   └── sections/         # Секции страниц
├── lib/                  # Утилиты и конфигурация
│   ├── supabase.ts       # Supabase клиент
│   ├── database.types.ts # Типы базы данных
│   ├── mock.ts           # Мок-данные
│   └── utils/            # Вспомогательные функции
├── hooks/                # Кастомные хуки
├── contexts/             # React контексты
└── store/                # Zustand store
```

## 📋 Статусы задач

- **TODO** — задача запланирована
- **IN-PROGRESS** — задача в работе
- **BLOCKED** — заблокирована внешними зависимостями
- **DONE** — выполнена

В `Tasktracker.md` используются чек-листы `- [ ]` / `- [x]` и префиксы приоритета: `CRITICAL`, `HIGH`, `MEDIUM`, `LOW`.

## 🔄 Рабочий процесс

### Ветки и коммиты
- **Основная ветка**: `main` (production)
- **Фичи**: `feat/<кратко>`; фиксы: `fix/<кратко>`
- **Релизы**: тэги `vX.Y.Z`
- **Стиль коммитов**: Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`, `chore:`)

### Как работать с документами
1. **Проектирование** — обновляем `Project.md` при изменении архитектуры/экранов
2. **Планирование** — задачи кладём в `Tasktracker.md`, группируем по спринтам из `Sprints.md`
3. **Ведение работ** — все важные решения фиксируем в `Diary.md` датированными записями
4. **Уточнения** — открытые вопросы вносим в `qa.md` и закрываем ссылками на PR

## 🎯 Критерии качества

### Код
- Проходит `pnpm type-check` и `pnpm lint` без ошибок
- Покрытие тестами ≥ 80%
- Lighthouse ≥ 90 по Performance/Accessibility/SEO

### Деплой
- Автоматический деплой на Vercel при push в `main`
- Preview деплои для PR
- Зелёные проверки CI/CD

### Безопасность
- RLS политики в Supabase (deny-by-default)
- Валидация входных данных (Zod)
- Секреты только в переменных окружения

## 🔗 Полезные ссылки

- **Дизайн-референсы**: см. бриф и Pinterest-борды
- **База данных**: [Supabase Console](https://supabase.com/dashboard)
- **Деплой**: [Vercel Dashboard](https://vercel.com/dashboard)
- **Аналитика**: [Vercel Analytics](https://vercel.com/analytics)

## 📞 Поддержка

При возникновении вопросов:
1. Проверьте раздел [`qa.md`](./qa.md)
2. Создайте issue с тегом `question`
3. Обратитесь к техническому дневнику [`Diary.md`](./Diary.md)

---

## 📈 История изменений

### v2.1 - Оптимизация и стабилизация (5 сентября 2025)
- ✅ **Исправлено 76+ ошибок TypeScript** в 18 файлах
- ✅ **Очищен кэш и переустановлены зависимости**
- ✅ **Проект успешно собран без ошибок компиляции**
- ✅ **Локальное тестирование пройдено** - все функции работают корректно
- ✅ **Tailwind CSS v4.1** - 5x быстрее сборка, CSS-based конфигурация
- ✅ **pnpm Migration** - 33x быстрее установка пакетов
- ✅ **mdream Integration** - AI-friendly HTML to Markdown conversion
- ✅ **Статус**: готов к дальнейшей разработке

**Детали оптимизации**: 
- [TAILWIND_V4_UPGRADE_REPORT.md](../TAILWIND_V4_UPGRADE_REPORT.md)
- [PNPM_MIGRATION_REPORT.md](../PNPM_MIGRATION_REPORT.md)
- [TYPESCRIPT_FIXES_REPORT.md](../TYPESCRIPT_FIXES_REPORT.md)

---

**Последнее обновление**: 3 сентября 2025  
**Версия документации**: 1.1.0
