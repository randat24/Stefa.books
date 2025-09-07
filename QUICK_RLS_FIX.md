# ⚡ Быстрое исправление RLS

**Проблема**: `ERROR: 42710: policy "Public read access for users" for table "users" already exists`

## 🚀 Быстрое решение

### 1. Откройте Supabase Dashboard
- Перейдите в [Supabase Dashboard](https://supabase.com/dashboard)
- Выберите ваш проект
- Перейдите в **SQL Editor**

### 2. Выполните этот SQL код

```sql
-- Отключаем RLS
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Удаляем ВСЕ политики
DO $$
DECLARE
    policy_name TEXT;
BEGIN
    FOR policy_name IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'users' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.users', policy_name);
    END LOOP;
END $$;

-- Создаем новые политики
CREATE POLICY "users_select" ON public.users FOR SELECT USING (true);
CREATE POLICY "users_insert" ON public.users FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "users_update" ON public.users FOR UPDATE USING (auth.email() = email);
CREATE POLICY "users_delete" ON public.users FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.users WHERE email = auth.email() AND role = 'admin')
);

-- Включаем RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
```

### 3. Проверьте результат

```bash
# Проверка API
curl https://stefa-books.com.ua/api/books

# Локальная проверка
node check_site_database_connection.mjs
```

## ✅ Ожидаемый результат

- ✅ API Books вернет список книг
- ✅ Локальная проверка покажет "✅ Подключение к базе данных: OK"
- ✅ Сайт будет полностью функционален

---

**Время выполнения**: 2-3 минуты  
**Сложность**: Простая
