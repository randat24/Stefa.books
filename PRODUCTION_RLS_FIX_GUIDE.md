# 🔧 Исправление RLS в продакшене

## ✅ Статус деплоя
- **Сайт развернут**: https://stefa-books.com.ua ✅
- **API работает**: https://stefa-books.com.ua/api/health ✅
- **Проблема**: RLS политика блокирует доступ к данным ❌
- **Дата**: 7 вересня 2025
- **Версия**: 2.1.0

## 🚨 Проблема
```
{"error":"Ошибка при получении книг"}
```

**Причина**: `infinite recursion detected in policy for relation "users"`

## 🔧 Решение

### 1. Откройте Supabase Dashboard
1. Перейдите в [Supabase Dashboard](https://supabase.com/dashboard)
2. Выберите ваш проект
3. Перейдите в **SQL Editor**

### 2. Выполните SQL скрипт

**Если получили ошибку "policy already exists":**
Используйте упрощенную версию: `fix_rls_users_policy_simple.sql`

**Если нужна полная версия:**
Используйте: `fix_rls_users_policy_v2.sql`

**Скопируйте и выполните следующий SQL код:**

```sql
-- Простое исправление RLS политики для таблицы users
-- Удаляет все политики и создает новые без рекурсии

-- Отключаем RLS
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Удаляем ВСЕ политики для таблицы users
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

-- Создаем новые простые политики
CREATE POLICY "users_select" ON public.users FOR SELECT USING (true);
CREATE POLICY "users_insert" ON public.users FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "users_update" ON public.users FOR UPDATE USING (auth.email() = email);
CREATE POLICY "users_delete" ON public.users FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.users WHERE email = auth.email() AND role = 'admin')
);

-- Включаем RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Проверяем результат
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'users';
```

### 3. Проверьте результат
После выполнения SQL скрипта проверьте:

1. **API книг**: https://stefa-books.com.ua/api/books
2. **Локальная проверка**: `node check_site_database_connection.mjs`

## 🎯 Ожидаемый результат
- ✅ API книг должен вернуть список книг
- ✅ Локальная проверка должна показать "✅ Подключение к базе данных: OK"
- ✅ Сайт должен работать полностью

## 📝 Дополнительные проверки
После исправления RLS проверьте:
- [ ] Главная страница загружается
- [ ] Каталог книг работает
- [ ] API возвращает данные
- [ ] Админ панель доступна

## 🔗 Полезные ссылки
- **Сайт**: https://stefa-books.com.ua
- **API Health**: https://stefa-books.com.ua/api/health
- **API Books**: https://stefa-books.com.ua/api/books
- **Supabase Dashboard**: https://supabase.com/dashboard
