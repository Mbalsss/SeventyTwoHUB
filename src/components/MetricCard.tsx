import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: LucideIcon;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, trend, icon: Icon }) => {
  return (
    <div className="bg-surface-light rounded-xl p-3 sm:p-4 shadow-sm border border-primary-300 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <div className="p-1.5 sm:p-2 bg-background-secondary rounded-lg">
          <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary-500" />
        </div>
        <div className={`flex items-center space-x-1 text-xs sm:text-sm ${
          trend === 'up' ? 'text-green-600' : 'text-red-600'
        }`}>
          {trend === 'up' ? (
            <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
          ) : (
            <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4" />
          )}
          <span className="font-medium">{change}</span>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg sm:text-xl font-bold text-text-dark mb-1">{value}</h3>
        <p className="text-text-muted text-xs sm:text-sm">{title}</p>
      </div>
    </div>
  );
};

export default MetricCard;