# 🔧 Решение проблемы с админ панелью

**Проблема**: Не можете зайти в админ панель  
**Статус**: Диагностика в процессе

## 🔍 Диагностика

### ✅ Что работает:
- **Сайт доступен**: https://stefa-books.com.ua ✅
- **Админ панель загружается**: https://stefa-books.com.ua/admin ✅
- **Пользователи созданы**: 3 администратора в системе ✅
- **Локальные тесты**: Данные загружаются через anon key ✅

### ❌ Что не работает:
- **API Books**: https://stefa-books.com.ua/api/books ❌
- **API Users**: https://stefa-books.com.ua/api/users ❌
- **Debug API**: https://stefa-books.com.ua/api/debug ❌

## 🚨 Основные проблемы

### 1. RLS политики в Supabase
**Проблема**: `infinite recursion detected in policy for relation "users"`

**Решение**: Выполните SQL скрипт в Supabase Dashboard:
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

### 2. Переменные окружения в Vercel
**Проблема**: Возможно, переменные окружения не настроены правильно

**Проверка**:
1. Откройте [Vercel Dashboard](https://vercel.com/dashboard)
2. Выберите проект `stefa-books-next`
3. Перейдите в Settings → Environment Variables
4. Убедитесь, что все переменные настроены:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

### 3. Структура базы данных
**Проблема**: API пытается получить несуществующие поля

**Решение**: API уже исправлен для работы с реальной структурой БД

## 🚀 Пошаговое решение

### Шаг 1: Исправьте RLS политики
1. Откройте [Supabase Dashboard](https://supabase.com/dashboard)
2. Перейдите в SQL Editor
3. Выполните SQL скрипт выше
4. Проверьте результат

### Шаг 2: Проверьте переменные окружения
1. Откройте [Vercel Dashboard](https://vercel.com/dashboard)
2. Проверьте Environment Variables
3. При необходимости обновите их

### Шаг 3: Перезапустите деплой
1. В Vercel Dashboard нажмите "Redeploy"
2. Дождитесь завершения деплоя
3. Проверьте работу API

### Шаг 4: Проверьте результат
```bash
# Проверка API Books
curl https://stefa-books.com.ua/api/books

# Проверка API Users
curl https://stefa-books.com.ua/api/users

# Проверка админ панели
curl -I https://stefa-books.com.ua/admin
```

## 🔐 Доступ к админ панели

### Созданные пользователи:
1. **admin@stefa-books.com.ua** (Головний Адміністратор)
2. **anastasia@stefa-books.com.ua** (Анастасія)
3. **randat24@gmail.com** (Розробник)

### Все пользователи имеют:
- **Роль**: admin
- **Подписка**: premium
- **Статус**: active

## 📞 Поддержка

Если проблема не решается:

1. **Проверьте логи Vercel**:
   - Vercel Dashboard → Functions → View Logs

2. **Проверьте логи Supabase**:
   - Supabase Dashboard → Logs

3. **Создайте issue** в GitHub репозитории

## 🎯 Ожидаемый результат

После исправления RLS политик:
- ✅ API Books вернет список книг
- ✅ API Users вернет список пользователей
- ✅ Админ панель будет загружать данные
- ✅ Все 3 администратора смогут входить в систему

---

**Время исправления**: 5-10 минут  
**Сложность**: Простая  
**Критичность**: Высокая (блокирует работу админ панели)
