-- Update existing users to admin role
-- This migration updates existing users who should be admins

-- Since users who subscribe are already registered,
-- we need to identify and update admin users

-- Method 1: Update by email (if you know the admin email)
-- UPDATE user_profiles 
-- SET role = 'admin', updated_at = NOW()
-- WHERE email = 'admin@stefa-books.com.ua';

-- Method 2: Update by specific user ID (if you know the user ID)
-- UPDATE user_profiles 
-- SET role = 'admin', updated_at = NOW()
-- WHERE id = 'your-user-id-here';

-- Method 3: Update all users with specific email pattern (if needed)
-- UPDATE user_profiles 
-- SET role = 'admin', updated_at = NOW()
-- WHERE email LIKE '%@stefa-books.com.ua';

-- Method 4: Create a function to safely update admin users
CREATE OR REPLACE FUNCTION update_user_to_admin(user_email TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_exists BOOLEAN;
  updated_count INTEGER;
BEGIN
  -- Check if user exists
  SELECT EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE email = user_email
  ) INTO user_exists;
  
  IF NOT user_exists THEN
    RETURN 'User with email ' || user_email || ' does not exist';
  END IF;
  
  -- Update user role to admin
  UPDATE user_profiles 
  SET role = 'admin', updated_at = NOW()
  WHERE email = user_email;
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  
  IF updated_count > 0 THEN
    RETURN 'User ' || user_email || ' updated to admin role';
  ELSE
    RETURN 'No changes made for user ' || user_email;
  END IF;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION update_user_to_admin(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION update_user_to_admin(TEXT) TO service_role;

-- Example usage (uncomment and modify as needed):
-- SELECT update_user_to_admin('admin@stefa-books.com.ua');

-- Add comment
COMMENT ON FUNCTION update_user_to_admin(TEXT) IS 'Safely updates a user to admin role by email';
