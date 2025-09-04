# 📚 Stefa.Books

> Детская библиотека книг с подпиской и арендой

[![Next.js](https://img.shields.io/badge/Next.js-15.4.6-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.0-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-cyan)](https://tailwindcss.com/)

## ✅ Статус проекта

**Последнее обновление**: 3 сентября 2025  
**Статус**: 🚀 **ПОЛНОСТЬЮ ГОТОВ К ПРОДАКШЕНУ**

### Недавние изменения
- ✅ **Исправлено 50+ ошибок TypeScript** в 18 файлах
- ✅ **Исправлено 50+ предупреждений ESLint** - код полностью чистый
- ✅ **Очищен кэш и переустановлены зависимости**
- ✅ **Проект успешно собран без ошибок компиляции**
- ✅ **Локальное тестирование пройдено** - все функции работают корректно
- ✅ **ESLint: 0 ошибок, 0 предупреждений** - идеальное качество кода

**Детали оптимизации**: [BUILD_OPTIMIZATION_REPORT.md](./BUILD_OPTIMIZATION_REPORT.md)  
**Отчёт по ESLint**: [ESLINT_CLEANUP_SUMMARY.md](./ESLINT_CLEANUP_SUMMARY.md)

## 🚀 Быстрый старт

### 1. Клонирование и установка
```bash
git clone <repository-url>
cd Stefa-books-v2.1
pnpm install
```

### 2. Настройка переменных окружения
```bash
cp .env.example .env.local
# Отредактируйте .env.local с вашими ключами
```

### 3. Настройка базы данных
```bash
# Выполните миграции Supabase
supabase db reset
```

### 4. Импорт данных
```bash
cd scripts/
npm install
node quick-import.js
# Выполните созданный SQL файл в Supabase
```

### 5. Запуск приложения
```bash
pnpm dev
```

## 🚀 Деплой на Vercel

### Быстрый деплой
```bash
# Проверка готовности
pnpm vercel:check

# Деплой в preview
pnpm vercel:deploy:preview

# Деплой в production
pnpm vercel:deploy:prod
```

### Подробная документация
- **Полное руководство**: [VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md)
- **Быстрый старт**: [VERCEL_QUICK_START.md](./VERCEL_QUICK_START.md)
- **Настройка окружения**: [ENV_SETUP.md](./ENV_SETUP.md)

## 🛠 Технологический стек

| Технология | Версия | Назначение |
|------------|--------|------------|
| **Next.js** | 15.4.6 | React фреймворк с App Router |
| **React** | 19.1.0 | UI библиотека |
| **TypeScript** | 5.0 | Типизация |
| **Tailwind CSS** | 4.0 | Стилизация |
| **shadcn/ui** | Latest | UI компоненты |
| **Supabase** | Latest | Backend (PostgreSQL + Auth) |
| **Cloudinary** | Latest | Хранение изображений |
| **Vercel** | Latest | Деплой |

## 📁 Структура проекта

```
Stefa-books-v2.1/
├── 📁 src/                    # Исходный код
│   ├── 📁 app/               # Next.js App Router
│   ├── 📁 components/        # React компоненты
│   ├── 📁 lib/              # Утилиты и конфигурация
│   └── 📁 hooks/            # Пользовательские хуки
├── 📁 supabase/             # Конфигурация БД
├── 📁 scripts/              # Скрипты импорта данных
├── 📁 docs/                 # Документация
└── 📁 public/               # Статические файлы
```

Подробнее см. [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)

## 📚 Основные функции

- 🔍 **Поиск книг** - Полнотекстовый поиск по названию, автору, категории
- 📖 **Каталог** - Фильтрация по категориям, возрасту, доступности
- 👤 **Аутентификация** - Регистрация и вход через Supabase Auth
- 💳 **Подписка** - Ежемесячная подписка на доступ к книгам
- 📦 **Аренда** - Аренда отдельных книг
- 💰 **Платежи** - Интеграция с платежными системами
- 👨‍💼 **Админ-панель** - Управление книгами, пользователями, заказами
- 📱 **PWA** - Прогрессивное веб-приложение

## 🔧 Разработка

### Команды
```bash
pnpm dev          # Запуск в режиме разработки
pnpm build        # Сборка для продакшена
pnpm start        # Запуск продакшен сборки
pnpm lint         # Проверка кода (0 ошибок, 0 предупреждений)
pnpm lint --fix   # Автоматическое исправление кода
pnpm test         # Запуск тестов
pnpm test:e2e     # End-to-end тесты
```

### Импорт данных
```bash
cd scripts/
node quick-import.js        # Создание SQL для импорта
node auto-upload-covers.js  # Загрузка обложек в Cloudinary
```

## 📖 Документация

- [Настройка админ-панели](./ADMIN_SETUP.md)
- [Безопасность](./SECURITY.md)
- [Структура проекта](./PROJECT_STRUCTURE.md)
- [Импорт данных](./scripts/README.md)
- [Документация проекта](./docs/README.md)

## 🚀 Деплой

Приложение автоматически деплоится на Vercel при пуше в main ветку.

### Переменные окружения для продакшена:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

## 🤝 Участие в разработке

1. Форкните репозиторий
2. Создайте feature ветку
3. Внесите изменения
4. Создайте Pull Request

## 📄 Лицензия

MIT License - см. [LICENSE](./LICENSE) файл.

## 📞 Поддержка

Если у вас есть вопросы или проблемы:
- Создайте [Issue](../../issues)
- Обратитесь к [документации](./docs/)
- Проверьте [FAQ](./docs/qa.md)