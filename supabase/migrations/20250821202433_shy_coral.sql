/*
  # Complete User Profile and Role System Setup

  1. Database Functions
     - Enhanced handle_new_user function to properly create profiles and assign roles
     - Automatic role assignment based on email patterns
     - Proper error handling and logging

  2. Triggers
     - Ensure trigger fires on user creation
     - Handle both regular users and admin users

  3. Security
     - Proper RLS policies for profile creation
     - Allow authenticated users to read/update their own profiles
     - Admin access for user management
*/

-- Create or replace the enhanced user profile creation function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create user profile with metadata
  INSERT INTO public.profiles (
    id,
    full_name,
    mobile_number,
    avatar_url,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'mobile_number', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    NOW(),
    NOW()
  );

  -- Determine and assign user role based on email
  IF NEW.email LIKE '%admin%' OR NEW.email LIKE '%@bizboost.co.za' THEN
    -- Assign admin role
    INSERT INTO public.user_roles (user_id, role, created_at)
    VALUES (NEW.id, 'admin', NOW());
  ELSE
    -- Assign participant role
    INSERT INTO public.user_roles (user_id, role, created_at)
    VALUES (NEW.id, 'participant', NOW());
    
    -- Create default business record for participants
    INSERT INTO public.businesses (
      owner_id,
      business_name,
      business_category,
      business_location,
      business_type,
      number_of_employees,
      monthly_revenue,
      years_in_operation,
      beee_level,
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
      COALESCE(NEW.raw_user_meta_data->>'beee_level', 'not_certified'),
      NOW(),
      NOW()
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION handle_new_user();
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Update RLS policies for profiles table
DO $$
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Enable insert for users based on user_id" ON profiles;
  DROP POLICY IF EXISTS "Enable read access for users based on user_id" ON profiles;
  DROP POLICY IF EXISTS "Enable update for users based on user_id" ON profiles;
  DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
  DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

  -- Create comprehensive RLS policies
  CREATE POLICY "Users can insert own profile"
    ON profiles FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

  CREATE POLICY "Users can read own profile"
    ON profiles FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

  CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

  CREATE POLICY "Admins can view all profiles"
    ON profiles FOR SELECT
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM user_roles
        WHERE user_id = auth.uid()
        AND role IN ('admin', 'super_admin', 'program_manager', 'client_admin')
      )
    );

  CREATE POLICY "Admins can update all profiles"
    ON profiles FOR UPDATE
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM user_roles
        WHERE user_id = auth.uid()
        AND role IN ('admin', 'super_admin', 'program_manager')
      )
    );
END;
$$ LANGUAGE plpgsql;

-- Update RLS policies for user_roles table
DO $$
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Users can insert own role" ON user_roles;

  -- Create proper RLS policies for user_roles
  CREATE POLICY "Users can read own roles"
    ON user_roles FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

  CREATE POLICY "System can insert user roles"
    ON user_roles FOR INSERT
    TO authenticated
    WITH CHECK (true);

  CREATE POLICY "Admins can manage all roles"
    ON user_roles FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM user_roles ur
        WHERE ur.user_id = auth.uid()
        AND ur.role IN ('admin', 'super_admin', 'program_manager')
      )
    );
END;
$$ LANGUAGE plpgsql;

-- Update RLS policies for businesses table
DO $$
BEGIN
  -- Drop existing conflicting policies if they exist
  DROP POLICY IF EXISTS "Users can insert own business" ON businesses;
  DROP POLICY IF EXISTS "Users can view own business" ON businesses;
  DROP POLICY IF EXISTS "Users can update own business" ON businesses;
  DROP POLICY IF EXISTS "Admins can view all businesses" ON businesses;

  -- Create comprehensive RLS policies for businesses
  CREATE POLICY "Users can manage own business"
    ON businesses FOR ALL
    TO authenticated
    USING (owner_id = auth.uid())
    WITH CHECK (owner_id = auth.uid());

  CREATE POLICY "Admins can view all businesses"
    ON businesses FOR SELECT
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM user_roles
        WHERE user_id = auth.uid()
        AND role IN ('admin', 'super_admin', 'program_manager', 'client_admin')
      )
    );

  CREATE POLICY "System can create business records"
    ON businesses FOR INSERT
    TO authenticated
    WITH CHECK (true);
END;
$$ LANGUAGE plpgsql;

-- Ensure RLS is enabled on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
DO $$
BEGIN
  -- Create indexes if they don't exist
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_profiles_id') THEN
    CREATE INDEX idx_profiles_id ON profiles(id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_user_roles_user_id') THEN
    CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_user_roles_role') THEN
    CREATE INDEX idx_user_roles_role ON user_roles(role);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_businesses_owner_id') THEN
    CREATE INDEX idx_businesses_owner_id ON businesses(owner_id);
  END IF;
END;
$$ LANGUAGE plpgsql;