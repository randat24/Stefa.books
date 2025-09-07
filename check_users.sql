-- Проверка существующих пользователей в системе
-- Запустите этот скрипт в Supabase SQL Editor

-- 1. Проверяем всех пользователей
SELECT 
  'Все пользователи' as info,
  COUNT(*) as total_users
FROM users;

-- 2. Показываем всех пользователей с их ролями
SELECT 
  id,
  email,
  name,
  role,
  phone,
  subscription_type,
  status,
  created_at,
  updated_at
FROM users 
ORDER BY created_at DESC;

-- 3. Проверяем администраторов
SELECT 
  'Администраторы' as info,
  COUNT(*) as admin_count
FROM users 
WHERE role = 'admin';

-- 4. Показываем только администраторов
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
WHERE role = 'admin'
ORDER BY created_at DESC;

-- 5. Проверяем пользователей по email
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM users WHERE email = 'admin@stefa-books.com.ua') 
    THEN 'Админ найден' 
    ELSE 'Админ НЕ найден' 
  END as admin_status;

-- 6. Если нужно создать админа, выполните:
-- UPDATE users SET role = 'admin' WHERE email = 'ваш-email@example.com';
