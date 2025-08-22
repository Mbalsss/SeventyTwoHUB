/*
  # Fix Programs Table RLS Policies

  1. Security Updates
    - Add INSERT policy for admins to create programs
    - Ensure proper role checking for program creation
    - Maintain existing SELECT policies

  2. Changes Made
    - Added "Admins can create programs" INSERT policy
    - Uses existing user_roles table for authorization
    - Allows admin, super_admin, and program_manager roles
*/

-- Add INSERT policy for programs table to allow admins to create programs
CREATE POLICY "Admins can create programs"
  ON programs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM user_roles
      WHERE user_roles.user_id = auth.uid()
        AND user_roles.role = ANY (ARRAY['admin'::user_role_type, 'super_admin'::user_role_type, 'program_manager'::user_role_type])
    )
  );

-- Ensure the existing policies are properly configured
-- Update the existing SELECT policy to be more permissive for admins
DROP POLICY IF EXISTS "Admins can view all programs" ON programs;
CREATE POLICY "Admins can view all programs"
  ON programs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM user_roles
      WHERE user_roles.user_id = auth.uid()
        AND user_roles.role = ANY (ARRAY['admin'::user_role_type, 'super_admin'::user_role_type, 'program_manager'::user_role_type, 'client_admin'::user_role_type])
    )
  );

-- Update the existing UPDATE policy for admins
DROP POLICY IF EXISTS "Admins can manage programs" ON programs;
CREATE POLICY "Admins can manage programs"
  ON programs
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM user_roles
      WHERE user_roles.user_id = auth.uid()
        AND user_roles.role = ANY (ARRAY['admin'::user_role_type, 'super_admin'::user_role_type, 'program_manager'::user_role_type])
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM user_roles
      WHERE user_roles.user_id = auth.uid()
        AND user_roles.role = ANY (ARRAY['admin'::user_role_type, 'super_admin'::user_role_type, 'program_manager'::user_role_type])
    )
  );

-- Add DELETE policy for admins
CREATE POLICY "Admins can delete programs"
  ON programs
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM user_roles
      WHERE user_roles.user_id = auth.uid()
        AND user_roles.role = ANY (ARRAY['admin'::user_role_type, 'super_admin'::user_role_type])
    )
  );