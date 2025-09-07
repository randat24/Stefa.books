-- Создание нового администратора с нуля
-- Запустите этот скрипт в Supabase SQL Editor

-- 1. Сначала проверим, что у нас есть
SELECT 
  'Текущие пользователи' as info,
  COUNT(*) as count
FROM users;

-- 2. Покажем всех пользователей
SELECT 
  id,
  email,
  name,
  role,
  phone,
  subscription_type,
  status,
  created_at
FROM users 
ORDER BY created_at DESC;

-- 3. Создаем нового администратора с уникальным email
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

-- 4. Проверяем результат
SELECT 
  'Администратор готов!' as status,
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

-- 5. Если нужно создать с другим email
-- INSERT INTO users (
--   id,
--   email,
--   name,
--   role,
--   phone,
--   subscription_type,
--   status,
--   notes,
--   created_at,
--   updated_at
-- ) VALUES (
--   gen_random_uuid(),
--   'admin2@stefa-books.com.ua',
--   'Администратор 2',
--   'admin',
--   '+38 (063) 856-54-14',
--   'premium',
--   'active',
--   'Второй администратор системы',
--   NOW(),
--   NOW()
-- );
