-- ============================================================================
-- ADD SUBSCRIPTION REQUESTS TABLE
-- ============================================================================

-- Создаем таблицу для заявок на подписку
CREATE TABLE IF NOT EXISTS public.subscription_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL, -- Имя и фамилия
    email TEXT NOT NULL, -- Email адрес
    phone TEXT NOT NULL, -- Номер телефона
    social TEXT, -- Instagram или другой соц. сеть
    plan TEXT NOT NULL CHECK (plan IN ('mini', 'maxi', 'premium')), -- Тип подписки
    payment_method TEXT NOT NULL CHECK (payment_method IN ('monobank', 'online', 'cash')), -- Способ оплаты
    message TEXT, -- Дополнительное сообщение
    screenshot TEXT, -- URL скриншота оплаты
    privacy_consent BOOLEAN NOT NULL DEFAULT false, -- Согласие с политикой
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')), -- Статус заявки
    admin_notes TEXT, -- Заметки администратора
    processed_at TIMESTAMPTZ, -- Дата обработки
    processed_by UUID REFERENCES public.users(id), -- Кто обработал
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_subscription_requests_email ON public.subscription_requests (email);
CREATE INDEX IF NOT EXISTS idx_subscription_requests_phone ON public.subscription_requests (phone);
CREATE INDEX IF NOT EXISTS idx_subscription_requests_status ON public.subscription_requests (status);
CREATE INDEX IF NOT EXISTS idx_subscription_requests_created_at ON public.subscription_requests (created_at);

-- Включаем RLS
ALTER TABLE public.subscription_requests ENABLE ROW LEVEL SECURITY;

-- Политики для заявок (удаляем существующие перед созданием новых)
DROP POLICY IF EXISTS "Allow public insert for subscription requests" ON public.subscription_requests;
DROP POLICY IF EXISTS "Allow admin full access to subscription requests" ON public.subscription_requests;

CREATE POLICY "Allow public insert for subscription requests" ON public.subscription_requests
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow admin full access to subscription requests" ON public.subscription_requests
    FOR ALL USING (true);

-- Триггер для обновления updated_at (удаляем существующий перед созданием)
DROP TRIGGER IF EXISTS update_subscription_requests_updated_at ON public.subscription_requests;
CREATE TRIGGER update_subscription_requests_updated_at BEFORE UPDATE ON public.subscription_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Комментарий к таблице
COMMENT ON TABLE public.subscription_requests IS 'Заявки на подписку от пользователей';
