import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Map, BookOpen, BarChart3, GraduationCap, Wrench } from 'lucide-react';

const QuickActions: React.FC = () => {
  const navigate = useNavigate();

  const actions = [
    {
      title: 'Learning Modules',
      description: 'Build essential business skills',
      icon: GraduationCap,
      action: () => navigate('/learning'),
      color: 'bg-blue-50 text-blue-600 hover:bg-blue-100',
    },
    {
      title: 'Marketplace',
      description: 'List and promote your products',
      icon: Upload,
      action: () => navigate('/dashboard/marketplace'),
      color: 'bg-green-50 text-green-600 hover:bg-green-100',
    },
    {
      title: 'Find Mentor',
      description: 'Connect with experienced mentors',
      icon: Map,
      action: () => navigate('/dashboard/mentorship'),
      color: 'bg-purple-50 text-purple-600 hover:bg-purple-100',
    },
    {
      title: 'Performance',
      description: 'Track your business metrics',
      icon: BarChart3,
      action: () => navigate('/dashboard/analytics'),
      color: 'bg-orange-50 text-orange-600 hover:bg-orange-100',
    },
  ];

  const secondaryActions = [
    {
      title: 'Business Toolkit',
      description: 'Templates and tools',
      icon: Wrench,
      action: () => navigate('/dashboard/toolkit'),
      color: 'bg-purple-50 text-purple-600 hover:bg-purple-100',
    },
    {
      title: 'Community',
      description: 'Connect with peers',
      icon: BookOpen,
      action: () => navigate('/dashboard/community'),
      color: 'bg-gray-50 text-gray-600 hover:bg-gray-100',
    },
  ];

  return (
    <div className="bg-surface-light rounded-xl p-4 sm:p-6 shadow-sm border border-primary-300">
      <h3 className="text-base sm:text-lg font-bold text-text-dark mb-4">Quick Actions</h3>
      
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        {actions.map((action, index) => (
          <button
            key={`quick-action-${index}-${action.title.replace(/\s+/g, '-').toLowerCase()}`}
            onClick={action.action}
            className="p-2 sm:p-3 rounded-lg border border-primary-300 hover:border-primary-500 transition-all text-left group bg-surface-light"
          >
            <div className={`inline-flex p-1.5 sm:p-2 rounded-lg ${action.color} mb-2 transition-colors`}>
              <action.icon className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <h4 className="font-semibold text-text-dark mb-1 group-hover:text-primary-500 transition-colors text-xs sm:text-sm">
              {action.title}
            </h4>
            <p className="text-xs text-text-muted line-clamp-2">{action.description}</p>
          </button>
        ))}
      </div>
      
      <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-primary-300">
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          {secondaryActions.map((action, index) => (
            <button
              key={`secondary-action-${index}-${action.title.replace(/\s+/g, '-').toLowerCase()}`}
              onClick={action.action}
              className="p-2 sm:p-3 rounded-lg border border-primary-300 hover:border-primary-500 transition-all text-left group bg-surface-light"
            >
              <div className={`inline-flex p-1.5 sm:p-2 rounded-lg ${action.color} mb-2 transition-colors`}>
                <action.icon className="w-3 h-3 sm:w-4 sm:h-4" />
              </div>
              <h4 className="font-semibold text-text-dark text-xs sm:text-sm group-hover:text-primary-500 transition-colors">
                {action.title}
              </h4>
              <p className="text-xs text-text-muted line-clamp-1">{action.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuickActions;