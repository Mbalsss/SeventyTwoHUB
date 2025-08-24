import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Filter, 
  ChevronDown,
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText,
  Download,
  Mail,
  Phone,
  MapPin,
  Building,
  User,
  AlertTriangle
} from 'lucide-react';
import { supabase, getBusinessRegistrations, updateRegistrationStatus } from '../../lib/supabase';

// ... (interface definition remains the same)

interface BusinessRegistration {
  id: string;
  full_name: string;
  email: string;
  mobile_number?: string;
  business_name: string;
  business_category: string;
  business_location: string;
  business_type: string;
  number_of_employees: string;
  monthly_revenue: string;
  years_in_operation: number;
  beee_level?: string;
  selected_services: string[];
  description?: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'requires_documents';
  submitted_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  review_notes?: string;
  reference_number: string;
  documents?: any[];
}


const BusinessRegistrationReview: React.FC = () => {
  const [registrations, setRegistrations] = useState<BusinessRegistration[]>([]);
  const [filteredRegistrations, setFilteredRegistrations] = useState<BusinessRegistration[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  const [selectedRegistration, setSelectedRegistration] = useState<BusinessRegistration | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [loading, setLoading] = useState(true);

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'under_review', label: 'Under Review' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'requires_documents', label: 'Requires Documents' },
  ];

  // Effect to handle clicks outside the filter dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  useEffect(() => {
    loadRegistrations();
  }, []);

  useEffect(() => {
    filterRegistrations();
  }, [registrations, searchTerm, selectedStatus]);

  const loadRegistrations = async () => {
    try {
      setLoading(true);
      
      const data = await getBusinessRegistrations();
      
      const registrationsWithDocs = await Promise.all(
        data.map(async (registration) => {
          const { data: documents } = await supabase
            .from('registration_documents')
            .select('*')
            .eq('registration_id', registration.id);
          
          return {
            ...registration,
            documents: documents || []
          };
        })
      );
      
      setRegistrations(registrationsWithDocs);
    } catch (error) {
      console.error('Error loading registrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterRegistrations = () => {
    let filtered = [...registrations];

    if (searchTerm) {
      const lowercasedTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(reg =>
        reg.business_name.toLowerCase().includes(lowercasedTerm) ||
        reg.full_name.toLowerCase().includes(lowercasedTerm) ||
        reg.email.toLowerCase().includes(lowercasedTerm) ||
        reg.reference_number.toLowerCase().includes(lowercasedTerm)
      );
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(reg => reg.status === selectedStatus);
    }

    setFilteredRegistrations(filtered);
  };

  const handleStatusUpdate = async (registrationId: string, status: string, notes?: string) => {
    try {
      await updateRegistrationStatus(registrationId, status, notes);
      await loadRegistrations();
      setShowReviewModal(false);
      setReviewNotes('');
      alert('Registration status updated successfully!');
    } catch (error) {
      console.error('Error updating registration status:', error);
      alert('Error updating registration status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'under_review': return 'bg-blue-100 text-blue-800';
      case 'requires_documents': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'under_review': return <Eye className="w-4 h-4 text-blue-600" />;
      case 'requires_documents': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'pending': return <Clock className="w-4 h-4 text-gray-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const exportRegistrations = async () => {
    try {
      const csvContent = [
        ['Reference', 'Business Name', 'Owner', 'Email', 'Category', 'Location', 'Status', 'Submitted'],
        ...filteredRegistrations.map(reg => [
          reg.reference_number,
          reg.business_name,
          reg.full_name,
          reg.email,
          reg.business_category,
          reg.business_location,
          reg.status,
          new Date(reg.submitted_at).toLocaleDateString()
        ])
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `business-registrations-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting registrations:', error);
      alert('Error exporting registrations');
    }
  };

  const handleFilterSelect = (status: string) => {
    setSelectedStatus(status);
    setIsFilterOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Business Registration Review</h2>
          <p className="text-gray-600">Review and approve business registration applications</p>
        </div>
        
        <button
          onClick={exportRegistrations}
          className="mt-4 sm:mt-0 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Pending', count: registrations.filter(r => r.status === 'pending').length, color: 'text-gray-600' },
          { label: 'Under Review', count: registrations.filter(r => r.status === 'under_review').length, color: 'text-blue-600' },
          { label: 'Approved', count: registrations.filter(r => r.status === 'approved').length, color: 'text-green-600' },
          { label: 'Rejected', count: registrations.filter(r => r.status === 'rejected').length, color: 'text-red-600' },
          { label: 'Need Docs', count: registrations.filter(r => r.status === 'requires_documents').length, color: 'text-yellow-600' }
        ].map((stat, index) => (
          <div key={index} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.count}</div>
            <div className="text-gray-600 text-sm">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="bg-gray-50 rounded-xl p-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, business, email, or reference..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          
          <div ref={filterRef} className="relative w-full md:w-auto">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="w-full md:w-auto flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 space-x-2"
            >
              <Filter className="w-4 h-4 text-gray-600" />
              <span className="text-gray-700">Filter by Status</span>
              {selectedStatus !== 'all' && (
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              )}
            </button>
            {isFilterOpen && (
              <div className="absolute top-full mt-2 w-full md:w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                <ul className="py-1">
                  {statusOptions.map(option => (
                     <li key={option.value}>
                       <button
                         onClick={() => handleFilterSelect(option.value)}
                         className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between ${
                           selectedStatus === option.value 
                             ? 'bg-blue-50 text-blue-600' 
                             : 'text-gray-700 hover:bg-gray-100'
                         }`}
                       >
                         {option.label}
                         {selectedStatus === option.value && (
                           <CheckCircle className="w-4 h-4 text-blue-500" />
                         )}
                       </button>
                     </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* ... (rest of the component JSX remains the same) ... */}

       {/* Registrations List */}
      <div className="space-y-4">
        {filteredRegistrations.map(registration => (
          <div key={registration.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="font-semibold text-gray-900">{registration.business_name}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full inline-flex items-center ${getStatusColor(registration.status)}`}>
                    {getStatusIcon(registration.status)}
                    <span className="ml-1.5">{registration.status.replace(/_/g, ' ').toUpperCase()}</span>
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                  <div className="flex items-center space-x-2 truncate">
                    <User className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{registration.full_name}</span>
                  </div>
                  <div className="flex items-center space-x-2 truncate">
                    <Mail className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{registration.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 flex-shrink-0" />
                    <span>{registration.mobile_number || 'N/A'}</span>
                  </div>
                  <div className="flex items-center space-x-2 truncate">
                    <Building className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{registration.business_category}</span>
                  </div>
                  <div className="flex items-center space-x-2 truncate">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{registration.business_location}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 flex-shrink-0" />
                    <span>{registration.documents?.length || 0} documents</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>Ref: {registration.reference_number}</span>
                  <span>Submitted: {new Date(registration.submitted_at).toLocaleDateString()}</span>
                  {registration.reviewed_at && (
                    <span>Reviewed: {new Date(registration.reviewed_at).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
              
              <div className="flex space-x-2 ml-4">
                <button
                  onClick={() => {
                    setSelectedRegistration(registration);
                    setReviewNotes(registration.review_notes || '');
                    setShowReviewModal(true);
                  }}
                  className="px-3 py-1 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm flex items-center space-x-1.5"
                >
                  <Eye className="w-4 h-4" />
                  <span>Review</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedRegistration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Review: {selectedRegistration.business_name}</h3>
              <button
                onClick={() => setShowReviewModal(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium text-gray-800 mb-3 border-b pb-2">Business Information</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between"><span className="font-medium text-gray-600">Name:</span> <span className="text-gray-800 text-right">{selectedRegistration.business_name}</span></div>
                    <div className="flex justify-between"><span className="font-medium text-gray-600">Category:</span> <span className="text-gray-800 text-right">{selectedRegistration.business_category}</span></div>
                    <div className="flex justify-between"><span className="font-medium text-gray-600">Location:</span> <span className="text-gray-800 text-right">{selectedRegistration.business_location}</span></div>
                    <div className="flex justify-between"><span className="font-medium text-gray-600">Type:</span> <span className="text-gray-800 text-right">{selectedRegistration.business_type}</span></div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-800 mb-3 border-b pb-2">Owner Information</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between"><span className="font-medium text-gray-600">Full Name:</span> <span className="text-gray-800 text-right">{selectedRegistration.full_name}</span></div>
                    <div className="flex justify-between"><span className="font-medium text-gray-600">Email:</span> <span className="text-gray-800 text-right">{selectedRegistration.email}</span></div>
                    <div className="flex justify-between"><span className="font-medium text-gray-600">Mobile:</span> <span className="text-gray-800 text-right">{selectedRegistration.mobile_number || 'N/A'}</span></div>
                  </div>
                </div>
                
                 {/* Selected Services */}
                {selectedRegistration.selected_services.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-800 mb-3 border-b pb-2">Selected Services</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedRegistration.selected_services.map((service, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium text-gray-800 mb-3 border-b pb-2">Business Metrics</h4>
                   <div className="space-y-3 text-sm">
                    <div className="flex justify-between"><span className="font-medium text-gray-600">Employees:</span> <span className="text-gray-800 text-right">{selectedRegistration.number_of_employees}</span></div>
                    <div className="flex justify-between"><span className="font-medium text-gray-600">Monthly Revenue:</span> <span className="text-gray-800 text-right">{selectedRegistration.monthly_revenue}</span></div>
                    <div className="flex justify-between"><span className="font-medium text-gray-600">Years in Operation:</span> <span className="text-gray-800 text-right">{selectedRegistration.years_in_operation}</span></div>
                    {selectedRegistration.beee_level && (
                      <div className="flex justify-between"><span className="font-medium text-gray-600">B-BBEE Level:</span> <span className="text-gray-800 text-right">Level {selectedRegistration.beee_level}</span></div>
                    )}
                  </div>
                </div>

                {/* Documents */}
                <div>
                  <h4 className="font-medium text-gray-800 mb-3 border-b pb-2">Uploaded Documents</h4>
                  {selectedRegistration.documents && selectedRegistration.documents.length > 0 ? (
                    <div className="space-y-2">
                      {selectedRegistration.documents.map((doc, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <FileText className="w-4 h-4 text-gray-600" />
                            <span className="text-sm text-gray-900">{doc.document_type}</span>
                          </div>
                          <a
                            href={doc.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                          >
                            View
                          </a>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No documents uploaded.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            {selectedRegistration.description && (
              <div className="mt-6">
                <h4 className="font-medium text-gray-800 mb-2 border-b pb-2">Description</h4>
                <p className="text-gray-700 bg-gray-50 rounded-lg p-3 text-sm">{selectedRegistration.description}</p>
              </div>
            )}

            {/* Review Notes */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Review Notes (for internal use)</label>
              <textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Add notes about this registration..."
              />
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-4 border-t border-gray-200">
              <button onClick={() => handleStatusUpdate(selectedRegistration.id, 'approved', reviewNotes)} className="py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center space-x-2"><CheckCircle className="w-4 h-4" /><span>Approve</span></button>
              <button onClick={() => handleStatusUpdate(selectedRegistration.id, 'under_review', reviewNotes)} className="py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">Set to Review</button>
              <button onClick={() => handleStatusUpdate(selectedRegistration.id, 'requires_documents', reviewNotes)} className="py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors">Need Docs</button>
              <button onClick={() => handleStatusUpdate(selectedRegistration.id, 'rejected', reviewNotes || 'Application rejected')} className="py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center space-x-2"><XCircle className="w-4 h-4" /><span>Reject</span></button>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="text-center py-8">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading registrations...</p>
        </div>
      )}

      {!loading && filteredRegistrations.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Registrations Found</h3>
          <p className="text-gray-600">No applications match your current search and filter criteria.</p>
        </div>
      )}
    </div>
  );
};

export default BusinessRegistrationReview;