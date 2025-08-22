/*
  # Add INSERT policy for user_roles table

  1. Security Changes
    - Add INSERT policy for `user_roles` table to allow users to be assigned roles during signup
    - Policy allows authenticated users to insert roles where user_id matches their auth.uid()
    - This enables the signup process to work properly without RLS violations

  2. Notes
    - This policy is essential for the user registration flow
    - Only allows users to assign roles to themselves, maintaining security
    - Admins can still manage roles through existing policies
*/

-- Add INSERT policy for user_roles table
CREATE POLICY "Users can insert own role during signup"
  ON user_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());