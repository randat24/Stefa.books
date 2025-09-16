# 🚀 Быстрое исправление входа в админ-панель

## 🎯 Проблема
Не можете войти в админ-панель с данными:
- Email: `admin@stefa-books.com.ua`
- Password: `oqP_Ia5VMO2wy46p`

## ⚡ Решение

### Вариант 1: Через Supabase Dashboard (Рекомендуется)

1. **Откройте Supabase Dashboard**
   - Перейдите на [supabase.com/dashboard](https://supabase.com/dashboard)
   - Выберите ваш проект

2. **Создайте пользователя**
   - `Authentication` → `Users` → `Add user`
   - Email: `admin@stefa-books.com.ua`
   - Password: `oqP_Ia5VMO2wy46p`
   - Email confirm: ✅ (поставьте галочку)
   - `Create user`

3. **Установите роль администратора**
   - `SQL Editor`
   - Выполните SQL:

```sql
-- Создаем запись в таблице users
INSERT INTO users (
  id,
  email,
  name,
  role,
  is_admin,
  status,
  created_at,
  updated_at
)
SELECT 
  au.id,
  'admin@stefa-books.com.ua',
  'Admin User',
  'admin',
  true,
  'active',
  NOW(),
  NOW()
FROM auth.users au
WHERE au.email = 'admin@stefa-books.com.ua'
ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  is_admin = true,
  status = 'active',
  updated_at = NOW();
```

### Вариант 2: Через SQL Editor

1. **Откройте SQL Editor в Supabase Dashboard**
2. **Выполните полный SQL скрипт** (файл `create-admin-simple.sql`):

```sql
-- 1. Создаем пользователя в auth.users
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@stefa-books.com.ua',
  crypt('oqP_Ia5VMO2wy46p', gen_salt('bf')),
  NOW(),
  NULL,
  NULL,
  '{"provider":"email","providers":["email"]}',
  '{"first_name":"Admin","last_name":"User"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
) ON CONFLICT (email) DO UPDATE SET
  encrypted_password = crypt('oqP_Ia5VMO2wy46p', gen_salt('bf')),
  email_confirmed_at = NOW(),
  updated_at = NOW();

-- 2. Создаем запись в таблице users
INSERT INTO users (
  id,
  email,
  name,
  role,
  is_admin,
  status,
  created_at,
  updated_at
)
SELECT 
  au.id,
  'admin@stefa-books.com.ua',
  'Admin User',
  'admin',
  true,
  'active',
  NOW(),
  NOW()
FROM auth.users au
WHERE au.email = 'admin@stefa-books.com.ua'
ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  is_admin = true,
  status = 'active',
  updated_at = NOW();
```

### Вариант 3: Через веб-интерфейс

1. **Откройте страницу регистрации**
   - Перейдите на `http://localhost:3000/auth/register`

2. **Зарегистрируйте админ-пользователя**
   - Имя: `Admin`
   - Фамилия: `User`
   - Email: `admin@stefa-books.com.ua`
   - Пароль: `oqP_Ia5VMO2wy46p`
   - Подтвердите пароль: `oqP_Ia5VMO2wy46p`

3. **Установите роль администратора**
   - Выполните SQL из Варианта 1

## 🧪 Тестирование

После создания пользователя:

1. **Откройте админ-панель**
   - Перейдите на `http://localhost:3000/admin/login`

2. **Войдите с данными**
   - Email: `admin@stefa-books.com.ua`
   - Password: `oqP_Ia5VMO2wy46p`

3. **Проверьте доступ**
   - Должно произойти перенаправление на админ-панель
   - URL должен быть `http://localhost:3000/admin`

## ✅ Готово!

После выполнения любого из вариантов админ-панель должна работать корректно.

## 🔧 Если проблема остается

1. **Проверьте логи сервера** - `npm run dev`
2. **Очистите кеш браузера** - Ctrl+Shift+R
3. **Проверьте переменные окружения** - `.env.local`
4. **Убедитесь, что сервер запущен** - `http://localhost:3000`
