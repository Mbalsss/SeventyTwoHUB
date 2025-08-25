import { supabase } from './supabase';

// User Management Queries
export const getUsersWithDetails = async (filters?: {
  search?: string;
  role?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}) => {
  let query = supabase
    .from('profiles')
    .select(`
      *,
      user_roles(role),
      businesses(business_name, business_category, business_location),
      program_enrollments!program_enrollments_participant_id_fkey(id)
    `);

  // Apply filters
  if (filters?.search) {
    query = query.ilike('full_name', `%${filters.search}%`);
  }

  // Apply sorting
  if (filters?.sortBy) {
    query = query.order(filters.sortBy, { ascending: filters.sortOrder === 'asc' });
  } else {
    query = query.order('created_at', { ascending: false });
  }

  // Apply pagination
  if (filters?.limit) {
    query = query.limit(filters.limit);
    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + filters.limit - 1);
    }
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export const updateUserRole = async (userId: string, role: string, programId?: string) => {
  const { data, error } = await supabase
    .from('user_roles')
    .upsert({
      user_id: userId,
      role,
      program_id: programId
    });

  if (error) throw error;
  return data;
};

export const updateUserStatus = async (userId: string, status: 'active' | 'inactive' | 'suspended', reason?: string) => {
  // Update user status in profiles table (add status column if needed)
  const { data, error } = await supabase
    .from('profiles')
    .update({ 
      updated_at: new Date().toISOString(),
      // In production, add a status column to profiles table
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteUserData = async (userId: string) => {
  // Delete user data in correct order due to foreign key constraints
  // Note: This only deletes profile data, not the auth user
  const { error: rolesError } = await supabase
    .from('user_roles')
    .delete()
    .eq('user_id', userId);

  if (rolesError) throw rolesError;

  const { error: businessError } = await supabase
    .from('businesses')
    .delete()
    .eq('owner_id', userId);

  if (businessError) throw businessError;

  const { error: profileError } = await supabase
    .from('profiles')
    .delete()
    .eq('id', userId);

  if (profileError) throw profileError;

  return { success: true };
};

// Program Management Queries
export const getProgramsWithStats = async () => {
  const { data, error } = await supabase
    .from('programs')
    .select(`
      *,
      program_applications!inner(id),
      program_enrollments!inner(id),
      program_events!inner(id),
      program_materials!inner(id)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  
  // Calculate counts manually to avoid aggregation issues
  const programsWithCounts = await Promise.all((data || []).map(async (program) => {
    const [appCount, enrollCount, eventCount, materialCount] = await Promise.all([
      supabase.from('program_applications').select('*', { count: 'exact', head: true }).eq('program_id', program.id),
      supabase.from('program_enrollments').select('*', { count: 'exact', head: true }).eq('program_id', program.id),
      supabase.from('program_events').select('*', { count: 'exact', head: true }).eq('program_id', program.id),
      supabase.from('program_materials').select('*', { count: 'exact', head: true }).eq('program_id', program.id)
    ]);

    return {
      ...program,
      applications_count: appCount.count || 0,
      enrollments_count: enrollCount.count || 0,
      events_count: eventCount.count || 0,
      materials_count: materialCount.count || 0
    };
  }));

  return programsWithCounts;
};

export const createProgramWithForm = async (programData: any, formConfig: any) => {
  // Create program
  const { data: program, error: programError } = await supabase
    .from('programs')
    .insert(programData)
    .select()
    .single();

  if (programError) throw programError;

  // Create application form
  const { data: form, error: formError } = await supabase
    .from('application_forms')
    .insert({
      program_id: program.id,
      form_config: formConfig
    })
    .select()
    .single();

  if (formError) throw formError;

  return { program, form };
};

export const updateProgramStatus = async (programId: string, status: string) => {
  const { data, error } = await supabase
    .from('programs')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', programId)
    .select()
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error('Program not found');
  return data;
};

// Application Management Queries
export const getProgramApplications = async (programId: string, status?: string) => {
  let query = supabase
    .from('program_applications')
    .select(`
      *,
      profiles!program_applications_applicant_id_fkey(
        id,
        full_name
      ),
      businesses!program_applications_business_id_fkey(
        id,
        business_name,
        business_category,
        business_location
      ),
      programs(name)
    `)
    .eq('program_id', programId);

  if (status) {
    query = query.eq('status', status);
  }

  query = query.order('submitted_at', { ascending: false });

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export const updateApplicationStatus = async (
  applicationId: string, 
  status: string, 
  reviewerId: string,
  notes?: string
) => {
  const { data, error } = await supabase
    .from('program_applications')
    .update({
      status,
      reviewed_at: new Date().toISOString(),
      reviewed_by: reviewerId,
      notes
    })
    .eq('id', applicationId)
    .select()
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error('Application not found');

  // If approved, create enrollment
  if (status === 'approved') {
    const { error: enrollmentError } = await supabase
      .from('program_enrollments')
      .insert({
        program_id: data.program_id,
        participant_id: data.applicant_id,
        application_id: applicationId
      });

    if (enrollmentError) throw enrollmentError;
  }

  return data;
};

// Business Registration Queries
export const getBusinessRegistrationsWithDocuments = async (status?: string) => {
  let query = supabase
    .from('business_registrations')
    .select(`
      *,
      registration_documents!inner(
        id,
        document_type,
        file_name,
        file_url,
        uploaded_at
      )
    `);

  if (status) {
    query = query.eq('status', status);
  }

  query = query.order('submitted_at', { ascending: false });

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export const updateBusinessRegistrationStatus = async (
  registrationId: string,
  status: string,
  reviewerId: string,
  notes?: string
) => {
  const { data, error } = await supabase
    .from('business_registrations')
    .update({
      status,
      reviewed_at: new Date().toISOString(),
      reviewed_by: reviewerId,
      review_notes: notes
    })
    .eq('id', registrationId)
    .select()
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error('Registration not found');

  // If approved, create user account and business record
  if (status === 'approved') {
    // This would trigger the account creation process
    // Implementation depends on your specific workflow
  }

  return data;
};

// Analytics Queries
export const getAnalyticsData = async (timeRange: string) => {
  const endDate = new Date();
  const startDate = new Date();
  
  switch (timeRange) {
    case '7days':
      startDate.setDate(endDate.getDate() - 7);
      break;
    case '30days':
      startDate.setDate(endDate.getDate() - 30);
      break;
    case '90days':
      startDate.setDate(endDate.getDate() - 90);
      break;
    case '1year':
      startDate.setFullYear(endDate.getFullYear() - 1);
      break;
  }

  const [
    usersData,
    programsData,
    registrationsData,
    enrollmentsData
  ] = await Promise.all([
    supabase
      .from('profiles')
      .select('created_at')
      .gte('created_at', startDate.toISOString()),
    
    supabase
      .from('programs')
      .select(`
        *,
        program_applications(count),
        program_enrollments(count)
      `),
    
    supabase
      .from('business_registrations')
      .select('created_at, business_category, status')
      .gte('created_at', startDate.toISOString()),
    
    supabase
      .from('program_enrollments')
      .select('enrolled_at')
      .gte('enrolled_at', startDate.toISOString())
  ]);
        profiles!program_enrollments_participant_id_fkey(
          id,
          full_name
        )
  return {
    users: usersData.data || [],
    programs: programsData.data || [],
    registrations: registrationsData.data || [],
    enrollments: enrollmentsData.data || []
  };
};

// Notification Queries
export const getAdminNotifications = async (userId: string) => {
  // Get pending items that need admin attention
  const [
    pendingRegistrations,
    pendingApplications,
    systemAlerts
  ] = await Promise.all([
    supabase
      .from('business_registrations')
      .select('id, business_name, created_at')
      .eq('status', 'pending')
      .order('created_at', { ascending: true }),
    
    supabase
      .from('program_applications')
      .select(`
        id, submitted_at,
        programs(name),
        profiles!program_applications_applicant_id_fkey(
          id,
          full_name
        )
      `)
      .eq('status', 'submitted')
      .order('submitted_at', { ascending: true }),
    
    // Mock system alerts - in production, these would come from a monitoring system
    Promise.resolve({ data: [] })
  ]);

  const notifications = [
    ...(pendingRegistrations.data || []).map(reg => ({
      id: `reg-${reg.id}`,
      type: 'registration',
      title: 'Business registration pending review',
      message: `${reg.business_name} is waiting for approval`,
      timestamp: reg.created_at,
      priority: 'medium',
      read: false
    })),
    ...(pendingApplications.data || []).map(app => ({
      id: `app-${app.id}`,
      type: 'application',
      title: 'Program application pending review',
      message: `${app.profiles?.full_name} applied to ${app.programs?.name}`,
      timestamp: app.submitted_at,
      priority: 'high',
      read: false
    }))
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return notifications;
};

// Audit Log Queries
export const logAdminAction = async (
  adminId: string,
  action: string,
  targetType: string,
  targetId: string,
  details?: any
) => {
  // In production, implement audit logging
  console.log('Admin Action:', {
    adminId,
    action,
    targetType,
    targetId,
    details,
    timestamp: new Date().toISOString()
  });
};

// Export Functions
export const exportUsersToCSV = async (filters?: any) => {
  const users = await getUsersWithDetails(filters);
  
  const csvContent = [
    ['Name', 'Email', 'Mobile', 'Business', 'Category', 'Location', 'Roles', 'Joined', 'Status'],
    ...users.map(user => [
      user.full_name,
      user.email || '',
      user.mobile_number || '',
      user.businesses?.[0]?.business_name || '',
      user.businesses?.[0]?.business_category || '',
      user.businesses?.[0]?.business_location || '',
      user.user_roles?.map((r: any) => r.role).join(', ') || '',
      new Date(user.created_at).toLocaleDateString(),
      'Active' // Derive from auth status
    ])
  ].map(row => row.join(',')).join('\n');

  return csvContent;
};

export const exportProgramsToCSV = async () => {
  const programs = await getProgramsWithStats();
  
  const csvContent = [
    ['Name', 'Description', 'Status', 'Applications', 'Enrollments', 'Start Date', 'End Date', 'Created'],
    ...programs.map(program => [
      program.name,
      program.description || '',
      program.status,
      program.program_applications?.[0]?.count || 0,
      program.program_enrollments?.[0]?.count || 0,
      program.start_date || '',
      program.end_date || '',
      new Date(program.created_at).toLocaleDateString()
    ])
  ].map(row => row.join(',')).join('\n');

  return csvContent;
};