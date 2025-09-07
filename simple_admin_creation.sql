-- Простое создание администратора
-- Запустите этот скрипт в Supabase SQL Editor

-- 1. Создаем пользователя напрямую в таблице users
INSERT INTO users (
  id,
  email,
  name,
  role,
  phone,
  subscription_type,
  status,
  notes,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'admin@stefa-books.com.ua',
  'Администратор',
  'admin',
  '+38 (063) 856-54-14',
  'premium',
  'active',
  'Главный администратор системы',
  NOW(),
  NOW()
) ON CONFLICT (email) DO UPDATE SET
  role = 'admin',
  name = 'Администратор',
  phone = '+38 (063) 856-54-14',
  subscription_type = 'premium',
  status = 'active',
  notes = 'Главный администратор системы',
  updated_at = NOW();

-- 2. Проверяем результат
SELECT 
  'Администратор создан!' as status,
  id,
  email,
  name,
  role,
  phone,
  subscription_type,
  status,
  created_at
FROM users 
WHERE email = 'admin@stefa-books.com.ua';

-- 3. Если нужно создать пользователя в auth.users, используйте Supabase Dashboard
-- Authentication > Users > Add user
-- Email: admin@stefa-books.com.ua
-- Password: ваш-пароль
-- Auto Confirm User: ✅
