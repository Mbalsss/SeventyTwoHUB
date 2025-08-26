import React, { useState } from 'react';
import { Search, AppWindow, ExternalLink, Star, Download, ShoppingCart, Play, Zap } from 'lucide-react';

const Applications: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Applications' },
    { id: 'bizboost', name: 'BizBoost Solutions' },
    { id: 'productivity', name: 'Productivity' },
    { id: 'finance', name: 'Finance & Accounting' },
    { id: 'marketing', name: 'Marketing & Sales' },
    { id: 'operations', name: 'Operations' },
    { id: 'free', name: 'Free Tools' }
  ];

  const applications = [
    {
      id: 1,
      name: 'BizBoost Service Desk',
      description: 'Complete customer service management solution with ticket tracking, knowledge base, and analytics.',
      category: 'bizboost',
      type: 'Premium',
      price: 'R299/month',
      rating: 4.9,
      users: 1250,
      features: ['Ticket Management', 'Knowledge Base', 'Analytics Dashboard', 'Multi-channel Support'],
      image: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=400',
      isFeatured: true,
      isNew: false
    },
    {
      id: 2,
      name: 'BizBoost Inventory Portal',
      description: 'Smart inventory management system with real-time tracking, automated reordering, and supplier integration.',
      category: 'bizboost',
      type: 'Premium',
      price: 'R199/month',
      rating: 4.8,
      users: 890,
      features: ['Real-time Tracking', 'Auto Reordering', 'Supplier Integration', 'Mobile App'],
      image: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=400',
      isFeatured: true,
      isNew: true
    },
    {
      id: 3,
      name: 'QuickBooks Online',
      description: 'Cloud-based accounting software for small businesses with invoicing, expense tracking, and reporting.',
      category: 'finance',
      type: 'Trial',
      price: '30-day free trial',
      rating: 4.6,
      users: 15000,
      features: ['Invoicing', 'Expense Tracking', 'Financial Reports', 'Tax Preparation'],
      image: 'https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg?auto=compress&cs=tinysrgb&w=400',
      isFeatured: false,
      isNew: false
    },
    {
      id: 4,
      name: 'Mailchimp',
      description: 'Email marketing platform with automation, templates, and detailed analytics for growing your audience.',
      category: 'marketing',
      type: 'Freemium',
      price: 'Free up to 2,000 contacts',
      rating: 4.5,
      users: 25000,
      features: ['Email Campaigns', 'Automation', 'Templates', 'Analytics'],
      image: 'https://images.pexels.com/photos/267389/pexels-photo-267389.jpeg?auto=compress&cs=tinysrgb&w=400',
      isFeatured: false,
      isNew: false
    },
    {
      id: 5,
      name: 'Trello',
      description: 'Visual project management tool using boards, lists, and cards to organize tasks and collaborate with teams.',
      category: 'productivity',
      type: 'Free',
      price: 'Free',
      rating: 4.7,
      users: 35000,
      features: ['Kanban Boards', 'Team Collaboration', 'Task Management', 'Mobile Apps'],
      image: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=400',
      isFeatured: false,
      isNew: false
    },
    {
      id: 6,
      name: 'BizBoost POS System',
      description: 'Point of sale system designed for South African retailers with inventory sync and payment processing.',
      category: 'bizboost',
      type: 'Premium',
      price: 'R149/month',
      rating: 4.9,
      users: 650,
      features: ['Payment Processing', 'Inventory Sync', 'Sales Reports', 'Offline Mode'],
      image: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=400',
      isFeatured: true,
      isNew: true
    },
    {
      id: 7,
      name: 'Slack',
      description: 'Business communication platform with channels, direct messaging, and file sharing for team collaboration.',
      category: 'productivity',
      type: 'Freemium',
      price: 'Free for small teams',
      rating: 4.6,
      users: 45000,
      features: ['Team Messaging', 'File Sharing', 'Video Calls', 'App Integrations'],
      image: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=400',
      isFeatured: false,
      isNew: false
    },
    {
      id: 8,
      name: 'Canva',
      description: 'Graphic design platform with templates for social media, marketing materials, and business documents.',
      category: 'marketing',
      type: 'Freemium',
      price: 'Free with premium options',
      rating: 4.8,
      users: 60000,
      features: ['Design Templates', 'Brand Kit', 'Team Collaboration', 'Print Services'],
      image: 'https://images.pexels.com/photos/265087/pexels-photo-265087.jpeg?auto=compress&cs=tinysrgb&w=400',
      isFeatured: false,
      isNew: false
    }
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Free': return 'bg-green-100 text-green-800';
      case 'Freemium': return 'bg-blue-100 text-blue-800';
      case 'Trial': return 'bg-yellow-100 text-yellow-800';
      case 'Premium': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionButton = (app: any) => {
    if (app.category === 'bizboost') {
      return (
        <button className="w-full py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center justify-center space-x-2">
          <ShoppingCart className="w-4 h-4" />
          <span>Purchase</span>
        </button>
      );
    }
    
    if (app.type === 'Free') {
      return (
        <button className="w-full py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center space-x-2">
          <Download className="w-4 h-4" />
          <span>Get Free</span>
        </button>
      );
    }
    
    if (app.type === 'Trial') {
      return (
        <button className="w-full py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors flex items-center justify-center space-x-2">
          <Play className="w-4 h-4" />
          <span>Start Trial</span>
        </button>
      );
    }
    
    return (
      <button className="w-full py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center justify-center space-x-2">
        <ExternalLink className="w-4 h-4" />
        <span>Learn More</span>
      </button>
    );
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || app.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredApps = applications.filter(app => app.isFeatured);
  const bizBoostApps = applications.filter(app => app.category === 'bizboost');

  return (
    <div className="space-y-4 animate-fade-in px-2 sm:px-0">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Business Applications</h1>
        <p className="text-gray-600 text-sm">Discover powerful software solutions to streamline your business operations</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search applications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
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
      </div>

      {/* BizBoost Solutions */}
      <div>
        <div className="flex items-center space-x-2 mb-4">
          <Zap className="w-5 h-5 text-primary-500" />
          <h2 className="text-lg font-semibold text-gray-900">BizBoost Solutions</h2>
          <span className="px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded-full">Our Products</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {bizBoostApps.map(app => (
            <div key={app.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              <div className="relative">
                <img 
                  src={app.image} 
                  alt={app.name}
                  className="w-full h-32 object-cover"
                />
                <div className="absolute top-2 left-2 flex space-x-1">
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${getTypeColor(app.type)}`}>
                    {app.type}
                  </span>
                  {app.isNew && (
                    <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full font-medium">
                      New
                    </span>
                  )}
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-1 text-sm">{app.name}</h3>
                <p className="text-gray-600 text-xs mb-3 line-clamp-2">{app.description}</p>
                
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-primary-600 text-sm">{app.price}</span>
                  <div className="flex items-center space-x-1">
                    <Star className="w-3 h-3 text-yellow-500 fill-current" />
                    <span className="text-xs text-gray-600">{app.rating}</span>
                  </div>
                </div>
                
                <div className="mb-3">
                  <div className="flex flex-wrap gap-1">
                    {app.features.slice(0, 2).map((feature, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                        {feature}
                      </span>
                    ))}
                    {app.features.length > 2 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        +{app.features.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
                
                {getActionButton(app)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Applications */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Featured Applications</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {featuredApps.filter(app => app.category !== 'bizboost').map(app => (
            <div key={app.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              <div className="relative">
                <img 
                  src={app.image} 
                  alt={app.name}
                  className="w-full h-32 object-cover"
                />
                <div className="absolute top-2 left-2">
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${getTypeColor(app.type)}`}>
                    {app.type}
                  </span>
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-1 text-sm">{app.name}</h3>
                <p className="text-gray-600 text-xs mb-3 line-clamp-2">{app.description}</p>
                
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-gray-900 text-sm">{app.price}</span>
                  <div className="flex items-center space-x-1">
                    <Star className="w-3 h-3 text-yellow-500 fill-current" />
                    <span className="text-xs text-gray-600">{app.rating}</span>
                  </div>
                </div>
                
                {getActionButton(app)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* All Applications */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">All Applications</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredApplications.map(app => (
            <div key={app.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              <div className="relative">
                <img 
                  src={app.image} 
                  alt={app.name}
                  className="w-full h-24 object-cover"
                />
                <div className="absolute top-2 left-2 flex space-x-1">
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${getTypeColor(app.type)}`}>
                    {app.type}
                  </span>
                  {app.isNew && (
                    <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full font-medium">
                      New
                    </span>
                  )}
                </div>
              </div>
              
              <div className="p-3">
                <h3 className="font-semibold text-gray-900 mb-1 text-sm line-clamp-1">{app.name}</h3>
                <p className="text-gray-600 text-xs mb-2 line-clamp-2">{app.description}</p>
                
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-gray-900 text-xs">{app.price}</span>
                  <div className="flex items-center space-x-1">
                    <Star className="w-3 h-3 text-yellow-500 fill-current" />
                    <span className="text-xs text-gray-600">{app.rating}</span>
                  </div>
                </div>
                
                <div className="text-xs text-gray-500 mb-2">
                  {app.users.toLocaleString()} users
                </div>
                
                {getActionButton(app)}
              </div>
            </div>
          ))}
        </div>
        
        {filteredApplications.length === 0 && (
          <div className="text-center py-12">
            <AppWindow className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
            <p className="text-gray-600">Try adjusting your search criteria or filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Applications;