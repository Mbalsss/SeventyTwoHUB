/*
  # Fix Profiles Table RLS Policies

  This migration fixes infinite recursion issues in RLS policies by:
  1. Dropping all existing conflicting policies on profiles table
  2. Creating safe, non-recursive policies using direct auth.uid() comparisons
  3. Ensuring users can only access/modify their own profiles
  4. Adding separate admin policies that don't cause recursion
  5. Using proper USING and WITH CHECK clauses

  ## Changes Made:
  1. **Security**: Enable RLS on profiles table
  2. **User Policies**: Direct auth.uid() = id comparisons (no subqueries)
  3. **Admin Policies**: Use JWT claims instead of table queries
  4. **Safety**: All policies avoid self-referencing the profiles table
*/

-- Ensure RLS is enabled on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies on profiles table to start fresh
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;

-- Create safe user policies using direct comparisons (no recursion)
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create admin policies using JWT claims (no table queries to avoid recursion)
CREATE POLICY "Admins can view all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    -- Check if user has admin role via JWT claims or email pattern
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' IN ('admin', 'super_admin', 'program_manager', 'client_admin')
    OR 
    auth.email() LIKE '%@admin.%'
    OR
    auth.email() LIKE '%@seda.%'
  );

CREATE POLICY "Admins can update all profiles"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (
    -- Same admin check as above
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' IN ('admin', 'super_admin', 'program_manager', 'client_admin')
    OR 
    auth.email() LIKE '%@admin.%'
    OR
    auth.email() LIKE '%@seda.%'
  );

-- Ensure the handle_new_user trigger function is safe and non-recursive
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Insert profile with safe defaults
  INSERT INTO profiles (
    id, 
    full_name, 
    mobile_number,
    avatar_url,
    two_factor_enabled,
    created_at, 
    updated_at
  )
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email, 'User'),
    NEW.raw_user_meta_data->>'mobile_number',
    NEW.raw_user_meta_data->>'avatar_url',
    false,
    NOW(), 
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    mobile_number = COALESCE(EXCLUDED.mobile_number, profiles.mobile_number),
    avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
    updated_at = NOW();

  -- Assign default participant role (safe insert)
  INSERT INTO user_roles (user_id, role, created_at)
  VALUES (NEW.id, 'participant', NOW())
  ON CONFLICT (user_id, role, program_id) DO NOTHING;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log error but don't fail user creation
  RAISE NOTICE 'Error in handle_new_user trigger for user %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
DROP TRIGGER IF EXISTS handle_new_user ON auth.users;
CREATE TRIGGER handle_new_user
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();