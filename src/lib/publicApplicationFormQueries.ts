import { supabase } from '../supabaseClient';
export { supabase } from '../supabaseClient';

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