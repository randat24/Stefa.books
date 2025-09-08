-- Полная очистка и пересоздание администратора
-- ВНИМАНИЕ: Этот скрипт удалит существующего пользователя и создаст нового

-- 1. Удаляем пользователя из public.users
DELETE FROM public.users WHERE email = 'admin@stefa-books.com.ua';

-- 2. Удаляем пользователя из auth.users
DELETE FROM auth.users WHERE email = 'admin@stefa-books.com.ua';

-- 3. Создаем нового пользователя в auth.users
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  role,
  is_super_admin,
  is_anonymous,
  raw_user_meta_data
) VALUES (
  gen_random_uuid(),
  'admin@stefa-books.com.ua',
  crypt('Admin123!@#', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  'authenticated',
  FALSE,
  FALSE,
  '{"first_name": "Администратор", "last_name": "Системы"}'::jsonb
);

-- 4. Создаем пользователя в public.users
INSERT INTO public.users (
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
)
SELECT 
  au.id,
  'admin@stefa-books.com.ua',
  'Администратор',
  'admin',
  '+38 (063) 856-54-14',
  'premium',
  'active',
  'Главный администратор системы',
  NOW(),
  NOW()
FROM auth.users au
WHERE au.email = 'admin@stefa-books.com.ua';

-- 5. Проверяем результат
SELECT 
  'Администратор пересоздан успешно!' as status,
  u.id,
  u.email,
  u.name,
  u.role,
  u.phone,
  u.subscription_type,
  u.status,
  u.created_at
FROM public.users u
WHERE u.email = 'admin@stefa-books.com.ua';
