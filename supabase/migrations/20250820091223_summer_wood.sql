/*
  # Fix profiles table RLS policy for signup

  1. Security Updates
    - Drop existing problematic INSERT policy on profiles table
    - Create new INSERT policy that allows users to create their own profile
    - Ensure the policy works with auth.uid() function correctly

  2. Policy Details
    - Allow authenticated users to insert their own profile record
    - Use proper RLS syntax with auth.uid() = id check
    - Enable automatic profile creation during signup process
*/

-- Drop the existing problematic policy if it exists
DROP POLICY IF EXISTS "Allow new users to insert their profile" ON profiles;
DROP POLICY IF EXISTS "Allow new users" ON profiles;

-- Create the correct INSERT policy for profiles
CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Ensure the profiles table has proper RLS enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Verify the user_roles INSERT policy exists and is correct
DROP POLICY IF EXISTS "Allow role assignment during signup" ON user_roles;

CREATE POLICY "Users can insert own role"
  ON user_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());