# ⚡ БЫСТРОЕ ИСПРАВЛЕНИЕ RLS ПОЛИТИК

**Проблема**: Сайт показывает ошибку "Помилка завантаження" и "Failed to fetch books: 500"  
**Причина**: RLS политики блокируют доступ к данным через anon key

## 🚀 **САМОЕ БЫСТРОЕ РЕШЕНИЕ:**

### **Шаг 1: Откройте Supabase Dashboard**
1. Перейдите на [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Войдите в свой аккаунт
3. Выберите проект **stefa-books**

### **Шаг 2: Выполните SQL в SQL Editor**
1. Перейдите в **SQL Editor**
2. Скопируйте и вставьте этот код:

```sql
-- БЫСТРОЕ ИСПРАВЛЕНИЕ RLS ПОЛИТИК
-- Позволяет анонимным пользователям читать книги и категории

-- Отключаем RLS для books
ALTER TABLE public.books DISABLE ROW LEVEL SECURITY;

-- Удаляем все политики для books
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

-- Создаем простую политику для чтения книг
CREATE POLICY "books_public_read" ON public.books 
    FOR SELECT USING (true);

-- Включаем RLS обратно
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

-- Отключаем RLS для categories
ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;

-- Удаляем все политики для categories
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

-- Создаем простую политику для чтения категорий
CREATE POLICY "categories_public_read" ON public.categories 
    FOR SELECT USING (true);

-- Включаем RLS обратно
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Проверяем результат
SELECT 'Books policies:' as info;
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'books';
SELECT 'Categories policies:' as info;
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'categories';
```

3. **Нажмите "Run"** (или Ctrl+Enter)

### **Шаг 3: Проверьте результат**
После выполнения SQL проверьте:

```bash
# Проверка API Books
curl https://stefa-books.com.ua/api/books

# Проверка API Categories  
curl https://stefa-books.com.ua/api/categories
```

**Ожидаемый результат:**
- ✅ API Books вернет JSON с книгами
- ✅ API Categories вернет JSON с категориями

### **Шаг 4: Обновите сайт**
1. Откройте [https://stefa-books.com.ua](https://stefa-books.com.ua)
2. Обновите страницу (F5)
3. Книги и категории должны отображаться

## 🔍 **Если не работает:**

### **Проверьте переменные окружения в Vercel:**
1. Vercel Dashboard → Settings → Environment Variables
2. Убедитесь, что есть:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### **Перезапустите деплой:**
1. Vercel Dashboard → Deployments
2. Нажмите "Redeploy" на последнем деплое

## ✅ **Ожидаемый результат:**

После исправления RLS:
- ✅ **Главная страница**: Отображаются книги
- ✅ **Каталог**: Работает без ошибок
- ✅ **Категории**: Отображаются в меню
- ✅ **Поиск**: Функционирует корректно

---

**Время исправления**: 1-2 минуты  
**Сложность**: Очень простая  
**Результат**: Полноценный сайт! 🚀
