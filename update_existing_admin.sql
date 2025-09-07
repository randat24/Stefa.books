-- Простой скрипт для обновления существующего администратора
-- Используйте этот скрипт, если пользователь уже существует

-- 1. Обновляем существующего пользователя в public.users
UPDATE public.users SET
    role = 'admin',
    name = 'Администратор',
    phone = '+38 (063) 856-54-14',
    subscription_type = 'premium',
    status = 'active',
    notes = 'Главный администратор системы',
    updated_at = NOW()
WHERE email = 'admin@stefa-books.com.ua';

-- 2. Проверяем результат
SELECT 
  'Администратор обновлен успешно!' as status,
  u.id,
  u.email,
  u.name,
  u.role,
  u.phone,
  u.subscription_type,
  u.status,
  u.created_at,
  u.updated_at
FROM public.users u
WHERE u.email = 'admin@stefa-books.com.ua';

-- 3. Если нужно, также обновляем пароль в auth.users
-- ВНИМАНИЕ: Это обновит пароль существующего пользователя
UPDATE auth.users SET
    encrypted_password = crypt('Admin123!@#', gen_salt('bf')),
    updated_at = NOW()
WHERE email = 'admin@stefa-books.com.ua';
