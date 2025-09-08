-- Исправленный скрипт создания администратора
-- Обрабатывает случай, когда пользователь уже существует

-- 1. Создаем пользователя в auth.users (если не существует)
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
) 
SELECT 
  gen_random_uuid(),
  'admin@stefa-books.com.ua',
  crypt('Admin123!@#', gen_salt('bf')),   -- bcrypt hash пароля
  NOW(),
  NOW(),
  NOW(),
  'authenticated',
  FALSE,
  FALSE,
  '{"first_name": "Администратор", "last_name": "Системы"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@stefa-books.com.ua')
RETURNING id, email, created_at;

-- 2. Создаем или обновляем пользователя в таблице users
DO $$
DECLARE
    user_exists_in_auth BOOLEAN;
    user_exists_in_public BOOLEAN;
    auth_user_id UUID;
    existing_user_id UUID;
BEGIN
    -- Проверяем, существует ли пользователь в auth.users
    SELECT EXISTS(SELECT 1 FROM auth.users WHERE email = 'admin@stefa-books.com.ua') INTO user_exists_in_auth;
    
    -- Проверяем, существует ли пользователь в public.users
    SELECT EXISTS(SELECT 1 FROM public.users WHERE email = 'admin@stefa-books.com.ua') INTO user_exists_in_public;
    
    IF user_exists_in_auth THEN
        -- Получаем ID пользователя из auth.users
        SELECT id INTO auth_user_id FROM auth.users WHERE email = 'admin@stefa-books.com.ua' LIMIT 1;
        
        IF user_exists_in_public THEN
            -- Получаем ID существующего пользователя в public.users
            SELECT id INTO existing_user_id FROM public.users WHERE email = 'admin@stefa-books.com.ua' LIMIT 1;
            
            -- Если ID совпадают, просто обновляем
            IF existing_user_id = auth_user_id THEN
                UPDATE public.users SET
                    role = 'admin',
                    name = 'Администратор',
                    phone = '+38 (063) 856-54-14',
                    subscription_type = 'premium',
                    status = 'active',
                    notes = 'Главный администратор системы',
                    updated_at = NOW()
                WHERE id = auth_user_id;
            ELSE
                -- Если ID не совпадают, удаляем старую запись и создаем новую
                DELETE FROM public.users WHERE email = 'admin@stefa-books.com.ua';
                
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
                ) VALUES (
                    auth_user_id,
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
            END IF;
        ELSE
            -- Создаем нового пользователя
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
            ) VALUES (
                auth_user_id,
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
        END IF;
    ELSE
        RAISE NOTICE 'Пользователь не найден в auth.users. Сначала создайте пользователя в auth.';
    END IF;
END $$;

-- 3. Проверяем результат
SELECT 
  'Администратор создан/обновлен успешно!' as status,
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
