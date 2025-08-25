import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Upload, BookOpen, MessageSquare, Copy } from 'lucide-react';
import { submitBusinessRegistration, uploadRegistrationDocument, supabase } from '../../lib/supabase'



const Confirmation: React.FC = () => {
  const navigate = useNavigate();
  const [applicationNumber, setApplicationNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    submitRegistration();
  }, []);

  const submitRegistration = async () => {
    try {
      setIsSubmitting(true);
      const registrationData = JSON.parse(localStorage.getItem('registrationData') || '{}');
      
      // Prepare data for submission
      const submissionData = {
        full_name: registrationData.step1?.fullName || '',
        email: registrationData.step1?.emailAddress || '',
        mobile_number: registrationData.step1?.mobileNumber || '',
        business_name: registrationData.step2?.businessName || '',
        business_category: registrationData.step2?.businessCategory || '',
        business_location: registrationData.step2?.businessLocation || '',
        business_type: registrationData.step2?.businessType || 'informal',
        number_of_employees: registrationData.step2?.numberOfEmployees || '',
        monthly_revenue: registrationData.step2?.monthlyRevenue || '',
        years_in_operation: parseInt(registrationData.step2?.yearsInOperation) || 0,
        beee_level: registrationData.step2?.beeeLevel || 'not_certified',
        selected_services: registrationData.step4?.selectedTypes || [],
        description: registrationData.step4?.description || ''
      };

      // Submit to database
      const result = await submitBusinessRegistration(submissionData);
      
      if (!result) {
        throw new Error('Failed to submit registration');
      }
      
      setApplicationNumber(result.reference_number);
      
      // Create program applications for selected programs
      if (registrationData.step4?.selectedPrograms) {
        for (const program of registrationData.step4.selectedPrograms) {
          try {
            await supabase
              .from('program_applications')
              .insert({
                program_id: program.id,
                applicant_id: result.id, // Use registration ID as temporary applicant ID
                application_data: {
                  ...submissionData,
                  program_name: program.name,
                  application_source: 'business_registration'
                },
                status: 'submitted'
              });
          } catch (appError) {
            console.error(`Error creating application for program ${program.name}:`, appError);
          }
        }
      }
      
      // Upload documents if any were provided
      if (registrationData.step3) {
        const documents = registrationData.step3;
        for (const [docType, file] of Object.entries(documents)) {
          if (file) {
            try {
              await uploadRegistrationDocument(result.id, docType, file as File);
            } catch (docError) {
              console.error(`Error uploading ${docType}:`, docError);
            }
          }
        }
      }
      
      // Store application data with reference number
      localStorage.setItem('applicationData', JSON.stringify({
        ...registrationData,
        applicationNumber: result.reference_number,
        status: 'Pending Review',
        submittedAt: result.submitted_at
      }));
      
    } catch (error) {
      console.error('Error submitting registration:', error);
      alert('Error submitting registration. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  const copyToClipboard = () => {
    navigator.clipboard.writeText(applicationNumber);
    alert('Application number copied to clipboard!');
  };

  const goToDashboard = () => {
    // Clear registration data and redirect to login
    localStorage.removeItem('registrationData');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Thank you for registering!</h1>
            <p className="text-gray-600">Your business registration has been submitted for review.</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">Application Reference Number</h3>
            <div className="flex items-center justify-center space-x-2">
              <span className="text-lg font-mono text-primary-600">
                {isSubmitting ? 'Generating...' : applicationNumber}
              </span>
              <button
                onClick={copyToClipboard}
                disabled={isSubmitting || !applicationNumber}
                className="p-1 hover:bg-gray-200 rounded transition-colors"
                title="Copy to clipboard"
              >
                <Copy className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>

          <div className="text-left mb-8">
            <h3 className="font-semibold text-gray-900 mb-3">What happens next?</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start space-x-2">
                <span className="text-primary-500 mt-1">•</span>
                <span>We'll review your application within 2-3 business days</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-primary-500 mt-1">•</span>
                <span>You'll receive an email notification once approved</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-primary-500 mt-1">•</span>
                <span>Access to selected services will be activated</span>
              </li>
            </ul>
          </div>

          <button
            onClick={goToDashboard}
            className="w-full py-3 bg-primary-500 text-white rounded-lg font-semibold hover:bg-primary-600 transition-colors mb-4"
          >
            Go to Login
          </button>

          <div className="grid grid-cols-3 gap-2">
            <button className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Upload className="w-5 h-5 text-gray-600 mx-auto mb-1" />
              <span className="text-xs text-gray-600">Upload Documents</span>
            </button>
            <button className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <BookOpen className="w-5 h-5 text-gray-600 mx-auto mb-1" />
              <span className="text-xs text-gray-600">Resources</span>
            </button>
            <button className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <MessageSquare className="w-5 h-5 text-gray-600 mx-auto mb-1" />
              <span className="text-xs text-gray-600">Messages</span>
            </button>
          </div>
        </div>

        <div className="mt-6 text-center">
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

export default Confirmation;