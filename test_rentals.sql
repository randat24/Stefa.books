-- Создание тестовых аренд для проверки админ панели
-- Выполните этот SQL в Supabase Dashboard > SQL Editor

-- Сначала получаем ID пользователей и книг
WITH user_ids AS (
  SELECT id, name FROM public.users WHERE status = 'active' LIMIT 3
),
book_ids AS (
  SELECT id, title, code FROM public.books WHERE available = true LIMIT 5
)

-- Создаем тестовые аренды
INSERT INTO public.rentals (
  id,
  user_id,
  book_id,
  rental_date,
  due_date,
  return_date,
  status,
  notes,
  created_at,
  updated_at
)
SELECT 
  gen_random_uuid(),
  u.id,
  b.id,
  CURRENT_DATE - INTERVAL '5 days', -- арендована 5 дней назад
  CURRENT_DATE + INTERVAL '25 days', -- должна быть возвращена через 25 дней
  NULL, -- еще не возвращена
  'active',
  'Тестова аренда для перевірки адмін панелі',
  NOW(),
  NOW()
FROM user_ids u
CROSS JOIN book_ids b
LIMIT 3;

-- Создаем просроченную аренду
INSERT INTO public.rentals (
  id,
  user_id,
  book_id,
  rental_date,
  due_date,
  return_date,
  status,
  notes,
  created_at,
  updated_at
)
SELECT 
  gen_random_uuid(),
  u.id,
  b.id,
  CURRENT_DATE - INTERVAL '35 days', -- арендована 35 дней назад
  CURRENT_DATE - INTERVAL '5 days', -- просрочена на 5 дней
  NULL, -- еще не возвращена
  'overdue',
  'Просрочена аренда для тестування',
  NOW(),
  NOW()
FROM user_ids u
CROSS JOIN book_ids b
LIMIT 1;

-- Создаем возвращенную аренду
INSERT INTO public.rentals (
  id,
  user_id,
  book_id,
  rental_date,
  due_date,
  return_date,
  status,
  notes,
  created_at,
  updated_at
)
SELECT 
  gen_random_uuid(),
  u.id,
  b.id,
  CURRENT_DATE - INTERVAL '20 days', -- арендована 20 дней назад
  CURRENT_DATE - INTERVAL '5 days', -- должна была быть возвращена 5 дней назад
  CURRENT_DATE - INTERVAL '2 days', -- возвращена 2 дня назад
  'returned',
  'Повернута аренда',
  NOW(),
  NOW()
FROM user_ids u
CROSS JOIN book_ids b
LIMIT 1;

-- Проверяем созданные аренды
SELECT 
  r.id,
  u.name as user_name,
  b.title as book_title,
  b.code as book_code,
  r.rental_date,
  r.due_date,
  r.return_date,
  r.status,
  r.created_at
FROM public.rentals r
JOIN public.users u ON r.user_id = u.id
JOIN public.books b ON r.book_id = b.id
ORDER BY r.created_at DESC;
