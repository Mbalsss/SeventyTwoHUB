/*
  # Initial BizBoost Hub Database Schema

  1. New Tables
    - `profiles` - Extended user profile information
    - `businesses` - Business information and details
    - `programs` - Training programs and accelerator programs
    - `program_applications` - Applications submitted for programs
    - `program_enrollments` - Accepted participants in programs
    - `program_events` - Calendar events for programs
    - `program_materials` - Training materials and resources
    - `user_roles` - Role-based access control
    - `application_forms` - Dynamic form configurations
    - `form_responses` - Responses to dynamic forms

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users based on roles
    - Implement proper access controls for different user types

  3. Functions
    - Generate unique application links
    - Handle program enrollment logic
    - Manage file uploads and access
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE user_role_type AS ENUM ('participant', 'admin', 'client_admin', 'program_manager', 'super_admin');
CREATE TYPE application_status AS ENUM ('draft', 'submitted', 'under_review', 'approved', 'rejected');
CREATE TYPE program_status AS ENUM ('draft', 'active', 'completed', 'cancelled');
CREATE TYPE business_type AS ENUM ('formal', 'informal', 'startup', 'cooperative', 'franchise');
CREATE TYPE beee_level AS ENUM ('1', '2', '3', '4', '5', '6', '7', '8', 'not_certified');

-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  mobile_number text,
  avatar_url text,
  two_factor_enabled boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- User roles table
CREATE TABLE IF NOT EXISTS user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  role user_role_type NOT NULL DEFAULT 'participant',
  program_id uuid, -- Will reference programs table
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, role, program_id)
);

-- Businesses table
CREATE TABLE IF NOT EXISTS businesses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  business_name text NOT NULL,
  business_category text NOT NULL,
  business_location text NOT NULL,
  business_type business_type NOT NULL,
  number_of_employees text NOT NULL,
  monthly_revenue text NOT NULL,
  years_in_operation integer NOT NULL,
  beee_level beee_level DEFAULT 'not_certified',
  registration_number text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Programs table
CREATE TABLE IF NOT EXISTS programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  status program_status DEFAULT 'draft',
  start_date date,
  end_date date,
  max_participants integer,
  application_deadline date,
  application_link_id text UNIQUE, -- For unique application URLs
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Application forms table (for dynamic forms)
CREATE TABLE IF NOT EXISTS application_forms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id uuid REFERENCES programs(id) ON DELETE CASCADE,
  form_config jsonb NOT NULL, -- Stores form structure and validation rules
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Program applications table
CREATE TABLE IF NOT EXISTS program_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id uuid REFERENCES programs(id) ON DELETE CASCADE,
  applicant_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  business_id uuid REFERENCES businesses(id) ON DELETE CASCADE,
  application_data jsonb NOT NULL, -- Stores form responses
  status application_status DEFAULT 'submitted',
  submitted_at timestamptz DEFAULT now(),
  reviewed_at timestamptz,
  reviewed_by uuid REFERENCES profiles(id),
  notes text,
  reference_number text UNIQUE NOT NULL
);

-- Program enrollments table
CREATE TABLE IF NOT EXISTS program_enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id uuid REFERENCES programs(id) ON DELETE CASCADE,
  participant_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  application_id uuid REFERENCES program_applications(id),
  enrolled_at timestamptz DEFAULT now(),
  status text DEFAULT 'active', -- active, completed, dropped_out
  completion_percentage integer DEFAULT 0,
  UNIQUE(program_id, participant_id)
);

-- Program events table (calendar)
CREATE TABLE IF NOT EXISTS program_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id uuid REFERENCES programs(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  event_type text DEFAULT 'training', -- training, workshop, assessment, etc.
  location text,
  zoom_link text,
  is_mandatory boolean DEFAULT true,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Event attendance table
CREATE TABLE IF NOT EXISTS event_attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES program_events(id) ON DELETE CASCADE,
  participant_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  status text DEFAULT 'registered', -- registered, attended, absent, excused
  attended_at timestamptz,
  notes text,
  UNIQUE(event_id, participant_id)
);

-- Program materials table
CREATE TABLE IF NOT EXISTS program_materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id uuid REFERENCES programs(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  material_type text NOT NULL, -- video, document, presentation, link
  file_url text,
  file_size bigint,
  module_number integer,
  is_required boolean DEFAULT false,
  uploaded_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Material access tracking
CREATE TABLE IF NOT EXISTS material_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id uuid REFERENCES program_materials(id) ON DELETE CASCADE,
  participant_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  accessed_at timestamptz DEFAULT now(),
  completion_status text DEFAULT 'viewed', -- viewed, completed, downloaded
  time_spent_minutes integer
);

-- Document uploads table (for supporting documents)
CREATE TABLE IF NOT EXISTS document_uploads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  business_id uuid REFERENCES businesses(id) ON DELETE CASCADE,
  document_type text NOT NULL, -- company_registration, id_document, bank_confirmation, beee_certificate
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_size bigint,
  mime_type text,
  uploaded_at timestamptz DEFAULT now(),
  verified boolean DEFAULT false,
  verified_by uuid REFERENCES profiles(id),
  verified_at timestamptz
);

-- Add foreign key constraint for user_roles.program_id
ALTER TABLE user_roles ADD CONSTRAINT fk_user_roles_program 
  FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE CASCADE;

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_uploads ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'super_admin', 'program_manager')
    )
  );

-- RLS Policies for businesses
CREATE POLICY "Users can view own business"
  ON businesses FOR SELECT
  TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "Users can update own business"
  ON businesses FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "Users can insert own business"
  ON businesses FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Admins can view all businesses"
  ON businesses FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'super_admin', 'program_manager')
    )
  );

-- RLS Policies for programs
CREATE POLICY "Anyone can view active programs"
  ON programs FOR SELECT
  TO authenticated
  USING (status = 'active');

CREATE POLICY "Admins can manage programs"
  ON programs FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'super_admin', 'program_manager')
    )
  );

-- RLS Policies for program applications
CREATE POLICY "Users can view own applications"
  ON program_applications FOR SELECT
  TO authenticated
  USING (applicant_id = auth.uid());

CREATE POLICY "Users can insert own applications"
  ON program_applications FOR INSERT
  TO authenticated
  WITH CHECK (applicant_id = auth.uid());

CREATE POLICY "Admins can view all applications"
  ON program_applications FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'super_admin', 'program_manager')
    )
  );

CREATE POLICY "Admins can update applications"
  ON program_applications FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'super_admin', 'program_manager')
    )
  );

-- RLS Policies for program enrollments
CREATE POLICY "Participants can view own enrollments"
  ON program_enrollments FOR SELECT
  TO authenticated
  USING (participant_id = auth.uid());

CREATE POLICY "Admins can manage enrollments"
  ON program_enrollments FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'super_admin', 'program_manager')
    )
  );

-- RLS Policies for program events
CREATE POLICY "Enrolled participants can view program events"
  ON program_events FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM program_enrollments 
      WHERE program_id = program_events.program_id 
      AND participant_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'super_admin', 'program_manager')
    )
  );

CREATE POLICY "Admins can manage events"
  ON program_events FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'super_admin', 'program_manager')
    )
  );

-- RLS Policies for program materials
CREATE POLICY "Enrolled participants can view program materials"
  ON program_materials FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM program_enrollments 
      WHERE program_id = program_materials.program_id 
      AND participant_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'super_admin', 'program_manager')
    )
  );

CREATE POLICY "Admins can manage materials"
  ON program_materials FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'super_admin', 'program_manager')
    )
  );

-- RLS Policies for document uploads
CREATE POLICY "Users can view own documents"
  ON document_uploads FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can upload own documents"
  ON document_uploads FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all documents"
  ON document_uploads FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'super_admin', 'program_manager')
    )
  );

-- Functions for generating unique application links
CREATE OR REPLACE FUNCTION generate_application_link()
RETURNS text AS $$
BEGIN
  RETURN 'app-' || encode(gen_random_bytes(8), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Function to generate application reference numbers
CREATE OR REPLACE FUNCTION generate_reference_number()
RETURNS text AS $$
BEGIN
  RETURN 'APP' || to_char(now(), 'YYYYMMDD') || '-' || encode(gen_random_bytes(4), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate application link for programs
CREATE OR REPLACE FUNCTION set_program_application_link()
RETURNS trigger AS $$
BEGIN
  IF NEW.application_link_id IS NULL THEN
    NEW.application_link_id := generate_application_link();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_program_application_link
  BEFORE INSERT ON programs
  FOR EACH ROW
  EXECUTE FUNCTION set_program_application_link();

-- Trigger to auto-generate reference number for applications
CREATE OR REPLACE FUNCTION set_application_reference()
RETURNS trigger AS $$
BEGIN
  IF NEW.reference_number IS NULL THEN
    NEW.reference_number := generate_reference_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_application_reference
  BEFORE INSERT ON program_applications
  FOR EACH ROW
  EXECUTE FUNCTION set_application_reference();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_id ON profiles(id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);
CREATE INDEX IF NOT EXISTS idx_businesses_owner_id ON businesses(owner_id);
CREATE INDEX IF NOT EXISTS idx_programs_status ON programs(status);
CREATE INDEX IF NOT EXISTS idx_programs_application_link ON programs(application_link_id);
CREATE INDEX IF NOT EXISTS idx_program_applications_program_id ON program_applications(program_id);
CREATE INDEX IF NOT EXISTS idx_program_applications_applicant_id ON program_applications(applicant_id);
CREATE INDEX IF NOT EXISTS idx_program_applications_status ON program_applications(status);
CREATE INDEX IF NOT EXISTS idx_program_enrollments_program_id ON program_enrollments(program_id);
CREATE INDEX IF NOT EXISTS idx_program_enrollments_participant_id ON program_enrollments(participant_id);
CREATE INDEX IF NOT EXISTS idx_program_events_program_id ON program_events(program_id);
CREATE INDEX IF NOT EXISTS idx_program_events_start_time ON program_events(start_time);
CREATE INDEX IF NOT EXISTS idx_program_materials_program_id ON program_materials(program_id);
CREATE INDEX IF NOT EXISTS idx_document_uploads_user_id ON document_uploads(user_id);
CREATE INDEX IF NOT EXISTS idx_document_uploads_business_id ON document_uploads(business_id);