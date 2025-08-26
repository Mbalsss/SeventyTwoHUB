import type { LoginFormState, FormMode, LoginType, LoginErrors } from '../types/login.types';

// Rate limiting configuration constants
const MAX_LOGIN_ATTEMPTS = 5;
const RATE_LIMIT_DURATION = 15 * 60 * 1000; // 15 minutes

/**
 * Validates the login/signup form data.
 * @returns An object containing any validation errors.
 */
export const validateForm = (formData: LoginFormState, formMode: FormMode, loginType: LoginType): LoginErrors => {
    const newErrors: LoginErrors = {};

    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password || formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters long';
    }

    if (loginType === 'admin' && !formData.email.includes('admin') && !formData.email.endsWith('@bizboost.co.za')) {
        newErrors.email = 'This does not appear to be a valid admin email';
    }

    if (formMode === 'signup') {
        if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
        if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
        if (formData.mobileNumber && !/^(\+27|0)[0-9]{9}$/.test(formData.mobileNumber.replace(/\s/g, ''))) {
            newErrors.mobileNumber = 'Please enter a valid South African mobile number';
        }
    }

    return newErrors;
};

/**
 * Checks if the user is currently rate-limited.
 * @returns An object indicating if rate-limited and a corresponding error message.
 */
export const checkRateLimit = (): { limited: boolean; message?: string } => {
    const lastAttemptTime = parseInt(localStorage.getItem('lastLoginAttempt') || '0');
    const attemptCount = parseInt(localStorage.getItem('loginAttempts') || '0');

    if (lastAttemptTime && attemptCount >= MAX_LOGIN_ATTEMPTS) {
        const timeSince = Date.now() - lastAttemptTime;
        if (timeSince < RATE_LIMIT_DURATION) {
            const remainingTime = Math.ceil((RATE_LIMIT_DURATION - timeSince) / 60000);
            return {
                limited: true,
                message: `Too many login attempts. Please try again in ${remainingTime} minutes.`,
            };
        } else {
            localStorage.removeItem('loginAttempts');
            localStorage.removeItem('lastLoginAttempt');
        }
    }
    return { limited: false };
};

/**
 * Updates the login attempt count in localStorage. This does NOT touch React state.
 */
export const updateLoginAttempts = (isSuccess: boolean): void => {
    if (isSuccess) {
        localStorage.removeItem('loginAttempts');
        localStorage.removeItem('lastLoginAttempt');
    } else {
        const newAttempts = (parseInt(localStorage.getItem('loginAttempts') || '0')) + 1;
        localStorage.setItem('loginAttempts', newAttempts.toString());
        localStorage.setItem('lastLoginAttempt', Date.now().toString());
    }
};

/**
 * Parses Supabase auth errors into user-friendly messages.
 * @param error The error object from Supabase.
 * @returns A user-friendly error string.
 */
export const parseAuthError = (error: Error): string => {
    const message = error.message.toLowerCase();
    if (message.includes('invalid login credentials')) return 'Invalid email or password. Please try again.';
    if (message.includes('email not confirmed')) return 'Please confirm your email address before signing in.';
    if (message.includes('already registered')) return 'An account with this email already exists. Please try logging in.';
    if (message.includes('user already registered')) return 'An account with this email already exists. Please try logging in.';
    if (message.includes('rate limit exceeded') || message.includes('too many requests')) return 'Too many attempts. Please wait a moment before trying again.';
    return error.message || 'An unexpected error occurred.';
};