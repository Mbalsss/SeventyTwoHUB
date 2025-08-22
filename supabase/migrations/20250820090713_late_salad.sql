/*
  # Fix signup policies and triggers

  1. Database Issues Fixed
    - Add missing INSERT policy for profiles table
    - Fix user_roles INSERT policy to work with auth triggers
    - Create proper trigger function for new user handling
    - Add proper foreign key handling

  2. Security Policies
    - Allow new users to insert their own profile
    - Allow automatic role assignment during signup
    - Maintain security while enabling signup flow

  3. Trigger Functions
    - Automatic profile creation on user signup
    - Default role assignment based on email patterns
    - Proper error handling in triggers
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Allow new users" ON profiles;
DROP POLICY IF EXISTS "Users can insert own role during signup" ON user_roles;

-- Create proper INSERT policy for profiles
CREATE POLICY "Allow new users to insert their profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create proper INSERT policy for user_roles
CREATE POLICY "Allow role assignment during signup"
  ON user_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Create or replace the trigger function for handling new users
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into profiles table
  INSERT INTO public.profiles (id, full_name, mobile_number)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'mobile_number', '')
  );

  -- Determine role based on email or metadata
  DECLARE
    user_role user_role_type := 'participant';
  BEGIN
    -- Check if admin based on email pattern or metadata
    IF NEW.email LIKE '%admin%' OR 
       NEW.email LIKE '%@bizboost.co.za' OR 
       (NEW.raw_user_meta_data->>'role') = 'admin' THEN
      user_role := 'admin';
    END IF;

    -- Insert role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, user_role);
  END;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the signup
    RAISE WARNING 'Error in handle_new_user trigger: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Ensure the trigger function has proper permissions
GRANT EXECUTE ON FUNCTION handle_new_user() TO authenticated;
GRANT EXECUTE ON FUNCTION handle_new_user() TO service_role;