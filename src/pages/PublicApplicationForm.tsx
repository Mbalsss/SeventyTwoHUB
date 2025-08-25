import React, { useState, useEffect, useCallback } from 'react'; // **FIX 10: Import useCallback**
import { useParams, useNavigate } from 'react-router-dom';
import { TrendingUp, Upload, Send } from 'lucide-react';
import { getProgramByLinkId, submitProgramApplication } from '../lib/publicApplicationFormQueries';
import { useAuth } from '../context/AuthContext';
import { supabase } from "../supabaseClient";

// **FIX 1: Define an interface for the Program data**
interface Program {
  id: string;
  name: string;
  description: string;
  application_deadline?: string;
}

// **FIX 2: Define an interface for a single form field**
interface FormField {
  id: string;
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'file';
  label: string;
  required: boolean;
  options?: string[];
  placeholder?: string;
}

// **FIX 3: Define an interface for the entire Application Form structure**
interface ApplicationForm {
  id: string;
  program_id: string;
  is_active: boolean;
  form_config: {
    fields: FormField[];
  };
}

// **FIX 4: Define a type for the dynamic form data object**
type FormData = Record<string, string | number>;

const PublicApplicationForm: React.FC = () => {
  const { linkId } = useParams<{ linkId: string }>();
  const navigate = useNavigate();
  const { signUp } = useAuth();

  // **FIX 5: Use the new, specific interfaces instead of `any`**
  const [program, setProgram] = useState<Program | null>(null);
  const [applicationForm, setApplicationForm] = useState<ApplicationForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({});
  const [files, setFiles] = useState<Record<string, File>>({});

  // **FIX 11: Wrap the data loading function in useCallback**
  const loadProgramAndForm = useCallback(async () => {
    if (!linkId) return;

    try {
      setLoading(true);
      const programData = await getProgramByLinkId(linkId);
      setProgram(programData);

      if (!programData?.id) {
        throw new Error("Program data is invalid or missing ID.");
      }

      const { data: form, error: formError } = await supabase
        .from('application_forms')
        .select('*')
        .eq('program_id', programData.id)
        .eq('is_active', true)
        .maybeSingle();

      // **FIX 12: Refactored error handling to avoid "throw caught locally"**
      if (formError) {
        console.error('Error loading application form:', formError);
        alert('Could not load the application form. Please try again later.');
        navigate('/');
        return; // Exit function
      }
      
      if (!form) {
        console.error('No active application form found for this program');
        alert('No active application form found for this program.');
        navigate('/');
        return; // Exit function
      }
      
      setApplicationForm(form);

    } catch (error) {
      console.error('Error loading program:', error);
      alert('Program not found or no longer accepting applications.');
      navigate('/');
    } finally {
      setLoading(false);
    }
  }, [linkId, navigate]); // **FIX 13: Add dependencies for useCallback**

  // **FIX 14: Use the memoized function in useEffect**
  useEffect(() => {
    loadProgramAndForm();
  }, [loadProgramAndForm]);

  // **FIX 6: Use a more specific type for the value**
  const handleInputChange = (fieldId: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleFileChange = (fieldId: string, file: File | null) => {
    if (file) {
      setFiles(prev => ({ ...prev, [fieldId]: file }));
    } else {
      // Allow removing a file
      const newFiles = { ...files };
      delete newFiles[fieldId];
      setFiles(newFiles);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!program) {
      alert("Program data is missing. Cannot submit.");
      return;
    }

    setSubmitting(true);

    try {
      // **FIX 15: Refactored error handling to be more direct**
      const { user: authUser, error: authError } = await signUp(
        String(formData.email),
        String(formData.password) || `temp_${Date.now()}`,
        { full_name: String(formData.full_name), mobile_number: String(formData.mobile_number) }
      );

      if (authError || !authUser?.id) {
        throw authError || new Error('Failed to create user account. The email might already be in use.');
      }

      const { data: businessData, error: businessError } = await supabase
        .from('businesses')
        .insert({
          owner_id: authUser.id,
          business_name: formData.business_name,
          business_category: formData.business_category,
          business_location: formData.business_location,
          business_type: formData.business_type,
          number_of_employees: formData.number_of_employees,
          monthly_revenue: formData.monthly_revenue,
          years_in_operation: parseInt(String(formData.years_in_operation)) || 0,
          beee_level: formData.beee_level || 'not_certified'
        })
        .select()
        .single();

      if (businessError || !businessData) {
        throw businessError || new Error('Failed to create business record.');
      }

      const uploadedFiles: Record<string, string> = {};
      for (const [fieldId, file] of Object.entries(files)) {
        const fileName = `${authUser.id}/${fieldId}_${Date.now()}_${file.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('documents')
          .upload(fileName, file);

        if (uploadError || !uploadData) {
            throw uploadError || new Error(`Failed to upload file: ${file.name}`);
        }
        uploadedFiles[fieldId] = uploadData.path;
      }

      // Submit application
      await submitProgramApplication({
        program_id: program.id,
        applicant_id: authUser.id,
        business_id: businessData.id,
        application_data: {
          ...formData,
          uploaded_files: uploadedFiles
        }
      });

      alert('Application submitted successfully! You will receive an email confirmation shortly.');
      navigate('/login');

    } catch (error: any) {
      console.error('Error submitting application:', error);
      alert(`Error submitting application: ${error.message || 'Please check your details and try again.'}`);
    } finally {
      setSubmitting(false);
    }
  };

  // **FIX 7: Use the `FormField` interface for the field parameter**
  const renderField = (field: FormField) => {
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
            <span className="text-2xl font-bold text-gray-900">SeventyTwo X</span>
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
            {/* **FIX 8: Use the new interface, no `any` needed** */}
            {applicationForm.form_config.fields.map((field) => renderField(field))}

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