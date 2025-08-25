import { supabase } from './supabase';

export type UserStatus = 'active' | 'inactive' | 'suspended';

export interface UserProfile {
  id: string;
  full_name: string;
  email?: string;
  mobile_number?: string;
  created_at: string;
  updated_at: string;
  roles: string[];
  business?: {
    business_name: string;
    business_category: string;
    business_location: string;
  } | null;
  status: UserStatus;
}

/**
 * Load users with roles and business info. Maps to the UserProfile shape used by the UI.
 */
export const getUsersWithBusinessAndRoles = async (): Promise<UserProfile[]> => {
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select(`
      *,
      user_roles(role),
      businesses(business_name, business_category, business_location)
    `)
    .order('created_at', { ascending: false });
  if (error) throw error;

  const combinedUsers: UserProfile[] = (profiles || []).map((profile: any) => ({
    id: profile.id,
    full_name: profile.full_name,
    // Keep email hidden per current UI behavior
    email: 'Email hidden for privacy',
    mobile_number: profile.mobile_number,
    created_at: profile.created_at,
    updated_at: profile.updated_at,
    roles: profile.user_roles?.map((r: any) => r.role) || [],
    business: profile.businesses?.[0] || null,
    // Default status: the UI currently assumes status without DB backing
    status: 'active'
  }));

  return combinedUsers;
};

/**
 * Bulk activate (placeholder: currently only touches updated_at like original code).
 */
export const bulkActivateProfiles = async (ids: string[]): Promise<void> => {
  const { error } = await supabase
    .from('profiles')
    .update({ updated_at: new Date().toISOString() })
    .in('id', ids);
  if (error) throw error;
};

/**
 * Bulk deactivate (placeholder: currently only touches updated_at like original code).
 */
export const bulkDeactivateProfiles = async (ids: string[]): Promise<void> => {
  const { error } = await supabase
    .from('profiles')
    .update({ updated_at: new Date().toISOString() })
    .in('id', ids);
  if (error) throw error;
};

/**
 * Bulk delete profiles.
 */
export const bulkDeleteProfiles = async (ids: string[]): Promise<void> => {
  const { error } = await supabase
    .from('profiles')
    .delete()
    .in('id', ids);
  if (error) throw error;
};
