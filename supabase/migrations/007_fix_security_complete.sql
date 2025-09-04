-- ПОЛНОЕ ИСПРАВЛЕНИЕ ПРЕДУПРЕЖДЕНИЙ БЕЗОПАСНОСТИ
-- Удаляем все зависимости, потом пересоздаем функцию с правильными настройками

-- 1. Удалить все триггеры, которые используют функцию update_updated_at_column
DROP TRIGGER IF EXISTS update_books_updated_at ON books;
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_rentals_updated_at ON rentals;
DROP TRIGGER IF EXISTS update_payments_updated_at ON payments;
DROP TRIGGER IF EXISTS set_updated_at ON books;
DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;

-- 2. Теперь можем безопасно удалить функцию
DROP FUNCTION IF EXISTS update_updated_at_column();

-- 3. Создать новую безопасную функцию
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

-- 4. Пересоздать все триггеры
-- Триггер для таблицы books
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'books' AND column_name = 'updated_at') THEN
        CREATE TRIGGER update_books_updated_at
            BEFORE UPDATE ON books
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Триггер для таблицы users
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'updated_at') THEN
        CREATE TRIGGER update_users_updated_at
            BEFORE UPDATE ON users
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Триггер для таблицы rentals
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rentals' AND column_name = 'updated_at') THEN
        CREATE TRIGGER update_rentals_updated_at
            BEFORE UPDATE ON rentals
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Триггер для таблицы payments
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'updated_at') THEN
        CREATE TRIGGER update_payments_updated_at
            BEFORE UPDATE ON payments
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Триггер для таблицы categories
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'updated_at') THEN
        CREATE TRIGGER update_categories_updated_at
            BEFORE UPDATE ON categories
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- 5. Результат
SELECT 'Security warnings fixed for update_updated_at_column function and all triggers recreated' AS result;
SELECT COUNT(*) as recreated_triggers FROM information_schema.triggers WHERE trigger_name LIKE '%updated_at%';