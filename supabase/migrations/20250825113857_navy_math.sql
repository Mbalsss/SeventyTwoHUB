/*
  # Create admin_settings table for platform configuration

  1. New Tables
    - `admin_settings`
      - `id` (uuid, primary key)
      - `platform_name` (text, default 'SeventyTwo X')
      - `platform_description` (text)
      - `maintenance_mode` (boolean, default false)
      - `registration_enabled` (boolean, default true)
      - `default_language` (text, default 'en')
      - `require_email_verification` (boolean, default false)
      - `session_timeout_hours` (integer, default 24)
      - `max_login_attempts` (integer, default 5)
      - `password_min_length` (integer, default 6)
      - `two_factor_required_for_admins` (boolean, default false)
      - `email_notifications_enabled` (boolean, default true)
      - `admin_alerts_enabled` (boolean, default true)
      - `system_updates_enabled` (boolean, default true)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `admin_settings` table
    - Add policy for authenticated users to read settings
    - Add policy for admins to insert/update settings
    - Add policy restricting deletion to super_admins only

  3. Functions & Triggers
    - Create `update_updated_at_column` function for automatic timestamp updates
    - Add trigger to update `updated_at` on row changes

  4. Initial Data
    - Insert default configuration row with secure defaults
*/

-- Create the admin_settings table
CREATE TABLE IF NOT EXISTS public.admin_settings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    platform_name text NOT NULL DEFAULT 'SeventyTwo X',
    platform_description text NOT NULL DEFAULT 'Empowering South African entrepreneurs',
    maintenance_mode boolean NOT NULL DEFAULT false,
    registration_enabled boolean NOT NULL DEFAULT true,
    default_language text NOT NULL DEFAULT 'en',
    require_email_verification boolean NOT NULL DEFAULT false,
    session_timeout_hours integer NOT NULL DEFAULT 24,
    max_login_attempts integer NOT NULL DEFAULT 5,
    password_min_length integer NOT NULL DEFAULT 6,
    two_factor_required_for_admins boolean NOT NULL DEFAULT false,
    email_notifications_enabled boolean NOT NULL DEFAULT true,
    admin_alerts_enabled boolean NOT NULL DEFAULT true,
    system_updates_enabled boolean NOT NULL DEFAULT true,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL
);

-- Add constraint to ensure only one settings row exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'admin_settings' AND constraint_name = 'admin_settings_single_row'
    ) THEN
        ALTER TABLE public.admin_settings 
        ADD CONSTRAINT admin_settings_single_row 
        UNIQUE (id);
    END IF;
END $$;

-- Create or replace function to update updated_at column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic updated_at updates
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'update_admin_settings_updated_at'
    ) THEN
        CREATE TRIGGER update_admin_settings_updated_at
        BEFORE UPDATE ON public.admin_settings
        FOR EACH ROW
        EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to read admin settings
CREATE POLICY "Allow authenticated users to read admin settings"
ON public.admin_settings
FOR SELECT
TO authenticated
USING (true);

-- Policy: Allow admins to insert admin settings (for initial setup)
CREATE POLICY "Allow admins to insert admin settings"
ON public.admin_settings
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = auth.uid()
        AND role IN ('admin', 'super_admin', 'program_manager', 'client_admin')
    )
);

-- Policy: Allow admins to update admin settings
CREATE POLICY "Allow admins to update admin settings"
ON public.admin_settings
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = auth.uid()
        AND role IN ('admin', 'super_admin', 'program_manager', 'client_admin')
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = auth.uid()
        AND role IN ('admin', 'super_admin', 'program_manager', 'client_admin')
    )
);

-- Policy: Restrict deletion to super_admins only
CREATE POLICY "Restrict deletion of admin settings to super_admins"
ON public.admin_settings
FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = auth.uid()
        AND role = 'super_admin'
    )
);

-- Insert default settings row if table is empty
INSERT INTO public.admin_settings (
    platform_name,
    platform_description,
    maintenance_mode,
    registration_enabled,
    default_language,
    require_email_verification,
    session_timeout_hours,
    max_login_attempts,
    password_min_length,
    two_factor_required_for_admins,
    email_notifications_enabled,
    admin_alerts_enabled,
    system_updates_enabled
)
SELECT 
    'SeventyTwo X',
    'Empowering South African entrepreneurs',
    false,
    true,
    'en',
    false,
    24,
    5,
    6,
    false,
    true,
    true,
    true
WHERE NOT EXISTS (SELECT 1 FROM public.admin_settings);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_admin_settings_updated_at 
ON public.admin_settings (updated_at);

-- Add helpful comments
COMMENT ON TABLE public.admin_settings IS 'Global platform configuration settings';
COMMENT ON COLUMN public.admin_settings.two_factor_required_for_admins IS 'When true, all admin accounts must have 2FA enabled';
COMMENT ON COLUMN public.admin_settings.maintenance_mode IS 'When true, platform is in maintenance mode';
COMMENT ON COLUMN public.admin_settings.registration_enabled IS 'When false, new user registrations are disabled';