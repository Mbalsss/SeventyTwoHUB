import React, { useState } from 'react';
import { Download, ExternalLink, Star, Search, Filter, Wrench } from 'lucide-react';

const Toolkit: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Tools' },
    { id: 'templates', name: 'Templates' },
    { id: 'software', name: 'Software Trials' },
    { id: 'calculators', name: 'Calculators' },
    { id: 'planners', name: 'Planners' }
  ];

  const tools = [
    {
      id: 1,
      name: 'Business Plan Template',
      description: 'Comprehensive business plan template with financial projections and market analysis sections.',
      category: 'templates',
      type: 'Free Download',
      rating: 4.9,
      downloads: 15420,
      format: 'PDF, DOCX',
      image: 'https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: 2,
      name: 'Marketing Calendar Planner',
      description: 'Annual marketing calendar template to plan campaigns, content, and promotional activities.',
      category: 'planners',
      type: 'Free Download',
      rating: 4.7,
      downloads: 8930,
      format: 'Excel, Google Sheets',
      image: 'https://images.pexels.com/photos/6801648/pexels-photo-6801648.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: 3,
      name: 'CRM Software Trial',
      description: 'Full-featured CRM system with contact management, sales pipeline, and automation tools.',
      category: 'software',
      type: '30-Day Free Trial',
      rating: 4.8,
      downloads: 3240,
      format: 'Web App',
      image: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: 4,
      name: 'ROI Calculator',
      description: 'Calculate return on investment for marketing campaigns, projects, and business initiatives.',
      category: 'calculators',
      type: 'Free Tool',
      rating: 4.6,
      downloads: 12100,
      format: 'Web Tool',
      image: 'https://images.pexels.com/photos/6801874/pexels-photo-6801874.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: 5,
      name: 'Invoice Template Pack',
      description: 'Professional invoice templates in multiple formats with automatic calculations.',
      category: 'templates',
      type: 'Free Download',
      rating: 4.8,
      downloads: 22340,
      format: 'PDF, Excel, Word',
      image: 'https://images.pexels.com/photos/6863183/pexels-photo-6863183.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: 6,
      name: 'Cash Flow Forecasting Tool',
      description: 'Predict and manage your business cash flow with this comprehensive forecasting spreadsheet.',
      category: 'calculators',
      type: 'Premium Tool',
      rating: 4.9,
      downloads: 5670,
      format: 'Excel, Google Sheets',
      image: 'https://images.pexels.com/photos/6801648/pexels-photo-6801648.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: 7,
      name: 'Social Media Scheduler',
      description: 'Schedule and manage your social media posts across multiple platforms.',
      category: 'software',
      type: '14-Day Free Trial',
      rating: 4.7,
      downloads: 4320,
      format: 'Web App, Mobile',
      image: 'https://images.pexels.com/photos/267389/pexels-photo-267389.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: 8,
      name: 'Employee Handbook Template',
      description: 'Complete employee handbook template covering policies, procedures, and company culture.',
      category: 'templates',
      type: 'Premium Download',
      rating: 4.5,
      downloads: 3890,
      format: 'PDF, DOCX',
      image: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=400'
    }
  ];

  const getTypeColor = (type: string) => {
    if (type.includes('Free')) return 'bg-green-100 text-green-800';
    if (type.includes('Trial')) return 'bg-blue-100 text-blue-800';
    if (type.includes('Premium')) return 'bg-purple-100 text-purple-800';
    return 'bg-gray-100 text-gray-800';
  };

  const filteredTools = tools.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Business Toolkit</h1>
        <p className="text-gray-600">Access essential tools, templates, and software to streamline your business operations</p>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search tools and templates..."
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

      {/* Featured Tools */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Featured Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTools.slice(0, 3).map(tool => (
            <div key={tool.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              <img 
                src={tool.image} 
                alt={tool.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-3 py-1 text-xs rounded-full font-medium ${getTypeColor(tool.type)}`}>
                    {tool.type}
                  </span>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm text-gray-600">{tool.rating}</span>
                  </div>
                </div>
                
                <h3 className="font-semibold text-gray-900 mb-2">{tool.name}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{tool.description}</p>
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>{tool.format}</span>
                  <span>{tool.downloads.toLocaleString()} downloads</span>
                </div>
                
                <button className="w-full py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center justify-center space-x-2">
                  {tool.category === 'software' ? (
                    <>
                      <ExternalLink className="w-4 h-4" />
                      <span>Start Trial</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Download</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* All Tools */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">All Tools & Templates</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTools.map(tool => (
            <div key={tool.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start space-x-4">
                <img 
                  src={tool.image} 
                  alt={tool.name}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{tool.name}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${getTypeColor(tool.type)}`}>
                      {tool.type}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-3">{tool.description}</p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                    <div className="flex items-center space-x-4">
                      <span>{tool.format}</span>
                      <div className="flex items-center space-x-1">
                        <Star className="w-3 h-3 text-yellow-500 fill-current" />
                        <span>{tool.rating}</span>
                      </div>
                    </div>
                    <span>{tool.downloads.toLocaleString()} downloads</span>
                  </div>
                  
                  <button className="w-full py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center justify-center space-x-2">
                    {tool.category === 'software' ? (
                      <>
                        <ExternalLink className="w-4 h-4" />
                        <span>Access Tool</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        <span>Download</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {filteredTools.length === 0 && (
          <div className="text-center py-12">
            <Wrench className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tools found</h3>
            <p className="text-gray-600">Try adjusting your search terms or category filter.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Toolkit;