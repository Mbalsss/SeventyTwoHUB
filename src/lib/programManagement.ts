import { supabase } from './supabase';

// Types shared by admin program management
export type ProgramStatus = 'draft' | 'active' | 'completed' | 'cancelled';

export interface ProgramRecord {
  id: string;
  name: string;
  description?: string;
  status: ProgramStatus;
  start_date?: string | null;
  end_date?: string | null;
  max_participants?: number | null;
  application_deadline?: string | null;
  application_link_id?: string | null;
  created_at: string;
  created_by?: string | null;
}

export interface ProgramWithCounts extends ProgramRecord {
  applications_count: number;
  enrollments_count: number;
}

/**
 * Load programs and attach counts for applications and enrollments (normalized fields)
 */
export const getProgramsWithCounts = async (): Promise<ProgramWithCounts[]> => {
  const { data, error } = await supabase
    .from('programs')
    .select(`
      *,
      program_applications(count),
      program_enrollments(count)
    `)
    .order('created_at', { ascending: false });
  if (error) throw error;

  return (data || []).map((p: any) => ({
    ...p,
    applications_count: p.program_applications?.[0]?.count || 0,
    enrollments_count: p.program_enrollments?.[0]?.count || 0,
  }));
};

/**
 * Load programs with PostgREST relation count arrays (program_applications(count), program_enrollments(count))
 * Useful for UIs that already expect relation arrays.
 */
export const getProgramsWithRelationCounts = async (): Promise<any[]> => {
  const { data, error } = await supabase
    .from('programs')
    .select(`
      *,
      program_applications(count),
      program_enrollments(count)
    `)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
};

/**
 * Create a program and also create a default application form.
 */
export const createProgram = async (createdByUserId: string, formData: any): Promise<ProgramRecord> => {
  const { data, error } = await supabase
    .from('programs')
    .insert({
      ...formData,
      created_by: createdByUserId
    })
    .select()
    .single();
  if (error) throw error;

  // Create default application form (best effort)
  const { error: formError } = await supabase
    .from('application_forms')
    .insert({
      program_id: data.id,
      form_config: {
        title: `${formData.name} Application`,
        description: `Apply for the ${formData.name} program`,
        fields: [
          { id: 'full_name', type: 'text', label: 'Full Name', required: true },
          { id: 'email', type: 'email', label: 'Email Address', required: true },
          { id: 'mobile_number', type: 'tel', label: 'Mobile Number', required: true },
          { id: 'business_name', type: 'text', label: 'Business Name', required: true },
          { id: 'business_category', type: 'select', label: 'Business Category', required: true, options: ['Retail & Trading', 'Food & Beverages', 'Agriculture', 'Manufacturing', 'Services', 'Technology'] },
          { id: 'motivation', type: 'textarea', label: 'Why do you want to join this program?', required: true }
        ]
      }
    });
  if (formError) {
    // Log but don't fail the entire creation
    console.warn('Application form creation failed:', formError.message);
  }

  return data as ProgramRecord;
};

/**
 * Generate an application link id and update program. Tries RPC generate_application_link, falls back to local generation.
 * Returns the full link ID.
 */
export const generateApplicationLink = async (programId: string): Promise<string> => {
  // Try RPC first
  let linkId: string | null = null;
  try {
    const { data, error } = await supabase.rpc('generate_application_link');
    if (error) throw error;
    linkId = data as string;
  } catch (e) {
    // Fallback local generation
    linkId = `prog_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  const { error: updateError } = await supabase
    .from('programs')
    .update({ application_link_id: linkId })
    .eq('id', programId);
  if (updateError) throw updateError;

  return linkId!;
};

/**
 * Load applications for a program with joined profile and business info.
 */
export const getProgramApplications = async (programId: string): Promise<any[]> => {
  const { data, error } = await supabase
    .from('program_applications')
    .select(`
      *,
      profiles!program_applications_applicant_id_fkey(
        full_name
      ),
      businesses!program_applications_business_id_fkey(
        business_name,
        business_category,
        business_location
      )
    `)
    .eq('program_id', programId)
    .order('submitted_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

/**
 * Update application status and optionally create enrollment if approved.
 */
export const updateApplicationStatus = async (
  applicationId: string,
  status: 'approved' | 'rejected' | 'under_review' | 'submitted',
  reviewerUserId?: string,
  notes?: string
): Promise<void> => {
  const { error } = await supabase
    .from('program_applications')
    .update({
      status,
      reviewed_at: new Date().toISOString(),
      reviewed_by: reviewerUserId,
      notes
    })
    .eq('id', applicationId);
  if (error) throw error;

  if (status === 'approved') {
    // Load application to get IDs for enrollment creation
    const { data: app, error: loadError } = await supabase
      .from('program_applications')
      .select('id, program_id, applicant_id')
      .eq('id', applicationId)
      .single();
    if (loadError) throw loadError;

    const { error: enrollError } = await supabase
      .from('program_enrollments')
      .insert({
        program_id: app.program_id,
        participant_id: app.applicant_id,
        application_id: applicationId
      });
    if (enrollError) {
      // Log but don't fail the status update operation
      console.warn('Enrollment creation failed:', enrollError.message);
    }
  }
};

/**
 * Fetch applications for export and return CSV content as string.
 */
export const exportApplicationsCSV = async (programId: string): Promise<string> => {
  const { data, error } = await supabase
    .from('program_applications')
    .select(`
      *,
      profiles(full_name, mobile_number),
      businesses(business_name, business_category, business_location)
    `)
    .eq('program_id', programId);
  if (error) throw error;

  const rows = [
    ['Reference Number', 'Applicant Name', 'Email', 'Business Name', 'Category', 'Location', 'Status', 'Submitted Date'],
    ...((data || []) as any[]).map(app => [
      app.reference_number,
      app.profiles?.full_name || '',
      app.application_data?.email || '',
      app.businesses?.business_name || '',
      app.businesses?.business_category || '',
      app.businesses?.business_location || '',
      app.status,
      app.submitted_at ? new Date(app.submitted_at).toLocaleDateString() : ''
    ])
  ];
  return rows.map(r => r.join(',')).join('\n');
};
