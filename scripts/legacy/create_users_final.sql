-- Создание пользователей для Stefa.Books
-- Дата: 7 вересня 2025
-- Версия: 2.1.0

-- Сначала проверим, существуют ли уже эти пользователи
SELECT 
    email,
    name,
    role,
    status,
    created_at
FROM public.users 
WHERE email IN (
    'admin@stefa-books.com.ua',
    'anastasia@stefa-books.com.ua', 
    'randat24@gmail.com'
)
ORDER BY email;

-- Создаем функцию для безопасного создания пользователей
CREATE OR REPLACE FUNCTION create_user_safe(
    user_email TEXT,
    user_name TEXT,
    user_role TEXT DEFAULT 'user',
    user_phone TEXT DEFAULT NULL,
    user_subscription_type TEXT DEFAULT 'basic',
    user_status TEXT DEFAULT 'active',
    user_notes TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    new_user_id UUID;
    existing_user_id UUID;
BEGIN
    -- Проверяем, существует ли пользователь
    SELECT id INTO existing_user_id 
    FROM public.users 
    WHERE email = user_email;
    
    IF existing_user_id IS NOT NULL THEN
        -- Обновляем существующего пользователя
        UPDATE public.users SET
            name = user_name,
            role = user_role,
            phone = user_phone,
            subscription_type = user_subscription_type,
            status = user_status,
            notes = user_notes,
            updated_at = NOW()
        WHERE email = user_email;
        
        RETURN existing_user_id;
    ELSE
        -- Создаем нового пользователя
        new_user_id := gen_random_uuid();
        
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
            new_user_id,
            user_email,
            user_name,
            user_role,
            user_phone,
            user_subscription_type,
            user_status,
            user_notes,
            NOW(),
            NOW()
        );
        
        RETURN new_user_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Создаем пользователей
DO $$
DECLARE
    admin_id UUID;
    anastasia_id UUID;
    randat_id UUID;
BEGIN
    -- 1. Создаем главного администратора
    admin_id := create_user_safe(
        'admin@stefa-books.com.ua',
        'Головний Адміністратор',
        'admin',
        '+38 (063) 856-54-14',
        'premium',
        'active',
        'Головний адміністратор системи Stefa.Books'
    );
    
    -- 2. Создаем Анастасию (администратор)
    anastasia_id := create_user_safe(
        'anastasia@stefa-books.com.ua',
        'Анастасія',
        'admin',
        '+38 (050) 123-45-67',
        'premium',
        'active',
        'Адміністратор системи Stefa.Books'
    );
    
    -- 3. Создаем randat24@gmail.com (администратор)
    randat_id := create_user_safe(
        'randat24@gmail.com',
        'Розробник',
        'admin',
        '+38 (067) 987-65-43',
        'premium',
        'active',
        'Розробник та адміністратор проекту Stefa.Books'
    );
    
    -- Выводим результат
    RAISE NOTICE 'Створено/оновлено користувачів:';
    RAISE NOTICE 'Admin: %', admin_id;
    RAISE NOTICE 'Anastasia: %', anastasia_id;
    RAISE NOTICE 'Randat: %', randat_id;
END $$;

-- Проверяем результат
SELECT 
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
FROM public.users 
WHERE email IN (
    'admin@stefa-books.com.ua',
    'anastasia@stefa-books.com.ua', 
    'randat24@gmail.com'
)
ORDER BY 
    CASE 
        WHEN role = 'admin' THEN 1 
        ELSE 2 
    END,
    email;

-- Удаляем временную функцию
DROP FUNCTION IF EXISTS create_user_safe(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT);

-- Проверяем общее количество пользователей
SELECT 
    COUNT(*) as total_users,
    COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_users,
    COUNT(CASE WHEN role = 'user' THEN 1 END) as regular_users,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_users
FROM public.users;
