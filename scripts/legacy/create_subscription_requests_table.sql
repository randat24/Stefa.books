-- Создание таблицы для заявок на подписку
CREATE TABLE IF NOT EXISTS subscription_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  social VARCHAR(255),
  plan VARCHAR(20) NOT NULL CHECK (plan IN ('mini', 'maxi', 'premium')),
  payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('monobank', 'online', 'cash')),
  message TEXT,
  screenshot TEXT,
  privacy_consent BOOLEAN NOT NULL DEFAULT false,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Добавляем колонку social если её нет
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'subscription_requests' 
                 AND column_name = 'social') THEN
    ALTER TABLE subscription_requests ADD COLUMN social VARCHAR(255);
  END IF;
END $$;

-- Создание индексов для оптимизации запросов
CREATE INDEX IF NOT EXISTS idx_subscription_requests_email ON subscription_requests(email);
CREATE INDEX IF NOT EXISTS idx_subscription_requests_status ON subscription_requests(status);
CREATE INDEX IF NOT EXISTS idx_subscription_requests_created_at ON subscription_requests(created_at);

-- Включение RLS (Row Level Security)
ALTER TABLE subscription_requests ENABLE ROW LEVEL SECURITY;

-- Политика для чтения заявок (только для аутентифицированных пользователей)
CREATE POLICY "Users can view their own subscription requests" ON subscription_requests
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Политика для вставки новых заявок (публичный доступ)
CREATE POLICY "Anyone can create subscription requests" ON subscription_requests
  FOR INSERT WITH CHECK (true);

-- Политика для обновления заявок (только для аутентифицированных пользователей)
CREATE POLICY "Users can update their own subscription requests" ON subscription_requests
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Функция для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггер для автоматического обновления updated_at
CREATE TRIGGER update_subscription_requests_updated_at
  BEFORE UPDATE ON subscription_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Комментарии к таблице и колонкам
COMMENT ON TABLE subscription_requests IS 'Заявки на подписку от пользователей';
COMMENT ON COLUMN subscription_requests.name IS 'Имя и фамилия пользователя';
COMMENT ON COLUMN subscription_requests.email IS 'Email адрес пользователя';
COMMENT ON COLUMN subscription_requests.phone IS 'Номер телефона пользователя';
COMMENT ON COLUMN subscription_requests.social IS 'Социальные сети (Telegram/Instagram)';
COMMENT ON COLUMN subscription_requests.plan IS 'Выбранный план подписки';
COMMENT ON COLUMN subscription_requests.payment_method IS 'Способ оплаты';
COMMENT ON COLUMN subscription_requests.message IS 'Дополнительное сообщение от пользователя';
COMMENT ON COLUMN subscription_requests.screenshot IS 'Скриншот оплаты (если есть)';
COMMENT ON COLUMN subscription_requests.privacy_consent IS 'Согласие с политикой конфиденциальности';
COMMENT ON COLUMN subscription_requests.status IS 'Статус заявки';
