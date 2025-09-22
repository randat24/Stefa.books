# Ручная миграция базы данных

## 🎯 Цель
Создать таблицу `subscription_requests` с полем `address` в Supabase.

## 📋 Пошаговые инструкции

### Шаг 1: Откройте Supabase Dashboard
1. Перейдите на [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Войдите в свой аккаунт
3. Выберите проект **stefa-books-next**

### Шаг 2: Откройте SQL Editor
1. В левом меню нажмите **SQL Editor**
2. Нажмите **New query**

### Шаг 3: Выполните SQL миграцию
Скопируйте и вставьте следующий SQL код:

```sql
-- ============================================================================
-- СОЗДАНИЕ ТАБЛИЦЫ SUBSCRIPTION_REQUESTS С ПОЛЕМ ADDRESS
-- ============================================================================

-- 1. Проверяем, существует ли таблица
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'subscription_requests' AND table_schema = 'public') 
        THEN 'Таблица subscription_requests уже существует'
        ELSE 'Таблица subscription_requests НЕ существует - создаем'
    END as table_status;

-- 2. Удаляем таблицу, если она существует (для чистого старта)
DROP TABLE IF EXISTS public.subscription_requests CASCADE;

-- 3. Создаем таблицу subscription_requests с правильной структурой
CREATE TABLE public.subscription_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT, -- Адрес доставки (может быть NULL)
    social TEXT, -- Социальные сети
    subscription_type TEXT NOT NULL CHECK (subscription_type IN ('mini', 'maxi', 'premium')),
    payment_method TEXT NOT NULL CHECK (payment_method IN ('monobank', 'online', 'cash')),
    message TEXT, -- Дополнительное сообщение
    screenshot TEXT, -- URL скриншота
    privacy_consent BOOLEAN DEFAULT false,
    marketing_consent BOOLEAN DEFAULT false,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Создаем индексы для оптимизации
CREATE INDEX idx_subscription_requests_email ON public.subscription_requests (email);
CREATE INDEX idx_subscription_requests_status ON public.subscription_requests (status);
CREATE INDEX idx_subscription_requests_created_at ON public.subscription_requests (created_at);
CREATE INDEX idx_subscription_requests_subscription_type ON public.subscription_requests (subscription_type);

-- 5. Включаем RLS (Row Level Security)
ALTER TABLE public.subscription_requests ENABLE ROW LEVEL SECURITY;

-- 6. Создаем RLS политики
-- Политика для публичного доступа (только чтение)
CREATE POLICY "Public can view subscription requests" ON public.subscription_requests
    FOR SELECT USING (true);

-- Политика для вставки (любой может создавать заявки)
CREATE POLICY "Anyone can insert subscription requests" ON public.subscription_requests
    FOR INSERT WITH CHECK (true);

-- Политика для обновления (только service_role)
CREATE POLICY "Service role can update subscription requests" ON public.subscription_requests
    FOR UPDATE USING (auth.role() = 'service_role');

-- Политика для удаления (только service_role)
CREATE POLICY "Service role can delete subscription requests" ON public.subscription_requests
    FOR DELETE USING (auth.role() = 'service_role');

-- 7. Создаем функцию для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_subscription_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Создаем триггер для автоматического обновления updated_at
CREATE TRIGGER update_subscription_requests_updated_at
    BEFORE UPDATE ON public.subscription_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_subscription_requests_updated_at();

-- 9. Проверяем финальную структуру таблицы
SELECT 'Финальная структура таблицы subscription_requests:' as info;
SELECT 
    column_name as "Поле",
    data_type as "Тип данных",
    is_nullable as "Может быть NULL",
    column_default as "Значение по умолчанию"
FROM information_schema.columns 
WHERE table_name = 'subscription_requests' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 10. Тестируем вставку тестовой записи
INSERT INTO public.subscription_requests (
    name, 
    email, 
    phone, 
    address, 
    subscription_type, 
    payment_method, 
    message, 
    privacy_consent
) VALUES (
    'Тестовый Пользователь',
    'test@example.com',
    '+380123456789',
    'ул. Тестовая, 123, кв. 45',
    'mini',
    'monobank',
    'Тестовая заявка',
    true
);

-- 11. Проверяем, что запись создалась
SELECT 'Тестовая запись создана:' as info;
SELECT id, name, email, phone, address, subscription_type, status, created_at
FROM public.subscription_requests 
WHERE email = 'test@example.com'
ORDER BY created_at DESC
LIMIT 1;

-- 12. Удаляем тестовую запись
DELETE FROM public.subscription_requests WHERE email = 'test@example.com';

SELECT '✅ Таблица subscription_requests успешно создана с полем address!' as result;
```

### Шаг 4: Выполните SQL
1. Нажмите кнопку **Run** или **Ctrl+Enter**
2. Дождитесь завершения выполнения
3. Проверьте результаты в нижней панели

### Шаг 5: Проверьте результат
После выполнения SQL вы должны увидеть:
- ✅ Сообщение о создании таблицы
- 📋 Структуру таблицы с полем `address`
- ✅ Сообщение об успешном создании

### Шаг 6: Протестируйте API
После выполнения миграции запустите тест:

```bash
node test-api-simple.js
```

Ожидаемый результат:
- Статус ответа: 200
- Заявка успешно создана
- Данные платежа получены

## 🔧 Альтернативный способ

Если у вас есть доступ к Supabase CLI, можете выполнить:

```bash
supabase db reset
supabase db push
```

## ⚠️ Важные замечания

1. **Резервное копирование**: Перед выполнением миграции сделайте резервную копию базы данных
2. **Тестирование**: После миграции протестируйте все формы подписки
3. **Мониторинг**: Следите за логами после развертывания

## 🆘 Если что-то пошло не так

1. **Проверьте логи** в Supabase Dashboard
2. **Выполните проверочный SQL** из файла `check-subscription-requests-structure.sql`
3. **Проверьте переменные окружения** в `.env.local`
4. **Убедитесь, что RLS политики настроены** правильно

## 📞 Поддержка

Если возникли проблемы:
1. Проверьте логи в Netlify Dashboard
2. Проверьте переменные окружения
3. Убедитесь, что Supabase подключение работает
4. Проверьте, что все SQL миграции выполнены успешно
