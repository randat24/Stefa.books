-- Диагностика проблемы создания администратора
-- Запустите этот скрипт в Supabase SQL Editor

-- 1. Проверяем структуру таблицы users
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- 2. Проверяем существующих пользователей
SELECT 
  'Существующие пользователи' as info,
  COUNT(*) as count
FROM users;

-- 3. Проверяем, есть ли уже admin@stefa-books.com.ua
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM users WHERE email = 'admin@stefa-books.com.ua') 
    THEN 'Пользователь УЖЕ существует' 
    ELSE 'Пользователь НЕ найден' 
  END as status;

-- 4. Проверяем auth.users (если доступно)
SELECT 
  'Пользователи в auth.users' as info,
  COUNT(*) as count
FROM auth.users;

-- 5. Проверяем ограничения таблицы users
SELECT 
  conname as constraint_name,
  contype as constraint_type,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'users'::regclass;

-- 6. Проверяем индексы
SELECT 
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename = 'users';

-- 7. Если нужно, создаем пользователя вручную
-- ВНИМАНИЕ: Этот блок выполняется только если пользователь не существует
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

-- 8. Финальная проверка
SELECT 
  'Результат' as info,
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
