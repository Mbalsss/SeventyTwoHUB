// src/pages/Login.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, TrendingUp, Users, Shield, User, Phone, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { LoginType, FormMode, LoginFormState, LoginErrors } from '../types/login.types';
import { validateForm, checkRateLimit, updateLoginAttempts, parseAuthError } from '../lib/login.utils';

// Read the bypass flag from environment variables.
// The value is a string, so we compare it to 'true'.
const DEV_BYPASS_ENABLED = import.meta.env.VITE_DEV_BYPASS_ENABLED === 'true';
const MAX_LOGIN_ATTEMPTS = 5; // The component needs this for its JSX.

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { signIn, signUp, setDevUser } = useAuth();

  const [loginType, setLoginType] = useState<LoginType>('user');
  const [formMode, setFormMode] = useState<FormMode>('login');
  const [formData, setFormData] = useState<LoginFormState>({
    email: '', password: '', confirmPassword: '',
    fullName: '', mobileNumber: '', rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<LoginErrors>({});
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isRateLimited, setIsRateLimited] = useState(false);

  const routeToDashboard = (userType: 'admin' | 'participant') => {
    navigate(userType === 'admin' ? '/admin/dashboard' : '/dashboard', { replace: true });
  };

  const handleInputChange = (field: keyof LoginFormState, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading || isRateLimited) return;
    setErrors({});

    const rateLimit = checkRateLimit();
    if (rateLimit.limited) {
      setErrors({ general: rateLimit.message });
      setIsRateLimited(true);
      return;
    }

    const validationErrors = validateForm(formData, formMode, loginType);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    if (formMode === 'login') {
      await handleLogin();
    } else {
      await handleSignUp();
    }
    setIsLoading(false);
  };

  const handleLogin = async () => {
    // Dev Bypass Logic
    if (DEV_BYPASS_ENABLED && formData.email.endsWith('@bizboost.dev')) {
        const devUserType = formData.email.startsWith('admin') ? 'admin' : 'participant';
        setDevUser(formData.email, devUserType, [devUserType]); // The component doesn't need to know UserRole type here
        setTimeout(() => routeToDashboard(devUserType), 100);
          return;
        }

    const { userType, error } = await signIn(formData.email, formData.password);

      if (error) {
      setErrors({ general: parseAuthError(error) });
      updateLoginAttempts(false); // Manages localStorage
      setLoginAttempts(prev => prev + 1); // Manages component state
        } else {
      updateLoginAttempts(true); // Manages localStorage
      setLoginAttempts(0); // Manages component state
      if (loginType === 'admin' && userType !== 'admin') {
        setErrors({ general: 'Access denied. This account lacks admin privileges.' });
        return;
      }
      setTimeout(() => routeToDashboard(userType), 500);
    }
  };

  const handleSignUp = async () => {
    const { error } = await signUp(formData.email, formData.password, {
      full_name: formData.fullName,
      mobile_number: formData.mobileNumber
      });

      if (error) {
      setErrors({ general: parseAuthError(error) });
    } else {
      alert('Account created! Please check your email to verify your account before logging in.');
      setFormMode('login');
      resetForm();
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

  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      setFormData(prev => ({ ...prev, email: rememberedEmail, rememberMe: true }));
    }
    const attempts = parseInt(localStorage.getItem('loginAttempts') || '0');
    setLoginAttempts(attempts);

    if (checkRateLimit().limited) {
      setIsRateLimited(true);
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