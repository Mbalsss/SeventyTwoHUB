import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, UserPlus, LogIn } from 'lucide-react';

const WelcomeScreen: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <TrendingUp className="w-12 h-12 text-primary-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">BUSINESS BOOST</h1>
          <p className="text-gray-600">Ready to grow your business?</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => navigate('/register/account')}
            className="w-full py-4 bg-primary-500 text-white rounded-lg font-semibold hover:bg-primary-600 transition-colors flex items-center justify-center space-x-2"
          >
            <UserPlus className="w-5 h-5" />
            <span>Register My Business</span>
          </button>
          
          <button
            onClick={() => navigate('/login')}
            className="w-full py-4 border-2 border-primary-500 text-primary-500 rounded-lg font-semibold hover:bg-primary-50 transition-colors flex items-center justify-center space-x-2"
          >
            <LogIn className="w-5 h-5" />
            <span>Log in</span>
          </button>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Join thousands of South African entrepreneurs growing their businesses
          </p>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;