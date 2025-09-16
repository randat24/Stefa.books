# 🚀 СРОЧНАЯ НАСТРОЙКА БАЗЫ ДАННЫХ

## ❌ Проблема
Сейчас сайт использует моковые данные вместо реальной базы данных Supabase.

## ✅ Решение

### 1. Создайте проект в Supabase

1. Перейдите на [supabase.com](https://supabase.com/dashboard)
2. Нажмите "New Project"
3. Выберите организацию
4. Введите название: `stefa-books`
5. Создайте пароль для базы данных
6. Выберите регион (ближайший к вам)
7. Нажмите "Create new project"

### 2. Получите ключи API

1. В вашем проекте перейдите в **Settings → API**
2. Скопируйте:
   - **Project URL** (например: `https://abcdefghijklmnop.supabase.co`)
   - **anon public** ключ (начинается с `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)
   - **service_role** ключ (для админ операций)

### 3. Обновите .env.local

Замените содержимое файла `.env.local`:

```env
# Supabase Configuration (ЗАМЕНИТЕ НА ВАШИ РЕАЛЬНЫЕ КЛЮЧИ!)
NEXT_PUBLIC_SUPABASE_URL=https://ваш-проект-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=ваш_реальный_anon_ключ
SUPABASE_SERVICE_ROLE_KEY=ваш_реальный_service_role_ключ

# Cloudinary Configuration (пока можно оставить заглушки)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Environment
NODE_ENV=development

# Debug
DEBUG=true
LOG_LEVEL=debug
```

### 4. Настройте базу данных

1. В Supabase перейдите в **SQL Editor**
2. Скопируйте и выполните содержимое файла `supabase/setup_database.sql`
3. Затем скопируйте и выполните содержимое файла `supabase/insert_sample_data.sql`

### 5. Перезапустите сервер

```bash
pnpm dev
```

## 🎯 Результат

После настройки у вас будет:
- ✅ **8 реальных книг** с обложками
- ✅ **6 категорий** с подкатегориями  
- ✅ **8 авторов** с биографиями
- ✅ **Полнотекстовый поиск** по книгам
- ✅ **Статистика и аналитика**

## 🔍 Проверка

1. Откройте http://localhost:3000
2. Блок "Категорії" должен показывать реальные данные
3. В консоли не должно быть ошибок
4. API должен возвращать данные из базы, а не моковые

## ⚠️ Важно

- **НЕ коммитьте** файл `.env.local` в Git
- **Сохраните ключи** в безопасном месте
- **Не делитесь** ключами с другими

---

**После настройки сайт будет работать с реальной базой данных!** 🎉
