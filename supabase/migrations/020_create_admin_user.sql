-- Admin user creation instructions
-- This migration provides instructions for creating admin user

-- IMPORTANT: Admin user must be created through Supabase Dashboard
-- 
-- Steps to create admin user:
-- 1. Go to Supabase Dashboard > Authentication > Users
-- 2. Click "Add user" or "Invite user"
-- 3. Enter email: admin@stefa-books.com.ua
-- 4. Set password (choose a strong password)
-- 5. Click "Create user"
-- 6. The user will be created in auth.users
-- 7. A profile will be automatically created in user_profiles with role 'user'
-- 8. Run the following SQL to make them admin:
--
-- UPDATE user_profiles 
-- SET role = 'admin', updated_at = NOW()
-- WHERE email = 'admin@stefa-books.com.ua';

-- Alternative: Create admin user via SQL (if you have service_role access)
-- This is for reference only - use Supabase Dashboard instead

/*
-- Create admin user function (for reference)
CREATE OR REPLACE FUNCTION create_admin_user_safely()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_user_id UUID;
  admin_email TEXT := 'admin@stefa-books.com.ua';
BEGIN
  -- Check if admin user already exists
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = admin_email) THEN
    -- Update existing user to admin
    UPDATE user_profiles 
    SET role = 'admin', updated_at = NOW()
    WHERE email = admin_email;
    RETURN 'Existing admin user updated to admin role';
  END IF;
  
  RETURN 'Admin user does not exist. Please create via Supabase Dashboard.';
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION create_admin_user_safely() TO service_role;

-- Run the function
SELECT create_admin_user_safely();

-- Drop the function
DROP FUNCTION create_admin_user_safely();
*/

-- Note: Since users who subscribe are already registered,
-- we just need to update their role to admin if they should be admin
