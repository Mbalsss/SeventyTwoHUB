import React from 'react';
import { Clock, TrendingUp, Upload, MessageSquare, Target } from 'lucide-react';

const RecentActivity: React.FC = () => {
  const activities = [
    {
      type: 'upload',
      title: 'Financial data uploaded',
      description: 'Q4 2024 revenue and expenses',
      time: '2 hours ago',
      icon: Upload,
      color: 'text-blue-600',
    },
    {
      type: 'ai',
      title: 'AI analysis completed',
      description: 'Growth recommendations generated',
      time: '4 hours ago',
      icon: MessageSquare,
      color: 'text-green-600',
    },
    {
      type: 'goal',
      title: 'Goal milestone reached',
      description: 'Monthly revenue target achieved',
      time: '1 day ago',
      icon: Target,
      color: 'text-purple-600',
    },
    {
      type: 'trend',
      title: 'Performance improvement',
      description: 'Customer retention up by 15%',
      time: '2 days ago',
      icon: TrendingUp,
      color: 'text-orange-600',
    },
  ];

  return (
    <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
      
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div key={index} className="flex items-start space-x-3 p-2 sm:p-3 rounded-lg hover:bg-gray-50 transition-colors">
            <div className={`p-1.5 sm:p-2 rounded-lg bg-gray-100 ${activity.color}`}>
              <activity.icon className="w-3 h-3 sm:w-4 sm:h-4" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-gray-900 mb-1 text-sm">{activity.title}</h4>
              <p className="text-xs sm:text-sm text-gray-600 mb-2">{activity.description}</p>
              <div className="flex items-center text-xs text-gray-500">
                <Clock className="w-3 h-3 mr-1 flex-shrink-0" />
                {activity.time}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <button className="w-full mt-4 py-2 text-xs sm:text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors">
        View all activity
      </button>
    </div>
  );
};

export default RecentActivity;