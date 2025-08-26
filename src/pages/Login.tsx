// src/pages/Login.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, TrendingUp, Users, Shield, User, Phone, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../types/auth';

type LoginType = 'user' | 'admin';
type FormMode = 'login' | 'signup';

const devCredentials = {
  user: { email: 'user@bizboost.co.za', password: 'user123' },
  admin: { email: 'admin@bizboost.co.za', password: 'admin123' },
};

const DEV_BYPASS_ENABLED = true; // flip to false for production

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { signIn, signUp, setDevUser } = useAuth();

  const [loginType, setLoginType] = useState<LoginType>('user');
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

  // Rate limiting configuration
  const MAX_LOGIN_ATTEMPTS = 5;
  const RATE_LIMIT_DURATION = 15 * 60 * 1000; // 15 minutes

  const handleInputChange = (field: keyof typeof formData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear field-specific errors when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Client-side validation
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }

    // Admin-specific validation
    if (loginType === 'admin') {
      if (!formData.email.includes('admin') && !formData.email.endsWith('@bizboost.co.za')) {
        newErrors.email = 'Admin accounts must use a valid admin email address';
      }
    }

    // Signup-specific validation
    if (formMode === 'signup') {
      if (!formData.fullName.trim()) {
        newErrors.fullName = 'Full name is required';
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

  // Rate limiting check
  const checkRateLimit = (): boolean => {
    const lastAttemptTime = localStorage.getItem('lastLoginAttempt');
    const attemptCount = parseInt(localStorage.getItem('loginAttempts') || '0');

    if (lastAttemptTime && attemptCount >= MAX_LOGIN_ATTEMPTS) {
      const timeSinceLastAttempt = Date.now() - parseInt(lastAttemptTime);
      if (timeSinceLastAttempt < RATE_LIMIT_DURATION) {
        setIsRateLimited(true);
        const remainingTime = Math.ceil((RATE_LIMIT_DURATION - timeSinceLastAttempt) / 60000);
        setErrors({ general: `Too many login attempts. Please try again in ${remainingTime} minutes.` });
        return false;
      } else {
        // Reset rate limiting
        localStorage.removeItem('loginAttempts');
        localStorage.removeItem('lastLoginAttempt');
        setIsRateLimited(false);
      }
    }

    return true;
  };

  // Update login attempts
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
    }
  };

  const routeToDashboard = (userType: 'admin' | 'participant') => {
    const path = userType === 'admin' ? '/admin/dashboard' : '/dashboard';
    console.log('Login - Routing to dashboard:', { userType, path });
    navigate(path, { replace: true });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

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
    const email = formData.email.trim();
    const password = formData.password;

    try {
      console.log('Login - Begin', { email, loginType });

      // ---- DEV BYPASS ----
      if (DEV_BYPASS_ENABLED) {
        const chosen = devCredentials[loginType];
        const match =
            email.toLowerCase() === chosen.email.toLowerCase() && password === chosen.password;

        if (match) {
          console.log('Login - Using DEV BYPASS for', email);

          // Update AuthContext with dev user before navigation
          const devUserType = loginType === 'admin' ? 'admin' : 'participant';
          const devRoles: UserRole[] = loginType === 'admin' ? ['admin'] : ['participant'];

          // Set dev user in AuthContext - this is crucial!
          setDevUser(email, devUserType, devRoles);

          // optional: remember email locally
          if (formData.rememberMe) localStorage.setItem('rememberedEmail', email);
          else localStorage.removeItem('rememberedEmail');

          updateLoginAttempts(true);
          console.log('Login - DEV BYPASS routing to:', devUserType);

          // Small delay to ensure context state is updated before navigation
          setTimeout(() => {
            routeToDashboard(devUserType);
          }, 100);
          return;
        }
      }

      // ---- REAL SUPABASE LOGIN ----
      const { userType, error } = await signIn(email, password);

      if (error) {
        console.warn('Login - Supabase error:', error);

        // Handle specific error types
        if (error.message?.includes('Invalid login credentials')) {
          setErrors({ general: 'Invalid email or password. Please check your credentials and try again.' });
        } else if (error.message?.includes('Email not confirmed')) {
          setErrors({ general: 'Please confirm your email address before signing in.' });
        } else if (error.message?.includes('Too many requests')) {
          setErrors({ general: 'Too many login attempts. Please wait before trying again.' });
        } else if (error.message?.includes('Access denied')) {
          setErrors({ general: error.message });
        } else {
          setErrors({ general: error?.message || 'Login failed. Please try again.' });
        }

        updateLoginAttempts(false);
        return;
      }

      // Verify that the returned userType matches the selected loginType
      if (loginType === 'admin' && userType !== 'admin') {
        setErrors({ general: 'Access denied. This account does not have admin privileges.' });
        updateLoginAttempts(false);
        return;
      }

      if (loginType === 'user' && userType === 'admin') {
        // Admin trying to login as user - redirect to admin
        console.log('Login - Admin account detected, redirecting to admin dashboard');
        routeToDashboard('admin');
        return;
      }

      // optional: remember email locally
      if (formData.rememberMe) localStorage.setItem('rememberedEmail', email);
      else localStorage.removeItem('rememberedEmail');

      updateLoginAttempts(true);
      console.log('Login - Supabase routing to:', userType);

      // Add small delay to ensure auth context is fully updated
      setTimeout(() => {
        routeToDashboard(userType);
      }, 500);
    } catch (err) {
      console.error('Login - Unexpected error:', err);
      setErrors({ general: 'An unexpected error occurred. Please try again later.' });
      updateLoginAttempts(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async () => {
    setIsLoading(true);
    const email = formData.email.trim();
    const password = formData.password;
    const fullName = formData.fullName.trim();
    const mobileNumber = formData.mobileNumber.trim();

    try {
      console.log('SignUp - Begin', { email, loginType, fullName });

      // Additional client-side validation
      if (!email || !password || !fullName) {
        setErrors({ general: 'Please fill in all required fields' });
        return;
      }

      // Validate email format
      if (!email.includes('@') || email.length < 5) {
        setErrors({ email: 'Please enter a valid email address' });
        return;
      }

      // Validate password strength
      if (password.length < 6) {
        setErrors({ password: 'Password must be at least 6 characters long' });
        return;
      }

      // Create user account with role metadata
      const { user, error } = await signUp(email, password, {
        full_name: fullName,
        mobile_number: mobileNumber
      });

      if (error) {
        console.warn('SignUp - Supabase error:', error);

        // Handle specific error types with user-friendly messages
        if (error.message?.includes('already registered') || error.message?.includes('User already registered') || error.message?.includes('already been registered')) {
          setErrors({ general: 'An account with this email already exists. Please try logging in instead.' });
          setFormMode('login');
          return;
        }

        if (error.message?.includes('Password should be at least') || error.message?.includes('Password must be at least')) {
          setErrors({ password: 'Password must be at least 6 characters long' });
          return;
        }

        if (error.message?.includes('Unable to validate email address') || error.message?.includes('Invalid email')) {
          setErrors({ email: 'Please enter a valid email address' });
          return;
        }

        if (error.message?.includes('Database error saving new user') || error.message?.includes('infinite recursion')) {
          setErrors({ general: 'Account creation is processing. Please wait a moment and try signing in, or contact support if you continue to have issues.' });
          return;
        }

        if (error.message?.includes('row-level security policy') || error.message?.includes('42501')) {
          setErrors({ general: 'Account creation failed due to permissions. Please contact support for assistance.' });
          return;
        }

        if (error.message?.includes('Account creation failed')) {
          setErrors({ general: error.message });
          return;
        }

        if (error.message?.includes('trigger') || error.message?.includes('function') || error.message?.includes('recursion')) {
          setErrors({ general: 'Account creation is processing. Please try signing in after a few moments.' });
          return;
        }

        // Generic fallback
        setErrors({ general: 'Error creating account. Please check your information and try again. If the problem persists, contact support.' });
        return;
      }

      if (user) {
        // For new signups, determine user type based on login type selection
        const userType = loginType === 'admin' ? 'admin' : 'participant';

        // Store user type for routing
        localStorage.setItem('userType', userType);
        localStorage.setItem('userEmail', email);

        console.log('SignUp - Account created successfully for:', email, 'as', userType);

        // Show success message with instructions
        alert('Account created successfully! Your profile is being set up. You will be redirected to your dashboard.');

        // Wait a moment for the database trigger to complete
        await new Promise(resolve => setTimeout(resolve, 2000));

        routeToDashboard(userType);
      }
    } catch (err) {
      console.error('SignUp - Unexpected error:', err);
      setErrors({ general: 'An unexpected error occurred during account creation. Please try again later or contact support if the issue persists.' });
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
  React.useEffect(() => {
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
      <>
        <div className="min-h-screen bg-background-secondary flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            {/* Logo */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <TrendingUp className="w-8 h-8 text-primary-500" />
                <span className="text-2xl font-bold text-text-dark">SeventyTwo X</span>
              </div>
              <h1 className="text-xl font-semibold text-text-dark mb-2">{formMode === 'login' ? 'Welcome Back' : 'Create Account'}</h1>
              <p className="text-text-muted">Empowering South African entrepreneurs</p>
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
                      Warning: {MAX_LOGIN_ATTEMPTS - loginAttempts} login attempts remaining before temporary lockout.
                    </p>
                  </div>
                </div>
            )}

            {/* Login Type Toggle */}
            <div className="bg-surface-light rounded-xl shadow-sm border border-primary-300 p-6 mb-6">
              <div className="flex bg-background-secondary rounded-lg p-1 mb-6">
                <button
                    type="button"
                    onClick={() => {
                      setFormMode('login');
                      resetForm();
                    }}
                    className={`flex-1 py-2 px-4 rounded-md transition-colors ${
                        formMode === 'login' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-600'
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
                            ? 'bg-surface-light text-primary-500 shadow-sm'
                            : 'text-text-dark'
                    }`}
                >
                  <span className="font-medium">Sign Up</span>
                </button>
              </div>

              {/* User Type Selection */}
              <div className="flex bg-background-secondary rounded-lg p-1 mb-6">
                <button
                    type="button"
                    onClick={() => {
                      setLoginType('user');
                      setErrors({});
                    }}
                    className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md transition-colors ${
                        loginType === 'user'
                            ? 'bg-surface-light text-primary-500 shadow-sm'
                            : 'text-text-dark'
                    }`}
                >
                  <Users className="w-4 h-4" />
                  <span className="font-medium">User</span>
                </button>
                <button
                    type="button"
                    onClick={() => {
                      setLoginType('admin');
                      setErrors({});
                    }}
                    className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md transition-colors ${
                        loginType === 'admin'
                            ? 'bg-surface-light text-primary-500 shadow-sm'
                            : 'text-text-dark'
                    }`}
                >
                  <Shield className="w-4 h-4" />
                  <span className="font-medium">Admin</span>
                </button>
              </div>

              {/* Admin Access Notice */}
              {loginType === 'admin' && (
                  <div className="bg-background-secondary border border-primary-300 rounded-lg p-3 mb-4">
                    <div className="flex items-center space-x-2">
                      <Shield className="w-4 h-4 text-primary-500" />
                      <p className="text-text-dark text-sm">
                        <strong className="text-primary-500">Admin Access:</strong> Only authorized administrators can access the admin dashboard.
                      </p>
                    </div>
                  </div>
              )}

              {/* Form */}
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
                              className={`w-full pl-10 pr-4 py-2 bg-surface-light border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-text-dark ${
                                  errors.fullName ? 'border-red-300 bg-red-50' : 'border-primary-300'
                              }`}
                              required
                          />
                        </div>
                        {errors.fullName && (
                            <p className="text-red-600 text-sm mt-1">{errors.fullName}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number</label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                              type="tel"
                              value={formData.mobileNumber}
                              onChange={(e) => handleInputChange('mobileNumber', e.target.value)}
                              placeholder="+27 XX XXX XXXX"
                              className={`w-full pl-10 pr-4 py-2 bg-surface-light border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-text-dark ${
                                  errors.mobileNumber ? 'border-red-300 bg-red-50' : 'border-primary-300'
                              }`}
                          />
                        </div>
                        {errors.mobileNumber && (
                            <p className="text-red-600 text-sm mt-1">{errors.mobileNumber}</p>
                        )}
                      </div>
                    </>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {loginType === 'admin' ? 'Admin Email Address' : 'Email Address'}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder={loginType === 'admin' ? 'admin@bizboost.co.za' : 'Enter your email'}
                        className={`w-full pl-10 pr-4 py-2 bg-surface-light border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-text-dark ${
                            errors.email ? 'border-red-300 bg-red-50' : 'border-primary-300'
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
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        placeholder="Enter your password"
                        className={`w-full pl-10 pr-10 py-2 bg-surface-light border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-text-dark ${
                            errors.password ? 'border-red-300 bg-red-50' : 'border-primary-300'
                        }`}
                        autoComplete="current-password"
                        required
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword((s) => !s)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-dark"
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
                            className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                                errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-300'
                            }`}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword((s) => !s)}
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
                          onClick={() => navigate('/forgot-password')}
                          className="text-sm text-primary-600 hover:text-primary-700"
                      >
                        Forgot password?
                      </button>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isLoading || isRateLimited}
                    className={`w-full py-3 rounded-lg font-bold transition-colors flex items-center justify-center ${
                        isLoading || isRateLimited
                            ? 'bg-text-muted text-text-light cursor-not-allowed'
                            : loginType === 'admin'
                                ? 'bg-red-500 text-text-light hover:bg-red-600'
                                : 'bg-primary-500 text-text-light hover:bg-background-dark'
                    }`}
                >
                  {isLoading ? (
                      <div className="w-5 h-5 border-2 border-text-light border-t-transparent rounded-full animate-spin" />
                  ) : isRateLimited ? (
                      'Account Temporarily Locked'
                  ) : (
                      <>
                        {loginType === 'admin' && <Shield className="w-4 h-4 mr-2" />}
                        {loginType === 'user' && <Users className="w-4 h-4 mr-2" />}
                        {formMode === 'login' ? 'Sign In' : 'Create Account'} as {loginType === 'admin' ? 'Admin' : 'User'}
                      </>
                  )}
                </button>
              </form>

              {/* Security Notice for Admin */}
              {loginType === 'admin' && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <Shield className="w-4 h-4 text-gray-600 mt-0.5" />
                      <div className="text-xs text-gray-600">
                        <p className="font-medium mb-1">Security Notice:</p>
                        <ul className="space-y-1">
                          <li>• Admin sessions are logged and monitored</li>
                          <li>• Use strong, unique passwords</li>
                          <li>• Report suspicious activity immediately</li>
                        </ul>
                      </div>
                    </div>
                  </div>
              )}


              {/* Toggle Link */}
              <div className="text-center">
                {formMode === 'login' ? (
                    <p className="text-gray-600">
                      Don&apos;t have an account?{' '}
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

                <p className="text-gray-600 mt-2">
                  Or register your business{' '}
                  <button
                      type="button"
                      onClick={() => navigate('/register/account-validated')}
                      className="text-primary-600 hover:text-primary-700 font-medium"
                  >
                    with approved application
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </>
  );
};

export default Login;