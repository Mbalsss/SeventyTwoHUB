import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Building, MapPin, Users, DollarSign } from 'lucide-react';

const BusinessInformation: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    businessName: '',
    businessCategory: '',
    businessLocation: '',
    businessType: '',
    numberOfEmployees: '',
    monthlyRevenue: '',
    yearsInOperation: '',
    beeeLevel: ''
  });

  const categories = [
    'Retail & Trading', 'Food & Beverages', 'Agriculture', 'Manufacturing',
    'Services', 'Technology', 'Healthcare', 'Education', 'Construction', 'Other'
  ];

  const businessTypes = [
    'Formal Business', 'Informal Business', 'Startup', 'Cooperative', 'Franchise'
  ];

  const employeeRanges = [
    '1 (Just me)', '2-5', '6-20', '21-50', '50+'
  ];

  const revenueRanges = [
    'R0 - R5,000', 'R5,001 - R20,000', 'R20,001 - R50,000', 
    'R50,001 - R100,000', 'R100,001 - R500,000', 'R500,000+'
  ];

  const beeeLevels = [
    { value: '', label: 'Not Certified' },
    { value: '1', label: 'Level 1 (≥100 points)' },
    { value: '2', label: 'Level 2 (≥95 points)' },
    { value: '3', label: 'Level 3 (≥90 points)' },
    { value: '4', label: 'Level 4 (≥80 points)' },
    { value: '5', label: 'Level 5 (≥75 points)' },
    { value: '6', label: 'Level 6 (≥70 points)' },
    { value: '7', label: 'Level 7 (≥55 points)' },
    { value: '8', label: 'Level 8 (≥40 points)' }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    // Update registration data
    const existingData = JSON.parse(localStorage.getItem('registrationData') || '{}');
    localStorage.setItem('registrationData', JSON.stringify({
      ...existingData,
      step2: formData
    }));
    navigate('/register/documents');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate('/register/account')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-xl font-semibold text-gray-900 ml-4">Business Information</h1>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <form onSubmit={handleNext} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Name
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={formData.businessName}
                  onChange={(e) => handleInputChange('businessName', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter your business name"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Category
              </label>
              <select
                value={formData.businessCategory}
                onChange={(e) => handleInputChange('businessCategory', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              >
                <option value="">Select category</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Location
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={formData.businessLocation}
                  onChange={(e) => handleInputChange('businessLocation', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., Soweto, Johannesburg"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                {businessTypes.map(type => (
                  <label key={type} className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="businessType"
                      value={type}
                      checked={formData.businessType === type}
                      onChange={(e) => handleInputChange('businessType', e.target.value)}
                      className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Employees
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select
                    value={formData.numberOfEmployees}
                    onChange={(e) => handleInputChange('numberOfEmployees', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select</option>
                    {employeeRanges.map(range => (
                      <option key={range} value={range}>{range}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monthly Revenue
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select
                    value={formData.monthlyRevenue}
                    onChange={(e) => handleInputChange('monthlyRevenue', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select</option>
                    {revenueRanges.map(range => (
                      <option key={range} value={range}>{range}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Years in Operation
              </label>
              <input
                type="number"
                value={formData.yearsInOperation}
                onChange={(e) => handleInputChange('yearsInOperation', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="e.g., 2"
                min="0"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                BEEE Certification Level
              </label>
              <select
                value={formData.beeeLevel}
                onChange={(e) => handleInputChange('beeeLevel', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {beeeLevels.map(level => (
                  <option key={level.value} value={level.value}>{level.label}</option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Select your current BEEE certification level if applicable
              </p>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="w-full py-3 bg-primary-500 text-white rounded-lg font-semibold hover:bg-primary-600 transition-colors"
              >
                Next
              </button>
            </div>
          </form>

          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              You can skip this and upload later
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessInformation;