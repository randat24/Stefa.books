# Настройка тестовых данных для админ панели

## Шаги для создания тестовых пользователей, аренд и платежей

### 1. Создание тестовых пользователей

Выполните SQL в Supabase Dashboard > SQL Editor:

```sql
-- Создание тестовых пользователей для проверки админ панели
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
```

### 2. Создание тестовых аренд

```sql
-- Создание тестовых аренд для проверки админ панели
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
```

### 3. Создание тестовых платежей

```sql
-- Создание тестовых платежей для проверки админ панели
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
```

## Проверка результатов

После выполнения всех SQL скриптов:

1. **Пользователи**: В админ панели на вкладке "Користувачі" должно отображаться 3 активных пользователя
2. **Аренды**: На вкладке "Оренди" должно быть 5 записей (3 активные, 1 просроченная, 1 возвращенная)
3. **Аналитика**: На вкладке "Звіти" должны отображаться метрики и последние платежи

## Цены подписок

- **Mini**: 300 ₴
- **Maxi**: 500 ₴  
- **Premium**: 1500 ₴

## Что можно протестировать

1. **Управление пользователями**: Просмотр списка пользователей, их подписок и статусов
2. **Управление арендами**: Отслеживание активных, просроченных и возвращенных книг
3. **Аналитика**: Просмотр доходов, статистики использования и последних платежей
4. **Обновление данных**: Кнопки "Оновити" в каждом разделе для обновления данных
