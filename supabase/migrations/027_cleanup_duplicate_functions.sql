-- Cleanup duplicate functions and ensure proper search_path
-- This migration removes duplicate functions and ensures all functions have proper search_path

-- Drop all existing functions first
DROP FUNCTION IF EXISTS public.is_admin(UUID);
DROP FUNCTION IF EXISTS public.get_user_role(UUID);
DROP FUNCTION IF EXISTS public.update_user_to_admin(UUID);
DROP FUNCTION IF EXISTS public.update_user_to_admin(TEXT);

-- Recreate functions with proper search_path
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
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

CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
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

CREATE OR REPLACE FUNCTION public.update_user_to_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  UPDATE user_profiles 
  SET role = 'admin', updated_at = NOW()
  WHERE id = user_id;
  
  RETURN FOUND;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_role(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_user_to_admin(UUID) TO authenticated;

-- Add comments
COMMENT ON FUNCTION public.is_admin(UUID) IS 'Check if user has admin role. Uses SECURITY DEFINER with proper search_path.';
COMMENT ON FUNCTION public.get_user_role(UUID) IS 'Get user role from user_profiles. Uses SECURITY DEFINER with proper search_path.';
COMMENT ON FUNCTION public.update_user_to_admin(UUID) IS 'Update user to admin role. Uses SECURITY DEFINER with proper search_path.';
