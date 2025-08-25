import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, TrendingUp, Shield, AlertCircle, User, Phone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logoSvg from '../assets/seventytwo-logo.svg';

type FormMode = 'login' | 'signup';

const UnifiedLogin: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { signIn, signUp, loading: authLoading } = useAuth();

    const [formMode, setFormMode] = useState<FormMode>('login');
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        fullName: '',
        mobileNumber: '',
        rememberMe: false
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [loginAttempts, setLoginAttempts] = useState(0);
    const [isRateLimited, setIsRateLimited] = useState(false);

    // Security configuration
    const MAX_LOGIN_ATTEMPTS = 5;
    const RATE_LIMIT_DURATION = 15 * 60 * 1000; // 15 minutes
    const LOCKOUT_MESSAGE = 'Account temporarily locked due to multiple failed attempts. Please try again later.';

    const handleInputChange = (field: keyof typeof formData, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        // Clear field-specific errors when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    // Comprehensive client-side validation
    const validateForm = (): boolean => {
        const newErrors: { [key: string]: string } = {};

        // Email validation
        if (!formData.email.trim()) {
            newErrors.email = 'Email address is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        // Password validation
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters long';
        }

        // Signup-specific validation
        if (formMode === 'signup') {
            if (!formData.fullName.trim()) {
                newErrors.fullName = 'Full name is required';
            } else if (formData.fullName.trim().length < 2) {
                newErrors.fullName = 'Full name must be at least 2 characters long';
            }

            if (!formData.confirmPassword) {
                newErrors.confirmPassword = 'Please confirm your password';
            } else if (formData.password !== formData.confirmPassword) {
                newErrors.confirmPassword = 'Passwords do not match';
            }

            if (formData.mobileNumber && !/^(\+27|0)[0-9]{9}$/.test(formData.mobileNumber.replace(/\s/g, ''))) {
                newErrors.mobileNumber = 'Please enter a valid South African mobile number';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Rate limiting protection
    const checkRateLimit = (): boolean => {
        const lastAttemptTime = localStorage.getItem('lastLoginAttempt');
        const attemptCount = parseInt(localStorage.getItem('loginAttempts') || '0');

        if (lastAttemptTime && attemptCount >= MAX_LOGIN_ATTEMPTS) {
            const timeSinceLastAttempt = Date.now() - parseInt(lastAttemptTime);
            if (timeSinceLastAttempt < RATE_LIMIT_DURATION) {
                setIsRateLimited(true);
                const remainingTime = Math.ceil((RATE_LIMIT_DURATION - timeSinceLastAttempt) / 60000);
                setErrors({ general: `${LOCKOUT_MESSAGE} Time remaining: ${remainingTime} minutes.` });
                return false;
            } else {
                // Reset rate limiting after timeout
                localStorage.removeItem('loginAttempts');
                localStorage.removeItem('lastLoginAttempt');
                setIsRateLimited(false);
                setLoginAttempts(0);
            }
        }

        return true;
    };

    // Update login attempts tracking
    const updateLoginAttempts = (success: boolean) => {
        if (success) {
            // Clear attempts on successful login
            localStorage.removeItem('loginAttempts');
            localStorage.removeItem('lastLoginAttempt');
            setLoginAttempts(0);
            setIsRateLimited(false);
        } else {
            // Increment attempts on failure
            const newAttempts = loginAttempts + 1;
            setLoginAttempts(newAttempts);
            localStorage.setItem('loginAttempts', newAttempts.toString());
            localStorage.setItem('lastLoginAttempt', Date.now().toString());

            // Check if we've hit the limit
            if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
                setIsRateLimited(true);
                setErrors({ general: LOCKOUT_MESSAGE });
            }
        }
    };

    // Secure role-based redirection
    const routeToDashboard = (userType: 'admin' | 'participant') => {
        const from = location.state?.from?.pathname;

        // Determine appropriate dashboard based on user role
        let targetPath: string;

        if (userType === 'admin') {
            targetPath = '/admin/dashboard';
        } else {
            targetPath = '/dashboard';
        }

        // If user was trying to access a specific page, redirect there if authorized
        if (from && from !== '/login' && from !== '/') {
            if (userType === 'admin' && from.startsWith('/admin/')) {
                targetPath = from;
            } else if (userType === 'participant' && from.startsWith('/dashboard/')) {
                targetPath = from;
            }
        }

        console.log('UnifiedLogin - Secure redirection:', { userType, targetPath, from });
        navigate(targetPath, { replace: true });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isLoading || authLoading) return;

        // Clear previous errors
        setErrors({});

        // Client-side validation
        if (!validateForm()) {
            return;
        }

        // Rate limiting check
        if (!checkRateLimit()) {
            return;
        }

        if (formMode === 'signup') {
            await handleSignUp();
        } else {
            await handleLogin();
        }
    };

    const handleLogin = async () => {
        setIsLoading(true);
        const email = formData.email.trim().toLowerCase();
        const password = formData.password;

        try {
            console.log('UnifiedLogin - Authentication attempt for:', email);

            // Attempt authentication
            const { userType, error } = await signIn(email, password);

            if (error) {
                console.warn('UnifiedLogin - Authentication failed:', error.message);

                // Generic error messages to prevent information leakage
                if (error.message?.includes('Invalid login credentials') ||
                    error.message?.includes('Invalid email or password') ||
                    error.message?.includes('Email not confirmed') ||
                    error.message?.includes('User not found')) {
                    setErrors({ general: 'Invalid email or password. Please check your credentials and try again.' });
                } else if (error.message?.includes('Too many requests') ||
                    error.message?.includes('rate limit')) {
                    setErrors({ general: 'Too many login attempts. Please wait before trying again.' });
                } else if (error.message?.includes('Email already in use') ||
                    error.message?.includes('already registered')) {
                    setErrors({ general: 'An account with this email already exists. Please try logging in.' });
                    setFormMode('login');
                } else {
                    // Generic fallback to prevent information leakage
                    setErrors({ general: 'Authentication failed. Please check your credentials and try again.' });
                }

                updateLoginAttempts(false);
                return;
            }

            // Successful authentication
            console.log('UnifiedLogin - Authentication successful, role detected:', userType);

            // Remember email if requested
            if (formData.rememberMe) {
                localStorage.setItem('rememberedEmail', email);
            } else {
                localStorage.removeItem('rememberedEmail');
            }

            updateLoginAttempts(true);

            // Add small delay to ensure auth context is fully updated
            setTimeout(() => {
                routeToDashboard(userType);
            }, 300);

        } catch (err) {
            console.error('UnifiedLogin - Unexpected authentication error:', err);
            setErrors({ general: 'An unexpected error occurred. Please try again later.' });
            updateLoginAttempts(false);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignUp = async () => {
        setIsLoading(true);
        const email = formData.email.trim().toLowerCase();
        const password = formData.password;
        const fullName = formData.fullName.trim();
        const mobileNumber = formData.mobileNumber.trim();

        try {
            console.log('UnifiedLogin - Account creation attempt for:', email);

            // Additional validation
            if (!email || !password || !fullName) {
                setErrors({ general: 'Please fill in all required fields' });
                return;
            }

            // Create user account
            const { user, error } = await signUp(email, password, {
                full_name: fullName,
                mobile_number: mobileNumber
            });

            if (error) {
                console.warn('UnifiedLogin - Account creation failed:', error.message);

                // Handle specific error types with generic messages
                if (error.message?.includes('already registered') ||
                    error.message?.includes('User already registered') ||
                    error.message?.includes('Email already in use')) {
                    setErrors({ general: 'An account with this email already exists. Please try logging in instead.' });
                    setFormMode('login');
                    return;
                }

                if (error.message?.includes('Password should be at least') ||
                    error.message?.includes('Password must be at least')) {
                    setErrors({ password: 'Password must be at least 6 characters long' });
                    return;
                }

                if (error.message?.includes('Unable to validate email address') ||
                    error.message?.includes('Invalid email')) {
                    setErrors({ email: 'Please enter a valid email address' });
                    return;
                }

                // Generic fallback for security
                setErrors({ general: 'Account creation failed. Please check your information and try again.' });
                return;
            }

            if (user) {
                console.log('UnifiedLogin - Account created successfully for:', email);

                // Show success message
                alert('Account created successfully! Your profile is being set up. You will be redirected to your dashboard.');

                // Wait for database trigger to complete
                await new Promise(resolve => setTimeout(resolve, 2000));

                // Determine user type and redirect
                const userType = user.userType || 'participant';
                routeToDashboard(userType);
            }
        } catch (err) {
            console.error('UnifiedLogin - Unexpected signup error:', err);
            setErrors({ general: 'An unexpected error occurred during account creation. Please try again later.' });
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            email: '', password: '', confirmPassword: '',
            fullName: '', mobileNumber: '', rememberMe: false
        });
        setErrors({});
        setLoginAttempts(0);
        setIsRateLimited(false);
    };

    // Load remembered email on component mount
    useEffect(() => {
        const rememberedEmail = localStorage.getItem('rememberedEmail');
        if (rememberedEmail) {
            setFormData(prev => ({ ...prev, email: rememberedEmail, rememberMe: true }));
        }

        // Check for existing rate limiting
        const attempts = parseInt(localStorage.getItem('loginAttempts') || '0');
        setLoginAttempts(attempts);
        if (attempts >= MAX_LOGIN_ATTEMPTS) {
            checkRateLimit();
        }
    }, []);

    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* Background with tropical beach image */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), 
                           url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')`
                }}
            />

            {/* Navigation Header */}
            <nav className="relative z-10 flex items-center justify-between px-6 py-4">
                <div className="flex items-center">
                    <div className="flex items-center mr-8">
                        <img
                            src={logoSvg}
                            alt="SeventyTwo X Logo"
                            className="h-10 w-auto filter brightness-0 invert"
                        />
                    </div>
                </div>

                <div className="hidden md:flex items-center space-x-8">
                    {/* Security & Privacy Dropdown */}
                    <div className="relative group">
                        <div className="text-white hover:text-blue-300 cursor-pointer">
                            <span>Security & Privacy</span>
                        </div>
                        <div className="absolute top-full left-0 mt-2 w-80 bg-blue-300/95 backdrop-blur-sm rounded-lg shadow-xl border border-blue-400/30 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                            <div className="p-6">
                                <h3 className="text-lg font-semibold text-white mb-3">Enterprise-Grade Security</h3>
                                <p className="text-white text-sm leading-relaxed mb-4">
                                    Your data is protected with bank-level security measures and encryption.
                                </p>
                                <div className="space-y-2">
                                    <div className="flex items-start space-x-2">
                                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                                        <p className="text-white text-sm">End-to-end encryption for all data</p>
                                    </div>
                                    <div className="flex items-start space-x-2">
                                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                                        <p className="text-white text-sm">Multi-factor authentication support</p>
                                    </div>
                                    <div className="flex items-start space-x-2">
                                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                                        <p className="text-white text-sm">Role-based access control</p>
                                    </div>
                                    <div className="flex items-start space-x-2">
                                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                                        <p className="text-white text-sm">GDPR and POPIA compliant</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* About Platform Dropdown */}
                    <div className="relative group">
                        <div className="text-white hover:text-blue-300 cursor-pointer">
                            <span>About Platform</span>
                        </div>
                        <div className="absolute top-full left-0 mt-2 w-80 bg-blue-300/95 backdrop-blur-sm rounded-lg shadow-xl border border-blue-400/30 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                            <div className="p-6">
                                <h3 className="text-lg font-semibold text-white mb-3">SeventyTwo X Platform</h3>
                                <p className="text-white text-sm leading-relaxed mb-4">
                                    Unified business platform for entrepreneurs and administrators with role-based access control.
                                </p>
                                <div className="space-y-2">
                                    <div className="flex items-start space-x-2">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                        <p className="text-white text-sm">Automatic role detection and routing</p>
                                    </div>
                                    <div className="flex items-start space-x-2">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                        <p className="text-white text-sm">Secure single sign-on experience</p>
                                    </div>
                                    <div className="flex items-start space-x-2">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                        <p className="text-white text-sm">Comprehensive business tools</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Business Registration Link */}
                    <div className="text-white hover:text-blue-300 cursor-pointer">
                        <button onClick={() => navigate('/welcome')}>
                            Business Registration
                        </button>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="relative z-10 flex items-center min-h-[calc(100vh-80px)] px-8">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 items-center w-full">

                    {/* Left side - Unified SSO Form */}
                    <div className="bg-white/95 backdrop-blur-sm rounded-xl p-8 border border-white/20 shadow-2xl max-w-md w-full">
                        {/* Logo and Title */}
                        <div className="text-center mb-8">
                            <div className="flex items-center justify-center space-x-2 mb-4">
                                <TrendingUp className="w-8 h-8 text-primary-500" />
                                <span className="text-2xl font-bold text-gray-900">SeventyTwo X</span>
                            </div>
                            <h1 className="text-xl font-semibold text-gray-900 mb-2">
                                {formMode === 'login' ? 'Secure Sign In' : 'Create Account'}
                            </h1>
                            <p className="text-gray-600">Unified Access Portal</p>
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

                        {/* Rate Limiting Warning */}
                        {loginAttempts >= 3 && loginAttempts < MAX_LOGIN_ATTEMPTS && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                                <div className="flex items-center space-x-2">
                                    <AlertCircle className="w-5 h-5 text-yellow-600" />
                                    <p className="text-yellow-800 text-sm">
                                        Security Notice: {MAX_LOGIN_ATTEMPTS - loginAttempts} attempts remaining before temporary lockout.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Login/Signup Mode Toggle */}
                        <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
                            <button
                                type="button"
                                onClick={() => {
                                    setFormMode('login');
                                    resetForm();
                                }}
                                className={`flex-1 py-2 px-4 rounded-md transition-colors ${
                                    formMode === 'login'
                                        ? 'bg-white text-primary-600 shadow-sm'
                                        : 'text-gray-600'
                                }`}
                            >
                                <span className="font-medium">Sign In</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setFormMode('signup');
                                    resetForm();
                                }}
                                className={`flex-1 py-2 px-4 rounded-md transition-colors ${
                                    formMode === 'signup'
                                        ? 'bg-white text-primary-600 shadow-sm'
                                        : 'text-gray-600'
                                }`}
                            >
                                <span className="font-medium">Sign Up</span>
                            </button>
                        </div>

                        {/* Unified Form */}
                        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                            {formMode === 'signup' && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input
                                                type="text"
                                                value={formData.fullName}
                                                onChange={(e) => handleInputChange('fullName', e.target.value)}
                                                placeholder="Enter your full name"
                                                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                                                    errors.fullName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                                }`}
                                                required
                                                autoComplete="name"
                                            />
                                        </div>
                                        {errors.fullName && (
                                            <p className="text-red-600 text-sm mt-1">{errors.fullName}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number (Optional)</label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input
                                                type="tel"
                                                value={formData.mobileNumber}
                                                onChange={(e) => handleInputChange('mobileNumber', e.target.value)}
                                                placeholder="+27 XX XXX XXXX"
                                                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                                                    errors.mobileNumber ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                                }`}
                                                autoComplete="tel"
                                            />
                                        </div>
                                        {errors.mobileNumber && (
                                            <p className="text-red-600 text-sm mt-1">{errors.mobileNumber}</p>
                                        )}
                                    </div>
                                </>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => handleInputChange('email', e.target.value)}
                                        placeholder="Enter your email address"
                                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                                            errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                        }`}
                                        autoComplete="username"
                                        required
                                    />
                                </div>
                                {errors.email && (
                                    <p className="text-red-600 text-sm mt-1">{errors.email}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={formData.password}
                                        onChange={(e) => handleInputChange('password', e.target.value)}
                                        placeholder="Enter your password"
                                        className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                                            errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                        }`}
                                        autoComplete={formMode === 'login' ? 'current-password' : 'new-password'}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="text-red-600 text-sm mt-1">{errors.password}</p>
                                )}
                            </div>

                            {formMode === 'signup' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            value={formData.confirmPassword}
                                            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                                            placeholder="Confirm your password"
                                            className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                                                errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                            }`}
                                            autoComplete="new-password"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    {errors.confirmPassword && (
                                        <p className="text-red-600 text-sm mt-1">{errors.confirmPassword}</p>
                                    )}
                                </div>
                            )}

                            {formMode === 'login' && (
                                <div className="flex items-center justify-between">
                                    <label className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            checked={formData.rememberMe}
                                            onChange={(e) => handleInputChange('rememberMe', e.target.checked)}
                                            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                                        />
                                        <span className="text-sm text-gray-600">Remember me</span>
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => alert('Password reset functionality would be implemented here')}
                                        className="text-sm text-primary-600 hover:text-primary-700"
                                    >
                                        Forgot password?
                                    </button>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading || authLoading || isRateLimited}
                                className={`w-full py-3 rounded-lg font-bold transition-colors flex items-center justify-center ${
                                    isLoading || authLoading || isRateLimited
                                        ? 'bg-gray-400 text-white cursor-not-allowed'
                                        : 'bg-primary-500 text-white hover:bg-primary-600'
                                }`}
                            >
                                {isLoading || authLoading ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : isRateLimited ? (
                                    'Account Temporarily Locked'
                                ) : (
                                    <>
                                        <Shield className="w-4 h-4 mr-2" />
                                        {formMode === 'login' ? 'Secure Sign In' : 'Create Secure Account'}
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Security Features Notice */}
                        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                            <div className="flex items-start space-x-2">
                                <Shield className="w-4 h-4 text-blue-600 mt-0.5" />
                                <div className="text-xs text-blue-800">
                                    <p className="font-medium mb-1">Security Features Active:</p>
                                    <ul className="space-y-1">
                                        <li>• Automatic role detection</li>
                                        <li>• Brute-force protection</li>
                                        <li>• Secure session management</li>
                                        <li>• Activity monitoring</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Toggle Link */}
                        <div className="text-center mt-6">
                            {formMode === 'login' ? (
                                <p className="text-gray-600">
                                    Don't have an account?{' '}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setFormMode('signup');
                                            resetForm();
                                        }}
                                        className="text-primary-600 hover:text-primary-700 font-medium"
                                    >
                                        Create account
                                    </button>
                                </p>
                            ) : (
                                <p className="text-gray-600">
                                    Already have an account?{' '}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setFormMode('login');
                                            resetForm();
                                        }}
                                        className="text-primary-600 hover:text-primary-700 font-medium"
                                    >
                                        Sign in
                                    </button>
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Right side - Security & Platform Information */}
                    <div className="text-white text-center lg:text-left lg:col-span-2">
                        <p className="text-xl mb-3 opacity-90">Secure Business Platform</p>
                        <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-5">
                            One login,<br />
                            complete access
                        </h1>
                        <div className="mb-6">
                            <p className="text-sm opacity-90 mb-3 leading-relaxed">
                                SeventyTwo X uses a unified Single Sign-On system that automatically detects your role
                                and provides secure access to the appropriate dashboard. Whether you're an entrepreneur
                                or an administrator, our platform ensures your data is protected with enterprise-grade security.
                            </p>

                            {/* Security Features Grid */}
                            <div className="max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-white/10 pr-2">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm opacity-90">
                                    <div className="space-y-2">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                            <span>Automatic role detection</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                            <span>Secure session management</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                            <span>Brute-force protection</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                            <span>Role-based access control</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                            <span>Activity monitoring</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                            <span>Data encryption</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                            <button
                                onClick={() => navigate('/welcome')}
                                className="bg-white/20 hover:bg-white/30 text-white px-5 py-2 rounded-md text-sm font-semibold transition-colors border border-white/30"
                            >
                                Business Registration
                            </button>
                            <button
                                onClick={() => window.open('mailto:support@seventytwo.co.za')}
                                className="bg-transparent hover:bg-white/10 text-white px-5 py-2 rounded-md text-sm font-semibold transition-colors border border-white/30"
                            >
                                Contact Support
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Security Badge */}
            <div className="absolute bottom-4 left-4 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/20">
                <div className="flex items-center space-x-2 text-white text-sm">
                    <Shield className="w-4 h-4" />
                    <span>Secured by SeventyTwo X SSO</span>
                </div>
            </div>
        </div>
    );
};

export default UnifiedLogin;