//src/components/admin/ProgramManagement.tsx

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Eye,
  Users, 
  Calendar, 
  ExternalLink, 
  Download,
  Search,
  Filter,
  MoreVertical,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  AlertTriangle
} from 'lucide-react';
import {
  getProgramsWithCounts,
  createProgram as libCreateProgram,
  generateApplicationLink as libGenerateApplicationLink,
  getProgramApplications as libGetProgramApplications,
  updateApplicationStatus as libUpdateApplicationStatus,
  exportApplicationsCSV
} from '../../lib/programManagement';
import { useAuth } from '../../context/AuthContext';

// Defines the structure of a Program object
interface Program {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  start_date?: string;
  end_date?: string;
  max_participants?: number;
  application_deadline?: string;
  application_link_id?: string;
  created_at: string;
  applications_count: number;
  enrollments_count: number;
}

// **FIX 1: Define a specific type for Application Status**
type ApplicationStatus = 'approved' | 'rejected' | 'under_review' | 'submitted';

// **FIX 2: Define a specific interface for an Application**
interface Application {
  id: string;
  status: ApplicationStatus;
  reference_number: string;
  submitted_at: string;
  reviewed_at?: string;
  profiles: { full_name: string } | null;
  businesses: {
    business_name: string;
    business_category: string;
    business_location: string;
  } | null;
}

// **FIX 3: Define a specific interface for the form data when creating a program**
interface NewProgramData {
  name: string;
  description: string;
  status: 'draft' | 'active';
  start_date: string | null;
  end_date: string | null;
  max_participants: number | null;
  application_deadline: string | null;
}

const ProgramManagement: React.FC = () => {
  const { user } = useAuth();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [filteredPrograms, setFilteredPrograms] = useState<Program[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showApplicationsModal, setShowApplicationsModal] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  // **FIX 4: Use the new `Application` interface for the state**
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadPrograms();
  }, []);

  useEffect(() => {
    filterPrograms();
  }, [programs, searchTerm, selectedStatus]);

  const loadPrograms = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getProgramsWithCounts();
      // **FIX 5: Removed unsafe `as any` cast. Trust the type from the library function.**
      setPrograms(data);
    } catch (error: any) {
      console.error('Error loading programs:', error);
      if (error?.code === '42501') {
        setError('You do not have permission to view programs. Please ensure you have admin privileges.');
      } else if (error?.code === '42703') {
        setError('Database schema error. Please contact support.');
      } else {
        setError('Failed to load programs. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const filterPrograms = () => {
    let filtered = [...programs];

    if (searchTerm) {
      filtered = filtered.filter(program =>
        program.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        program.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(program => program.status === selectedStatus);
    }

    setFilteredPrograms(filtered);
  };

  // **FIX 6: Use the `NewProgramData` interface instead of `any`**
  const createProgram = async (formData: NewProgramData) => {
  if (!user?.id) {
    console.error("Create program cancelled: User not authenticated.");
    alert("You must be signed in to create a program.");
      return;
  }

    try {
    // The check is no longer needed here.
      await libCreateProgram(user.id, formData);
      await loadPrograms();
      setShowCreateModal(false);
      alert('Program created successfully!');
    } catch (error: any) {
      console.error('Error creating program:', error);
      if (error?.code === '42501') {
        alert('You do not have permission to create programs. Please ensure you have admin privileges.');
      } else if (error?.message?.includes('invalid input syntax for type uuid')) {
        alert('Invalid user ID format. Please contact support.');
      } else if (error instanceof Error) {
        alert(`Error creating program: ${error.message}`);
      } else {
        alert('Error creating program. Please try again.');
      }
    }
  };

  const generateApplicationLink = async (programId: string) => {
    try {
      const linkId = await libGenerateApplicationLink(programId);
      await loadPrograms();
      const fullLink = `${window.location.origin}/apply/${linkId}`;
      navigator.clipboard.writeText(fullLink);
      alert(`Application link generated and copied to clipboard:\n${fullLink}`);
    } catch (error) {
      console.error('Error generating application link:', error);
      alert('Error generating application link');
    }
  };

  const loadProgramApplications = async (programId: string) => {
    try {
      const data = await libGetProgramApplications(programId);
      setApplications(data || []);
    } catch (error) {
      console.error('Error loading applications:', error);
      setApplications([]);
      setError('Failed to load program applications. Please try again.');
    }
  };

  // **FIX 7: Use the `ApplicationStatus` type for the status parameter**
  const updateApplicationStatus = async (applicationId: string, status: ApplicationStatus, notes?: string) => {
    try {
      setActionLoading(applicationId);
      // **FIX 8: Removed unsafe `as any` cast.**
      await libUpdateApplicationStatus(applicationId, status, user?.id, notes);
      if (selectedProgram) {
        await loadProgramApplications(selectedProgram.id);
      }
      alert('Application status updated successfully!');
    } catch (error) {
      console.error('Error updating application status:', error);
      alert('Error updating application status');
    } finally {
      setActionLoading(null);
    }
  };

  const exportApplications = async (programId: string) => {
    try {
      const csvContent = await exportApplicationsCSV(programId);
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `applications-${programId}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting applications:', error);
      alert('Error exporting applications');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getApplicationStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'under_review': return 'bg-blue-100 text-blue-800';
      case 'submitted': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <p className="text-red-800">{error}</p>
        </div>
        <button
          onClick={() => {
            setError(null);
            loadPrograms();
          }}
          className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Program Management</h2>
          <p className="text-gray-600">Manage training programs and applications</p>
        </div>
        
        <button
          onClick={() => setShowCreateModal(true)}
          className="mt-4 sm:mt-0 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Program</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-gray-50 rounded-xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search programs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          
          <div className="flex space-x-2">
            <button className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
            <button className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2">
              <Filter className="w-4 h-4" />
              <span>Filter</span>
            </button>
          </div>
        </div>
      </div>

      {/* Programs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPrograms.map(program => (
          <div key={program.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{program.name}</h3>
                <p className="text-gray-600 text-sm line-clamp-2">{program.description}</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(program.status)}`}>
                  {program.status}
                </span>
                <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Program Stats */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-lg font-bold text-gray-900">{program.applications_count}</div>
                <div className="text-xs text-gray-600">Applications</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-lg font-bold text-gray-900">{program.enrollments_count}</div>
                <div className="text-xs text-gray-600">Enrolled</div>
              </div>
            </div>

            {/* Program Details */}
            <div className="space-y-2 text-sm text-gray-600 mb-4">
              {program.start_date && (
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {new Date(program.start_date).toLocaleDateString()}
                    {program.end_date && ` - ${new Date(program.end_date).toLocaleDateString()}`}
                  </span>
                </div>
              )}
              {program.application_deadline && (
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>Deadline: {new Date(program.application_deadline).toLocaleDateString()}</span>
                </div>
              )}
              {program.max_participants && (
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span>Max: {program.max_participants} participants</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-2">
              {program.application_link_id ? (
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      const link = `${window.location.origin}/apply/${program.application_link_id}`;
                      navigator.clipboard.writeText(link);
                      alert('Application link copied to clipboard!');
                    }}
                    className="flex-1 py-2 px-3 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors text-sm flex items-center justify-center space-x-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Copy Link</span>
                  </button>
                  <button
                    onClick={() => exportApplications(program.id)}
                    className="py-2 px-3 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors"
                    title="Export applications"
                  >
                    <Download className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => generateApplicationLink(program.id)}
                  className="w-full py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm"
                >
                  Generate Application Link
                </button>
              )}

              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setSelectedProgram(program);
                    loadProgramApplications(program.id);
                    setShowApplicationsModal(true);
                  }}
                  className="flex-1 py-2 px-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm flex items-center justify-center space-x-1"
                >
                  <Eye className="w-3 h-3" />
                  <span>Applications</span>
                </button>
                <button className="flex-1 py-2 px-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm flex items-center justify-center space-x-1">
                  <Edit className="w-3 h-3" />
                  <span>Edit</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Program Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Program</h3>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);

              // **FIX 9: Construct a strongly-typed object before calling createProgram**
              const newProgramData: NewProgramData = {
                name: String(formData.get('name') || ''),
                description: String(formData.get('description') || ''),
                status: formData.get('status') === 'active' ? 'active' : 'draft',
                start_date: (formData.get('start_date') as string) || null,
                end_date: (formData.get('end_date') as string) || null,
                max_participants: formData.get('max_participants') ? parseInt(formData.get('max_participants') as string, 10) : null,
                application_deadline: (formData.get('application_deadline') as string) || null
              };

              createProgram(newProgramData);

            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Program Name</label>
                <input
                  name="name"
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter program name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Program description"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  name="status"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    name="start_date"
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    name="end_date"
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Participants</label>
                <input
                  name="max_participants"
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Leave empty for unlimited"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Application Deadline</label>
                <input
                  name="application_deadline"
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                >
                  Create Program
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Applications Modal */}
      {showApplicationsModal && selectedProgram && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Applications for {selectedProgram.name}
              </h3>
              <button
                onClick={() => setShowApplicationsModal(false)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              {applications.map(application => (
                <div key={application.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">
                        {application.profiles?.full_name || 'Unknown Applicant'}
                      </h4>
                      <p className="text-gray-600 text-sm">
                        {application.businesses?.business_name} • {application.businesses?.business_category}
                      </p>
                      <p className="text-gray-500 text-sm">
                        {application.businesses?.business_location}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${getApplicationStatusColor(application.status)}`}>
                      {application.status.replace('_', ' ')}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-3">
                    <p><strong>Ref:</strong> {application.reference_number}</p>
                    <p><strong>Submitted:</strong> {new Date(application.submitted_at).toLocaleDateString()}</p>
                    {application.reviewed_at && (
                      <p><strong>Reviewed:</strong> {new Date(application.reviewed_at).toLocaleDateString()}</p>
                    )}
                  </div>
                  
                  {application.status === 'submitted' && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => updateApplicationStatus(application.id, 'approved')}
                        disabled={actionLoading === application.id}
                        className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm flex items-center space-x-1"
                      >
                        {actionLoading === application.id ? (
                          <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <CheckCircle className="w-3 h-3" />
                        )}
                        <span>{actionLoading === application.id ? 'Processing...' : 'Approve'}</span>
                      </button>
                      <button
                        onClick={() => updateApplicationStatus(application.id, 'under_review')}
                        disabled={actionLoading === application.id}
                        className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                      >
                        Review
                      </button>
                      <button
                        onClick={() => updateApplicationStatus(application.id, 'rejected', 'Application rejected')}
                        disabled={actionLoading === application.id}
                        className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm flex items-center space-x-1"
                      >
                        {actionLoading === application.id ? (
                          <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <XCircle className="w-3 h-3" />
                        )}
                        <span>{actionLoading === application.id ? 'Processing...' : 'Reject'}</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
              
              {applications.length === 0 && (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
                  <p className="text-gray-600">Applications will appear here once submitted.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {filteredPrograms.length === 0 && !loading && !error && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No programs found</h3>
          <p className="text-gray-600">Create your first program to get started.</p>
        </div>
      )}
    </div>
  );
};

export default ProgramManagement;