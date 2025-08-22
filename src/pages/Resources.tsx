import React, { useState } from 'react';
import { Search, BookOpen, Video, FileText, Download, Star, Clock } from 'lucide-react';

const Resources: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Resources' },
    { id: 'negotiation', name: 'Negotiation Skills' },
    { id: 'leadership', name: 'Leadership' },
    { id: 'finance', name: 'Financial Management' },
    { id: 'marketing', name: 'Marketing & Sales' },
    { id: 'personal', name: 'Personal Mastery' },
    { id: 'strategy', name: 'Business Strategy' },
  ];

  const resources = [
    {
      id: 1,
      title: 'The Art of Business Negotiation',
      description: 'Master the fundamentals of successful business negotiations with proven strategies and techniques.',
      type: 'guide',
      category: 'negotiation',
      duration: '45 min read',
      rating: 4.8,
      downloads: 1250,
      featured: true,
    },
    {
      id: 2,
      title: 'Financial Planning for Small Business',
      description: 'Complete guide to managing cash flow, budgeting, and financial forecasting for growing businesses.',
      type: 'ebook',
      category: 'finance',
      duration: '2 hour read',
      rating: 4.9,
      downloads: 2100,
      featured: true,
    },
    {
      id: 3,
      title: 'Leadership in the Digital Age',
      description: 'Develop essential leadership skills for managing remote teams and digital transformation.',
      type: 'video',
      category: 'leadership',
      duration: '1.5 hours',
      rating: 4.7,
      downloads: 890,
      featured: false,
    },
    {
      id: 4,
      title: 'Personal Productivity Mastery',
      description: 'Time management and productivity techniques for busy entrepreneurs and business owners.',
      type: 'course',
      category: 'personal',
      duration: '3 hours',
      rating: 4.6,
      downloads: 1560,
      featured: false,
    },
    {
      id: 5,
      title: 'Digital Marketing Strategies 2024',
      description: 'Latest trends and strategies in digital marketing, social media, and customer acquisition.',
      type: 'guide',
      category: 'marketing',
      duration: '1 hour read',
      rating: 4.8,
      downloads: 1890,
      featured: true,
    },
    {
      id: 6,
      title: 'Strategic Business Planning Template',
      description: 'Comprehensive template and guide for creating effective business plans and strategies.',
      type: 'template',
      category: 'strategy',
      duration: '30 min setup',
      rating: 4.5,
      downloads: 3200,
      featured: false,
    },
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return Video;
      case 'ebook': return BookOpen;
      case 'course': return BookOpen;
      case 'template': return FileText;
      default: return FileText;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'video': return 'bg-red-50 text-red-600';
      case 'ebook': return 'bg-blue-50 text-blue-600';
      case 'course': return 'bg-green-50 text-green-600';
      case 'template': return 'bg-purple-50 text-purple-600';
      default: return 'bg-gray-50 text-gray-600';
    }
  };

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredResources = resources.filter(resource => resource.featured);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Business Resources</h1>
        <p className="text-gray-600">Access comprehensive guides, templates, and materials to grow your business</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search resources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Featured Resources */}
      {selectedCategory === 'all' && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Featured Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredResources.map(resource => {
              const TypeIcon = getTypeIcon(resource.type);
              return (
                <div key={resource.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-2 rounded-lg ${getTypeColor(resource.type)}`}>
                      <TypeIcon className="w-5 h-5" />
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-yellow-500">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-gray-600">{resource.rating}</span>
                    </div>
                  </div>
                  
                  <h3 className="font-semibold text-gray-900 mb-2">{resource.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{resource.description}</p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{resource.duration}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Download className="w-4 h-4" />
                      <span>{resource.downloads.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <button className="w-full py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
                    Access Resource
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* All Resources */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {selectedCategory === 'all' ? 'All Resources' : categories.find(c => c.id === selectedCategory)?.name}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredResources.map(resource => {
            const TypeIcon = getTypeIcon(resource.type);
            return (
              <div key={resource.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-lg ${getTypeColor(resource.type)}`}>
                    <TypeIcon className="w-6 h-6" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{resource.title}</h3>
                      {resource.featured && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                          Featured
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-3">{resource.description}</p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{resource.duration}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span>{resource.rating}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Download className="w-4 h-4" />
                        <span>{resource.downloads.toLocaleString()}</span>
                      </div>
                    </div>
                    
                    <button className="w-full py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
                      Access Resource
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {filteredResources.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No resources found</h3>
            <p className="text-gray-600">Try adjusting your search terms or category filter.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Resources;