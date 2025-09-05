-- Add admin role to user profiles
-- This migration adds a role column to the user_profiles table

-- Add role column to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator'));

-- Create index for role-based queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);

-- Update existing admin user if exists
UPDATE user_profiles 
SET role = 'admin' 
WHERE email = 'admin@stefa-books.com.ua';

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM user_profiles 
    WHERE id = user_id 
    AND role = 'admin'
  );
END;
$$;

-- Create function to get user role
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM user_profiles 
  WHERE id = user_id;
  
  RETURN COALESCE(user_role, 'user');
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION is_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_role(UUID) TO authenticated;

-- Add RLS policy for role-based access
CREATE POLICY "Users can view their own role" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

-- Add policy for admins to view all profiles
CREATE POLICY "Admins can view all profiles" ON user_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Add policy for admins to update roles
CREATE POLICY "Admins can update roles" ON user_profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Create admin user in auth.users first (if not exists)
-- Note: This should be done through Supabase Auth API, not directly in SQL
-- For now, we'll just update existing admin user if they exist

-- Update existing admin user role if they exist in user_profiles
UPDATE user_profiles 
SET role = 'admin', updated_at = NOW()
WHERE email = 'admin@stefa-books.com.ua';

-- Note: To create a new admin user, use the Supabase Auth API:
-- 1. Go to Supabase Dashboard > Authentication > Users
-- 2. Create user with email: admin@stefa-books.com.ua
-- 3. The user will automatically get a profile with role 'user'
-- 4. Then run: UPDATE user_profiles SET role = 'admin' WHERE email = 'admin@stefa-books.com.ua';

-- Add comment
COMMENT ON COLUMN user_profiles.role IS 'User role: user, admin, or moderator';
COMMENT ON FUNCTION is_admin(UUID) IS 'Check if user has admin role';
COMMENT ON FUNCTION get_user_role(UUID) IS 'Get user role by user ID';
