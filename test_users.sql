-- Создание тестовых пользователей для проверки админ панели
-- Выполните этот SQL в Supabase Dashboard > SQL Editor

-- Вставляем 3 активных пользователя
INSERT INTO public.users (
  id,
  name,
  email,
  phone,
  subscription_type,
  subscription_start,
  subscription_end,
  status,
  address,
  notes,
  created_at,
  updated_at
) VALUES 
(
  gen_random_uuid(),
  'Анна Петренко',
  'anna.petrenko@example.com',
  '+380501234567',
  'premium',
  '2024-12-01',
  '2025-12-01',
  'active',
  'вул. Соборна 15, кв. 42, Миколаїв',
  'Постійний клієнт, любить дитячі книги',
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  'Олексій Коваленко',
  'oleksiy.kovalenko@example.com',
  '+380671234567',
  'maxi',
  '2024-11-15',
  '2025-05-15',
  'active',
  'вул. Адміральська 8, кв. 12, Миколаїв',
  'Зацікавлений в науковій літературі',
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  'Марія Сидоренко',
  'maria.sydorenko@example.com',
  '+380931234567',
  'mini',
  '2024-12-10',
  '2025-03-10',
  'active',
  'вул. Центральна 25, кв. 7, Миколаїв',
  'Новий клієнт, тестує сервіс',
  NOW(),
  NOW()
);

-- Проверяем, что пользователи созданы
SELECT 
  name,
  email,
  subscription_type,
  status,
  created_at
FROM public.users 
WHERE status = 'active'
ORDER BY created_at DESC;
