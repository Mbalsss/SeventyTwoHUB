import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TrendingUp, Upload, User, Building, Mail, Phone, MapPin, FileText, Send } from 'lucide-react';
import { getProgramByLinkId, submitProgramApplication } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { supabase } from "../supabaseClient";


const PublicApplicationForm: React.FC = () => {
  const { linkId } = useParams<{ linkId: string }>();
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [program, setProgram] = useState<any>(null);
  const [applicationForm, setApplicationForm] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [files, setFiles] = useState<{ [key: string]: File }>({});

  useEffect(() => {
    if (linkId) {
      loadProgramAndForm();
    }
  }, [linkId]);

  const loadProgramAndForm = async () => {
    try {
      setLoading(true);
      
      // Get program by link ID
      const programData = await getProgramByLinkId(linkId!);
      setProgram(programData);

      // Get application form for this program
      const { data: formData, error: formError } = await supabase
        .from('application_forms')
        .select('*')
        .eq('program_id', programData.id)
        .eq('is_active', true)
        .single();

      if (formError) throw formError;
      setApplicationForm(formData);

    } catch (error) {
      console.error('Error loading program:', error);
      alert('Program not found or no longer accepting applications.');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleFileChange = (fieldId: string, file: File | null) => {
    if (file) {
      setFiles(prev => ({ ...prev, [fieldId]: file }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // First, create a user account if they don't have one
      const { user: authUser, error: authError } = await signUp(
        formData.email,
        formData.password || `temp_${Date.now()}`, // Temporary password
        {
          full_name: formData.full_name,
          mobile_number: formData.mobile_number
        }
      );

      if (authError) throw authError;

      const userId = authUser?.id;
      if (!userId) throw new Error('Failed to create user account');

      // Create business record
      const { data: businessData, error: businessError } = await supabase
        .from('businesses')
        .insert({
          owner_id: userId,
          business_name: formData.business_name,
          business_category: formData.business_category,
          business_location: formData.business_location,
          business_type: formData.business_type,
          number_of_employees: formData.number_of_employees,
          monthly_revenue: formData.monthly_revenue,
          years_in_operation: parseInt(formData.years_in_operation) || 0,
          beee_level: formData.beee_level || 'not_certified'
        })
        .select()
        .single();

      if (businessError) throw businessError;

      // Upload files if any
      const uploadedFiles: { [key: string]: string } = {};
      for (const [fieldId, file] of Object.entries(files)) {
        const fileName = `${userId}/${fieldId}_${Date.now()}_${file.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('documents')
          .upload(fileName, file);

        if (uploadError) throw uploadError;
        uploadedFiles[fieldId] = uploadData.path;
      }

      // Submit application
      await submitProgramApplication({
        program_id: program.id,
        applicant_id: userId,
        business_id: businessData.id,
        application_data: {
          ...formData,
          uploaded_files: uploadedFiles
        }
      });

      alert('Application submitted successfully! You will receive an email confirmation shortly.');
      navigate('/login');

    } catch (error) {
      console.error('Error submitting application:', error);
      alert('Error submitting application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (field: any) => {
    const { id, type, label, required, options, placeholder } = field;

    switch (type) {
      case 'text':
      case 'email':
      case 'tel':
        return (
          <div key={id}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {label} {required && <span className="text-red-500">*</span>}
            </label>
            <input
              type={type}
              value={formData[id] || ''}
              onChange={(e) => handleInputChange(id, e.target.value)}
              placeholder={placeholder}
              required={required}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        );

      case 'textarea':
        return (
          <div key={id}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {label} {required && <span className="text-red-500">*</span>}
            </label>
            <textarea
              value={formData[id] || ''}
              onChange={(e) => handleInputChange(id, e.target.value)}
              placeholder={placeholder}
              required={required}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            />
          </div>
        );

      case 'select':
        return (
          <div key={id}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {label} {required && <span className="text-red-500">*</span>}
            </label>
            <select
              value={formData[id] || ''}
              onChange={(e) => handleInputChange(id, e.target.value)}
              required={required}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Select {label}</option>
              {options?.map((option: string) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        );

      case 'file':
        return (
          <div key={id}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {label} {required && <span className="text-red-500">*</span>}
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-primary-400 transition-colors">
              <div className="text-center">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <input
                  type="file"
                  onChange={(e) => handleFileChange(id, e.target.files?.[0] || null)}
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  required={required}
                  className="hidden"
                  id={`file-${id}`}
                />
                <label
                  htmlFor={`file-${id}`}
                  className="cursor-pointer text-primary-600 hover:text-primary-700"
                >
                  Click to upload {label}
                </label>
                {files[id] && (
                  <p className="text-sm text-green-600 mt-2">✓ {files[id].name}</p>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading application form...</p>
        </div>
      </div>
    );
  }

  if (!program || !applicationForm) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Program Not Found</h1>
          <p className="text-gray-600">This application link is invalid or no longer active.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <TrendingUp className="w-8 h-8 text-primary-500" />
            <span className="text-2xl font-bold text-gray-900">BizBoost Hub</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{program.name}</h1>
          <p className="text-gray-600">{program.description}</p>
          
          {program.application_deadline && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm">
                <strong>Application Deadline:</strong> {new Date(program.application_deadline).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>

        {/* Application Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {applicationForm.form_config.fields.map((field: any) => renderField(field))}

            <div className="pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-primary-500 text-white rounded-lg font-semibold hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Submit Application</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            Need help? Contact us at{' '}
            <a href="mailto:support@bizboost.co.za" className="text-primary-600 hover:text-primary-700">
              support@bizboost.co.za
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PublicApplicationForm;