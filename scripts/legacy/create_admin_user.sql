-- Скрипт для создания нового администратора
-- Запустите этот скрипт в Supabase SQL Editor

-- 1. Создаем пользователя в auth.users (используя Supabase Auth Admin API)
-- ВАЖНО: Этот шаг нужно выполнить через Supabase Dashboard или API
-- 
-- Перейдите в Supabase Dashboard > Authentication > Users > Add user
-- Email: admin@stefa-books.com.ua (или ваш email)
-- Password: выберите надежный пароль
-- Email confirm: true

-- 2. После создания пользователя в auth.users, выполните следующие команды:

-- Обновляем профиль пользователя, делая его админом
UPDATE users 
SET 
  role = 'admin',
  name = 'Администратор',
  phone = '+38 (063) 856-54-14',
  subscription_type = 'premium',
  status = 'active',
  notes = 'Главный администратор системы',
  updated_at = NOW()
WHERE email = 'admin@stefa-books.com.ua';

-- Проверяем, что пользователь создан
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
WHERE email = 'admin@stefa-books.com.ua';

-- Если пользователь не найден, создаем его вручную
-- (Этот блок выполняется только если пользователь не существует в auth.users)
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Проверяем, существует ли пользователь
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@stefa-books.com.ua') THEN
    -- Генерируем UUID для пользователя
    admin_user_id := gen_random_uuid();
    
    -- Создаем запись в таблице users
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
      admin_user_id,
      'admin@stefa-books.com.ua',
      'Администратор',
      'admin',
      '+38 (063) 856-54-14',
      'premium',
      'active',
      'Главный администратор системы',
      NOW(),
      NOW()
    );
    
    RAISE NOTICE 'Администратор создан с ID: %', admin_user_id;
  ELSE
    RAISE NOTICE 'Администратор уже существует';
  END IF;
END $$;

-- Финальная проверка
SELECT 
  'Администратор создан успешно!' as status,
  id,
  email,
  name,
  role,
  phone,
  subscription_type,
  status as user_status,
  created_at
FROM users 
WHERE email = 'admin@stefa-books.com.ua';
