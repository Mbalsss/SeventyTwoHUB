import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, FileText, CreditCard, Building } from 'lucide-react';

const SupportingDocuments: React.FC = () => {
  const navigate = useNavigate();
  const [uploadedFiles, setUploadedFiles] = useState({
    companyRegistration: null,
    idDocument: null,
    bankConfirmation: null,
    beeeCertificate: null
  });

  const handleFileUpload = (type: keyof typeof uploadedFiles, file: File | null) => {
    setUploadedFiles(prev => ({ ...prev, [type]: file }));
  };

  const handleNext = () => {
    // Update registration data
    const existingData = JSON.parse(localStorage.getItem('registrationData') || '{}');
    localStorage.setItem('registrationData', JSON.stringify({
      ...existingData,
      step3: uploadedFiles
    }));
    navigate('/register/application-type');
  };

  const handleSkip = () => {
    navigate('/register/application-type');
  };

  const FileUploadBox: React.FC<{ 
    title: string; 
    description: string; 
    icon: React.ReactNode; 
    type: string;
    required?: boolean;
  }> = ({ title, description, icon, type, required = false }) => (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-primary-400 transition-colors">
      <div className="text-center">
        <div className="flex justify-center mb-2">
          {icon}
        </div>
        <h4 className="font-medium text-gray-900 mb-1">
          {title} {required && <span className="text-red-500">*</span>}
        </h4>
        <p className="text-sm text-gray-600 mb-3">{description}</p>
        
        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={(e) => handleFileUpload(type, e.target.files?.[0] || null)}
          className="hidden"
          id={`upload-${type}`}
        />
        <label
          htmlFor={`upload-${type}`}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors cursor-pointer"
        >
          <Upload className="w-4 h-4" />
          <span>Choose File</span>
        </label>
        
        {uploadedFiles[type] && (
          <p className="text-sm text-green-600 mt-2">
            ✓ {(uploadedFiles[type] as File).name}
          </p>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate('/register/business')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-xl font-semibold text-gray-900 ml-4">Supporting Documents</h1>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="mb-6">
            <p className="text-gray-600 text-sm">
              Upload supporting documents to verify your business. You can skip this step and upload later.
            </p>
          </div>

          <div className="space-y-4">
            <FileUploadBox
              title="Company Registration"
              description="Business registration certificate or documents"
              icon={<Building className="w-8 h-8 text-gray-400" />}
              type="companyRegistration"
            />

            <FileUploadBox
              title="ID Document"
              description="Owner's identity document or passport"
              icon={<CreditCard className="w-8 h-8 text-gray-400" />}
              type="idDocument"
            />

            <FileUploadBox
              title="Bank Confirmation"
              description="Bank statement or business invoice"
              icon={<FileText className="w-8 h-8 text-gray-400" />}
              type="bankConfirmation"
            />
          </div>
            <FileUploadBox
              title="BEEE Certificate"
              description="Broad-Based Black Economic Empowerment certificate"
              icon={<FileText className="w-8 h-8 text-gray-400" />}
              type="beeeCertificate"
            />


          <div className="mt-8 space-y-3">
            <button
              onClick={handleNext}
              className="w-full py-3 bg-primary-500 text-white rounded-lg font-semibold hover:bg-primary-600 transition-colors"
            >
              Next
            </button>
            
            <button
              onClick={handleSkip}
              className="w-full py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Skip for Now
            </button>
          </div>

          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              Supported formats: PDF, JPG, PNG (Max 5MB each)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportingDocuments;