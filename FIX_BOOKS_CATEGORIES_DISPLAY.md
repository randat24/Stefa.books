# 🔧 Исправление отображения книг и категорий на сайте

**Проблема**: На сайте не отображаются книги и категории  
**Причина**: RLS политики блокируют доступ к данным через anon key

## 🚨 **Диагностика показала:**

- ❌ **API Books**: `{"error":"Ошибка при получении книг"}`
- ❌ **API Categories**: `{"success":false,"error":"Помилка отримання категорій з бази даних"}`

## 🎯 **РЕШЕНИЕ:**

### **Шаг 1: Исправить RLS политики в Supabase**

1. **Откройте**: [Supabase Dashboard](https://supabase.com/dashboard)
2. **Перейдите в**: SQL Editor
3. **Выполните SQL скрипт**: `fix_books_categories_api.sql`

**Или скопируйте и выполните этот код:**

```sql
-- Исправление RLS политик для отображения книг и категорий

-- ============================================================================
-- ИСПРАВЛЕНИЕ RLS ДЛЯ ТАБЛИЦЫ BOOKS
-- ============================================================================

-- Отключаем RLS для таблицы books
ALTER TABLE public.books DISABLE ROW LEVEL SECURITY;

-- Удаляем все существующие политики для books
DO $$
DECLARE
    policy_name TEXT;
BEGIN
    FOR policy_name IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'books' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.books', policy_name);
    END LOOP;
END $$;

-- Создаем простые политики для books
CREATE POLICY "books_select_public" ON public.books 
    FOR SELECT USING (true);

CREATE POLICY "books_insert_admin" ON public.books 
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE email = auth.email() AND role = 'admin'
        )
    );

-- Включаем RLS обратно
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- ИСПРАВЛЕНИЕ RLS ДЛЯ ТАБЛИЦЫ CATEGORIES
-- ============================================================================

-- Отключаем RLS для таблицы categories
ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;

-- Удаляем все существующие политики для categories
DO $$
DECLARE
    policy_name TEXT;
BEGIN
    FOR policy_name IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'categories' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.categories', policy_name);
    END LOOP;
END $$;

-- Создаем простые политики для categories
CREATE POLICY "categories_select_public" ON public.categories 
    FOR SELECT USING (true);

-- Включаем RLS обратно
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
```

### **Шаг 2: Проверить результат**

После выполнения SQL проверьте:

```bash
# Проверка API Books
curl https://stefa-books.com.ua/api/books

# Проверка API Categories  
curl https://stefa-books.com.ua/api/categories
```

**Ожидаемый результат:**
- ✅ API Books вернет список книг
- ✅ API Categories вернет список категорий

### **Шаг 3: Проверить сайт**

1. **Откройте**: [https://stefa-books.com.ua](https://stefa-books.com.ua)
2. **Проверьте**: Отображаются ли книги на главной странице
3. **Проверьте**: Работает ли каталог книг
4. **Проверьте**: Отображаются ли категории

## 🔍 **Дополнительная диагностика**

Если проблема не решается, проверьте:

### **1. Переменные окружения в Vercel:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### **2. Логи Vercel:**
- Vercel Dashboard → Functions → View Logs

### **3. Логи Supabase:**
- Supabase Dashboard → Logs

## ✅ **Ожидаемый результат**

После исправления RLS политик:
- ✅ **Главная страница**: Отображаются книги
- ✅ **Каталог**: Работает поиск и фильтрация
- ✅ **Категории**: Отображаются в меню
- ✅ **API**: Возвращают данные вместо ошибок

---

**Время исправления**: 2-3 минуты  
**Сложность**: Простая  
**Результат**: Полноценный сайт с книгами и категориями! 🚀
