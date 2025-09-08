-- ============================================================================
-- COMPLETE FIX FOR SUBSCRIPTION_REQUESTS TABLE
-- ============================================================================
-- This script creates or fixes the subscription_requests table with correct structure

-- First, let's see what actually exists
SELECT 'Current table structure:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'subscription_requests' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Drop the table if it exists (to start fresh)
DROP TABLE IF EXISTS public.subscription_requests CASCADE;

-- Create the subscription_requests table with correct structure
CREATE TABLE public.subscription_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL, -- Имя и фамилия
    email TEXT NOT NULL, -- Email адрес
    phone TEXT NOT NULL, -- Номер телефона
    social TEXT, -- Instagram или другой соц. сеть (может быть NULL)
    subscription_type TEXT NOT NULL CHECK (subscription_type IN ('mini', 'maxi')), -- Тип подписки
    payment_method TEXT NOT NULL CHECK (payment_method IN ('Онлайн оплата', 'Переказ на карту')), -- Способ оплаты
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_subscription_requests_email ON public.subscription_requests (email);
CREATE INDEX IF NOT EXISTS idx_subscription_requests_phone ON public.subscription_requests (phone);
CREATE INDEX IF NOT EXISTS idx_subscription_requests_status ON public.subscription_requests (status);
CREATE INDEX IF NOT EXISTS idx_subscription_requests_created_at ON public.subscription_requests (created_at);

-- Enable RLS
ALTER TABLE public.subscription_requests ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow public insert for subscription requests" ON public.subscription_requests
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow admin full access to subscription requests" ON public.subscription_requests
    FOR ALL USING (true);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_subscription_requests_updated_at 
    BEFORE UPDATE ON public.subscription_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE public.subscription_requests IS 'Заявки на подписку от пользователей';
COMMENT ON COLUMN public.subscription_requests.name IS 'Имя и фамилия пользователя';
COMMENT ON COLUMN public.subscription_requests.email IS 'Email адрес пользователя';
COMMENT ON COLUMN public.subscription_requests.phone IS 'Номер телефона пользователя';
COMMENT ON COLUMN public.subscription_requests.social IS 'Ник в Telegram или Instagram (может быть пустым)';
COMMENT ON COLUMN public.subscription_requests.subscription_type IS 'Тип подписки: mini или maxi';
COMMENT ON COLUMN public.subscription_requests.payment_method IS 'Способ оплаты: Онлайн оплата или Переказ на карту';
COMMENT ON COLUMN public.subscription_requests.message IS 'Дополнительное сообщение от пользователя';
COMMENT ON COLUMN public.subscription_requests.screenshot IS 'URL скриншота перевода (загружается в Cloudinary)';
COMMENT ON COLUMN public.subscription_requests.privacy_consent IS 'Согласие с политикой конфиденциальности';
COMMENT ON COLUMN public.subscription_requests.status IS 'Статус заявки: pending, approved, rejected, completed';
COMMENT ON COLUMN public.subscription_requests.admin_notes IS 'Заметки администратора';
COMMENT ON COLUMN public.subscription_requests.processed_at IS 'Дата обработки заявки';
COMMENT ON COLUMN public.subscription_requests.processed_by IS 'ID администратора, который обработал заявку';

-- Verify the final structure
SELECT 'Final table structure:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'subscription_requests' 
AND table_schema = 'public'
ORDER BY ordinal_position;
