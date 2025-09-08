-- ============================================================================
-- UPDATE SUBSCRIPTION REQUESTS TABLE STRUCTURE
-- ============================================================================

-- Обновляем структуру таблицы subscription_requests для новой формы подписки

-- Проверяем, существует ли таблица subscription_requests
DO $$ 
BEGIN
    -- Если таблица не существует, создаем её с правильной структурой
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables 
                   WHERE table_name = 'subscription_requests' 
                   AND table_schema = 'public') THEN
        RAISE NOTICE 'Table subscription_requests does not exist. Creating it.';
        
        CREATE TABLE public.subscription_requests (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            phone TEXT NOT NULL,
            social TEXT,
            subscription_type TEXT NOT NULL CHECK (subscription_type IN ('mini', 'maxi')),
            payment_method TEXT NOT NULL CHECK (payment_method IN ('Онлайн оплата', 'Переказ на карту')),
            message TEXT,
            screenshot TEXT,
            privacy_consent BOOLEAN NOT NULL DEFAULT false,
            status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
            admin_notes TEXT,
            processed_at TIMESTAMPTZ,
            processed_by UUID REFERENCES public.users(id),
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
        
        -- Создаем индексы
        CREATE INDEX IF NOT EXISTS idx_subscription_requests_email ON public.subscription_requests (email);
        CREATE INDEX IF NOT EXISTS idx_subscription_requests_phone ON public.subscription_requests (phone);
        CREATE INDEX IF NOT EXISTS idx_subscription_requests_status ON public.subscription_requests (status);
        CREATE INDEX IF NOT EXISTS idx_subscription_requests_created_at ON public.subscription_requests (created_at);
        
        -- Включаем RLS
        ALTER TABLE public.subscription_requests ENABLE ROW LEVEL SECURITY;
        
        -- Создаем политики
        CREATE POLICY "Allow public insert for subscription requests" ON public.subscription_requests
            FOR INSERT WITH CHECK (true);
        CREATE POLICY "Allow admin full access to subscription requests" ON public.subscription_requests
            FOR ALL USING (true);
            
        RETURN;
    END IF;
    
    -- Если таблица существует, обновляем структуру
    RAISE NOTICE 'Table subscription_requests exists. Updating structure.';
    
    -- Добавляем недостающие колонки
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'subscription_requests' 
                   AND column_name = 'social' 
                   AND table_schema = 'public') THEN
        ALTER TABLE public.subscription_requests ADD COLUMN social TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'subscription_requests' 
                   AND column_name = 'subscription_type' 
                   AND table_schema = 'public') THEN
        ALTER TABLE public.subscription_requests ADD COLUMN subscription_type TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'subscription_requests' 
                   AND column_name = 'payment_method' 
                   AND table_schema = 'public') THEN
        ALTER TABLE public.subscription_requests ADD COLUMN payment_method TEXT;
    END IF;
    
    -- Обрабатываем колонку plan -> subscription_type
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'subscription_requests' 
               AND column_name = 'plan' 
               AND table_schema = 'public') THEN
        -- Если есть plan, но нет subscription_type - переименовываем
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'subscription_requests' 
                       AND column_name = 'subscription_type' 
                       AND table_schema = 'public') THEN
            ALTER TABLE public.subscription_requests RENAME COLUMN plan TO subscription_type;
        ELSE
            -- Если есть обе колонки - удаляем plan
            ALTER TABLE public.subscription_requests DROP COLUMN plan;
        END IF;
    END IF;
END $$;

-- Обновляем ограничения для существующей таблицы
DO $$ 
BEGIN
    -- Удаляем старые ограничения
    ALTER TABLE public.subscription_requests DROP CONSTRAINT IF EXISTS subscription_requests_plan_check;
    ALTER TABLE public.subscription_requests DROP CONSTRAINT IF EXISTS subscription_requests_subscription_type_check;
    ALTER TABLE public.subscription_requests DROP CONSTRAINT IF EXISTS subscription_requests_payment_method_check;
    
    -- Добавляем новые ограничения
    ALTER TABLE public.subscription_requests ADD CONSTRAINT subscription_requests_subscription_type_check 
        CHECK (subscription_type IN ('mini', 'maxi'));
    ALTER TABLE public.subscription_requests ADD CONSTRAINT subscription_requests_payment_method_check 
        CHECK (payment_method IN ('Онлайн оплата', 'Переказ на карту'));
END $$;

-- Обновляем комментарии
COMMENT ON COLUMN public.subscription_requests.social IS 'Ник в Telegram или Instagram (может быть пустым)';
COMMENT ON COLUMN public.subscription_requests.subscription_type IS 'Тип подписки: mini или maxi';
COMMENT ON COLUMN public.subscription_requests.payment_method IS 'Способ оплаты: Онлайн оплата или Переказ на карту';
COMMENT ON COLUMN public.subscription_requests.screenshot IS 'URL скриншота перевода (загружается в Cloudinary)';
COMMENT ON COLUMN public.subscription_requests.message IS 'Дополнительное сообщение от пользователя';
