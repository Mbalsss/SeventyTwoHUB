/*
  # Business Registration Schema with Admin Approval Workflow

  1. New Tables
    - `business_registrations`
      - `id` (uuid, primary key)
      - `full_name` (text, applicant's full name)
      - `email` (text, applicant's email)
      - `mobile_number` (text, applicant's mobile)
      - `business_name` (text, business name)
      - `business_category` (text, business category)
      - `business_location` (text, business location)
      - `business_type` (business_type enum, type of business)
      - `number_of_employees` (text, employee count range)
      - `monthly_revenue` (text, revenue range)
      - `years_in_operation` (integer, years in business)
      - `beee_level` (beee_level enum, BEEE certification)
      - `selected_services` (jsonb, array of selected services)
      - `description` (text, optional description)
      - `status` (registration_status enum, approval status)
      - `submitted_at` (timestamptz, submission timestamp)
      - `reviewed_at` (timestamptz, review timestamp)
      - `reviewed_by` (uuid, admin who reviewed)
      - `review_notes` (text, admin notes)
      - `reference_number` (text, unique reference)

    - `registration_documents`
      - `id` (uuid, primary key)
      - `registration_id` (uuid, foreign key to business_registrations)
      - `document_type` (text, type of document)
      - `file_name` (text, original file name)
      - `file_url` (text, storage URL)
      - `file_size` (bigint, file size in bytes)
      - `mime_type` (text, file MIME type)
      - `uploaded_at` (timestamptz, upload timestamp)

  2. New Enums
    - `registration_status` (pending, under_review, approved, rejected, requires_documents)

  3. Security
    - Enable RLS on both tables
    - Add policies for applicants to view their own registrations
    - Add policies for admins to manage all registrations

  4. Functions
    - Auto-generate reference numbers for registrations
*/

-- Create registration status enum
CREATE TYPE registration_status AS ENUM (
  'pending',
  'under_review', 
  'approved',
  'rejected',
  'requires_documents'
);

-- Create business registrations table
CREATE TABLE IF NOT EXISTS business_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL,
  mobile_number text,
  business_name text NOT NULL,
  business_category text NOT NULL,
  business_location text NOT NULL,
  business_type business_type NOT NULL,
  number_of_employees text NOT NULL,
  monthly_revenue text NOT NULL,
  years_in_operation integer NOT NULL DEFAULT 0,
  beee_level beee_level DEFAULT 'not_certified',
  selected_services jsonb DEFAULT '[]'::jsonb,
  description text,
  status registration_status DEFAULT 'pending',
  submitted_at timestamptz DEFAULT now(),
  reviewed_at timestamptz,
  reviewed_by uuid,
  review_notes text,
  reference_number text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create registration documents table
CREATE TABLE IF NOT EXISTS registration_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id uuid NOT NULL REFERENCES business_registrations(id) ON DELETE CASCADE,
  document_type text NOT NULL,
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_size bigint,
  mime_type text,
  uploaded_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_business_registrations_status ON business_registrations(status);
CREATE INDEX IF NOT EXISTS idx_business_registrations_email ON business_registrations(email);
CREATE INDEX IF NOT EXISTS idx_business_registrations_submitted_at ON business_registrations(submitted_at);
CREATE INDEX IF NOT EXISTS idx_registration_documents_registration_id ON registration_documents(registration_id);

-- Enable Row Level Security
ALTER TABLE business_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE registration_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for business_registrations
CREATE POLICY "Admins can view all registrations"
  ON business_registrations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'super_admin', 'program_manager', 'client_admin')
    )
  );

CREATE POLICY "Admins can update registrations"
  ON business_registrations
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'super_admin', 'program_manager', 'client_admin')
    )
  );

CREATE POLICY "Anyone can insert registrations"
  ON business_registrations
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Applicants can view own registrations"
  ON business_registrations
  FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'email' = email);

-- RLS Policies for registration_documents
CREATE POLICY "Admins can view all documents"
  ON registration_documents
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'super_admin', 'program_manager', 'client_admin')
    )
  );

CREATE POLICY "Anyone can insert documents"
  ON registration_documents
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Applicants can view own documents"
  ON registration_documents
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM business_registrations
      WHERE business_registrations.id = registration_documents.registration_id
      AND business_registrations.email = (auth.jwt() ->> 'email')
    )
  );

-- Function to generate reference numbers
CREATE OR REPLACE FUNCTION generate_registration_reference()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  ref_number text;
BEGIN
  ref_number := 'REG' || to_char(now(), 'YYYYMMDD') || '-' || LPAD(floor(random() * 10000)::text, 4, '0');
  RETURN ref_number;
END;
$$;

-- Trigger to auto-generate reference numbers
CREATE OR REPLACE FUNCTION set_registration_reference()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.reference_number IS NULL OR NEW.reference_number = '' THEN
    NEW.reference_number := generate_registration_reference();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_set_registration_reference
  BEFORE INSERT ON business_registrations
  FOR EACH ROW
  EXECUTE FUNCTION set_registration_reference();

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_business_registrations_updated_at
  BEFORE UPDATE ON business_registrations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();