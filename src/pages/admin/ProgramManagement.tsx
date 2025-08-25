import React, { useState, useEffect } from 'react';
import { Plus, Edit, Eye, Users, Calendar, FileText, BarChart3, Download, ExternalLink, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { useAuth } from '../../context/AuthContext';

const AdminProgramManagement: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [programs, setPrograms] = useState<any[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('programs');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPrograms();
  }, []);

  const loadPrograms = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('programs')
        .select(`
          *,
          program_applications(count),
          program_enrollments(count)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPrograms(data || []);
    } catch (error) {
      console.error('Error loading programs:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateApplicationLink = async (programId: string) => {
    try {
      const { data, error } = await supabase.rpc('generate_application_link');
      if (error) throw error;

      const linkId = data;
      
      // Update program with the generated link
      await supabase
        .from('programs')
        .update({ application_link_id: linkId })
        .eq('id', programId);

      // Reload programs to show updated link
      loadPrograms();
      
      const fullLink = `${window.location.origin}/apply/${linkId}`;
      navigator.clipboard.writeText(fullLink);
      alert(`Application link generated and copied to clipboard:\n${fullLink}`);
    } catch (error) {
      console.error('Error generating application link:', error);
      alert('Error generating application link');
    }
  };

  const createProgram = async (formData: any) => {
    try {
      if (!user) return;

      const { data, error } = await supabase
        .from('programs')
        .insert({
          ...formData,
          created_by: user.id
        })
        .select()
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        throw new Error('Failed to create program');
      }

      // Create default application form
      await supabase
        .from('application_forms')
        .insert({
          program_id: data.id,
          form_config: {
            title: `${formData.name} Application`,
            description: `Apply for the ${formData.name} program`,
            fields: [
              { id: 'full_name', type: 'text', label: 'Full Name', required: true },
              { id: 'email', type: 'email', label: 'Email Address', required: true },
              { id: 'mobile_number', type: 'tel', label: 'Mobile Number', required: true },
              { id: 'business_name', type: 'text', label: 'Business Name', required: true },
              { id: 'business_category', type: 'select', label: 'Business Category', required: true, options: ['Retail & Trading', 'Food & Beverages', 'Agriculture', 'Manufacturing', 'Services', 'Technology'] },
              { id: 'business_location', type: 'text', label: 'Business Location', required: true },
              { id: 'business_type', type: 'select', label: 'Business Type', required: true, options: ['Formal Business', 'Informal Business', 'Startup', 'Cooperative', 'Franchise'] },
              { id: 'number_of_employees', type: 'select', label: 'Number of Employees', required: true, options: ['1 (Just me)', '2-5', '6-20', '21-50', '50+'] },
              { id: 'monthly_revenue', type: 'select', label: 'Monthly Revenue', required: true, options: ['R0 - R5,000', 'R5,001 - R20,000', 'R20,001 - R50,000', 'R50,001 - R100,000', 'R100,001 - R500,000', 'R500,000+'] },
              { id: 'years_in_operation', type: 'text', label: 'Years in Operation', required: true },
              { id: 'motivation', type: 'textarea', label: 'Why do you want to join this program?', required: true }
            ]
          }
        });

      loadPrograms();
      setShowCreateForm(false);
      alert('Program created successfully!');
    } catch (error) {
      console.error('Error creating program:', error);
      alert('Error creating program');
    }
  };

  const exportApplications = async (programId: string) => {
    try {
      const { data, error } = await supabase
        .from('program_applications')
        .select(`
          *,
          profiles(full_name, mobile_number),
          businesses(business_name, business_category, business_location)
        `)
        .eq('program_id', programId);

      if (error) throw error;

      // Convert to CSV
      const csvContent = [
        ['Reference Number', 'Applicant Name', 'Email', 'Business Name', 'Category', 'Location', 'Status', 'Submitted Date'],
        ...data.map(app => [
          app.reference_number,
          app.profiles?.full_name || '',
          app.application_data?.email || '',
          app.businesses?.business_name || '',
          app.businesses?.business_category || '',
          app.businesses?.business_location || '',
          app.status,
          new Date(app.submitted_at).toLocaleDateString()
        ])
      ].map(row => row.join(',')).join('\n');

      // Download CSV
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

  const tabs = [
    { id: 'programs', name: 'Programs', icon: FileText },
    { id: 'analytics', name: 'Analytics', icon: BarChart3 },
    { id: 'applications', name: 'Applications', icon: Users }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading programs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center mb-4">
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Admin Dashboard</span>
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Program Management</h1>
                <p className="text-gray-600 mt-2">Manage training programs and accelerator initiatives</p>
              </div>
              <button
                onClick={() => setShowCreateForm(true)}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>New Program</span>
              </button>
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
        {activeTab === 'programs' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {programs.map(program => (
              <div key={program.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">{program.name}</h3>
                    <p className="text-gray-600 text-sm line-clamp-2">{program.description}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    program.status === 'active' ? 'bg-green-100 text-green-800' :
                    program.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {program.status}
                  </span>
                </div>

                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center justify-between">
                    <span>Applications:</span>
                    <span className="font-medium">{program.program_applications?.[0]?.count || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Enrolled:</span>
                    <span className="font-medium">{program.program_enrollments?.[0]?.count || 0}</span>
                  </div>
                  {program.application_deadline && (
                    <div className="flex items-center justify-between">
                      <span>Deadline:</span>
                      <span className="font-medium">{new Date(program.application_deadline).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  {program.application_link_id ? (
                    <div className="flex items-center space-x-2">
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
                    <button className="flex-1 py-2 px-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm flex items-center justify-center space-x-1">
                      <Edit className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                    <button className="flex-1 py-2 px-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm flex items-center justify-center space-x-1">
                      <Eye className="w-3 h-3" />
                      <span>View</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Program Analytics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600">{programs.length}</div>
                <div className="text-gray-600">Total Programs</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {programs.reduce((sum, p) => sum + (p.program_applications?.[0]?.count || 0), 0)}
                </div>
                <div className="text-gray-600">Total Applications</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {programs.reduce((sum, p) => sum + (p.program_enrollments?.[0]?.count || 0), 0)}
                </div>
                <div className="text-gray-600">Total Enrollments</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'applications' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Applications</h3>
            <p className="text-gray-600">Select a program to view its applications</p>
          </div>
        )}
      </div>

      {/* Create Program Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Program</h3>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              createProgram({
                name: formData.get('name'),
                description: formData.get('description'),
                status: formData.get('status'),
                start_date: formData.get('start_date') || null,
                end_date: formData.get('end_date') || null,
                max_participants: parseInt(formData.get('max_participants') as string) || null,
                application_deadline: formData.get('application_deadline') || null
              });
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Program Name</label>
                <input
                  name="name"
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                  onClick={() => setShowCreateForm(false)}
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
    </div>
  );
};

export default AdminProgramManagement;