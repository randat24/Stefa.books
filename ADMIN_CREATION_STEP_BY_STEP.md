# 🎯 Пошаговое создание админ-пользователя

## 🚀 Самый простой способ

### Шаг 1: Откройте Supabase Dashboard
1. Перейдите на [supabase.com/dashboard](https://supabase.com/dashboard)
2. Войдите в свой аккаунт
3. Выберите проект Stefa.Books

### Шаг 2: Создайте пользователя через Authentication
1. В левом меню нажмите **Authentication**
2. Перейдите на вкладку **Users**
3. Нажмите кнопку **Add user**
4. Заполните форму:
   - **Email**: `admin@stefa-books.com.ua`
   - **Password**: `oqP_Ia5VMO2wy46p`
   - **Email confirm**: ✅ (поставьте галочку)
5. Нажмите **Create user**

### Шаг 3: Установите роль администратора
1. В левом меню нажмите **SQL Editor**
2. Скопируйте и вставьте этот SQL:

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
  COALESCE((SELECT MAX(id) FROM users), 0) + 1,
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

3. Нажмите **Run** для выполнения

### Шаг 4: Проверьте результат
Выполните этот SQL для проверки:

```sql
SELECT 
  u.id,
  u.email,
  u.name,
  u.role,
  u.is_admin,
  u.status,
  u.created_at
FROM users u
WHERE u.email = 'admin@stefa-books.com.ua';
```

### Шаг 5: Протестируйте вход
1. Откройте `http://localhost:3000/admin/login`
2. Введите:
   - **Email**: `admin@stefa-books.com.ua`
   - **Password**: `oqP_Ia5VMO2wy46p`
3. Нажмите **Увійти**

## ✅ Готово!

После выполнения этих шагов админ-панель должна работать корректно.

## 🔧 Альтернативный способ (если первый не работает)

### Через SQL Editor (полный скрипт)

Если создание через веб-интерфейс не работает, используйте этот SQL:

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
) 
SELECT 
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
WHERE NOT EXISTS (
  SELECT 1 FROM auth.users WHERE email = 'admin@stefa-books.com.ua'
);

-- 2. Создаем запись в таблице users
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
  au.id,
  'admin@stefa-books.com.ua',
  'Admin User',
  'admin',
  'active',
  NOW(),
  NOW()
FROM auth.users au
WHERE au.email = 'admin@stefa-books.com.ua'
ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  status = 'active',
  updated_at = NOW();
```

## 🆘 Если ничего не помогает

1. **Проверьте, что сервер запущен**: `npm run dev`
2. **Очистите кеш браузера**: Ctrl+Shift+R
3. **Проверьте переменные окружения** в `.env.local`
4. **Убедитесь, что база данных подключена** в Supabase Dashboard
