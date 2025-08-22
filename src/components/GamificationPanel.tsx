import React from 'react';
import { Award, Star, Trophy, Zap, Target, TrendingUp } from 'lucide-react';

const GamificationPanel: React.FC = () => {
  const userStats = {
    level: 7,
    xp: 2450,
    xpToNext: 3000,
    streak: 12,
    badges: 8,
    rank: 'Bronze Entrepreneur'
  };

  const recentBadges = [
    { name: 'First Sale', icon: Trophy, color: 'text-yellow-500', earned: true },
    { name: 'Social Media Pro', icon: Star, color: 'text-blue-500', earned: true },
    { name: 'Finance Guru', icon: TrendingUp, color: 'text-green-500', earned: false },
    { name: 'Community Helper', icon: Award, color: 'text-purple-500', earned: true },
  ];

  const weeklyGoals = [
    { task: 'Complete 3 learning modules', progress: 2, total: 3, xp: 150 },
    { task: 'Post 5 products to marketplace', progress: 3, total: 5, xp: 100 },
    { task: 'Help 2 community members', progress: 1, total: 2, xp: 75 },
  ];

  return (
    <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-4 sm:p-6 text-white">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">Level {userStats.level} - {userStats.rank}</h3>
          <div className="flex items-center space-x-4 mt-2">
            <div className="flex items-center space-x-1">
              <Zap className="w-4 h-4" />
              <span className="text-sm">{userStats.streak} day streak</span>
            </div>
            <div className="flex items-center space-x-1">
              <Award className="w-4 h-4" />
              <span className="text-sm">{userStats.badges} badges</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold">{userStats.xp} XP</div>
          <div className="text-sm opacity-80">{userStats.xpToNext - userStats.xp} to next level</div>
        </div>
      </div>

      {/* XP Progress Bar */}
      <div className="mb-4">
        <div className="w-full bg-white bg-opacity-20 rounded-full h-3">
          <div 
            className="bg-white h-3 rounded-full transition-all duration-300"
            style={{ width: `${(userStats.xp / userStats.xpToNext) * 100}%` }}
          />
        </div>
      </div>

      {/* Recent Badges */}
      <div className="mb-4">
        <h4 className="font-medium mb-2">Recent Achievements</h4>
        <div className="flex space-x-2 overflow-x-auto">
          {recentBadges.map((badge, index) => (
            <div 
              key={index} 
              className={`flex-shrink-0 p-2 rounded-lg ${
                badge.earned ? 'bg-white bg-opacity-20' : 'bg-white bg-opacity-10'
              }`}
            >
              <badge.icon className={`w-5 h-5 ${badge.earned ? badge.color : 'text-gray-400'}`} />
              <div className="text-xs mt-1 text-center">{badge.name}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Goals */}
      <div>
        <h4 className="font-medium mb-2">Weekly Goals</h4>
        <div className="space-y-2">
          {weeklyGoals.map((goal, index) => (
            <div key={index} className="bg-white bg-opacity-10 rounded-lg p-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm">{goal.task}</span>
                <span className="text-xs">+{goal.xp} XP</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-white bg-opacity-20 rounded-full h-2">
                  <div 
                    className="bg-white h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(goal.progress / goal.total) * 100}%` }}
                  />
                </div>
                <span className="text-xs">{goal.progress}/{goal.total}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GamificationPanel;