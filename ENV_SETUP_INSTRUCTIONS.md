# 🔧 Инструкция по настройке переменных окружения

## Проблема
В консоли браузера появляются ошибки "Failed to fetch" из-за отсутствия переменных окружения для Supabase.

## Решение

### 1. Создайте файл `.env.local` в корне проекта

```bash
# В корне проекта создайте файл .env.local
touch .env.local
```

### 2. Добавьте следующие переменные в `.env.local`

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
NEXT_PUBLIC_SITE_URL=http://localhost:3001

# Environment
NODE_ENV=development
```

### 3. Получите ключи Supabase

1. Перейдите на [supabase.com](https://supabase.com/dashboard)
2. Войдите в ваш проект
3. Перейдите в **Settings → API**
4. Скопируйте:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** → `SUPABASE_SERVICE_ROLE_KEY`

### 4. Получите ключи Cloudinary

1. Перейдите на [cloudinary.com](https://cloudinary.com/console)
2. В Dashboard скопируйте:
   - **Cloud name** → `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
   - **API Key** → `CLOUDINARY_API_KEY`
   - **API Secret** → `CLOUDINARY_API_SECRET`

### 5. Перезапустите сервер разработки

```bash
# Остановите текущий сервер (Ctrl+C)
# Затем запустите заново
npm run dev
```

## Временное решение

Если у вас нет доступа к Supabase или Cloudinary, приложение будет работать с ограниченной функциональностью:

- ✅ Главная страница
- ✅ Каталог книг
- ✅ Страницы книг
- ✅ Поиск
- ❌ Админ-панель (требует Supabase)
- ❌ Загрузка изображений (требует Cloudinary)

## Проверка

После настройки переменных окружения:

1. Ошибки "Failed to fetch" должны исчезнуть
2. Админ-панель должна загружаться без ошибок
3. В консоли не должно быть ошибок подключения к API

## Безопасность

⚠️ **Важно**: Никогда не коммитьте файл `.env.local` в Git! Он уже добавлен в `.gitignore`.
