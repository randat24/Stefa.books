-- Create user_profiles table
-- This table stores additional user information beyond what's in auth.users

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies (with IF NOT EXISTS check)
DO $$
BEGIN
  -- Users can view their own profile
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_profiles' 
    AND policyname = 'Users can view their own profile'
  ) THEN
    CREATE POLICY "Users can view their own profile" ON user_profiles
      FOR SELECT USING (auth.uid() = id);
  END IF;

  -- Users can update their own profile
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_profiles' 
    AND policyname = 'Users can update their own profile'
  ) THEN
    CREATE POLICY "Users can update their own profile" ON user_profiles
      FOR UPDATE USING (auth.uid() = id);
  END IF;

  -- Users can insert their own profile
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_profiles' 
    AND policyname = 'Users can insert their own profile'
  ) THEN
    CREATE POLICY "Users can insert their own profile" ON user_profiles
      FOR INSERT WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name'
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON user_profiles TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Add comments
COMMENT ON TABLE user_profiles IS 'User profiles with additional information beyond auth.users';
COMMENT ON COLUMN user_profiles.id IS 'References auth.users(id)';
COMMENT ON COLUMN user_profiles.email IS 'User email address';
COMMENT ON COLUMN user_profiles.first_name IS 'User first name';
COMMENT ON COLUMN user_profiles.last_name IS 'User last name';
COMMENT ON COLUMN user_profiles.phone IS 'User phone number';
