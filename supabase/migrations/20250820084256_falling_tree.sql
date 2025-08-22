/*
  # Fix signup database error with automatic profile creation

  1. Database Functions
    - `handle_new_user()` - Automatically creates profile and assigns role when new user signs up
    
  2. Triggers
    - Trigger on auth.users table to call handle_new_user() function
    
  3. Security Policies
    - Add INSERT policy for profiles table to allow trigger-based creation
    
  4. Changes
    - Removes dependency on client-side profile creation
    - Ensures profiles and roles are created server-side automatically
    - Maintains security while enabling smooth signup flow
*/

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
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
    IF NEW.email LIKE '%admin%' 
       OR NEW.email LIKE '%@bizboost.co.za' 
       OR (NEW.raw_user_meta_data->>'role') = 'admin' THEN
      user_role := 'admin';
    END IF;

    -- Insert into user_roles table
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, user_role);
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add INSERT policy for profiles to allow trigger-based creation
DROP POLICY IF EXISTS "Allow new users" ON profiles;
CREATE POLICY "Allow new users" 
  ON profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Ensure the trigger function has proper permissions
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT ALL ON public.profiles TO supabase_auth_admin;
GRANT ALL ON public.user_roles TO supabase_auth_admin;