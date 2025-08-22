import React, { useState } from 'react';
import { Map, ArrowRight, CheckCircle, Clock, Star, Download } from 'lucide-react';

const RoadmapGenerator: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    businessType: '',
    industry: '',
    stage: '',
    revenue: '',
    employees: '',
    goals: [],
    timeline: ''
  });
  const [generatedRoadmap, setGeneratedRoadmap] = useState<any>(null);

  const businessTypes = [
    'E-commerce', 'SaaS', 'Consulting', 'Restaurant', 'Retail', 'Manufacturing', 
    'Healthcare', 'Education', 'Real Estate', 'Other'
  ];

  const industries = [
    'Technology', 'Healthcare', 'Finance', 'Retail', 'Manufacturing', 
    'Education', 'Food & Beverage', 'Professional Services', 'Other'
  ];

  const stages = [
    { id: 'startup', name: 'Startup (0-2 years)', desc: 'Just getting started' },
    { id: 'growth', name: 'Growth Stage (2-5 years)', desc: 'Scaling operations' },
    { id: 'established', name: 'Established (5+ years)', desc: 'Optimizing & expanding' }
  ];

  const goals = [
    'Increase Revenue', 'Expand Market Reach', 'Improve Operations', 
    'Build Team', 'Secure Funding', 'Digital Transformation',
    'Customer Retention', 'Cost Reduction'
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGoalToggle = (goal: string) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter(g => g !== goal)
        : [...prev.goals, goal]
    }));
  };

  const generateRoadmap = () => {
    // Simulate roadmap generation
    const roadmap = {
      phase1: {
        title: 'Foundation & Quick Wins (0-3 months)',
        tasks: [
          { task: 'Optimize your online presence', priority: 'High', duration: '2 weeks' },
          { task: 'Implement basic analytics tracking', priority: 'High', duration: '1 week' },
          { task: 'Create customer feedback system', priority: 'Medium', duration: '2 weeks' },
          { task: 'Streamline core operations', priority: 'High', duration: '4 weeks' }
        ]
      },
      phase2: {
        title: 'Growth Acceleration (3-6 months)',
        tasks: [
          { task: 'Launch targeted marketing campaigns', priority: 'High', duration: '6 weeks' },
          { task: 'Expand product/service offerings', priority: 'Medium', duration: '8 weeks' },
          { task: 'Build strategic partnerships', priority: 'Medium', duration: '4 weeks' },
          { task: 'Implement automation tools', priority: 'High', duration: '3 weeks' }
        ]
      },
      phase3: {
        title: 'Scale & Optimize (6-12 months)',
        tasks: [
          { task: 'Enter new market segments', priority: 'High', duration: '12 weeks' },
          { task: 'Build advanced team structure', priority: 'Medium', duration: '8 weeks' },
          { task: 'Implement advanced analytics', priority: 'Medium', duration: '4 weeks' },
          { task: 'Explore funding opportunities', priority: 'Low', duration: '6 weeks' }
        ]
      }
    };
    setGeneratedRoadmap(roadmap);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Acceleration Roadmap Generator</h1>
        <p className="text-gray-600">Get a personalized roadmap to accelerate your business growth</p>
      </div>

      {!generatedRoadmap ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-8">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep >= step ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {currentStep > step ? <CheckCircle className="w-5 h-5" /> : step}
                </div>
                {step < 3 && (
                  <div className={`w-16 h-1 mx-2 ${
                    currentStep > step ? 'bg-primary-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Business Basics */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Tell us about your business</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Type
                  </label>
                  <select
                    value={formData.businessType}
                    onChange={(e) => handleInputChange('businessType', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Select business type</option>
                    {businessTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Industry
                  </label>
                  <select
                    value={formData.industry}
                    onChange={(e) => handleInputChange('industry', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Select industry</option>
                    {industries.map(industry => (
                      <option key={industry} value={industry}>{industry}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Business Stage
                </label>
                <div className="space-y-3">
                  {stages.map(stage => (
                    <label key={stage.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="radio"
                        name="stage"
                        value={stage.id}
                        checked={formData.stage === stage.id}
                        onChange={(e) => handleInputChange('stage', e.target.value)}
                        className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                      />
                      <div>
                        <div className="font-medium text-gray-900">{stage.name}</div>
                        <div className="text-sm text-gray-600">{stage.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Current Metrics */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Current business metrics</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Annual Revenue Range
                  </label>
                  <select
                    value={formData.revenue}
                    onChange={(e) => handleInputChange('revenue', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Select revenue range</option>
                    <option value="0-50k">$0 - $50,000</option>
                    <option value="50k-100k">$50,000 - $100,000</option>
                    <option value="100k-500k">$100,000 - $500,000</option>
                    <option value="500k-1m">$500,000 - $1,000,000</option>
                    <option value="1m+">$1,000,000+</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Employees
                  </label>
                  <select
                    value={formData.employees}
                    onChange={(e) => handleInputChange('employees', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Select team size</option>
                    <option value="1">Just me (solopreneur)</option>
                    <option value="2-5">2-5 employees</option>
                    <option value="6-20">6-20 employees</option>
                    <option value="21-50">21-50 employees</option>
                    <option value="50+">50+ employees</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Goals & Timeline */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Your growth goals</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select your primary goals (choose up to 4)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {goals.map(goal => (
                    <label key={goal} className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.goals.includes(goal)}
                        onChange={() => handleGoalToggle(goal)}
                        disabled={formData.goals.length >= 4 && !formData.goals.includes(goal)}
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700">{goal}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Timeline for achieving goals
                </label>
                <select
                  value={formData.timeline}
                  onChange={(e) => handleInputChange('timeline', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Select timeline</option>
                  <option value="3months">3 months</option>
                  <option value="6months">6 months</option>
                  <option value="1year">1 year</option>
                  <option value="2years">2+ years</option>
                </select>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            
            {currentStep < 3 ? (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center space-x-2"
              >
                <span>Next</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={generateRoadmap}
                className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center space-x-2"
              >
                <Map className="w-4 h-4" />
                <span>Generate Roadmap</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Generated Roadmap */
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Your Personalized Growth Roadmap</h2>
              <div className="flex space-x-2">
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2">
                  <Download className="w-4 h-4" />
                  <span>Export PDF</span>
                </button>
                <button
                  onClick={() => setGeneratedRoadmap(null)}
                  className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                >
                  Generate New
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {Object.entries(generatedRoadmap).map(([key, phase]: [string, any]) => (
                <div key={key} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-4">{phase.title}</h3>
                  <div className="space-y-3">
                    {phase.tasks.map((task: any, index: number) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-gray-900 text-sm">{task.task}</h4>
                          <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                        </div>
                        <div className="flex items-center text-xs text-gray-600">
                          <Clock className="w-3 h-3 mr-1" />
                          {task.duration}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoadmapGenerator;