# 🎯 Финальное решение проблемы входа в админ-панель

## 🚨 Проблема
Не можете войти в админ-панель с данными:
- Email: `admin@stefa-books.com.ua`
- Password: `oqP_Ia5VMO2wy46p`

## ✅ Решение

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
-- Создаем запись в таблице users (для bigint ID)
INSERT INTO users (
  id,
  email,
  name,
  role,
  status,
  created_at,
  updated_at
)
SELECT 
  nextval('users_id_seq'),
  'admin@stefa-books.com.ua',
  'Admin User',
  'admin',
  'active',
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'admin@stefa-books.com.ua'
);

-- Обновляем роль если пользователь уже существует
UPDATE users 
SET 
  role = 'admin',
  status = 'active',
  updated_at = NOW()
WHERE email = 'admin@stefa-books.com.ua';
```

### Вариант 2: Полный SQL скрипт

Если первый вариант не работает, используйте полный скрипт из файла `create-admin-simple-bigint.sql`:

1. Откройте `SQL Editor` в Supabase Dashboard
2. Скопируйте и выполните содержимое файла `create-admin-simple-bigint.sql`

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

## 🔍 Проверка результата

Выполните этот SQL для проверки:

```sql
-- Проверяем auth.users
SELECT 
  au.id,
  au.email,
  au.raw_user_meta_data,
  au.email_confirmed_at,
  au.created_at
FROM auth.users au
WHERE au.email = 'admin@stefa-books.com.ua';

-- Проверяем users
SELECT 
  u.id,
  u.email,
  u.name,
  u.role,
  u.status,
  u.created_at
FROM users u
WHERE u.email = 'admin@stefa-books.com.ua';
```

## ✅ Готово!

После выполнения любого из вариантов админ-панель должна работать корректно.

## 🔧 Если проблема остается

1. **Проверьте логи сервера** - `npm run dev`
2. **Очистите кеш браузера** - Ctrl+Shift+R
3. **Проверьте переменные окружения** - `.env.local`
4. **Убедитесь, что сервер запущен** - `http://localhost:3000`
5. **Проверьте, что пользователь создан** - выполните SQL проверки выше

## 📝 Важные замечания

- В таблице `users` используется `bigint` ID, а не `uuid`
- Система проверяет роль администратора по email и `profile.role`
- Пользователь должен быть подтвержден в `auth.users`
- Роль должна быть установлена в таблице `users`
