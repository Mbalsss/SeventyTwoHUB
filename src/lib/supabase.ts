// src/lib/supabase.ts
import { supabase } from '../supabaseClient';

// Re-export the supabase client for convenience
export { supabase } from '../supabaseClient';

// ---- Helper Functions (unchanged, with minor safety) ----
export const getCurrentUser = async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user ?? null;
};

export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
  return data || null;
};

export const getUserRoles = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_roles')
    .select('*')
    .eq('user_id', userId);
  if (error) {
    console.error('Error fetching user roles:', error);
    throw error;
  }
  return data ?? [];
};

export const getUserBusiness = async (userId: string) => {
  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('owner_id', userId)
    .limit(1);
  if (error) {
    console.error('Error fetching user business:', error);
    throw error;
  }
  return data?.[0] || null;
};

export const getActivePrograms = async () => {
  const { data, error } = await supabase
    .from('programs')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
};

export const getProgramByLinkId = async (linkId: string) => {
  const { data, error } = await supabase
    .from('programs')
    .select('*')
    .eq('application_link_id', linkId)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('Program not found');
  return data;
};

export const submitProgramApplication = async (applicationData: {
  program_id: string;
  applicant_id: string;
  business_id: string;
  application_data: any;
}) => {
  const { data, error } = await supabase
    .from('program_applications')
    .insert(applicationData)
    .select()
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('Failed to create application');
  return data;
};

export const submitBusinessRegistration = async (registrationData: {
  full_name: string;
  email: string;
  mobile_number?: string;
  business_name: string;
  business_category: string;
  business_location: string;
  business_type: string;
  number_of_employees: string;
  monthly_revenue: string;
  years_in_operation: number;
  beee_level?: string;
  selected_services: string[];
  description?: string;
}) => {
  const { data, error } = await supabase
    .from('business_registrations')
    .insert(registrationData)
    .select()
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('Failed to create registration');
  return data;
};

export const getBusinessRegistrations = async (status?: string) => {
  let query = supabase
    .from('business_registrations')
    .select('*')
    .order('submitted_at', { ascending: false });

  if (status) query = query.eq('status', status);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
};

export const updateRegistrationStatus = async (
  registrationId: string,
  status: string,
  reviewNotes?: string
) => {
  const { data: auth } = await supabase.auth.getUser();
  const reviewerId = auth.user?.id;
  if (!reviewerId) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('business_registrations')
    .update({
      status,
      reviewed_at: new Date().toISOString(),
      reviewed_by: reviewerId,
      review_notes: reviewNotes,
    })
    .eq('id', registrationId)
    .select()
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('Registration not found');
  return data;
};

export const uploadRegistrationDocument = async (
  registrationId: string,
  documentType: string,
  file: File
) => {
  const fileName = `${registrationId}/${documentType}_${Date.now()}_${file.name}`;

  const { error: uploadError } = await supabase.storage
    .from('registration-documents')
    .upload(fileName, file);
  if (uploadError) throw uploadError;

  const {
    data: { publicUrl },
  } = supabase.storage.from('registration-documents').getPublicUrl(fileName);

  const { data, error } = await supabase
    .from('registration_documents')
    .insert({
      registration_id: registrationId,
      document_type: documentType,
      file_name: file.name,
      file_url: publicUrl,
      file_size: file.size,
      mime_type: file.type,
    })
    .select()
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error('Failed to save document record');
  return data;
};

export const uploadFile = async (bucket: string, path: string, file: File) => {
  const { data, error } = await supabase.storage.from(bucket).upload(path, file);
  if (error) throw error;
  return data;
};

export const getFileUrl = (bucket: string, path: string) => {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
};

export const subscribeToTable = (
  table: string,
  callback: (payload: any) => void,
  filter?: string
) => {
  return supabase
    .channel(`${table}_changes`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table, filter },
      callback
    )
    .subscribe();
};

export const handleSupabaseError = (error: any) => {
  console.error('Supabase Error:', error);
  if (error?.code === 'PGRST116') return 'No data found';
  if (error?.code === '23505') return 'This record already exists';
  return error?.message || 'An unexpected error occurred';
};
