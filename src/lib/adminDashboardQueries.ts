import { supabase } from './supabase';

// Types used by Admin Dashboard UI
export type DashboardStats = {
  totalUsers: number;
  activePrograms: number;
  pendingRegistrations: number;
  userGrowth: number; // percentage
  programGrowth: number; // placeholder until real logic is defined
  registrationGrowth: number; // placeholder until real logic is defined
};

export type ActivityItem = {
  id: string;
  type: 'registration' | 'application';
  title: string;
  description: string;
  timestamp: string;
  status?: string;
};

export type NotificationItem = {
  id: string;
  type: 'registration' | 'application';
  title: string;
  message: string;
  timestamp: string;
  priority: 'low' | 'medium' | 'high';
};

// DB row types (minimal fields used by the dashboard)
type ProfileRow = { id: string; created_at: string };
type ProgramRow = { id: string; status: string; created_at: string };
type RegistrationRow = { id: string; business_name: string; full_name?: string; status: string; created_at: string };
type ApplicationRow = { id: string; status: string; submitted_at: string; programs?: { name?: string } | null; profiles?: { full_name?: string } | null };

// Fetch and compute high-level dashboard statistics
export const getDashboardStats = async (): Promise<DashboardStats> => {
  const [usersResult, programsResult, registrationsResult] = await Promise.all([
    supabase.from('profiles').select('id, created_at'),
    supabase.from('programs').select('id, status, created_at'),
    supabase.from('business_registrations').select('id, status, created_at'),
  ]);

  const users = (usersResult.data || []) as ProfileRow[];
  const programs = (programsResult.data || []) as ProgramRow[];
  const registrations = (registrationsResult.data || []) as RegistrationRow[];

  const totalUsers = users.length;
  const activePrograms = programs.filter((p) => p.status === 'active').length;
  const pendingRegistrations = registrations.filter((r) => r.status === 'pending').length;

  // Calculate growth rates (last 30 days vs previous 30 days) based on users
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

  const recentUsers = users.filter((u) => new Date(u.created_at) > thirtyDaysAgo).length;
  const previousUsers = users.filter((u) => {
    const date = new Date(u.created_at);
    return date > sixtyDaysAgo && date <= thirtyDaysAgo;
  }).length;

  // Restored: More robust user growth calculation
  const userGrowth = previousUsers > 0
    ? ((recentUsers - previousUsers) / previousUsers * 100)
    : (recentUsers > 0 ? 100 : 0);

  return {
    totalUsers,
    activePrograms,
    pendingRegistrations,
    userGrowth: Math.round(userGrowth * 10) / 10,
    programGrowth: 12.5,
    registrationGrowth: 8.3,
  };
};

// Fetch recent activity items for dashboard
export const getRecentActivity = async (): Promise<ActivityItem[]> => {
  // Recent registrations
  const { data: registrations } = await supabase
    .from('business_registrations')
    .select('id, business_name, full_name, status, created_at')
    .order('created_at', { ascending: false })
    .limit(5);

  // Recent applications
  const { data: applications } = await supabase
    .from('program_applications')
    .select(`
      id, status, submitted_at,
      programs(name),
      profiles!program_applications_applicant_id_fkey(full_name)
    `)
    .order('submitted_at', { ascending: false })
    .limit(5);

  const regRows = (registrations || []) as RegistrationRow[];
  const appRows = (applications || []) as ApplicationRow[];

  return [
    ...regRows.map((reg) => ({
      id: `reg-${reg.id}`,
      type: 'registration' as const,
      title: 'New business registration',
      description: `${reg.business_name} by ${reg.full_name}`,
      timestamp: reg.created_at,
      status: reg.status,
    })),
    ...appRows.map((app) => ({
      id: `app-${app.id}`,
      type: 'application' as const,
      title: 'Program application',
      description: `${app.profiles?.full_name} applied to ${app.programs?.name}`,
      timestamp: app.submitted_at,
      status: app.status,
    })),
  ]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10);
};

// Fetch notifications for pending items
export const getDashboardNotifications = async (): Promise<NotificationItem[]> => {
  const { data: pendingRegistrations } = await supabase
    .from('business_registrations')
    .select('id, business_name, created_at')
    .eq('status', 'pending')
    .order('created_at', { ascending: true });

  const { data: pendingApplications } = await supabase
    .from('program_applications')
    .select(`
      id, status, submitted_at,
      programs(name),
      profiles!program_applications_applicant_id_fkey(full_name)
    `)
    .eq('status', 'submitted')
    .order('submitted_at', { ascending: true });

  const regRows = (pendingRegistrations || []) as Array<Pick<RegistrationRow, 'id' | 'business_name' | 'created_at'>>;
  const appRows = (pendingApplications || []) as ApplicationRow[];

  return [
    ...regRows.map((reg) => ({
      id: `reg-${reg.id}`,
      type: 'registration' as const,
      title: 'Business registration pending review',
      message: `${reg.business_name} is waiting for approval`,
      timestamp: reg.created_at,
      priority: 'medium' as const,
    })),
    ...appRows.map((app) => ({
      id: `app-${app.id}`,
      type: 'application' as const,
      title: 'Program application pending review',
      message: `${app.profiles?.full_name} applied to ${app.programs?.name}`,
      timestamp: app.submitted_at,
      priority: 'high' as const,
    })),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

// Setup realtime subscriptions for admin dashboard
export const setupAdminRealtime = (onChange: () => void) => {
  const registrationsChannel = supabase
    .channel('admin_registrations')
    .on('postgres_changes', {
      event: '*', // Listen for INSERT, UPDATE, DELETE
      schema: 'public',
      table: 'business_registrations',
    }, onChange)
    .subscribe();

  const applicationsChannel = supabase
    .channel('admin_applications')
    .on('postgres_changes', {
      event: '*', // Listen for INSERT, UPDATE, DELETE
      schema: 'public',
      table: 'program_applications',
    }, onChange)
    .subscribe();

  // Add subscription for new users to update stats in real-time
  const profilesChannel = supabase
    .channel('admin_profiles')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
        table: 'profiles'
    }, onChange)
    .subscribe();

  // Return a cleanup function to unsubscribe from all channels
  return () => {
    supabase.removeChannel(registrationsChannel);
    supabase.removeChannel(applicationsChannel);
    supabase.removeChannel(profilesChannel);
  };
};