-- Add missing fields to books table for admin panel
-- These fields are needed for proper book management

-- Add price fields
ALTER TABLE books ADD COLUMN IF NOT EXISTS price_uah NUMERIC(8,2);
ALTER TABLE books ADD COLUMN IF NOT EXISTS full_price_uah NUMERIC(8,2);

-- Add quantity fields
ALTER TABLE books ADD COLUMN IF NOT EXISTS qty_total INTEGER DEFAULT 1;
ALTER TABLE books ADD COLUMN IF NOT EXISTS qty_available INTEGER DEFAULT 1;

-- Add location field
ALTER TABLE books ADD COLUMN IF NOT EXISTS location TEXT;

-- Add constraints (only if they don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'books_price_uah_check') THEN
        ALTER TABLE books ADD CONSTRAINT books_price_uah_check CHECK (price_uah >= 0);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'books_full_price_uah_check') THEN
        ALTER TABLE books ADD CONSTRAINT books_full_price_uah_check CHECK (full_price_uah >= 0);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'books_qty_total_check') THEN
        ALTER TABLE books ADD CONSTRAINT books_qty_total_check CHECK (qty_total >= 0);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'books_qty_available_check') THEN
        ALTER TABLE books ADD CONSTRAINT books_qty_available_check CHECK (qty_available >= 0);
    END IF;
END $$;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS books_price_uah_idx ON books(price_uah);
CREATE INDEX IF NOT EXISTS books_full_price_uah_idx ON books(full_price_uah);
CREATE INDEX IF NOT EXISTS books_qty_available_idx ON books(qty_available);
CREATE INDEX IF NOT EXISTS books_location_idx ON books(location);

-- Update existing books to have default values
UPDATE books SET qty_total = 1 WHERE qty_total IS NULL;
UPDATE books SET qty_available = 1 WHERE qty_available IS NULL;

-- Update search vector function to include new fields
CREATE OR REPLACE FUNCTION update_book_search_vector() RETURNS TRIGGER AS $$
BEGIN
  NEW.search_text := COALESCE(NEW.title, '') || ' ' || 
                    COALESCE(NEW.author, '') || ' ' || 
                    COALESCE(NEW.category, '') || ' ' || 
                    COALESCE(NEW.subcategory, '') || ' ' ||
                    COALESCE(NEW.description, '') || ' ' ||
                    COALESCE(NEW.short_description, '') || ' ' ||
                    COALESCE(NEW.publisher, '') || ' ' ||
                    COALESCE(array_to_string(NEW.tags, ' '), '');

  NEW.search_vector := to_tsvector('simple', 
    COALESCE(NEW.title, '') || ' ' || 
    COALESCE(NEW.author, '') || ' ' || 
    COALESCE(NEW.category, '') || ' ' ||
    COALESCE(NEW.subcategory, '') || ' ' ||
    COALESCE(NEW.description, '') || ' ' ||
    COALESCE(NEW.short_description, '') || ' ' ||
    COALESCE(NEW.publisher, '') || ' ' ||
    COALESCE(array_to_string(NEW.tags, ' '), '')
  );
  
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add comment
COMMENT ON COLUMN books.price_uah IS 'Ціна аренди книги в гривнях';
COMMENT ON COLUMN books.full_price_uah IS 'Повна ціна книги в гривнях';
COMMENT ON COLUMN books.qty_total IS 'Загальна кількість екземплярів книги';
COMMENT ON COLUMN books.qty_available IS 'Кількість доступних екземплярів книги';
COMMENT ON COLUMN books.location IS 'Місцезнаходження книги';
