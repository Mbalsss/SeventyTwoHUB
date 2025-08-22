import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Wrench, DollarSign, ShoppingBag, Users } from 'lucide-react';

const ApplicationType: React.FC = () => {
  const navigate = useNavigate();
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [description, setDescription] = useState('');

  const applicationTypes = [
    {
      id: 'toolkit',
      title: 'Boost Toolkit',
      description: 'Access training, resources, and business tools',
      icon: Wrench,
      color: 'text-blue-600'
    },
    {
      id: 'funding',
      title: 'Funding/Grant Support',
      description: 'Apply for funding opportunities and grants',
      icon: DollarSign,
      color: 'text-green-600'
    },
    {
      id: 'marketplace',
      title: 'Marketplace Listing',
      description: 'List and promote your products/services',
      icon: ShoppingBag,
      color: 'text-purple-600'
    },
    {
      id: 'mentorship',
      title: 'Mentorship',
      description: 'Connect with experienced business mentors',
      icon: Users,
      color: 'text-orange-600'
    }
  ];

  const handleTypeToggle = (typeId: string) => {
    setSelectedTypes(prev => 
      prev.includes(typeId)
        ? prev.filter(id => id !== typeId)
        : [...prev, typeId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTypes.length === 0) {
      alert('Please select at least one application type');
      return;
    }

    // Update registration data
    const existingData = JSON.parse(localStorage.getItem('registrationData') || '{}');
    localStorage.setItem('registrationData', JSON.stringify({
      ...existingData,
      step4: { selectedTypes, description }
    }));
    
    navigate('/register/confirmation');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate('/register/documents')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-xl font-semibold text-gray-900 ml-4">Application Type</h1>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">What are you applying for?</h2>
            <p className="text-sm text-gray-600">Select all that apply to your business needs</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-3">
              {applicationTypes.map(type => {
                const Icon = type.icon;
                const isSelected = selectedTypes.includes(type.id);
                
                return (
                  <label
                    key={type.id}
                    className={`flex items-start space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      isSelected 
                        ? 'border-primary-500 bg-primary-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleTypeToggle(type.id)}
                      className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500 mt-0.5"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <Icon className={`w-5 h-5 ${type.color}`} />
                        <h3 className="font-medium text-gray-900">{type.title}</h3>
                      </div>
                      <p className="text-sm text-gray-600">{type.description}</p>
                    </div>
                  </label>
                );
              })}
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Short Description (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                placeholder="Write a short description about your business goals and how we can help you..."
                maxLength={100}
              />
              <p className="text-xs text-gray-500 mt-1">{description.length}/100 characters</p>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="w-full py-3 bg-primary-500 text-white rounded-lg font-semibold hover:bg-primary-600 transition-colors"
              >
                Submit Application
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ApplicationType;