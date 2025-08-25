import React, { useState, useEffect } from 'react';
import { 
  Users, 
  TrendingUp,
  Activity, 
  FileText, 
  BarChart3,
  Shield,
  AlertCircle,
  CheckCircle,
  Clock,
  RefreshCw
} from 'lucide-react';
import { getDashboardStats, getRecentActivity as fetchRecentActivity, getDashboardNotifications as fetchDashboardNotifications, setupAdminRealtime, } from '../../lib/adminDashboardQueries';
import type {ActivityItem, NotificationItem} from '../../lib/adminDashboardQueries';
import UserManagement from '../../components/admin/UserManagement';
import ProgramManagement from '../../components/admin/ProgramManagement';
import BusinessRegistrationReview from '../../components/admin/BusinessRegistrationReview';
import AdminAnalytics from '../../components/admin/AdminAnalytics';
import AdminSettings from '../../components/admin/AdminSettings';
import NotificationCenter from  '../../components/admin/NotificationCenter';
// Restored: Import for the AdminUserManagement component
import AdminUserManagement from '../../components/admin/AdminUserManagement';


const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Listen for tab changes from AdminLayout
  useEffect(() => {
    const handleTabChange = (event: CustomEvent) => {
      setActiveTab(event.detail.tab);
    };

    window.addEventListener('adminTabChange', handleTabChange as EventListener);
    return () => window.removeEventListener('adminTabChange', handleTabChange as EventListener);
  }, []);

  // Expose setActiveTab to parent layout
  useEffect(() => {
    (window as unknown as { setAdminTab?: (tab: string) => void }).setAdminTab = setActiveTab;
    return () => {
      delete (window as unknown as { setAdminTab?: (tab: string) => void }).setAdminTab;
    };
  }, []);

  const [dashboardStats, setDashboardStats] = useState({
    totalUsers: 0,
    activePrograms: 0,
    pendingRegistrations: 0,
    userGrowth: 0,
    programGrowth: 0,
    registrationGrowth: 0
  });
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
    // Setup subscriptions and store the cleanup function
    const cleanup = setupRealtimeSubscriptions();
    // Return the cleanup function to be called on unmount
    return cleanup;
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Dashboard statistics
      const stats = await getDashboardStats();
      setDashboardStats(stats);

      // Recent activity
      const activities = await fetchRecentActivity();
      setRecentActivity(activities);

      // Notifications
      const notifs = await fetchDashboardNotifications();
      setNotifications(notifs);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };



  const setupRealtimeSubscriptions = () => {
    const cleanup = setupAdminRealtime(() => {
      loadDashboardData();
    });
    return cleanup;
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'users', name: 'Users', icon: Users },
    // Restored: "Admins" tab for managing admin users
    { id: 'admin-users', name: 'Admins', icon: Shield },
    { id: 'programs', name: 'Programs', icon: FileText },
    { id: 'registrations', name: 'Registrations', icon: Shield },
    { id: 'analytics', name: 'Analytics', icon: TrendingUp },
    { id: 'settings', name: 'Settings', icon: Activity }
  ];

  const statCards = [
    {
      title: 'Total Users',
      value: dashboardStats.totalUsers.toLocaleString(),
      change: `${dashboardStats.userGrowth >= 0 ? '+' : ''}${dashboardStats.userGrowth}%`,
      trend: dashboardStats.userGrowth >= 0 ? 'up' : 'down',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Active Programs',
      value: dashboardStats.activePrograms.toString(),
      change: `+${dashboardStats.programGrowth}%`,
      trend: 'up',
      icon: FileText,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Pending Reviews',
      value: dashboardStats.pendingRegistrations.toString(),
      change: `+${dashboardStats.registrationGrowth}%`,
      trend: 'up',
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Centralized management for BizBoost Hub platform</p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          <button
            onClick={loadDashboardData}
            className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            title="Refresh data"
          >
            <RefreshCw className="w-4 h-4 text-gray-600" />
          </button>
          <NotificationCenter notifications={notifications} />
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-1 px-4 overflow-x-auto">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-3 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {statCards.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div key={stat.title} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                          <Icon className={`w-5 h-5 ${stat.color}`} />
                        </div>
                            <span className={`text-sm font-medium ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>{stat.change}</span>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                      <p className="text-gray-600 text-sm">{stat.title}</p>
                    </div>
                  );
                })}
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pending Actions */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Pending Actions</h3>
                    <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                      {notifications.length} items
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    {notifications.slice(0, 5).map(notification => (
                      <div key={notification.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className={`p-1 rounded-full ${
                          notification.priority === 'high' ? 'bg-red-100' : 'bg-yellow-100'
                        }`}>
                          <AlertCircle className={`w-4 h-4 ${
                            notification.priority === 'high' ? 'text-red-600' : 'text-yellow-600'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 text-sm">{notification.title}</h4>
                          <p className="text-gray-600 text-xs">{notification.message}</p>
                          <p className="text-gray-500 text-xs mt-1">
                            {new Date(notification.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                    
                    {notifications.length === 0 && (
                      <div className="text-center py-4">
                        <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                        <p className="text-gray-600 text-sm">All caught up!</p>
                      </div>
                    )}
                  </div>
                  
                  {notifications.length > 5 && (
                    <button className="w-full mt-4 py-2 text-primary-600 hover:text-primary-700 text-sm font-medium">
                      View all {notifications.length} notifications
                    </button>
                  )}
                </div>

                {/* Recent Activity */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                  
                  <div className="space-y-3">
                    {recentActivity.slice(0, 5).map(activity => (
                      <div key={`activity-${activity.id}`} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className={`p-1 rounded-full ${
                          activity.type === 'registration' ? 'bg-blue-100' : 'bg-green-100'
                        }`}>
                          {activity.type === 'registration' ? (
                            <Shield className="w-4 h-4 text-blue-600" />
                          ) : (
                            <FileText className="w-4 h-4 text-green-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 text-sm">{activity.title}</h4>
                          <p className="text-gray-600 text-xs">{activity.description}</p>
                          <p className="text-gray-500 text-xs mt-1">
                            {new Date(activity.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          activity.status === 'approved' ? 'bg-green-100 text-green-800' :
                          activity.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {activity.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && <UserManagement />}
          {/* Restored: Conditional render for the AdminUserManagement component */}
          {activeTab === 'admin-users' && <AdminUserManagement />}
          {activeTab === 'programs' && <ProgramManagement />}
          {activeTab === 'registrations' && <BusinessRegistrationReview />}
          {activeTab === 'analytics' && <AdminAnalytics />}
          {activeTab === 'settings' && <AdminSettings />}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;