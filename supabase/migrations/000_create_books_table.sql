-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- Create books table first (before categories migration)
CREATE TABLE IF NOT EXISTS books (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT,
  description TEXT,
  short_description TEXT,
  code TEXT UNIQUE,
  isbn TEXT,
  pages INTEGER,
  age_range TEXT,
  language TEXT DEFAULT 'uk',
  publisher TEXT,
  publication_year INTEGER,
  cover_url TEXT,
  status TEXT DEFAULT 'available', -- available, rented, maintenance, unavailable
  available BOOLEAN DEFAULT true,
  rating NUMERIC(2,1) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  price_daily NUMERIC(8,2),
  price_weekly NUMERIC(8,2), 
  price_monthly NUMERIC(8,2),
  badges TEXT[],
  tags TEXT[],
  
  -- Search optimization fields
  search_vector tsvector,
  search_text TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT books_rating_check CHECK (rating >= 0 AND rating <= 5),
  CONSTRAINT books_pages_check CHECK (pages > 0)
);

-- Create authors table
CREATE TABLE IF NOT EXISTS authors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  biography TEXT,
  birth_year INTEGER,
  death_year INTEGER,
  nationality TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  subscription_type TEXT,
  subscription_start TIMESTAMP WITH TIME ZONE,
  subscription_end TIMESTAMP WITH TIME ZONE,
  status TEXT,
  address TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create rentals table
CREATE TABLE IF NOT EXISTS rentals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  rental_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  return_date TIMESTAMP WITH TIME ZONE,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'active', -- active, returned, overdue, cancelled
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create search_queries table
CREATE TABLE IF NOT EXISTS search_queries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  query TEXT NOT NULL,
  results_count INTEGER DEFAULT 0,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_books_title ON books(title);
CREATE INDEX IF NOT EXISTS idx_books_author ON books(author);
CREATE INDEX IF NOT EXISTS idx_books_category ON books(category);
CREATE INDEX IF NOT EXISTS idx_books_available ON books(available);
CREATE INDEX IF NOT EXISTS idx_books_rating ON books(rating);
CREATE INDEX IF NOT EXISTS idx_books_search_vector ON books USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_books_search_text ON books USING GIN(search_text gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_authors_name ON authors(name);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_rentals_user_id ON rentals(user_id);
CREATE INDEX IF NOT EXISTS idx_rentals_book_id ON rentals(book_id);
CREATE INDEX IF NOT EXISTS idx_rentals_status ON rentals(status);
CREATE INDEX IF NOT EXISTS idx_rentals_due_date ON rentals(due_date);

-- Enable RLS
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE rentals ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_queries ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Books are viewable by everyone" ON books FOR SELECT USING (true);
CREATE POLICY "Authors are viewable by everyone" ON authors FOR SELECT USING (true);
CREATE POLICY "Users can view their own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can view their own rentals" ON rentals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Search queries are viewable by everyone" ON search_queries FOR SELECT USING (true);
