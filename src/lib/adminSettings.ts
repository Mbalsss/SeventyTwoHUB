import { supabase } from './supabase';

export interface AdminSettings {
  id: string;
  platform_name: string;
  platform_description: string;
  maintenance_mode: boolean;
  registration_enabled: boolean;
  default_language: string;
  require_email_verification: boolean;
  session_timeout_hours: number;
  max_login_attempts: number;
  password_min_length: number;
  two_factor_required_for_admins: boolean;
  email_notifications_enabled: boolean;
  admin_alerts_enabled: boolean;
  system_updates_enabled: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Get current admin settings from database
 */
export const getAdminSettings = async (): Promise<AdminSettings | null> => {
  try {
    const { data, error } = await supabase
      .from('admin_settings')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error fetching admin settings:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in getAdminSettings:', error);
    throw error;
  }
};

/**
 * Update admin settings in database
 */
export const updateAdminSettings = async (settings: Partial<AdminSettings>): Promise<AdminSettings> => {
  try {
    // First, get the current settings to get the ID
    const currentSettings = await getAdminSettings();
    
    if (!currentSettings) {
      throw new Error('No admin settings found. Please contact support.');
    }

    // Remove read-only fields from update
    const { id, created_at, updated_at, ...updateData } = settings;

    const { data, error } = await supabase
      .from('admin_settings')
      .update(updateData)
      .eq('id', currentSettings.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating admin settings:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in updateAdminSettings:', error);
    throw error;
  }
};

/**
 * Check if 2FA is required for admin accounts
 */
export const isTwoFactorRequiredForAdmins = async (): Promise<boolean> => {
  try {
    const settings = await getAdminSettings();
    return settings?.two_factor_required_for_admins || false;
  } catch (error) {
    console.error('Error checking 2FA requirement:', error);
    // Default to false if we can't fetch settings
    return false;
  }
};

/**
 * Enable or disable 2FA requirement for admin accounts
 */
export const setTwoFactorRequirement = async (required: boolean): Promise<void> => {
  try {
    await updateAdminSettings({
      two_factor_required_for_admins: required
    });
    
    console.log(`2FA requirement for admins ${required ? 'enabled' : 'disabled'}`);
  } catch (error) {
    console.error('Error setting 2FA requirement:', error);
    throw error;
  }
};

/**
 * Get platform maintenance status
 */
export const isMaintenanceMode = async (): Promise<boolean> => {
  try {
    const settings = await getAdminSettings();
    return settings?.maintenance_mode || false;
  } catch (error) {
    console.error('Error checking maintenance mode:', error);
    return false;
  }
};

/**
 * Check if new registrations are enabled
 */
export const isRegistrationEnabled = async (): Promise<boolean> => {
  try {
    const settings = await getAdminSettings();
    return settings?.registration_enabled ?? true;
  } catch (error) {
    console.error('Error checking registration status:', error);
    return true; // Default to enabled if we can't fetch settings
  }
};

/**
 * Initialize admin settings if they don't exist
 * This function should be called during app initialization
 */
export const initializeAdminSettings = async (): Promise<void> => {
  try {
    const existingSettings = await getAdminSettings();
    
    if (!existingSettings) {
      console.log('No admin settings found, creating default settings...');
      
      const { error } = await supabase
        .from('admin_settings')
        .insert({
          platform_name: 'SeventyTwo X',
          platform_description: 'Empowering South African entrepreneurs',
          maintenance_mode: false,
          registration_enabled: true,
          default_language: 'en',
          require_email_verification: false,
          session_timeout_hours: 24,
          max_login_attempts: 5,
          password_min_length: 6,
          two_factor_required_for_admins: false,
          email_notifications_enabled: true,
          admin_alerts_enabled: true,
          system_updates_enabled: true
        });

      if (error) {
        console.error('Error creating default admin settings:', error);
        throw error;
      }
      
      console.log('Default admin settings created successfully');
    }
  } catch (error) {
    console.error('Error initializing admin settings:', error);
    // Don't throw here as this is initialization - app should still work
  }
};

/**
 * Subscribe to admin settings changes
 */
export const subscribeToAdminSettings = (callback: (settings: AdminSettings | null) => void) => {
  return supabase
    .channel('admin_settings_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'admin_settings'
      },
      async () => {
        try {
          const settings = await getAdminSettings();
          callback(settings);
        } catch (error) {
          console.error('Error fetching updated settings:', error);
          callback(null);
        }
      }
    )
    .subscribe();
};