// src/pages/registration/ApplicationType.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Wrench, DollarSign, ShoppingBag, Users, Calendar, Clock, RefreshCw } from 'lucide-react';
import { fetchActivePrograms, subscribeToProgramChanges } from '../../lib/applicationType.queries';
import type {Program} from '../../types/applicationType.types';

const ApplicationType: React.FC = () => {
  const navigate = useNavigate();
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [availablePrograms, setAvailablePrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAvailablePrograms = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchActivePrograms();
      setAvailablePrograms(data);
    } catch (err) {
      console.error('Error loading programs:', err);
      setError('Failed to load available programs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
        loadAvailablePrograms();

    const subscription = subscribeToProgramChanges(loadAvailablePrograms);

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const getIconForProgram = (programName: string) => {
    const name = programName.toLowerCase();
    if (name.includes('toolkit') || name.includes('tool')) return Wrench;
    if (name.includes('funding') || name.includes('grant') || name.includes('finance')) return DollarSign;
    if (name.includes('marketplace') || name.includes('market') || name.includes('sell')) return ShoppingBag;
    if (name.includes('mentor') || name.includes('coach') || name.includes('support')) return Users;
    return Calendar; // Default icon for programs
  };

  const getColorForProgram = (index: number) => {
    const colors = [
      'text-blue-600',
      'text-green-600', 
      'text-purple-600',
      'text-orange-600',
      'text-red-600',
      'text-indigo-600'
    ];
    return colors[index % colors.length];
  };

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
      step4: { 
        selectedTypes, 
        description,
        selectedPrograms: availablePrograms.filter(p => selectedTypes.includes(p.id))
      }
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
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Select Programs to Apply For</h2>
                <p className="text-sm text-gray-600">Choose the programs that match your business needs</p>
              </div>
              <button
                onClick={loadAvailablePrograms}
                disabled={loading}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                title="Refresh programs"
              >
                <RefreshCw className={`w-4 h-4 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{error}</p>
              <button
                onClick={loadAvailablePrograms}
                className="mt-2 text-red-600 hover:text-red-700 text-sm font-medium"
              >
                Try Again
              </button>
            </div>
          )}

          {loading && (
            <div className="mb-6 text-center">
              <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-gray-600 text-sm">Loading available programs...</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!loading && availablePrograms.length === 0 && !error && (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Programs Available</h3>
                <p className="text-gray-600">There are currently no active programs accepting applications.</p>
              </div>
            )}

            {!loading && availablePrograms.length > 0 && (
              <div className="space-y-3">
                {availablePrograms.map((program, index) => {
                  const Icon = getIconForProgram(program.name);
                  const isSelected = selectedTypes.includes(program.id);
                  const color = getColorForProgram(index);
                  
                  return (
                    <label
                      key={program.id}
                      className={`flex items-start space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                        isSelected 
                          ? 'border-primary-500 bg-primary-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleTypeToggle(program.id)}
                        className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500 mt-0.5"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <Icon className={`w-5 h-5 ${color}`} />
                          <h3 className="font-medium text-gray-900">{program.name}</h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{program.description}</p>
                        
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          {program.start_date && (
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-3 h-3" />
                              <span>Starts: {new Date(program.start_date).toLocaleDateString()}</span>
                            </div>
                          )}
                          {program.application_deadline && (
                            <div className="flex items-center space-x-1">
                              <Clock className="w-3 h-3" />
                              <span>Deadline: {new Date(program.application_deadline).toLocaleDateString()}</span>
                            </div>
                          )}
                          {program.max_participants && (
                            <div className="flex items-center space-x-1">
                              <Users className="w-3 h-3" />
                              <span>Max: {program.max_participants}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Information (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                placeholder="Tell us more about your business goals and how these programs can help you..."
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">{description.length}/500 characters</p>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading || availablePrograms.length === 0}
                className="w-full py-3 bg-primary-500 text-white rounded-lg font-semibold hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {selectedTypes.length > 0 
                  ? `Apply to ${selectedTypes.length} Program${selectedTypes.length > 1 ? 's' : ''}`
                  : 'Submit Application'
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ApplicationType;