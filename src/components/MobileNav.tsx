import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, GraduationCap, ShoppingBag, MessageCircle, User, AppWindow } from 'lucide-react';

const MobileNav: React.FC = () => {
  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Home' },
    { path: '/dashboard/learning', icon: GraduationCap, label: 'Learn' },
    { path: '/dashboard/marketplace', icon: ShoppingBag, label: 'Market' },
    { path: '/dashboard/applications', icon: AppWindow, label: 'Apps' },
    { path: '/dashboard/mentorship', icon: MessageCircle, label: 'Mentor' },
    { path: '/dashboard/profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface-light border-t border-primary-300 z-40">
      <div className="flex justify-around py-2">
        {navItems.map((item, index) => (
          <NavLink
            key={`mobile-nav-${item.path}-${index}`}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                isActive
                  ? 'text-primary-500'
                  : 'text-text-dark hover:text-primary-500'
              }`
            }
          >
            <item.icon className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default MobileNav;