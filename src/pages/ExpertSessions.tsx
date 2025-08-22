import React, { useState } from 'react';
import { Video, Calendar, Clock, Star, Users, Play, BookOpen, Filter } from 'lucide-react';

const ExpertSessions: React.FC = () => {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const tabs = [
    { id: 'upcoming', name: 'Upcoming Sessions' },
    { id: 'recorded', name: 'Recorded Sessions' },
    { id: 'schedule', name: 'Schedule Session' }
  ];

  const categories = [
    { id: 'all', name: 'All Topics' },
    { id: 'startup', name: 'Startup Strategy' },
    { id: 'marketing', name: 'Marketing & Sales' },
    { id: 'finance', name: 'Finance & Funding' },
    { id: 'operations', name: 'Operations' },
    { id: 'leadership', name: 'Leadership' },
    { id: 'legal', name: 'Legal & Compliance' }
  ];

  const upcomingSessions = [
    {
      id: 1,
      title: 'Scaling Your Startup: From 1 to 100 Employees',
      expert: 'Sarah Johnson',
      expertTitle: 'Serial Entrepreneur & CEO',
      date: 'March 18, 2024',
      time: '2:00 PM EST',
      duration: '60 minutes',
      category: 'startup',
      attendees: 156,
      maxAttendees: 200,
      price: 'Free',
      description: 'Learn proven strategies for scaling your team, processes, and culture as you grow from startup to scale-up.',
      topics: ['Hiring strategies', 'Organizational structure', 'Culture building', 'Process optimization'],
      rating: 4.9,
      image: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: 2,
      title: 'Digital Marketing ROI: Measuring What Matters',
      expert: 'Mike Chen',
      expertTitle: 'Growth Marketing Director',
      date: 'March 20, 2024',
      time: '1:00 PM EST',
      duration: '45 minutes',
      category: 'marketing',
      attendees: 89,
      maxAttendees: 150,
      price: '$29',
      description: 'Master the art of measuring and optimizing your digital marketing campaigns for maximum ROI.',
      topics: ['Attribution models', 'KPI selection', 'Analytics setup', 'Optimization strategies'],
      rating: 4.8,
      image: 'https://images.pexels.com/photos/265087/pexels-photo-265087.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: 3,
      title: 'Fundraising 101: Preparing for Your First Round',
      expert: 'Jennifer Park',
      expertTitle: 'Venture Capital Partner',
      date: 'March 22, 2024',
      time: '3:00 PM EST',
      duration: '90 minutes',
      category: 'finance',
      attendees: 234,
      maxAttendees: 300,
      price: '$49',
      description: 'Everything you need to know about preparing for and executing your first fundraising round.',
      topics: ['Pitch deck creation', 'Valuation basics', 'Investor outreach', 'Due diligence prep'],
      rating: 4.9,
      image: 'https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg?auto=compress&cs=tinysrgb&w=400'
    }
  ];

  const recordedSessions = [
    {
      id: 1,
      title: 'Building a Remote-First Company Culture',
      expert: 'David Rodriguez',
      expertTitle: 'Remote Work Consultant',
      duration: '55 minutes',
      category: 'leadership',
      views: 2340,
      rating: 4.7,
      price: 'Free',
      description: 'Learn how to build and maintain a strong company culture in a remote-first environment.',
      image: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: 2,
      title: 'Legal Essentials for Early-Stage Startups',
      expert: 'Lisa Thompson',
      expertTitle: 'Startup Attorney',
      duration: '75 minutes',
      category: 'legal',
      views: 1890,
      rating: 4.8,
      price: '$19',
      description: 'Navigate the legal landscape of starting and running a business with confidence.',
      image: 'https://images.pexels.com/photos/5668882/pexels-photo-5668882.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: 3,
      title: 'Customer Acquisition Strategies That Work',
      expert: 'Amanda Foster',
      expertTitle: 'Growth Strategist',
      duration: '65 minutes',
      category: 'marketing',
      views: 3120,
      rating: 4.9,
      price: '$24',
      description: 'Proven customer acquisition strategies and tactics for sustainable business growth.',
      image: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=400'
    }
  ];

  const experts = [
    {
      id: 1,
      name: 'Robert Johnson',
      title: 'Serial Entrepreneur & Investor',
      expertise: ['Startup Strategy', 'Fundraising', 'Scaling'],
      experience: '15+ years',
      rating: 4.9,
      sessions: 127,
      hourlyRate: '$200',
      availability: 'Available',
      image: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: 2,
      name: 'Lisa Thompson',
      title: 'Marketing Director & Consultant',
      expertise: ['Digital Marketing', 'Brand Strategy', 'Growth Hacking'],
      experience: '12+ years',
      rating: 4.8,
      sessions: 89,
      hourlyRate: '$150',
      availability: 'Available',
      image: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: 3,
      name: 'Carlos Martinez',
      title: 'Operations & Finance Expert',
      expertise: ['Operations', 'Financial Planning', 'Process Optimization'],
      experience: '10+ years',
      rating: 4.9,
      sessions: 156,
      hourlyRate: '$175',
      availability: 'Busy',
      image: 'https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg?auto=compress&cs=tinysrgb&w=400'
    }
  ];

  const getCategoryColor = (category: string) => {
    const colors = {
      startup: 'bg-blue-100 text-blue-800',
      marketing: 'bg-green-100 text-green-800',
      finance: 'bg-purple-100 text-purple-800',
      operations: 'bg-orange-100 text-orange-800',
      leadership: 'bg-indigo-100 text-indigo-800',
      legal: 'bg-red-100 text-red-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const filteredUpcoming = upcomingSessions.filter(session =>
    selectedCategory === 'all' || session.category === selectedCategory
  );

  const filteredRecorded = recordedSessions.filter(session =>
    selectedCategory === 'all' || session.category === selectedCategory
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Expert Q&A Sessions</h1>
        <p className="text-gray-600">Learn from industry experts through live sessions and recorded content</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Category Filter */}
          <div className="mb-6">
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

          {activeTab === 'upcoming' && (
            <div className="space-y-6">
              {filteredUpcoming.map(session => (
                <div key={session.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex flex-col lg:flex-row lg:items-start space-y-4 lg:space-y-0 lg:space-x-6">
                    <img 
                      src={session.image} 
                      alt={session.title}
                      className="w-full lg:w-48 h-32 object-cover rounded-lg"
                    />
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <span className={`px-3 py-1 text-xs rounded-full font-medium ${getCategoryColor(session.category)}`}>
                            {categories.find(c => c.id === session.category)?.name}
                          </span>
                          <h3 className="font-semibold text-gray-900 mt-2 mb-1">{session.title}</h3>
                          <p className="text-gray-600 text-sm">with {session.expert}, {session.expertTitle}</p>
                        </div>
                        <div className="text-right">
                          <span className={`font-semibold ${session.price === 'Free' ? 'text-green-600' : 'text-gray-900'}`}>
                            {session.price}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-4">{session.description}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4" />
                          <span>{session.date}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4" />
                          <span>{session.time}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Video className="w-4 h-4" />
                          <span>{session.duration}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4" />
                          <span>{session.attendees}/{session.maxAttendees}</span>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">Topics covered:</h4>
                        <div className="flex flex-wrap gap-2">
                          {session.topics.map((topic, index) => (
                            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span className="text-sm text-gray-600">{session.rating}</span>
                          </div>
                          <span className="text-sm text-gray-600">
                            {session.attendees} registered
                          </span>
                        </div>
                        
                        <button className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
                          Register Now
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'recorded' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRecorded.map(session => (
                <div key={session.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                  <div className="relative">
                    <img 
                      src={session.image} 
                      alt={session.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <button className="p-3 bg-white rounded-full hover:bg-gray-100 transition-colors">
                        <Play className="w-6 h-6 text-gray-600" />
                      </button>
                    </div>
                    <div className="absolute top-4 right-4">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                        session.price === 'Free' ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'
                      }`}>
                        {session.price}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${getCategoryColor(session.category)}`}>
                      {categories.find(c => c.id === session.category)?.name}
                    </span>
                    
                    <h3 className="font-semibold text-gray-900 mt-3 mb-2 line-clamp-2">{session.title}</h3>
                    <p className="text-gray-600 text-sm mb-3">with {session.expert}</p>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{session.description}</p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4" />
                        <span>{session.duration}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span>{session.rating}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{session.views.toLocaleString()} views</span>
                      <button className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
                        Watch Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'schedule' && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Schedule a 1-on-1 Session</h3>
                <p className="text-gray-600">Get personalized advice from industry experts</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {experts.map(expert => (
                  <div key={expert.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-4 mb-4">
                      <img 
                        src={expert.image} 
                        alt={expert.name}
                        className="w-16 h-16 object-cover rounded-full"
                      />
                      <div>
                        <h3 className="font-semibold text-gray-900">{expert.name}</h3>
                        <p className="text-gray-600 text-sm">{expert.title}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3 mb-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Expertise:</p>
                        <div className="flex flex-wrap gap-1">
                          {expert.expertise.map((skill, index) => (
                            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{expert.experience} experience</span>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="text-gray-600">{expert.rating}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{expert.sessions} sessions completed</span>
                        <span className="font-semibold text-gray-900">{expert.hourlyRate}/hour</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          expert.availability === 'Available' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {expert.availability}
                        </span>
                      </div>
                    </div>
                    
                    <button 
                      className={`w-full py-2 rounded-lg transition-colors ${
                        expert.availability === 'Available'
                          ? 'bg-primary-500 text-white hover:bg-primary-600'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                      disabled={expert.availability !== 'Available'}
                    >
                      {expert.availability === 'Available' ? 'Book Session' : 'Currently Unavailable'}
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

export default ExpertSessions;