import React, { useState } from 'react';
import { Play, Clock, Star, Award, BookOpen, CheckCircle, Lock } from 'lucide-react';

const LearningModules: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [completedModules] = useState(['1', '3']);

  const categories = [
    { id: 'all', name: 'All Modules' },
    { id: 'business-plan', name: 'Business Planning' },
    { id: 'marketing', name: 'Marketing & Sales' },
    { id: 'finance', name: 'Financial Management' },
    { id: 'operations', name: 'Operations' },
    { id: 'leadership', name: 'Leadership' }
  ];

  const modules = [
    {
      id: '1',
      title: 'How to Create a Winning Business Plan',
      description: 'Learn to craft a comprehensive business plan that attracts investors and guides your growth.',
      category: 'business-plan',
      duration: '45 min',
      lessons: 8,
      difficulty: 'Beginner',
      rating: 4.8,
      students: 2340,
      isPremium: false,
      progress: 100,
      thumbnail: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: '2',
      title: 'Mastering Social Media Advertising',
      description: 'Advanced strategies for Facebook, Instagram, and LinkedIn advertising that drive real results.',
      category: 'marketing',
      duration: '1h 20min',
      lessons: 12,
      difficulty: 'Intermediate',
      rating: 4.9,
      students: 1890,
      isPremium: true,
      progress: 0,
      thumbnail: 'https://images.pexels.com/photos/267389/pexels-photo-267389.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: '3',
      title: 'Financial Planning for Small Business',
      description: 'Master budgeting, cash flow management, and financial forecasting for sustainable growth.',
      category: 'finance',
      duration: '55 min',
      lessons: 10,
      difficulty: 'Beginner',
      rating: 4.7,
      students: 3120,
      isPremium: false,
      progress: 100,
      thumbnail: 'https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: '4',
      title: 'Scaling Your Business Without Burning Out',
      description: 'Learn sustainable scaling strategies and build systems that work without your constant involvement.',
      category: 'operations',
      duration: '1h 10min',
      lessons: 9,
      difficulty: 'Advanced',
      rating: 4.9,
      students: 1560,
      isPremium: true,
      progress: 25,
      thumbnail: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: '5',
      title: 'Leadership Skills for Entrepreneurs',
      description: 'Develop essential leadership skills to inspire your team and drive business success.',
      category: 'leadership',
      duration: '50 min',
      lessons: 7,
      difficulty: 'Intermediate',
      rating: 4.6,
      students: 2100,
      isPremium: false,
      progress: 0,
      thumbnail: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: '6',
      title: 'Digital Marketing Fundamentals',
      description: 'Complete guide to SEO, content marketing, email campaigns, and analytics.',
      category: 'marketing',
      duration: '2h 15min',
      lessons: 15,
      difficulty: 'Beginner',
      rating: 4.8,
      students: 4200,
      isPremium: false,
      progress: 60,
      thumbnail: 'https://images.pexels.com/photos/265087/pexels-photo-265087.jpeg?auto=compress&cs=tinysrgb&w=400'
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredModules = modules.filter(module => 
    selectedCategory === 'all' || module.category === selectedCategory
  );

  const totalProgress = Math.round(
    (modules.reduce((sum, module) => sum + module.progress, 0) / modules.length)
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Interactive Learning Modules</h1>
        <p className="text-gray-600">Master essential business skills with our bite-sized, interactive courses</p>
      </div>

      {/* Progress Overview */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Your Learning Progress</h3>
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-yellow-500" />
            <span className="text-sm font-medium text-gray-700">
              {completedModules.length} modules completed
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex-1 bg-gray-200 rounded-full h-3">
            <div 
              className="bg-primary-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${totalProgress}%` }}
            />
          </div>
          <span className="text-sm font-medium text-gray-700">{totalProgress}%</span>
        </div>
      </div>

      {/* Category Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === category.id
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Learning Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredModules.map(module => (
          <div key={module.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
            <div className="relative">
              <img 
                src={module.thumbnail} 
                alt={module.title}
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-4 right-4">
                {module.isPremium ? (
                  <span className="px-2 py-1 bg-yellow-500 text-white text-xs rounded-full font-medium">
                    Premium
                  </span>
                ) : (
                  <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full font-medium">
                    Free
                  </span>
                )}
              </div>
              
              {completedModules.includes(module.id) && (
                <div className="absolute top-4 left-4">
                  <div className="p-1 bg-green-500 rounded-full">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                </div>
              )}

              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <button className="p-3 bg-white rounded-full hover:bg-gray-100 transition-colors">
                  {module.isPremium && module.progress === 0 ? (
                    <Lock className="w-6 h-6 text-gray-600" />
                  ) : (
                    <Play className="w-6 h-6 text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className={`px-2 py-1 text-xs rounded-full ${getDifficultyColor(module.difficulty)}`}>
                  {module.difficulty}
                </span>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="text-sm text-gray-600">{module.rating}</span>
                </div>
              </div>

              <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{module.title}</h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{module.description}</p>

              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{module.duration}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <BookOpen className="w-4 h-4" />
                    <span>{module.lessons} lessons</span>
                  </div>
                </div>
                <span>{module.students.toLocaleString()} students</span>
              </div>

              {module.progress > 0 && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600">Progress</span>
                    <span className="text-xs text-gray-600">{module.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${module.progress}%` }}
                    />
                  </div>
                </div>
              )}

              <button className="w-full py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center justify-center space-x-2">
                {module.progress === 0 ? (
                  <>
                    <Play className="w-4 h-4" />
                    <span>Start Learning</span>
                  </>
                ) : module.progress === 100 ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Review</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>Continue</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LearningModules;