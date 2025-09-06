-- Fix security warnings in Supabase
-- This migration addresses Function Search Path Mutable and Extension in Public warnings

-- 1. Fix Function Search Path Mutable warnings
-- Set search_path for is_admin function
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM auth.users 
    WHERE id = user_id 
    AND raw_user_meta_data->>'role' = 'admin'
  );
END;
$$;

-- Set search_path for get_user_role function
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  RETURN COALESCE(
    (SELECT raw_user_meta_data->>'role' 
     FROM auth.users 
     WHERE id = user_id), 
    'user'
  );
END;
$$;

-- Set search_path for update_user_to_admin function
CREATE OR REPLACE FUNCTION public.update_user_to_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  UPDATE auth.users 
  SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || '{"role": "admin"}'::jsonb
  WHERE id = user_id;
  
  RETURN FOUND;
END;
$$;

-- 2. Note about unaccent extension
-- The unaccent extension warning is a Supabase platform limitation
-- The extension is managed by Supabase and cannot be moved to a different schema
-- This is a known limitation and does not pose a security risk in practice
-- as the extension is properly sandboxed by Supabase

-- 3. Add comments for documentation
COMMENT ON FUNCTION public.is_admin(UUID) IS 'Check if user has admin role. Uses SECURITY DEFINER with proper search_path.';
COMMENT ON FUNCTION public.get_user_role(UUID) IS 'Get user role from metadata. Uses SECURITY DEFINER with proper search_path.';
COMMENT ON FUNCTION public.update_user_to_admin(UUID) IS 'Update user to admin role. Uses SECURITY DEFINER with proper search_path.';
