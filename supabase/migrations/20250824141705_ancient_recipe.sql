/*
  # Add Account Status and Access Control

  1. New Columns
    - Add `account_status` to profiles table (pending, approved, rejected, suspended)
    - Add `approved_at` and `approved_by` to profiles table for audit trail
    - Add `rejection_reason` for feedback when applications are rejected

  2. Security Updates
    - Update RLS policies to prevent login for non-approved accounts
    - Add admin policies for managing account status
    - Ensure only approved accounts can access the platform

  3. Triggers
    - Update user creation trigger to set default status as 'pending'
    - Add trigger to update approval timestamps
*/

-- Add account status and approval tracking to profiles
DO $$
BEGIN
  -- Add account_status column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'account_status'
  ) THEN
    ALTER TABLE profiles ADD COLUMN account_status text DEFAULT 'pending' CHECK (account_status IN ('pending', 'approved', 'rejected', 'suspended'));
  END IF;

  -- Add approved_at column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'approved_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN approved_at timestamptz;
  END IF;

  -- Add approved_by column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'approved_by'
  ) THEN
    ALTER TABLE profiles ADD COLUMN approved_by uuid REFERENCES profiles(id);
  END IF;

  -- Add rejection_reason column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'rejection_reason'
  ) THEN
    ALTER TABLE profiles ADD COLUMN rejection_reason text;
  END IF;
END $$;

-- Create index for account status queries
CREATE INDEX IF NOT EXISTS idx_profiles_account_status ON profiles(account_status);

-- Drop existing policies that might conflict
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can select own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Create new RLS policies with access control
CREATE POLICY "Approved users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    (id = auth.uid() AND account_status = 'approved') OR
    ((auth.jwt() ->> 'email') ~~ '%@admin.%') OR
    ((auth.jwt() ->> 'email') ~~ '%@seda.%') OR
    ((auth.jwt() ->> 'email') ~~ '%@bizboost.co.za')
  );

CREATE POLICY "Approved users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (
    (id = auth.uid() AND account_status = 'approved') OR
    ((auth.jwt() ->> 'email') ~~ '%@admin.%') OR
    ((auth.jwt() ->> 'email') ~~ '%@seda.%') OR
    ((auth.jwt() ->> 'email') ~~ '%@bizboost.co.za')
  )
  WITH CHECK (
    (id = auth.uid() AND account_status = 'approved') OR
    ((auth.jwt() ->> 'email') ~~ '%@admin.%') OR
    ((auth.jwt() ->> 'email') ~~ '%@seda.%') OR
    ((auth.jwt() ->> 'email') ~~ '%@bizboost.co.za')
  );

CREATE POLICY "System can insert profiles"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- Admin policies for managing account status
CREATE POLICY "Admins can manage all profiles"
  ON profiles
  FOR ALL
  TO authenticated
  USING (
    ((auth.jwt() ->> 'email') ~~ '%@admin.%') OR
    ((auth.jwt() ->> 'email') ~~ '%@seda.%') OR
    ((auth.jwt() ->> 'email') ~~ '%@bizboost.co.za')
  )
  WITH CHECK (
    ((auth.jwt() ->> 'email') ~~ '%@admin.%') OR
    ((auth.jwt() ->> 'email') ~~ '%@seda.%') OR
    ((auth.jwt() ->> 'email') ~~ '%@bizboost.co.za')
  );

-- Update the handle_new_user function to set pending status for non-admin users
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
DECLARE
  user_email text;
  is_admin boolean;
  default_role user_role_type;
  default_status text;
BEGIN
  -- Get user email
  user_email := NEW.email;
  
  -- Check if user is admin based on email
  is_admin := (
    user_email ~~ '%@admin.%' OR 
    user_email ~~ '%@seda.%' OR 
    user_email ~~ '%@bizboost.co.za'
  );
  
  -- Set default role and status
  IF is_admin THEN
    default_role := 'admin';
    default_status := 'approved'; -- Admins are auto-approved
  ELSE
    default_role := 'participant';
    default_status := 'pending'; -- Regular users need approval
  END IF;
  
  -- Create user profile
  INSERT INTO public.profiles (
    id, 
    full_name, 
    mobile_number, 
    role,
    account_status,
    approved_at,
    created_at, 
    updated_at
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(user_email, '@', 1)),
    NEW.raw_user_meta_data->>'mobile_number',
    default_role,
    default_status,
    CASE WHEN is_admin THEN now() ELSE NULL END,
    now(),
    now()
  );
  
  -- Create user role
  INSERT INTO public.user_roles (user_id, role) 
  VALUES (NEW.id, default_role);
  
  -- Create business record for participants only
  IF NOT is_admin THEN
    INSERT INTO public.businesses (
      owner_id,
      business_name,
      business_category,
      business_location,
      business_type,
      number_of_employees,
      monthly_revenue,
      years_in_operation,
      created_at,
      updated_at
    ) VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'business_name', 'My Business'),
      COALESCE(NEW.raw_user_meta_data->>'business_category', 'General'),
      COALESCE(NEW.raw_user_meta_data->>'business_location', 'South Africa'),
      COALESCE(NEW.raw_user_meta_data->>'business_type', 'informal'),
      COALESCE(NEW.raw_user_meta_data->>'number_of_employees', '1 (Just me)'),
      COALESCE(NEW.raw_user_meta_data->>'monthly_revenue', 'R0 - R5,000'),
      COALESCE((NEW.raw_user_meta_data->>'years_in_operation')::integer, 0),
      now(),
      now()
    );
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the user creation
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to approve user account
CREATE OR REPLACE FUNCTION approve_user_account(user_id uuid, admin_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE profiles 
  SET 
    account_status = 'approved',
    approved_at = now(),
    approved_by = admin_id,
    updated_at = now()
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to reject user account
CREATE OR REPLACE FUNCTION reject_user_account(user_id uuid, admin_id uuid, reason text DEFAULT NULL)
RETURNS void AS $$
BEGIN
  UPDATE profiles 
  SET 
    account_status = 'rejected',
    approved_by = admin_id,
    rejection_reason = reason,
    updated_at = now()
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;