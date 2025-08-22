import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface AdminStats {
  totalUsers: number;
  activePrograms: number;
  pendingRegistrations: number;
  totalRevenue: number;
  userGrowth: number;
  programGrowth: number;
  registrationGrowth: number;
  revenueGrowth: number;
}

export interface RecentActivity {
  id: string;
  type: 'registration' | 'application' | 'enrollment' | 'user';
  title: string;
  description: string;
  timestamp: string;
  status: string;
  userId?: string;
  programId?: string;
}

export const useAdminData = () => {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activePrograms: 0,
    pendingRegistrations: 0,
    totalRevenue: 0,
    userGrowth: 0,
    programGrowth: 0,
    registrationGrowth: 0,
    revenueGrowth: 0
  });
  
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = async () => {
    try {
      setError(null);
      
      // Load basic counts
      const [
        usersResult,
        programsResult,
        registrationsResult,
        enrollmentsResult
      ] = await Promise.all([
        supabase.from('profiles').select('id, created_at'),
        supabase.from('programs').select('id, status, created_at'),
        supabase.from('business_registrations').select('id, status, created_at'),
        supabase.from('program_enrollments').select('id, enrolled_at')
      ]);

      // Calculate basic stats
      const totalUsers = usersResult.data?.length || 0;
      const activePrograms = programsResult.data?.filter(p => p.status === 'active').length || 0;
      const pendingRegistrations = registrationsResult.data?.filter(r => r.status === 'pending').length || 0;

      // Calculate growth rates (last 30 days vs previous 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

      const calculateGrowthRate = (data: any[], dateField: string) => {
        const recent = data?.filter(item => new Date(item[dateField]) > thirtyDaysAgo).length || 0;
        const previous = data?.filter(item => {
          const date = new Date(item[dateField]);
          return date > sixtyDaysAgo && date <= thirtyDaysAgo;
        }).length || 0;
        
        return previous > 0 ? ((recent - previous) / previous * 100) : 0;
      };

      const userGrowth = calculateGrowthRate(usersResult.data || [], 'created_at');
      const programGrowth = calculateGrowthRate(programsResult.data || [], 'created_at');
      const registrationGrowth = calculateGrowthRate(registrationsResult.data || [], 'created_at');

      setStats({
        totalUsers,
        activePrograms,
        pendingRegistrations,
        totalRevenue: 2400000, // Mock data - replace with actual revenue tracking
        userGrowth: Math.round(userGrowth * 10) / 10,
        programGrowth: Math.round(programGrowth * 10) / 10,
        registrationGrowth: Math.round(registrationGrowth * 10) / 10,
        revenueGrowth: 15.2 // Mock data
      });

    } catch (err) {
      console.error('Error loading admin stats:', err);
      setError('Failed to load dashboard statistics');
    }
  };

  const loadRecentActivity = async () => {
    try {
      // Load recent registrations
      const { data: registrations } = await supabase
        .from('business_registrations')
        .select('id, business_name, full_name, status, created_at')
        .order('created_at', { ascending: false })
        .limit(10);

      // Load recent applications
      const { data: applications } = await supabase
        .from('program_applications')
        .select(`
          id, status, submitted_at,
          programs(name),
          profiles(full_name)
        `)
        .order('submitted_at', { ascending: false })
        .limit(10);

      // Load recent enrollments
      const { data: enrollments } = await supabase
        .from('program_enrollments')
        .select(`
          id, 
          enrolled_at,
          programs(name),
          profiles!program_enrollments_participant_id_fkey(full_name)
        `)
        .order('enrolled_at', { ascending: false })
        .limit(10);

      // Combine and sort all activities
      const activities: RecentActivity[] = [
        ...(registrations || []).map(reg => ({
          id: `reg-${reg.id}`,
          type: 'registration' as const,
          title: 'New business registration',
          description: `${reg.business_name} by ${reg.full_name}`,
          timestamp: reg.created_at,
          status: reg.status
        })),
        ...(applications || []).map(app => ({
          id: `app-${app.id}`,
          type: 'application' as const,
          title: 'Program application',
          description: `${app.profiles?.full_name} applied to ${app.programs?.name}`,
          timestamp: app.submitted_at,
          status: app.status
        })),
        ...(enrollments || []).map(enr => ({
          id: `enr-${enr.id}`,
          type: 'enrollment' as const,
          title: 'Program enrollment',
          description: `${enr.profiles?.full_name} enrolled in ${enr.programs?.name}`,
          timestamp: enr.enrolled_at,
          status: 'active'
        }))
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 15);

      setRecentActivity(activities);
    } catch (err) {
      console.error('Error loading recent activity:', err);
    }
  };

  const refreshData = async () => {
    setLoading(true);
    await Promise.all([loadStats(), loadRecentActivity()]);
    setLoading(false);
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Set up real-time subscriptions
  useEffect(() => {
    const subscriptions = [
      supabase
        .channel('admin_registrations')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'business_registrations'
        }, () => refreshData())
        .subscribe(),
      
      supabase
        .channel('admin_applications')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'program_applications'
        }, () => refreshData())
        .subscribe(),
      
      supabase
        .channel('admin_users')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'profiles'
        }, () => refreshData())
        .subscribe()
    ];

    return () => {
      subscriptions.forEach(sub => sub.unsubscribe());
    };
  }, []);

  return {
    stats,
    recentActivity,
    loading,
    error,
    refreshData
  };
};