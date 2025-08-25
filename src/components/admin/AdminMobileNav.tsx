import React from 'react';
import { BarChart3, Users, FileText, Shield, Settings, Bell } from 'lucide-react';

interface AdminMobileNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  notificationCount: number;
}

const AdminMobileNav: React.FC<AdminMobileNavProps> = ({ 
  activeTab, 
  onTabChange, 
  notificationCount 
}) => {
  const navItems = [
    { id: 'overview', icon: BarChart3, label: 'Overview' },
    { id: 'users', icon: Users, label: 'Users' },
    { id: 'programs', icon: FileText, label: 'Programs' },
    { id: 'registrations', icon: Shield, label: 'Reviews' },
    { id: 'settings', icon: Settings, label: 'Settings' }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 md:hidden">
      <div className="flex justify-around py-2">
        {navItems.map((item) => (
          <button
            key={`mobile-nav-${item.id}`}
            onClick={() => onTabChange(item.id)}
            className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors relative ${
              activeTab === item.id
                ? 'text-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <item.icon className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">{item.label}</span>
            
            {item.id === 'registrations' && notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {notificationCount > 9 ? '9+' : notificationCount}
              </span>
            )}
          </button>
        ))}
      </div>
    </nav>
  );
};

export default AdminMobileNav;