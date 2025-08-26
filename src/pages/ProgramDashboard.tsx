// src/pages/ProgramDashboard.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Calendar, BookOpen, Video, Download, Clock, CheckCircle, Play } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  getProgramDetails,
  getUserEnrollment,
  getProgramEvents,
  getProgramMaterials,
  markMaterialAsAccessed
} from '../lib/program.queries';
import type { ProgramRow, EnrollmentRow, EventRow, MaterialRow } from '../types/programDashboard.types.ts';

const ProgramDashboard: React.FC = () => {
  const { programId } = useParams<{ programId: string }>();
  const { user } = useAuth();
  const [program, setProgram] = useState<ProgramRow | null>(null);
  const [enrollment, setEnrollment] = useState<EnrollmentRow | null>(null);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [materials, setMaterials] = useState<MaterialRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const loadProgramData = useCallback(async () => {
    if (!user || !programId) return;

    try {
      setLoading(true);

      // Use query functions to fetch all data in parallel
      const [programData, enrollmentData, eventsData, materialsData] = await Promise.all([
        getProgramDetails(programId),
        getUserEnrollment(programId, user.id),
        getProgramEvents(programId),
        getProgramMaterials(programId)
      ]);

      if (!programData || !enrollmentData) {
        console.warn('Program not found or user is not enrolled.');
        setProgram(null);
        setEnrollment(null);
        return;
      }
      
      setProgram(programData);
      setEnrollment(enrollmentData);
      setEvents(eventsData);
      setMaterials(materialsData);

    } catch (error) {
      console.error('Error loading program dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [programId, user]);

  useEffect(() => {
    if (programId) {
      void loadProgramData();
    }
  }, [programId, loadProgramData]);

  const handleMarkMaterialAsAccessed = async (materialId: string) => {
      if (!user) return;

    await markMaterialAsAccessed(materialId, user.id);

    // For immediate UI feedback, you could update the state here
    // before reloading all data.
    setMaterials(prevMaterials =>
      prevMaterials.map(m =>
        m.id === materialId ? { ...m, accessed: true } : m
      )
    );

    // Optionally, you can still reload all data to ensure consistency
    // void loadProgramData();
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: BookOpen },
    { id: 'calendar', name: 'Calendar', icon: Calendar },
    { id: 'materials', name: 'Materials', icon: Video },
    { id: 'progress', name: 'Progress', icon: CheckCircle }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading program dashboard...</p>
        </div>
      </div>
    );
  }

  if (!program || !enrollment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">You are not enrolled in this program or the program does not exist.</p>
        </div>
      </div>
    );
  }

  // --- RENDER LOGIC --- (No changes below this line)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">{program.name}</h1>
            <p className="text-gray-600 mt-2">{program.description}</p>
            <div className="mt-4 flex items-center space-x-6 text-sm text-gray-500">
              <span>Status: <span className="text-green-600 font-medium">{enrollment.status}</span></span>
              <span>Progress: <span className="text-primary-600 font-medium">{enrollment.completion_percentage}%</span></span>
              <span>Enrolled: {new Date(enrollment.enrolled_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Program Info */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Program Overview</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900">Duration</h4>
                    <p className="text-gray-600">
                      {program.start_date && program.end_date && (
                        `${new Date(program.start_date).toLocaleDateString()} - ${new Date(program.end_date).toLocaleDateString()}`
                      )}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Description</h4>
                    <p className="text-gray-600">{program.description}</p>
                  </div>
                </div>
              </div>

              {/* Upcoming Events */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Events</h3>
                <div className="space-y-3">
                  {events.slice(0, 3).map(event => (
                    <div key={event.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                      <div className="p-2 bg-primary-100 rounded-lg">
                        <Calendar className="w-4 h-4 text-primary-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{event.title}</h4>
                        <p className="text-sm text-gray-600">
                          {new Date(event.start_time).toLocaleDateString()} at {new Date(event.start_time).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Progress Sidebar */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Progress</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Overall Progress</span>
                      <span className="text-sm font-medium text-gray-900">{enrollment.completion_percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${enrollment.completion_percentage}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Materials Accessed</span>
                      <span className="font-medium">{materials.filter(m => m.accessed).length}/{materials.length}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-2">
                      <span className="text-gray-600">Events Attended</span>
                      <span className="font-medium">0/{events.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'calendar' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Program Calendar</h3>
            <div className="space-y-4">
              {events.map(event => (
                <div key={event.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-2">{event.title}</h4>
                      <p className="text-gray-600 text-sm mb-3">{event.description}</p>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(event.start_time).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{new Date(event.start_time).toLocaleTimeString()} - {event.end_time && new Date(event.end_time).toLocaleTimeString()}</span>
                        </div>
                      </div>
                      
                      {event.location && (
                        <p className="text-sm text-gray-600 mt-2">Location: {event.location}</p>
                      )}
                      
                      {event.zoom_link && (
                        <a 
                          href={event.zoom_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1 text-primary-600 hover:text-primary-700 text-sm mt-2"
                        >
                          <Video className="w-4 h-4" />
                          <span>Join Zoom Meeting</span>
                        </a>
                      )}
                    </div>
                    
                    <div className="text-right">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        event.is_mandatory ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {event.is_mandatory ? 'Mandatory' : 'Optional'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'materials' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Training Materials</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {materials.map(material => (
                <div key={material.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      {material.material_type === 'video' ? (
                        <Video className="w-5 h-5 text-red-500" />
                      ) : (
                        <BookOpen className="w-5 h-5 text-blue-500" />
                      )}
                      <span className="text-xs text-gray-500">Module {material.module_number}</span>
                    </div>
                    {material.is_required && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                        Required
                      </span>
                    )}
                  </div>
                  
                  <h4 className="font-semibold text-gray-900 mb-2">{material.title}</h4>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{material.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {material.file_size && `${Math.round(material.file_size / 1024 / 1024)} MB`}
                    </span>
                    <button
                      onClick={() => handleMarkMaterialAsAccessed(material.id)}
                      className="flex items-center space-x-1 px-3 py-1 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm"
                    >
                      {material.material_type === 'video' ? (
                        <Play className="w-3 h-3" />
                      ) : (
                        <Download className="w-3 h-3" />
                      )}
                      <span>{material.material_type === 'video' ? 'Watch' : 'Download'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'progress' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Progress Tracking</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Module Progress */}
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Module Completion</h4>
                <div className="space-y-3">
                  {materials.map(material => (
                    <div key={material.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded-full ${
                          material.accessed ? 'bg-green-500' : 'bg-gray-300'
                        }`} />
                        <span className="text-sm text-gray-900">Module {material.module_number}: {material.title}</span>
                      </div>
                      {material.accessed && (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Event Attendance */}
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Event Attendance</h4>
                <div className="space-y-3">
                  {events.map(event => (
                    <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-4 h-4 rounded-full bg-gray-300" />
                        <span className="text-sm text-gray-900">{event.title}</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(event.start_time).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgramDashboard;