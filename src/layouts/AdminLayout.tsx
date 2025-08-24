import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  Shield, 
  LogOut, 
  Settings, 
  Users, 
  FileText, 
  BarChart3, 
  Home, 
  Bell,
  Database,
  Lock,
  Globe
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AdminMobileNav from '../components/admin/AdminMobileNav';

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut, user } = useAuth();
  const [activeTab, setActiveTab] = React.useState('overview');
  const [notificationCount] = React.useState(5); // Mock notification count

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error during logout:', error);
      navigate('/login');
    }
  };

  const adminNavItems = [
    { id: 'overview', path: '/admin/dashboard', icon: Home, label: 'Dashboard' },
    { id: 'users', path: '/admin/dashboard/users', icon: Users, label: 'Users' },
    { id: 'programs', path: '/admin/programs', icon: FileText, label: 'Programs' },
    { id: 'registrations', path: '/admin/dashboard/registrations', icon: Shield, label: 'Registrations' },
    { id: 'analytics', path: '/admin/dashboard/analytics', icon: BarChart3, label: 'Analytics' },
    { id: 'general', path: '/admin/dashboard/general', icon: Settings, label: 'General' },
    { id: 'security', path: '/admin/dashboard/security', icon: Lock, label: 'Security' },
    { id: 'notifications', path: '/admin/dashboard/notifications', icon: Bell, label: 'Notifications' },
    { id: 'integrations', path: '/admin/dashboard/integrations', icon: Database, label: 'Integrations' },
    { id: 'access-control', path: '/admin/dashboard/access-control', icon: Globe, label: 'Access Control' },
  ];

  const handleNavigation = (item: any) => {
    if (item.path === '/admin/programs') {
      navigate('/admin/programs');
    } else {
      navigate('/admin/dashboard');
      setActiveTab(item.id);
      // Notify AdminDashboard component about tab change
      if ((window as any).setAdminTab) {
        (window as any).setAdminTab(item.id);
      }
    }
  };

  // Update active tab based on current location
  React.useEffect(() => {
    if (location.pathname === '/admin/programs') {
      setActiveTab('programs');
    } else if (location.pathname === '/admin/dashboard') {
      // Keep current tab or default to overview
      if (!activeTab || activeTab === 'programs') {
        setActiveTab('overview');
      }
    }
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      {/* Admin Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Shield className="w-6 h-6 text-primary-500" />
                <span className="text-xl font-bold text-gray-900">SeventyTwo X Admin</span>
              </div>
              <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                Admin Panel
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Bell className="w-5 h-5 text-gray-600" />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {notificationCount}
                  </span>
                )}
              </div>
              <span className="text-sm text-gray-600">
                Welcome, {user?.email?.split('@')[0] || 'Admin'}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Admin Sidebar */}
        <nav className="hidden md:block w-64 bg-white shadow-sm h-screen sticky top-16 border-r border-gray-200">
          <div className="p-6">
            <ul className="space-y-2">
              {adminNavItems.map(item => {
                const Icon = item.icon;
                const isActive = (location.pathname === '/admin/programs' && item.id === 'programs') || 
                                (location.pathname === '/admin/dashboard' && activeTab === item.id);
                return (
                  <li key={item.path}>
                    <button
                      onClick={() => handleNavigation(item)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-left ${
                        isActive
                          ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-500'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium text-sm">{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>

      {/* Mobile Navigation */}
      <AdminMobileNav 
        activeTab={activeTab}
        onTabChange={setActiveTab}
        notificationCount={notificationCount}
      />
    </div>
  );
};

export default AdminLayout;