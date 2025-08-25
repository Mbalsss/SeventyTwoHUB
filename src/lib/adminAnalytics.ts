import { supabase } from './supabase';

// Types used specifically by the Admin Analytics screen
export type UserRow = { created_at: string };
export type ProgramRow = {
  id?: string;
  name: string;
  status?: string;
  program_applications?: { count: number }[] | null;
  program_enrollments?: { count: number }[] | null;
};
export type RegistrationRow = { created_at: string; business_category: string; status: string };

// Fetch users created since a given ISO date (inclusive), ordered ascending by created_at
export const getUsersSince = async (startIso: string): Promise<UserRow[]> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('created_at')
    .gte('created_at', startIso)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data || []) as UserRow[];
};

// Fetch programs with aggregated counts for applications and enrollments
export const getProgramsWithCounts = async (): Promise<ProgramRow[]> => {
  const { data, error } = await supabase
    .from('programs')
    .select(`
      *,
      program_applications(count),
      program_enrollments(count)
    `);

  if (error) throw error;
  return (data || []) as ProgramRow[];
};

// Fetch business registrations since a given ISO date (inclusive), ordered ascending by created_at
export const getRegistrationsSince = async (startIso: string): Promise<RegistrationRow[]> => {
  const { data, error } = await supabase
    .from('business_registrations')
    .select('created_at, business_category, status')
    .gte('created_at', startIso)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data || []) as RegistrationRow[];
};
