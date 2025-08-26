import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Building, MapPin, User, Mail, Phone } from 'lucide-react';

type FormDataState = {
  firstName: string;
  lastName: string;
  gender: string;
  emailAddress: string;
  cellphoneNumber: string;
  businessName: string;
  cityTownship: string;
  businessResidentialCorridor: string;
  businessIndustry: string;
  businessDescription: string;
  consentToShare: boolean;
  declaration: boolean;
};

const BusinessInformation: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormDataState>({
    firstName: '',
    lastName: '',
    gender: '',
    emailAddress: '',
    cellphoneNumber: '',
    businessName: '',
    cityTownship: '',
    businessResidentialCorridor: '',
    businessIndustry: '',
    businessDescription: '',
    consentToShare: false,
    declaration: false
  });

  const genderOptions = [
    'Male',
    'Female',
    'Non-binary',
    'Prefer not to say'
  ];

  const corridorOptions = [
    'Gauteng North - Atteridgeville, Pretoria Central, Refilwe, Soshanguve, Mamelodi',
    'Gauteng Central - Soweto, Lenasia, Alexandra, Johannesburg',
    'Gauteng East - Thembisa, Alexandra, Tsakani, Springs',
    'Gauteng West - Carletonville, Kagiso, Cosmo City, Krugersdorp',
    'Gauteng South - Sebokeng, Vaal, Vereeniging, Orange Farm'
  ];

  const industryOptions = [
    'Street Vendor/Spaza Shop',
    'Car Wash',
    'Hair Salon and Nail Salon',
    'Logistics and Transportation',
    'Internet Cafe',
    'Farming',
    'Butcher/Meat Cutter',
    'Fashion and Textile',
    'Laundry and Cleaning',
    'Grass Cutter',
    'Tent renters, Mobile Toilet and Fridge',
    'Mechanic and Tyre Services',
    'Phone Sellers/Repairers',
    'Fast Food/Confectioners',
    'Other'
  ];

  const businessDescriptionOptions = [
    'Woman-Owned',
    'Youth-Owned',
    'Black-Owned',
    'Other'
  ];

  const handleInputChange = (field: keyof FormDataState, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    const requiredFields: (keyof FormDataState)[] = [
      'firstName', 'lastName', 'gender', 'emailAddress', 'cellphoneNumber', 
      'businessName', 'businessResidentialCorridor'
    ];
    
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      alert('Please fill in all required fields marked with *');
      return;
    }

    if (!formData.declaration) {
      alert('Please accept the declaration to continue');
      return;
    }

    // Update registration data
    const existingData = JSON.parse(localStorage.getItem('registrationData') || '{}');
    localStorage.setItem('registrationData', JSON.stringify({
      ...existingData,
      step2: formData
    }));
    
    // Skip documents step and go directly to application type
    navigate('/register/application-type');
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
            {/* Personal Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="First name"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Last name"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gender <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.gender}
                onChange={(e) => handleInputChange('gender', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              >
                <option value="">Select gender</option>
                {genderOptions.map(gender => (
                  <option key={gender} value={gender}>{gender}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={formData.emailAddress}
                  onChange={(e) => handleInputChange('emailAddress', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cellphone Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="tel"
                  value={formData.cellphoneNumber}
                  onChange={(e) => handleInputChange('cellphoneNumber', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="+27 XX XXX XXXX"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Name <span className="text-red-500">*</span>
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
                City/Township
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={formData.cityTownship}
                  onChange={(e) => handleInputChange('cityTownship', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., Soweto, Pretoria"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Residential Corridor <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.businessResidentialCorridor}
                onChange={(e) => handleInputChange('businessResidentialCorridor', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              >
                <option value="">Select corridor</option>
                {corridorOptions.map(corridor => (
                  <option key={corridor} value={corridor}>{corridor}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Industry
              </label>
              <select
                value={formData.businessIndustry}
                onChange={(e) => handleInputChange('businessIndustry', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Select industry</option>
                {industryOptions.map(industry => (
                  <option key={industry} value={industry}>{industry}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select the option that best describes your business
              </label>
              <div className="space-y-2">
                {businessDescriptionOptions.map(option => (
                  <label key={option} className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="businessDescription"
                      value={option}
                      checked={formData.businessDescription === option}
                      onChange={(e) => handleInputChange('businessDescription', e.target.value)}
                      className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <label className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={formData.consentToShare}
                  onChange={(e) => handleInputChange('consentToShare', e.target.checked)}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 mt-0.5"
                />
                <div>
                  <span className="text-sm font-medium text-gray-900">
                    Do you give consent to share your business information with Standard Bank?
                  </span>
                  <p className="text-xs text-gray-600 mt-1">
                    This helps us provide better financial services and opportunities for your business.
                  </p>
                </div>
              </label>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <label className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={formData.declaration}
                  onChange={(e) => handleInputChange('declaration', e.target.checked)}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 mt-0.5"
                  required
                />
                <div>
                  <span className="text-sm font-medium text-gray-900">
                    Declaration <span className="text-red-500">*</span>
                  </span>
                  <p className="text-xs text-gray-600 mt-1">
                    I declare that the information provided is true and accurate to the best of my knowledge. 
                    I understand that providing false information may result in the rejection of my application.
                  </p>
                </div>
              </label>
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
              Fields marked with * are required
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessInformation;