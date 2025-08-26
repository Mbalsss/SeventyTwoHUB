/*
  # Add Account Creation Tracking (Corrected)

  1. Schema Updates
    - Add `account_created` column to business_registrations
    - Add `application_reference` column to business_registrations (UUID)
    - Add `application_reference` column to profiles
    - Add indexes for performance

  2. Security
    - Update RLS policies to handle account creation flow
    - Add policy for account creation validation

  3. Functions & Triggers
    - Function to prevent duplicate account creation
    - Trigger to mark business_registrations.account_created
*/

-- Add application_reference to business_registrations
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'business_registrations' AND column_name = 'application_reference'
  ) THEN
ALTER TABLE business_registrations
    ADD COLUMN application_reference uuid DEFAULT gen_random_uuid() UNIQUE;
END IF;
END $$;

-- Add account_created flag
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'business_registrations' AND column_name = 'account_created'
  ) THEN
ALTER TABLE business_registrations
    ADD COLUMN account_created boolean DEFAULT false;
END IF;
END $$;

-- Add application_reference to profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'application_reference'
  ) THEN
ALTER TABLE profiles
    ADD COLUMN application_reference uuid;
END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_business_registrations_application_reference
    ON business_registrations(application_reference);

CREATE INDEX IF NOT EXISTS idx_profiles_application_reference
    ON profiles(application_reference);

CREATE INDEX IF NOT EXISTS idx_business_registrations_account_created
    ON business_registrations(account_created);

-- Function to prevent duplicate account creation + mark registration
CREATE OR REPLACE FUNCTION prevent_duplicate_account_creation()
RETURNS trigger AS $$
BEGIN
  -- Ensure reference exists in business_registrations and is approved
  IF NOT EXISTS (
    SELECT 1 FROM business_registrations br
    WHERE br.application_reference = NEW.application_reference
      AND br.status = 'approved'
      AND br.account_created = FALSE
  ) THEN
    RAISE EXCEPTION 'Invalid or already used application reference';
END IF;

  -- Mark registration as linked
UPDATE business_registrations
SET account_created = TRUE, updated_at = now()
WHERE application_reference = NEW.application_reference;

RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger (after insert only)
DROP TRIGGER IF EXISTS trigger_prevent_duplicate_account_creation ON profiles;
CREATE TRIGGER trigger_prevent_duplicate_account_creation
    AFTER INSERT ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION prevent_duplicate_account_creation();

-- RLS: allow only valid application references during profile creation
CREATE POLICY IF NOT EXISTS "Allow insert profiles with valid application_reference"
  ON profiles
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM business_registrations br
      WHERE br.application_reference = application_reference
        AND br.status = 'approved'
        AND br.account_created = FALSE
    )
  );

-- Validation helper function
CREATE OR REPLACE FUNCTION validate_application_for_account(
  ref_number uuid,
  email_address text
)
RETURNS json AS $$
DECLARE
application_record business_registrations%ROWTYPE;
  result json;
BEGIN
SELECT * INTO application_record
FROM business_registrations
WHERE application_reference = ref_number;

IF NOT FOUND THEN
    RETURN json_build_object('valid', false, 'error', 'Application not found');
END IF;

  IF application_record.status != 'approved' THEN
    RETURN json_build_object('valid', false, 'error', 'Application not approved yet');
END IF;

  IF application_record.account_created = true THEN
    RETURN json_build_object('valid', false, 'error', 'Account already created');
END IF;

  IF EXISTS (SELECT 1 FROM auth.users WHERE email = email_address) THEN
    RETURN json_build_object('valid', false, 'error', 'Account with this email already exists');
END IF;

RETURN json_build_object('valid', true, 'application', row_to_json(application_record));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION validate_application_for_account(uuid, text) TO anon, authenticated;
