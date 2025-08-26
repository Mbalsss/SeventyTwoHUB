import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Lock, Eye, EyeOff, Shield, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

interface BusinessApplication {
    id: string;
    reference_number: string;
    full_name: string;
    email: string;
    business_name: string;
    status: string;
    account_created: boolean;
}

const CreateAccountWithValidation: React.FC = () => {
    const navigate = useNavigate();
    const { signUp } = useAuth();
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [validatingRef, setValidatingRef] = useState(false);
    const [application, setApplication] = useState<BusinessApplication | null>(null);

    const [referenceData, setReferenceData] = useState({
        referenceNumber: '',
        email: ''
    });

    const [accountData, setAccountData] = useState({
        password: '',
        confirmPassword: '',
        acceptTerms: false
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const handleReferenceInputChange = (field: string, value: string) => {
        setReferenceData(prev => ({ ...prev, [field]: value }));
        // Clear errors when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const handleAccountInputChange = (field: string, value: string | boolean) => {
        setAccountData(prev => ({ ...prev, [field]: value }));
        // Clear errors when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const validateReferenceNumber = async () => {
        if (!referenceData.referenceNumber.trim()) {
            setErrors({ referenceNumber: 'Application reference number is required' });
            return false;
        }

        if (!referenceData.email.trim()) {
            setErrors({ email: 'Email address is required' });
            return false;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(referenceData.email)) {
            setErrors({ email: 'Please enter a valid email address' });
            return false;
        }

        setValidatingRef(true);
        setErrors({});

        try {
            // Check if the reference number exists and get application details
            const { data: applicationData, error: appError } = await supabase
                .from('business_registrations')
                .select('*')
                .eq('reference_number', referenceData.referenceNumber.trim())
                .eq('email', referenceData.email.trim().toLowerCase())
                .maybeSingle();

            if (appError) {
                console.error('Error validating reference number:', appError);
                setErrors({ general: 'Error validating application. Please try again.' });
                return false;
            }

            if (!applicationData) {
                setErrors({
                    referenceNumber: 'Invalid reference number or email. Please check your details and try again.'
                });
                return false;
            }

            // Check if application is approved
            if (applicationData.status !== 'approved') {
                const statusMessages = {
                    'pending': 'Your application is still pending review. Please wait for approval before creating an account.',
                    'under_review': 'Your application is currently under review. Please wait for approval before creating an account.',
                    'rejected': 'Your application has been rejected. Please contact support for more information.',
                    'requires_documents': 'Your application requires additional documents. Please submit them before creating an account.'
                };

                setErrors({
                    general: statusMessages[applicationData.status] || 'Your application is not yet approved for account creation.'
                });
                return false;
            }

            // Check if an account has already been created for this application
            const { data: existingProfile, error: profileError } = await supabase
                .from('profiles')
                .select('id')
                .eq('email', applicationData.email)
                .maybeSingle();

            if (profileError && profileError.code !== 'PGRST116') {
                console.error('Error checking existing profile:', profileError);
                setErrors({ general: 'Error validating application. Please try again.' });
                return false;
            }

            if (existingProfile) {
                setErrors({
                    general: 'An account has already been created for this application. Please try logging in instead.'
                });
                return false;
            }

            // Check if reference number has been used (additional safety check)
            const { data: usedRef, error: refError } = await supabase
                .from('business_registrations')
                .select('id')
                .eq('reference_number', referenceData.referenceNumber.trim())
                .not('reviewed_by', 'is', null) // Has been processed
                .maybeSingle();

            if (refError && refError.code !== 'PGRST116') {
                console.error('Error checking reference usage:', refError);
                setErrors({ general: 'Error validating application. Please try again.' });
                return false;
            }

            // Set application data and proceed to next step
            setApplication({
                id: applicationData.id,
                reference_number: applicationData.reference_number,
                full_name: applicationData.full_name,
                email: applicationData.email,
                business_name: applicationData.business_name,
                status: applicationData.status,
                account_created: false
            });

            return true;

        } catch (error) {
            console.error('Unexpected error validating reference:', error);
            setErrors({ general: 'An unexpected error occurred. Please try again.' });
            return false;
        } finally {
            setValidatingRef(false);
        }
    };

    const handleReferenceSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const isValid = await validateReferenceNumber();
        if (isValid) {
            setCurrentStep(2);
        }
    };

    const validateAccountCreation = (): boolean => {
        const newErrors: { [key: string]: string } = {};

        if (!accountData.password) {
            newErrors.password = 'Password is required';
        } else if (accountData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters long';
        }

        if (!accountData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (accountData.password !== accountData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        if (!accountData.acceptTerms) {
            newErrors.acceptTerms = 'You must accept the terms and conditions';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleAccountCreation = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateAccountCreation() || !application) {
            return;
        }

        setLoading(true);
        setErrors({});

        try {
            // Create user account
            const { user, error: signUpError } = await signUp(
                application.email,
                accountData.password,
                {
                    full_name: application.full_name,
                    application_reference: application.reference_number,
                    business_name: application.business_name
                }
            );

            if (signUpError) {
                console.error('Account creation error:', signUpError);

                if (signUpError.message?.includes('already registered') ||
                    signUpError.message?.includes('User already registered')) {
                    setErrors({ general: 'An account with this email already exists. Please try logging in instead.' });
                    return;
                }

                setErrors({ general: signUpError.message || 'Error creating account. Please try again.' });
                return;
            }

            if (user) {
                // Mark the business registration as having an account created
                await supabase
                    .from('business_registrations')
                    .update({
                        updated_at: new Date().toISOString(),
                        review_notes: `Account created for user ${user.id} on ${new Date().toISOString()}`
                    })
                    .eq('id', application.id);

                // Create business record linked to the user
                await supabase
                    .from('businesses')
                    .insert({
                        owner_id: user.id,
                        business_name: application.business_name,
                        business_category: 'General', // Will be updated from registration data
                        business_location: 'South Africa', // Will be updated from registration data
                        business_type: 'formal',
                        number_of_employees: '1-10',
                        monthly_revenue: 'R0 - R5,000',
                        years_in_operation: 1
                    });

                alert('Account created successfully! You can now log in to access your dashboard.');
                navigate('/login');
            }

        } catch (error) {
            console.error('Unexpected error during account creation:', error);
            setErrors({ general: 'An unexpected error occurred. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-md mx-auto">
                <div className="flex items-center mb-6">
                    <button
                        onClick={() => currentStep === 1 ? navigate('/welcome') : setCurrentStep(1)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <h1 className="text-xl font-semibold text-gray-900 ml-4">Create Account</h1>
                </div>

                {/* Progress Indicator */}
                <div className="flex items-center justify-center mb-6">
                    <div className="flex items-center space-x-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            currentStep >= 1 ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-600'
                        }`}>
                            1
                        </div>
                        <div className={`w-16 h-1 ${currentStep >= 2 ? 'bg-primary-500' : 'bg-gray-200'}`} />
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            currentStep >= 2 ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-600'
                        }`}>
                            2
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    {/* Step 1: Reference Number Validation */}
                    {currentStep === 1 && (
                        <div>
                            <div className="text-center mb-6">
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <FileText className="w-6 h-6 text-blue-600" />
                                </div>
                                <h2 className="text-lg font-semibold text-gray-900 mb-2">Verify Your Application</h2>
                                <p className="text-sm text-gray-600">
                                    Enter your approved business application details to create your account
                                </p>
                            </div>

                            {/* Global Error Display */}
                            {errors.general && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                                    <div className="flex items-center space-x-2">
                                        <AlertCircle className="w-5 h-5 text-red-600" />
                                        <p className="text-red-800 text-sm">{errors.general}</p>
                                    </div>
                                </div>
                            )}

                            <form onSubmit={handleReferenceSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Application Reference Number <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={referenceData.referenceNumber}
                                        onChange={(e) => handleReferenceInputChange('referenceNumber', e.target.value.toUpperCase())}
                                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono ${
                                            errors.referenceNumber ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                        }`}
                                        placeholder="REF-XXXXXXXXX-XXXXX"
                                        required
                                    />
                                    {errors.referenceNumber && (
                                        <p className="text-red-600 text-sm mt-1">{errors.referenceNumber}</p>
                                    )}
                                    <p className="text-xs text-gray-500 mt-1">
                                        This was provided when you submitted your business application
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email Address <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        value={referenceData.email}
                                        onChange={(e) => handleReferenceInputChange('email', e.target.value.toLowerCase())}
                                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                                            errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                        }`}
                                        placeholder="Enter the email used in your application"
                                        required
                                    />
                                    {errors.email && (
                                        <p className="text-red-600 text-sm mt-1">{errors.email}</p>
                                    )}
                                    <p className="text-xs text-gray-500 mt-1">
                                        Must match the email address used in your business application
                                    </p>
                                </div>

                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <div className="flex items-start space-x-3">
                                        <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                                        <div>
                                            <h4 className="font-medium text-blue-900">Security Check</h4>
                                            <p className="text-sm text-blue-700 mt-1">
                                                We'll verify that your business application has been approved and hasn't been used to create an account yet.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={validatingRef}
                                    className="w-full py-3 bg-primary-500 text-white rounded-lg font-semibold hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                                >
                                    {validatingRef ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                            Validating Application...
                                        </>
                                    ) : (
                                        'Verify & Continue'
                                    )}
                                </button>
                            </form>

                            <div className="mt-6 text-center">
                                <p className="text-sm text-gray-600 mb-2">
                                    Don't have an application reference number?
                                </p>
                                <button
                                    onClick={() => navigate('/register/business')}
                                    className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                                >
                                    Submit Business Application First
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Account Creation */}
                    {currentStep === 2 && application && (
                        <div>
                            <div className="text-center mb-6">
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <CheckCircle className="w-6 h-6 text-green-600" />
                                </div>
                                <h2 className="text-lg font-semibold text-gray-900 mb-2">Application Verified!</h2>
                                <p className="text-sm text-gray-600">
                                    Create your login credentials to access your business dashboard
                                </p>
                            </div>

                            {/* Application Summary */}
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                                <h4 className="font-medium text-green-900 mb-2">Approved Application</h4>
                                <div className="space-y-1 text-sm text-green-800">
                                    <p><strong>Business:</strong> {application.business_name}</p>
                                    <p><strong>Owner:</strong> {application.full_name}</p>
                                    <p><strong>Reference:</strong> {application.reference_number}</p>
                                </div>
                            </div>

                            {/* Global Error Display */}
                            {errors.general && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                                    <div className="flex items-center space-x-2">
                                        <AlertCircle className="w-5 h-5 text-red-600" />
                                        <p className="text-red-800 text-sm">{errors.general}</p>
                                    </div>
                                </div>
                            )}

                            <form onSubmit={handleAccountCreation} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        value={application.email}
                                        disabled
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        This email will be used for your login
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Password <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={accountData.password}
                                            onChange={(e) => handleAccountInputChange('password', e.target.value)}
                                            className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                                                errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                            }`}
                                            placeholder="Create a strong password"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    {errors.password && (
                                        <p className="text-red-600 text-sm mt-1">{errors.password}</p>
                                    )}
                                    <p className="text-xs text-gray-500 mt-1">
                                        Must be at least 6 characters long
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Confirm Password <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            value={accountData.confirmPassword}
                                            onChange={(e) => handleAccountInputChange('confirmPassword', e.target.value)}
                                            className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                                                errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                            }`}
                                            placeholder="Confirm your password"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    {errors.confirmPassword && (
                                        <p className="text-red-600 text-sm mt-1">{errors.confirmPassword}</p>
                                    )}
                                </div>

                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                    <label className="flex items-start space-x-3">
                                        <input
                                            type="checkbox"
                                            checked={accountData.acceptTerms}
                                            onChange={(e) => handleAccountInputChange('acceptTerms', e.target.checked)}
                                            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 mt-0.5"
                                            required
                                        />
                                        <div>
                      <span className="text-sm font-medium text-gray-900">
                        I accept the Terms and Conditions <span className="text-red-500">*</span>
                      </span>
                                            <p className="text-xs text-gray-600 mt-1">
                                                By creating an account, you agree to our{' '}
                                                <a href="#" className="text-primary-600 hover:text-primary-700">Terms of Service</a>
                                                {' '}and{' '}
                                                <a href="#" className="text-primary-600 hover:text-primary-700">Privacy Policy</a>
                                            </p>
                                        </div>
                                    </label>
                                    {errors.acceptTerms && (
                                        <p className="text-red-600 text-sm mt-2">{errors.acceptTerms}</p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 bg-primary-500 text-white rounded-lg font-semibold hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                            Creating Account...
                                        </>
                                    ) : (
                                        <>
                                            <User className="w-5 h-5 mr-2" />
                                            Create My Account
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    )}
                </div>

                {/* Help Section */}
                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-500 mb-2">
                        Need help with your application?
                    </p>
                    <div className="space-y-1">
                        <p className="text-xs text-gray-500">
                            Email: <a href="mailto:support@hapotech.co.za" className="text-primary-600 hover:text-primary-700">support@hapotech.co.za</a>
                        </p>
                        <p className="text-xs text-gray-500">
                            Phone: <a href="tel:+27123456789" className="text-primary-600 hover:text-primary-700">+27 12 345 6789</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateAccountWithValidation;