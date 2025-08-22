import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';

const SplashScreen: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Auto-redirect after 3 seconds or user can click to continue
    const timer = setTimeout(() => {
      navigate('/welcome');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center p-4">
      <div className="text-center text-white">
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <TrendingUp className="w-16 h-16" />
          </div>
          <h1 className="text-4xl font-bold mb-2">BUSINESS BOOST</h1>
          <p className="text-xl text-primary-100">Empowering South African Entrepreneurs</p>
        </div>
        
        <button
          onClick={() => navigate('/welcome')}
          className="px-8 py-3 bg-white text-primary-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
        >
          Get Started
        </button>
        
        <div className="mt-8">
          <div className="flex justify-center space-x-2">
            <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;