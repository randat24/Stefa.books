-- Add role column to users table
-- This migration adds a role column to the users table

-- Add role column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator'));

-- Create index for role-based queries
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Update existing admin user if exists
UPDATE users 
SET role = 'admin' 
WHERE email = 'admin@stefa-books.com.ua';

-- Add comment
COMMENT ON COLUMN users.role IS 'User role: user, admin, or moderator';
