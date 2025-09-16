# Миграция для добавления недостающих полей в таблицу books

Выполните этот SQL в Supabase Dashboard > SQL Editor:

```sql
-- Add missing fields to books table for admin panel
ALTER TABLE books ADD COLUMN IF NOT EXISTS price_uah NUMERIC(8,2);
ALTER TABLE books ADD COLUMN IF NOT EXISTS full_price_uah NUMERIC(8,2);
ALTER TABLE books ADD COLUMN IF NOT EXISTS qty_total INTEGER DEFAULT 1;
ALTER TABLE books ADD COLUMN IF NOT EXISTS qty_available INTEGER DEFAULT 1;
ALTER TABLE books ADD COLUMN IF NOT EXISTS location TEXT;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS books_price_uah_idx ON books(price_uah);
CREATE INDEX IF NOT EXISTS books_full_price_uah_idx ON books(full_price_uah);
CREATE INDEX IF NOT EXISTS books_qty_available_idx ON books(qty_available);
CREATE INDEX IF NOT EXISTS books_location_idx ON books(location);

-- Update existing books to have default values
UPDATE books SET qty_total = 1 WHERE qty_total IS NULL;
UPDATE books SET qty_available = 1 WHERE qty_available IS NULL;

-- Add comments
COMMENT ON COLUMN books.price_uah IS 'Ціна аренди книги в гривнях';
COMMENT ON COLUMN books.full_price_uah IS 'Повна ціна книги в гривнях';
COMMENT ON COLUMN books.qty_total IS 'Загальна кількість екземплярів книги';
COMMENT ON COLUMN books.qty_available IS 'Кількість доступних екземплярів книги';
COMMENT ON COLUMN books.location IS 'Місцезнаходження книги';
```

После выполнения этой миграции все поля (Автор, Категорія, Видавництво, Ціна, Повна ціна) будут отображаться в админ панели.
