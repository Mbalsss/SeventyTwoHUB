import React, { useState } from 'react';
import { Users, MessageSquare, Video, Star, Clock, Award, Search, Filter } from 'lucide-react';

const MentorshipHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState('find-mentor');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const tabs = [
    { id: 'find-mentor', name: 'Find Mentor' },
    { id: 'peer-support', name: 'Peer Support' },
    { id: 'my-connections', name: 'My Connections' }
  ];

  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'retail', name: 'Retail & Trading' },
    { id: 'agriculture', name: 'Agriculture' },
    { id: 'services', name: 'Services' },
    { id: 'manufacturing', name: 'Manufacturing' },
    { id: 'technology', name: 'Technology' },
    { id: 'food', name: 'Food & Hospitality' }
  ];

  const mentors = [
    {
      id: 1,
      name: 'Sipho Mthembu',
      title: 'Retail Business Owner',
      experience: '8 years',
      location: 'Soweto',
      expertise: ['Retail Management', 'Customer Service', 'Inventory Control'],
      languages: ['English', 'isiZulu', 'Sesotho'],
      rating: 4.9,
      sessions: 45,
      category: 'retail',
      bio: 'Started with a small spaza shop and now owns 3 retail stores. Passionate about helping others grow their retail businesses.',
      availability: 'Available',
      image: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: 2,
      name: 'Nomsa Dlamini',
      title: 'Agricultural Entrepreneur',
      experience: '12 years',
      location: 'KwaZulu-Natal',
      expertise: ['Organic Farming', 'Market Access', 'Cooperative Management'],
      languages: ['English', 'isiZulu', 'Afrikaans'],
      rating: 4.8,
      sessions: 67,
      category: 'agriculture',
      bio: 'Transformed a small vegetable garden into a thriving organic farm supplying local markets and restaurants.',
      availability: 'Available',
      image: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: 3,
      name: 'Thabo Molefe',
      title: 'Tech Entrepreneur',
      experience: '6 years',
      location: 'Johannesburg',
      expertise: ['Digital Marketing', 'E-commerce', 'Mobile Apps'],
      languages: ['English', 'Setswana', 'Sesotho'],
      rating: 4.7,
      sessions: 32,
      category: 'technology',
      bio: 'Built a successful digital marketing agency helping small businesses establish their online presence.',
      availability: 'Busy',
      image: 'https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg?auto=compress&cs=tinysrgb&w=400'
    }
  ];

  const peerGroups = [
    {
      id: 1,
      name: 'Soweto Entrepreneurs Circle',
      members: 156,
      category: 'General Business',
      location: 'Soweto',
      description: 'A supportive community of entrepreneurs sharing experiences and growing together.',
      recentActivity: '12 new posts this week',
      image: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: 2,
      name: 'Women in Business SA',
      members: 234,
      category: 'Women Entrepreneurs',
      location: 'National',
      description: 'Empowering women entrepreneurs across South Africa through mentorship and support.',
      recentActivity: '8 new posts this week',
      image: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: 3,
      name: 'Young Farmers Network',
      members: 89,
      category: 'Agriculture',
      location: 'Rural Areas',
      description: 'Connecting young farmers to share knowledge about modern farming techniques.',
      recentActivity: '15 new posts this week',
      image: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=400'
    }
  ];

  const myConnections = [
    {
      id: 1,
      name: 'Maria Santos',
      type: 'Mentor',
      lastContact: '2 days ago',
      nextSession: 'Tomorrow 2:00 PM',
      status: 'Active'
    },
    {
      id: 2,
      name: 'David Nkomo',
      type: 'Peer',
      lastContact: '1 week ago',
      nextSession: null,
      status: 'Connected'
    },
    {
      id: 3,
      name: 'Sarah Mbeki',
      type: 'Mentee',
      lastContact: '3 days ago',
      nextSession: 'Friday 10:00 AM',
      status: 'Active'
    }
  ];

  const filteredMentors = mentors.filter(mentor =>
    selectedCategory === 'all' || mentor.category === selectedCategory
  );

  return (
    <div className="space-y-4 animate-fade-in px-2 sm:px-0">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Mentorship Hub</h1>
        <p className="text-gray-600 text-sm">Connect with experienced mentors and supportive peers in your community</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-4 sm:space-x-8 px-4 sm:px-6 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 sm:py-4 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
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

        <div className="p-4 sm:p-6">
          {activeTab === 'find-mentor' && (
            <div className="space-y-6">
              {/* Category Filter */}
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

              {/* Mentors Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filteredMentors.map(mentor => (
                  <div key={mentor.id} className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-4 mb-4">
                      <img 
                        src={mentor.image} 
                        alt={mentor.name}
                        className="w-12 h-12 object-cover rounded-full"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-sm">{mentor.name}</h3>
                        <p className="text-gray-600 text-xs">{mentor.title}</p>
                        <p className="text-gray-500 text-xs">{mentor.location}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        mentor.availability === 'Available' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {mentor.availability}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{mentor.bio}</p>
                    
                    <div className="space-y-3 mb-4">
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Expertise:</p>
                        <div className="flex flex-wrap gap-1">
                          {mentor.expertise.slice(0, 2).map((skill, index) => (
                            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                              {skill}
                            </span>
                          ))}
                          {mentor.expertise.length > 2 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                              +{mentor.expertise.length - 2} more
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Languages:</p>
                        <p className="text-xs text-gray-700">{mentor.languages.join(', ')}</p>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="text-gray-600 text-xs">{mentor.rating}</span>
                        </div>
                        <span className="text-gray-600 text-xs">{mentor.sessions} sessions</span>
                        <span className="text-gray-600 text-xs">{mentor.experience} exp.</span>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button className="flex-1 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-xs">
                        Connect
                      </button>
                      <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        <MessageSquare className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'peer-support' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Peer Support Groups</h3>
                <button className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm">
                  Create Group
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {peerGroups.map(group => (
                  <div key={group.id} className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3 mb-4">
                      <img 
                        src={group.image} 
                        alt={group.name}
                        className="w-12 h-12 object-cover rounded-full"
                      />
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm">{group.name}</h3>
                        <p className="text-gray-600 text-xs">{group.category}</p>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{group.description}</p>
                    
                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1">
                          <Users className="w-4 h-4" />
                          <span className="text-xs">{group.members} members</span>
                        </div>
                        <span className="text-xs">{group.location}</span>
                      </div>
                      <p className="text-xs text-green-600">{group.recentActivity}</p>
                    </div>
                    
                    <button className="w-full py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm">
                      Join Group
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'my-connections' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">My Connections</h3>
              
              <div className="space-y-4">
                {myConnections.map(connection => (
                  <div key={connection.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            {connection.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 text-sm">{connection.name}</h4>
                          <p className="text-gray-600 text-xs">{connection.type}</p>
                          <p className="text-gray-500 text-xs">Last contact: {connection.lastContact}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          connection.status === 'Active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {connection.status}
                        </span>
                        {connection.nextSession && (
                          <p className="text-xs text-primary-600 mt-1">{connection.nextSession}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex space-x-2 mt-4">
                      <button className="flex-1 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-xs flex items-center justify-center space-x-1">
                        <MessageSquare className="w-3 h-3" />
                        <span>Message</span>
                      </button>
                      <button className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-xs flex items-center justify-center space-x-1">
                        <Video className="w-3 h-3" />
                        <span>Video Call</span>
                      </button>
                    </div>
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

export default MentorshipHub;