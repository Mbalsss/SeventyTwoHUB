import React, { useState } from 'react';
import { Search, DollarSign, Calendar, MapPin, ExternalLink, Bookmark, Star } from 'lucide-react';

const FundingFinder: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const [selectedAmount, setSelectedAmount] = useState('all');

  const fundingTypes = [
    { id: 'all', name: 'All Types' },
    { id: 'grants', name: 'Grants' },
    { id: 'loans', name: 'Loans' },
    { id: 'competitions', name: 'Competitions' },
    { id: 'accelerators', name: 'Accelerators' },
    { id: 'investors', name: 'Investors' }
  ];

  const industries = [
    { id: 'all', name: 'All Industries' },
    { id: 'technology', name: 'Technology' },
    { id: 'healthcare', name: 'Healthcare' },
    { id: 'retail', name: 'Retail' },
    { id: 'manufacturing', name: 'Manufacturing' },
    { id: 'services', name: 'Services' }
  ];

  const amountRanges = [
    { id: 'all', name: 'Any Amount' },
    { id: '0-10k', name: 'Up to $10K' },
    { id: '10k-50k', name: '$10K - $50K' },
    { id: '50k-100k', name: '$50K - $100K' },
    { id: '100k-500k', name: '$100K - $500K' },
    { id: '500k+', name: '$500K+' }
  ];

  const opportunities = [
    {
      id: 1,
      title: 'Small Business Innovation Research (SBIR)',
      type: 'grants',
      provider: 'U.S. Small Business Administration',
      amount: '$50,000 - $1,500,000',
      deadline: 'March 30, 2024',
      industry: 'technology',
      location: 'United States',
      description: 'Federal funding for small businesses engaged in research and development with commercialization potential.',
      requirements: ['Must be for-profit', 'Less than 500 employees', 'U.S. owned and operated'],
      rating: 4.8,
      applicants: 2340,
      successRate: '15%',
      isFeatured: true
    },
    {
      id: 2,
      title: 'Techstars Accelerator Program',
      type: 'accelerators',
      provider: 'Techstars',
      amount: '$120,000',
      deadline: 'April 15, 2024',
      industry: 'technology',
      location: 'Multiple Cities',
      description: '13-week mentorship-driven accelerator program for early-stage technology companies.',
      requirements: ['Early-stage startup', 'Scalable business model', 'Strong founding team'],
      rating: 4.9,
      applicants: 5600,
      successRate: '1.5%',
      isFeatured: true
    },
    {
      id: 3,
      title: 'Women-Owned Small Business Loan',
      type: 'loans',
      provider: 'National Women\'s Business Center',
      amount: '$5,000 - $250,000',
      deadline: 'Rolling Applications',
      industry: 'all',
      location: 'United States',
      description: 'Low-interest loans specifically designed for women entrepreneurs and business owners.',
      requirements: ['51% women-owned', 'Operating for 2+ years', 'Good credit score'],
      rating: 4.6,
      applicants: 890,
      successRate: '35%',
      isFeatured: false
    },
    {
      id: 4,
      title: 'Healthcare Innovation Challenge',
      type: 'competitions',
      provider: 'Health Innovation Hub',
      amount: '$100,000',
      deadline: 'May 1, 2024',
      industry: 'healthcare',
      location: 'Global',
      description: 'Competition for innovative healthcare solutions that improve patient outcomes.',
      requirements: ['Healthcare focus', 'Prototype or MVP', 'Clear market need'],
      rating: 4.7,
      applicants: 1200,
      successRate: '8%',
      isFeatured: false
    },
    {
      id: 5,
      title: 'Retail Innovation Fund',
      type: 'investors',
      provider: 'Retail Ventures Capital',
      amount: '$250,000 - $2,000,000',
      deadline: 'Ongoing',
      industry: 'retail',
      location: 'North America',
      description: 'Seed and Series A funding for innovative retail and e-commerce startups.',
      requirements: ['Retail/e-commerce focus', 'Proven traction', 'Experienced team'],
      rating: 4.5,
      applicants: 450,
      successRate: '12%',
      isFeatured: true
    },
    {
      id: 6,
      title: 'Manufacturing Modernization Grant',
      type: 'grants',
      provider: 'Department of Commerce',
      amount: '$25,000 - $500,000',
      deadline: 'June 15, 2024',
      industry: 'manufacturing',
      location: 'United States',
      description: 'Grants to help manufacturers adopt new technologies and improve competitiveness.',
      requirements: ['Manufacturing business', 'Technology upgrade plan', 'Job creation commitment'],
      rating: 4.4,
      applicants: 670,
      successRate: '25%',
      isFeatured: false
    }
  ];

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      grants: 'bg-green-100 text-green-800',
      loans: 'bg-blue-100 text-blue-800',
      competitions: 'bg-purple-100 text-purple-800',
      accelerators: 'bg-orange-100 text-orange-800',
      investors: 'bg-red-100 text-red-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const filteredOpportunities = opportunities.filter(opportunity => {
    const matchesSearch = opportunity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         opportunity.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || opportunity.type === selectedType;
    const matchesIndustry = selectedIndustry === 'all' || opportunity.industry === selectedIndustry || opportunity.industry === 'all';
    return matchesSearch && matchesType && matchesIndustry;
  });

  const featuredOpportunities = opportunities.filter(opp => opp.isFeatured);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Funding & Grant Finder</h1>
        <p className="text-gray-600">Discover funding opportunities tailored to your business needs and stage</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search funding opportunities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {fundingTypes.map(type => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
            
            <select
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {industries.map(industry => (
                <option key={industry.id} value={industry.id}>{industry.name}</option>
              ))}
            </select>
            
            <select
              value={selectedAmount}
              onChange={(e) => setSelectedAmount(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {amountRanges.map(range => (
                <option key={range.id} value={range.id}>{range.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Featured Opportunities */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Featured Opportunities</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredOpportunities.map(opportunity => (
            <div key={opportunity.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <span className={`px-3 py-1 text-xs rounded-full font-medium ${getTypeColor(opportunity.type)}`}>
                  {opportunity.type.charAt(0).toUpperCase() + opportunity.type.slice(1)}
                </span>
                <button className="p-1 hover:bg-gray-100 rounded">
                  <Bookmark className="w-4 h-4 text-gray-400" />
                </button>
              </div>
              
              <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{opportunity.title}</h3>
              <p className="text-gray-600 text-sm mb-3">{opportunity.provider}</p>
              
              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4" />
                  <span>{opportunity.amount}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>{opportunity.deadline}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span>{opportunity.location}</span>
                </div>
              </div>
              
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{opportunity.description}</p>
              
              <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                <div className="flex items-center space-x-1">
                  <Star className="w-3 h-3 text-yellow-500 fill-current" />
                  <span>{opportunity.rating}</span>
                </div>
                <span>{opportunity.successRate} success rate</span>
              </div>
              
              <button className="w-full py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center justify-center space-x-2">
                <ExternalLink className="w-4 h-4" />
                <span>Learn More</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* All Opportunities */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">All Funding Opportunities</h2>
        <div className="space-y-4">
          {filteredOpportunities.map(opportunity => (
            <div key={opportunity.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className={`px-3 py-1 text-xs rounded-full font-medium ${getTypeColor(opportunity.type)}`}>
                      {opportunity.type.charAt(0).toUpperCase() + opportunity.type.slice(1)}
                    </span>
                    {opportunity.isFeatured && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                        Featured
                      </span>
                    )}
                  </div>
                  
                  <h3 className="font-semibold text-gray-900 mb-1">{opportunity.title}</h3>
                  <p className="text-gray-600 text-sm mb-3">{opportunity.provider}</p>
                </div>
                
                <button className="p-2 hover:bg-gray-100 rounded">
                  <Bookmark className="w-4 h-4 text-gray-400" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <DollarSign className="w-4 h-4" />
                  <span>{opportunity.amount}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>{opportunity.deadline}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{opportunity.location}</span>
                </div>
              </div>
              
              <p className="text-gray-600 text-sm mb-4">{opportunity.description}</p>
              
              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Requirements:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {opportunity.requirements.map((req, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span>{opportunity.rating}</span>
                  </div>
                  <span>{opportunity.applicants.toLocaleString()} applicants</span>
                  <span>{opportunity.successRate} success rate</span>
                </div>
                
                <button className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center space-x-2">
                  <ExternalLink className="w-4 h-4" />
                  <span>Apply Now</span>
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {filteredOpportunities.length === 0 && (
          <div className="text-center py-12">
            <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No funding opportunities found</h3>
            <p className="text-gray-600">Try adjusting your search criteria or filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FundingFinder;