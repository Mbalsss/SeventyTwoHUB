/*
  # Fix profiles table RLS policy for signup

  1. Security Updates
    - Drop existing conflicting policies on profiles table
    - Create proper INSERT policy for new user profile creation
    - Ensure policy uses correct field name (id instead of user_id)
    - Add SELECT policy for users to view their own profiles

  2. Policy Details
    - INSERT: Allow users to create their own profile during signup
    - SELECT: Allow users to view their own profile data
    - Uses auth.uid() = id for proper ownership validation
*/

-- Drop existing conflicting policies
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Allow new users to insert their profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;

-- Create proper INSERT policy for profile creation during signup
CREATE POLICY "Enable insert for users based on user_id" 
ON profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Create SELECT policy for users to view their own profiles
CREATE POLICY "Enable read access for users based on user_id" 
ON profiles 
FOR SELECT 
USING (auth.uid() = id);

-- Create UPDATE policy for users to update their own profiles
CREATE POLICY "Enable update for users based on user_id" 
ON profiles 
FOR UPDATE 
USING (auth.uid() = id) 
WITH CHECK (auth.uid() = id);