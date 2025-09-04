-- Создание тестовых платежей для проверки админ панели
-- Выполните этот SQL в Supabase Dashboard > SQL Editor

-- Создаем тестовые платежи для активных пользователей
INSERT INTO public.payments (
  id,
  user_id,
  amount_uah,
  currency,
  payment_method,
  status,
  transaction_id,
  payment_date,
  description,
  created_at,
  updated_at
)
SELECT 
  gen_random_uuid(),
  u.id,
  CASE 
    WHEN u.subscription_type = 'premium' THEN 1500
    WHEN u.subscription_type = 'maxi' THEN 500
    WHEN u.subscription_type = 'mini' THEN 300
    ELSE 300
  END,
  'UAH',
  CASE (random() * 3)::int
    WHEN 0 THEN 'monobank'
    WHEN 1 THEN 'online'
    ELSE 'cash'
  END,
  'completed',
  'TXN_' || extract(epoch from now())::text || '_' || (random() * 1000)::int,
  CURRENT_DATE - INTERVAL '10 days', -- платеж 10 дней назад
  'Оплата підписки ' || u.subscription_type || ' на 3 місяці',
  NOW(),
  NOW()
FROM public.users u
WHERE u.status = 'active'
LIMIT 3;

-- Создаем дополнительные платежи за текущий месяц
INSERT INTO public.payments (
  id,
  user_id,
  amount_uah,
  currency,
  payment_method,
  status,
  transaction_id,
  payment_date,
  description,
  created_at,
  updated_at
)
SELECT 
  gen_random_uuid(),
  u.id,
  200, -- дополнительная плата за продление
  'UAH',
  'monobank',
  'completed',
  'TXN_' || extract(epoch from now())::text || '_' || (random() * 1000)::int,
  CURRENT_DATE - INTERVAL '5 days', -- платеж 5 дней назад
  'Додаткова плата за продовження підписки',
  NOW(),
  NOW()
FROM public.users u
WHERE u.status = 'active'
LIMIT 2;

-- Создаем неудачный платеж
INSERT INTO public.payments (
  id,
  user_id,
  amount_uah,
  currency,
  payment_method,
  status,
  transaction_id,
  payment_date,
  description,
  created_at,
  updated_at
)
SELECT 
  gen_random_uuid(),
  u.id,
  1000,
  'UAH',
  'online',
  'failed',
  'TXN_FAILED_' || extract(epoch from now())::text,
  CURRENT_DATE - INTERVAL '3 days',
  'Неудачна спроба оплати',
  NOW(),
  NOW()
FROM public.users u
WHERE u.status = 'active'
LIMIT 1;

-- Проверяем созданные платежи
SELECT 
  p.id,
  u.name as user_name,
  p.amount_uah,
  p.payment_method,
  p.status,
  p.payment_date,
  p.description,
  p.created_at
FROM public.payments p
JOIN public.users u ON p.user_id = u.id
ORDER BY p.created_at DESC;
