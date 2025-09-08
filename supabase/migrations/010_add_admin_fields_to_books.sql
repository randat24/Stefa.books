-- Добавляем поля для админ панели в таблицу books
ALTER TABLE public.books 
ADD COLUMN IF NOT EXISTS publisher TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
ADD COLUMN IF NOT EXISTS full_price_uah DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Создаем индексы для новых полей
CREATE INDEX IF NOT EXISTS idx_books_status ON public.books(status);
CREATE INDEX IF NOT EXISTS idx_books_publisher ON public.books(publisher);
CREATE INDEX IF NOT EXISTS idx_books_full_price ON public.books(full_price_uah);

-- Обновляем существующие записи
UPDATE public.books 
SET 
  status = CASE 
    WHEN available = true THEN 'active'
    ELSE 'inactive'
  END,
  full_price_uah = price_uah
WHERE status IS NULL;

-- Комментарии к новым полям
COMMENT ON COLUMN public.books.publisher IS 'Издательство книги';
COMMENT ON COLUMN public.books.status IS 'Статус книги: active, inactive, archived';
COMMENT ON COLUMN public.books.full_price_uah IS 'Полная цена книги в гривнах';
COMMENT ON COLUMN public.books.created_by IS 'ID пользователя, создавшего запись';
COMMENT ON COLUMN public.books.updated_by IS 'ID пользователя, обновившего запись';
COMMENT ON COLUMN public.books.notes IS 'Заметки администратора';
