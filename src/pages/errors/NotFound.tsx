import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowLeft, Home } from 'lucide-react';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h1>
          <p className="text-gray-600 mb-6">
            The page you're looking for doesn't exist or has been moved.
          </p>
          
          <div className="space-y-3">
            <button
              onClick={() => navigate(-1)}
              className="w-full py-3 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Go Back</span>
            </button>
            
            <button
              onClick={() => navigate('/')}
              className="w-full py-3 px-4 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center justify-center space-x-2"
            >
              <Home className="w-4 h-4" />
              <span>Go to Dashboard</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;