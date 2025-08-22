import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Shield, LogOut, Settings, Users, FileText, BarChart3, Home, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AdminMobileNav from '../components/admin/AdminMobileNav';

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
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
    { path: '/admin/dashboard', icon: BarChart3, label: 'Dashboard' },
    { path: '/admin/programs', icon: FileText, label: 'Programs' },
    { path: '/admin/users', icon: Users, label: 'Users' },
    { path: '/admin/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      {/* Admin Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Shield className="w-6 h-6 text-primary-500" />
                <span className="text-xl font-bold text-gray-900">BizBoost Admin</span>
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
        <nav className="hidden md:block w-64 bg-white shadow-sm h-screen sticky top-16">
          <div className="p-4">
            <ul className="space-y-2">
              {adminNavItems.map(item => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <li key={item.path}>
                    <button
                      onClick={() => navigate(item.path)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-primary-50 text-primary-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
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