/*
  # Recreate User Creation Trigger

  1. Safety
    - Drop existing trigger and function safely
    - Prevent conflicts with existing implementations

  2. New Function
    - Enhanced error handling and logging
    - Safe defaults for all required fields
    - Duplicate prevention logic
    - Better metadata extraction

  3. Trigger
    - Recreate trigger with improved function
    - Maintains automatic profile creation on signup
*/

-- Step 1: Drop the trigger that depends on the function
DROP TRIGGER IF EXISTS handle_new_user ON auth.users;

-- Step 2: Drop the function safely
DROP FUNCTION IF EXISTS handle_new_user();

-- Step 3: Recreate the function with improved logic
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
DECLARE
  user_full_name text;
  user_mobile text;
  intended_role text;
  business_name text;
  business_category text;
  business_location text;
BEGIN
  -- Log the trigger execution for debugging
  RAISE LOG 'handle_new_user triggered for user: %', NEW.id;
  
  -- Extract metadata safely with multiple fallback options
  user_full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'display_name',
    split_part(NEW.email, '@', 1),
    'User'
  );
  
  user_mobile := COALESCE(
    NEW.raw_user_meta_data->>'mobile_number',
    NEW.raw_user_meta_data->>'phone',
    NEW.phone
  );
  
  intended_role := COALESCE(
    NEW.raw_user_meta_data->>'intended_role',
    NEW.raw_user_meta_data->>'role',
    CASE 
      WHEN NEW.email LIKE '%admin%' OR NEW.email LIKE '%@bizboost.co.za' OR NEW.email LIKE '%@seda.%' THEN 'admin'
      ELSE 'participant'
    END
  );

  -- Extract business metadata for participants
  business_name := COALESCE(
    NEW.raw_user_meta_data->>'business_name',
    user_full_name || '''s Business'
  );
  
  business_category := COALESCE(
    NEW.raw_user_meta_data->>'business_category',
    'General Business'
  );
  
  business_location := COALESCE(
    NEW.raw_user_meta_data->>'business_location',
    'South Africa'
  );

  BEGIN
    -- Check if profile already exists to prevent duplicates
    IF EXISTS (SELECT 1 FROM public.profiles WHERE id = NEW.id) THEN
      RAISE LOG 'Profile already exists for user: %', NEW.id;
      RETURN NEW;
    END IF;

    -- Create user profile with safe defaults
    INSERT INTO public.profiles (
      id,
      full_name,
      mobile_number,
      created_at,
      updated_at,
      account_status
    ) VALUES (
      NEW.id,
      user_full_name,
      user_mobile,
      NOW(),
      NOW(),
      'pending'
    );
    
    RAISE LOG 'Profile created for user: %', NEW.id;

    -- Assign user role
    INSERT INTO public.user_roles (
      user_id,
      role,
      created_at
    ) VALUES (
      NEW.id,
      intended_role::user_role_type,
      NOW()
    );
    
    RAISE LOG 'Role assigned for user: % as %', NEW.id, intended_role;

    -- Create business record for participants
    IF intended_role = 'participant' THEN
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
        business_name,
        business_category,
        business_location,
        'informal',
        '1 (Just me)',
        'R0 - R5,000',
        0,
        'not_certified',
        NOW(),
        NOW()
      );
      
      RAISE LOG 'Business record created for participant: %', NEW.id;
    END IF;

  EXCEPTION
    WHEN OTHERS THEN
      -- Log the error but don't fail the auth process
      RAISE LOG 'Error in handle_new_user for user %: % %', NEW.id, SQLSTATE, SQLERRM;
      -- Return NEW to allow auth to continue
      RETURN NEW;
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4: Recreate the trigger
CREATE TRIGGER handle_new_user
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION handle_new_user() TO authenticated;
GRANT EXECUTE ON FUNCTION handle_new_user() TO anon;