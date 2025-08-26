import React, { useState } from 'react';
import { MessageSquare, Users, TrendingUp, Clock, Heart, MessageCircle, Share, Plus } from 'lucide-react';

const Community: React.FC = () => {
  const [activeTab, setActiveTab] = useState('discussions');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const tabs = [
    { id: 'discussions', name: 'Discussions', icon: MessageSquare },
    { id: 'networking', name: 'Networking', icon: Users },
    { id: 'mentorship', name: 'Mentorship', icon: TrendingUp }
  ];

  const categories = [
    { id: 'all', name: 'All Topics' },
    { id: 'startup', name: 'Startup Advice' },
    { id: 'marketing', name: 'Marketing & Sales' },
    { id: 'finance', name: 'Finance & Funding' },
    { id: 'operations', name: 'Operations' },
    { id: 'tech', name: 'Technology' },
    { id: 'legal', name: 'Legal & Compliance' }
  ];

  const discussions = [
    {
      id: 1,
      title: 'How to validate your business idea before investing?',
      author: 'Sarah Chen',
      avatar: 'SC',
      category: 'startup',
      replies: 23,
      likes: 45,
      timeAgo: '2 hours ago',
      isHot: true,
      preview: 'I have a SaaS idea but want to make sure there\'s real demand before building...'
    },
    {
      id: 2,
      title: 'Best practices for remote team management',
      author: 'Mike Rodriguez',
      avatar: 'MR',
      category: 'operations',
      replies: 18,
      likes: 32,
      timeAgo: '4 hours ago',
      isHot: false,
      preview: 'Our team has grown to 15 people, all remote. Looking for advice on...'
    },
    {
      id: 3,
      title: 'Funding options for early-stage startups in 2024',
      author: 'Jennifer Park',
      avatar: 'JP',
      category: 'finance',
      replies: 41,
      likes: 78,
      timeAgo: '6 hours ago',
      isHot: true,
      preview: 'With the current market conditions, what are the best funding options...'
    },
    {
      id: 4,
      title: 'Social media marketing on a tight budget',
      author: 'David Kim',
      avatar: 'DK',
      category: 'marketing',
      replies: 15,
      likes: 28,
      timeAgo: '8 hours ago',
      isHot: false,
      preview: 'We have less than $500/month for marketing. What strategies work best...'
    },
    {
      id: 5,
      title: 'Legal structure: LLC vs Corporation for tech startups',
      author: 'Amanda Foster',
      avatar: 'AF',
      category: 'legal',
      replies: 29,
      likes: 52,
      timeAgo: '1 day ago',
      isHot: false,
      preview: 'Trying to decide between LLC and C-Corp for my tech startup...'
    }
  ];

  const networkingEvents = [
    {
      id: 1,
      title: 'Virtual Startup Pitch Night',
      date: 'March 15, 2024',
      time: '7:00 PM EST',
      attendees: 45,
      type: 'Virtual Event',
      description: 'Present your startup idea and get feedback from experienced entrepreneurs.'
    },
    {
      id: 2,
      title: 'E-commerce Entrepreneurs Meetup',
      date: 'March 20, 2024',
      time: '6:30 PM EST',
      attendees: 32,
      type: 'Industry Specific',
      description: 'Connect with fellow e-commerce business owners and share strategies.'
    },
    {
      id: 3,
      title: 'Women in Business Leadership Forum',
      date: 'March 25, 2024',
      time: '2:00 PM EST',
      attendees: 67,
      type: 'Community Focus',
      description: 'Empowering women entrepreneurs through networking and mentorship.'
    }
  ];

  const mentors = [
    {
      id: 1,
      name: 'Robert Johnson',
      title: 'Serial Entrepreneur & Investor',
      expertise: ['Startup Strategy', 'Fundraising', 'Scaling'],
      experience: '15+ years',
      companies: 'Founded 3 companies, 2 exits',
      rating: 4.9,
      sessions: 127,
      avatar: 'RJ'
    },
    {
      id: 2,
      name: 'Lisa Thompson',
      title: 'Marketing Director & Consultant',
      expertise: ['Digital Marketing', 'Brand Strategy', 'Growth Hacking'],
      experience: '12+ years',
      companies: 'Ex-Google, Ex-Shopify',
      rating: 4.8,
      sessions: 89,
      avatar: 'LT'
    },
    {
      id: 3,
      name: 'Carlos Martinez',
      title: 'Operations & Finance Expert',
      expertise: ['Operations', 'Financial Planning', 'Process Optimization'],
      experience: '10+ years',
      companies: 'Ex-McKinsey, CFO at 2 startups',
      rating: 4.9,
      sessions: 156,
      avatar: 'CM'
    }
  ];

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      startup: 'bg-blue-100 text-blue-800',
      marketing: 'bg-green-100 text-green-800',
      finance: 'bg-purple-100 text-purple-800',
      operations: 'bg-orange-100 text-orange-800',
      tech: 'bg-indigo-100 text-indigo-800',
      legal: 'bg-red-100 text-red-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const filteredDiscussions = discussions.filter(discussion =>
    selectedCategory === 'all' || discussion.category === selectedCategory
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Community Forum</h1>
        <p className="text-gray-600">Connect with fellow entrepreneurs, share experiences, and grow together</p>
      </div>

      {/* Community Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">12,847</h3>
              <p className="text-gray-600 text-sm">Active Members</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <MessageSquare className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">3,421</h3>
              <p className="text-gray-600 text-sm">Discussions</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">156</h3>
              <p className="text-gray-600 text-sm">Expert Mentors</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'discussions' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
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
                
                <button className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>New Discussion</span>
                </button>
              </div>

              <div className="space-y-4">
                {filteredDiscussions.map(discussion => (
                  <div key={discussion.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">{discussion.avatar}</span>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-gray-900 hover:text-primary-600 cursor-pointer">
                              {discussion.title}
                              {discussion.isHot && (
                                <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                                  Hot
                                </span>
                              )}
                            </h3>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="text-sm text-gray-600">by {discussion.author}</span>
                              <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(discussion.category)}`}>
                                {categories.find(c => c.id === discussion.category)?.name}
                              </span>
                            </div>
                          </div>
                          <span className="text-sm text-gray-500">{discussion.timeAgo}</span>
                        </div>
                        
                        <p className="text-gray-600 text-sm mb-3">{discussion.preview}</p>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <MessageCircle className="w-4 h-4" />
                            <span>{discussion.replies} replies</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Heart className="w-4 h-4" />
                            <span>{discussion.likes} likes</span>
                          </div>
                          <button className="flex items-center space-x-1 hover:text-primary-600">
                            <Share className="w-4 h-4" />
                            <span>Share</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'networking' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Upcoming Events</h3>
                <button className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
                  Create Event
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {networkingEvents.map(event => (
                  <div key={event.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="mb-4">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {event.type}
                      </span>
                    </div>
                    
                    <h3 className="font-semibold text-gray-900 mb-2">{event.title}</h3>
                    <p className="text-gray-600 text-sm mb-4">{event.description}</p>
                    
                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4" />
                        <span>{event.date} at {event.time}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4" />
                        <span>{event.attendees} attending</span>
                      </div>
                    </div>
                    
                    <button className="w-full py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
                      Join Event
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'mentorship' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Available Mentors</h3>
                <button className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
                  Become a Mentor
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mentors.map(mentor => (
                  <div key={mentor.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium">{mentor.avatar}</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{mentor.name}</h3>
                        <p className="text-gray-600 text-sm">{mentor.title}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3 mb-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Expertise:</p>
                        <div className="flex flex-wrap gap-1">
                          {mentor.expertise.map((skill, index) => (
                            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-600">
                        <p>{mentor.experience} experience</p>
                        <p>{mentor.companies}</p>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-1">
                          <div className="flex text-yellow-500">
                            {[...Array(5)].map((_, i) => (
                              <span key={i} className="text-xs">★</span>
                            ))}
                          </div>
                          <span className="text-gray-600">{mentor.rating}</span>
                        </div>
                        <span className="text-gray-600">{mentor.sessions} sessions</span>
                      </div>
                    </div>
                    
                    <button className="w-full py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
                      Book Session
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Community;