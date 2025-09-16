# Руководство по безопасности функций в PostgreSQL

## Проблема: Function Search Path Mutable

### Что это за уязвимость?

Функции с изменяемым search_path могут быть уязвимы к SQL-инъекциям. Если путь поиска (search_path) не установлен явно, злоумышленник может изменить его и вызвать выполнение вредоносного кода.

### Признаки проблемы

В Supabase Database Linter появляется предупреждение:
```
Function `public.function_name` has a role mutable search_path
```

### Решение

1. **Всегда явно задавайте search_path:**

```sql
CREATE OR REPLACE FUNCTION my_function()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public  -- Явное указание search_path
AS $$
BEGIN
  -- код функции
END;
$$;
```

## Правила безопасности для функций PostgreSQL

### 1. Явно задавайте search_path

```sql
-- ❌ Небезопасно
CREATE OR REPLACE FUNCTION unsafe_function()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- код
END;
$$;

-- ✅ Безопасно
CREATE OR REPLACE FUNCTION safe_function()
RETURNS void
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- код
END;
$$;
```

### 2. Осторожно используйте SECURITY DEFINER

- `SECURITY DEFINER` выполняет функцию с привилегиями создателя (обычно admin)
- `SECURITY INVOKER` (по умолчанию) - с привилегиями вызывающего пользователя

```sql
-- Используйте SECURITY DEFINER только когда это необходимо
CREATE OR REPLACE FUNCTION admin_function()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER           -- Только когда нужны повышенные права
SET search_path = public   -- Всегда указывайте search_path с SECURITY DEFINER
AS $$
BEGIN
  -- код требующий admin прав
END;
$$;
```

### 3. Проверяйте права доступа внутри функций

```sql
CREATE OR REPLACE FUNCTION delete_data(data_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Проверка прав
  IF NOT EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Недостаточно прав для удаления';
    RETURN false;
  END IF;
  
  -- Удаление данных
  DELETE FROM data WHERE id = data_id;
  RETURN true;
END;
$$;
```

### 4. Ограничьте доступ к функциям через GRANT

```sql
-- Ограничение доступа к функции
REVOKE ALL ON FUNCTION admin_function() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION admin_function() TO authenticated;
```

### 5. Используйте параметризацию вместо динамического SQL

```sql
-- ❌ Небезопасно - динамический SQL
CREATE FUNCTION unsafe_search(search_text text)
RETURNS SETOF books
AS $$
BEGIN
  RETURN QUERY EXECUTE 'SELECT * FROM books WHERE title LIKE ' || search_text;
END;
$$ LANGUAGE plpgsql;

-- ✅ Безопасно - параметризация
CREATE FUNCTION safe_search(search_text text)
RETURNS SETOF books
AS $$
BEGIN
  RETURN QUERY SELECT * FROM books WHERE title LIKE search_text;
END;
$$ LANGUAGE plpgsql;
```

## Примеры исправлений

### До исправления:

```sql
CREATE OR REPLACE FUNCTION cleanup_unused_indexes()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  -- код функции
END;
$$;
```

### После исправления:

```sql
CREATE OR REPLACE FUNCTION cleanup_unused_indexes()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  -- код функции
END;
$$;
```

## Проверка безопасности функций

```sql
-- Найти функции с потенциально небезопасным search_path
SELECT 
  n.nspname as schema,
  p.proname as function_name,
  p.prosecdef as security_definer,
  p.proconfig as search_path_config
FROM 
  pg_proc p
JOIN 
  pg_namespace n ON p.pronamespace = n.oid
WHERE 
  n.nspname = 'public' 
  AND p.proconfig IS NULL
ORDER BY 
  p.prosecdef DESC, p.proname;
```

---

*Последнее обновление: 2024-09-15*
