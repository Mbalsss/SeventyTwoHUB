import { supabase } from '../supabaseClient';
import type { ApplicationForm, BusinessDataPayload, ProgramApplicationPayload, FormData } from '../types/publicApplicationForm.types';

// Your provided function - integrated
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

// Helper function to get the form config
export const getActiveApplicationForm = async (programId: string): Promise<ApplicationForm | null> => {
  const { data, error } = await supabase
    .from('application_forms')
    .select('*')
    .eq('program_id', programId)
    .eq('is_active', true)
    .maybeSingle();

  if (error) {
    console.error('Error loading application form:', error);
    throw error;
  }
  return data;
};

// Your provided function - integrated
export const submitProgramApplication = async (applicationData: ProgramApplicationPayload) => {
    const { data, error } = await supabase
        .from('program_applications')
        .insert(applicationData)
        .select()
        .maybeSingle();
    if (error) throw error;
    if (!data) throw new Error('Failed to create application');
    return data;
};

// Helper function to create the business record
const createBusinessRecord = async (payload: BusinessDataPayload, formData: FormData) => {
    const { data, error } = await supabase
        .from('businesses')
        .insert({
          owner_id: payload.owner_id,
          business_name: formData.business_name,
          business_category: formData.business_category,
          business_location: formData.business_location,
          business_type: formData.business_type,
          number_of_employees: formData.number_of_employees,
          monthly_revenue: formData.monthly_revenue,
          years_in_operation: parseInt(String(formData.years_in_operation)) || 0,
          beee_level: formData.beee_level || 'not_certified'
        })
        .select('id') // Only select the ID we need
        .single();
    if (error) throw error;
    if (!data) throw new Error('Failed to create business record and retrieve its ID.');
    return data;
};

// Helper function to upload files
const uploadApplicationFiles = async (files: Record<string, File>, userId: string) => {
    const uploadedFiles: Record<string, string> = {};
    for (const [fieldId, file] of Object.entries(files)) {
        const fileName = `${userId}/${fieldId}_${Date.now()}_${file.name}`;
        const { data, error } = await supabase.storage
            .from('documents')
            .upload(fileName, file);

        if (error || !data) {
            throw error || new Error(`Failed to upload file: ${file.name}`);
        }
        uploadedFiles[fieldId] = data.path;
    }
    return uploadedFiles;
};

/**
 * Orchestrator Function: This is the main function the component will call.
 * It handles the entire multi-step submission process.
 */
export const handleFullApplicationSubmission = async (
  userId: string,
  programId: string,
  formData: FormData,
  files: Record<string, File>
) => {
  // 1. Create Business Record
  const business = await createBusinessRecord({ owner_id: userId }, formData);

  // 2. Upload Files
  const uploadedFiles = await uploadApplicationFiles(files, userId);

  // 3. Prepare and Submit Final Application using your function
  await submitProgramApplication({
    program_id: programId,
    applicant_id: userId,
    business_id: business.id,
    application_data: {
      ...formData,
      uploaded_files: JSON.stringify(uploadedFiles),
    },
  });
};