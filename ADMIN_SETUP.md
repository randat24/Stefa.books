# Налаштування Адмін-панелі Stefa.books

## ✅ Виконані кроки

1. **Структура адмін-панелі створена:**
   - `/src/app/admin/page.tsx` - головна сторінка адмін-панелі
   - `/src/app/admin/actions.ts` - Server Actions для CRUD операцій
   - `/src/app/admin/data.ts` - функції отримання даних
   - `/src/app/api/admin/export/route.ts` - API для експорту CSV

2. **База даних і типи:**
   - `/supabase/migrations/001_initial_schema.sql` - повна схема БД
   - `/src/lib/types/admin.ts` - TypeScript типи
   - `/src/lib/supabase/` - конфігурація клієнтів

3. **Середовище налаштовано:**
   - `.env.local` - змінні оточення
   - `supabase/config.toml` - конфігурація Supabase
   - `src/middleware.ts` - захист маршрутів

4. **UI компоненти встановлено:**
   - Radix UI компоненти додані
   - Tailwind CSS налаштований

## 🔧 Наступні кроки для повного запуску

### 1. Створити Supabase проект

```bash
# Якщо Docker встановлено
supabase start

# Або використовувати хмарний Supabase
# Перейти на https://supabase.com/dashboard
# Створити новий проект
```

### 2. Запустити міграції бази даних

```bash
# Для локального Supabase
supabase db push

# Для хмарного - через Dashboard > SQL Editor
# Виконати вміст файлу supabase/migrations/001_initial_schema.sql
```

### 3. Оновити змінні оточення

Отримати справжні ключі з Supabase Dashboard:

```bash
# У файлі .env.local оновити:
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 4. Додати тестові дані

```sql
-- Приклад додавання книги
INSERT INTO books (code, title, author, category, qty_total, qty_available, price_uah, status)
VALUES ('B001', 'Котигорошко', 'Народна казка', 'Казки', 5, 5, 150, 'available');

-- Приклад додавання користувача  
INSERT INTO users (name, email, phone, subscription_type, status)
VALUES ('Анна Петренко', 'anna@example.com', '+380501234567', 'mini', 'active');
```

## 🚀 Використання адмін-панелі

### Доступ
- URL: `http://localhost:3000/admin`
- У розробці: відкритий доступ
- У продакшені: потрібна автентифікація

### Функціональність

**📚 Управління книгами:**
- Додавання нових книг з усіма деталями
- Редагування інформації про книги
- Відстеження кількості та статусу
- Завантаження зображень обкладинок

**👥 Управління користувачами:**
- Перегляд списку підписників
- Створення нових акаунтів
- Управління підписками та статусами
- Контактна інформація

**📋 Управління орендами:**
- Створення нових орендних записів
- Відстеження поточних оренд
- Обробка повернень книг
- Історія транзакцій

**💰 Фінансова звітність:**
- Трекінг платежів
- Звіти по доходах
- Експорт даних у CSV
- Аналітика по підпискам

**📊 Аналітика та звіти:**
- KPI дашборд
- Статистика використання
- Популярні книги
- Активність користувачів

### Експорт даних
GET `/api/admin/export?type=books&format=csv` - експорт книг
GET `/api/admin/export?type=users&format=csv` - експорт користувачів
GET `/api/admin/export?type=rentals&format=csv` - експорт оренд

## 🔐 Безпека

- Row Level Security (RLS) налаштована у БД
- Middleware захищає адмін маршрути  
- Service Role ключ для серверних операцій
- Валідація даних з Zod схемами

## 📱 Мобільна адаптація

Адмін-панель повністю адаптована для мобільних пристроїв:
- Responsive табли з горизонтальним скролом
- Мобільне меню та навігація
- Сенсорні елементи управління
- Оптимізація для планшетів

## 🛠️ Розвиток

Для додавання нових функцій:

1. **Нова сутність:** додати схему у міграцію
2. **Типи:** оновити `/src/lib/types/admin.ts`
3. **CRUD:** додати actions у `/src/app/admin/actions.ts`
4. **UI:** створити компоненти в `/src/app/admin/`

## 📞 Підтримка

- Логи: перевірити console у браузері
- Помилки БД: Supabase Dashboard > Logs
- Сервер: перевірити терміnal з `pnpm dev`

---

**Адмін-панель Stefa.books готова до використання!** 🎉