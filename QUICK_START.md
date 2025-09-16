# ⚡ Быстрый старт Stefa.Books

## Автоматическая настройка (рекомендуется)

```bash
# Запустите скрипт автоматической настройки
./setup-local.sh
```

## Ручная настройка

### 1. Установка зависимостей
```bash
# Установка pnpm (если не установлен)
npm install -g pnpm

# Установка зависимостей проекта
pnpm install
```

### 2. Настройка переменных окружения
```bash
# Создайте файл .env.local
touch .env.local
```

Заполните `.env.local`:
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NODE_ENV=development
```

### 3. Запуск проекта
```bash
# Запуск dev сервера
pnpm dev
```

## Проверка работы

Откройте в браузере:
- **Основной сайт**: http://localhost:3000
- **API Health**: http://localhost:3000/api/health
- **Админ панель**: http://localhost:3000/admin

## Получение ключей

### Supabase ключи
1. Перейдите на [supabase.com/dashboard](https://supabase.com/dashboard)
2. Выберите ваш проект
3. Settings → API
4. Скопируйте Project URL и anon key

### Cloudinary ключи
1. Перейдите на [cloudinary.com/console](https://cloudinary.com/console)
2. В Dashboard скопируйте Cloud name, API Key и API Secret

## Полезные команды

```bash
# Разработка
pnpm dev                    # Запуск dev сервера
pnpm build                  # Сборка проекта
pnpm start                  # Запуск production сервера

# Проверки
pnpm type-check            # Проверка TypeScript
pnpm lint                  # Проверка кода
pnpm test                  # Запуск тестов

# Очистка
pnpm clean                 # Очистка временных файлов
pnpm clean:full            # Полная очистка с переустановкой

# Работа с БД
node check_site_database_connection.mjs  # Проверка подключения к БД
```

## Если что-то не работает

1. **Очистите кэш**: `pnpm run clean:cache`
2. **Переустановите зависимости**: `rm -rf node_modules && pnpm install`
3. **Проверьте переменные окружения** в `.env.local`
4. **Посмотрите полную документацию**: `LOCAL_SETUP_GUIDE.md`

## Готово! 🎉

После настройки ваш проект будет доступен на http://localhost:3000
