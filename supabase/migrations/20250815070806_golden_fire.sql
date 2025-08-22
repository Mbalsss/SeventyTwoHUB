/*
  # Create Admin User and Role

  1. New Admin User Setup
    - Creates admin user in auth.users if not exists
    - Creates corresponding profile
    - Assigns admin role

  2. Security
    - Ensures admin user has proper permissions
    - Sets up admin role in user_roles table
*/

-- Insert admin user into auth.users (if not exists)
DO $$
BEGIN
  -- Check if admin user already exists
  IF NOT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'admin@bizboost.co.za'
  ) THEN
    -- Insert admin user
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin,
      role
    ) VALUES (
      gen_random_uuid(),
      '00000000-0000-0000-0000-000000000000',
      'admin@bizboost.co.za',
      crypt('admin123', gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"provider": "email", "providers": ["email"]}',
      '{"full_name": "Admin User"}',
      false,
      'authenticated'
    );
  END IF;
END $$;

-- Create profile for admin user
DO $$
DECLARE
  admin_user_id uuid;
BEGIN
  -- Get admin user ID
  SELECT id INTO admin_user_id FROM auth.users WHERE email = 'admin@bizboost.co.za';
  
  -- Insert profile if not exists
  IF admin_user_id IS NOT NULL THEN
    INSERT INTO profiles (id, full_name, created_at, updated_at)
    VALUES (admin_user_id, 'Admin User', now(), now())
    ON CONFLICT (id) DO NOTHING;
    
    -- Insert admin role if not exists
    INSERT INTO user_roles (user_id, role, created_at)
    VALUES (admin_user_id, 'admin', now())
    ON CONFLICT (user_id, role, program_id) DO NOTHING;
  END IF;
END $$;