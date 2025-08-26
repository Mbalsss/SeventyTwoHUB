/** Defines whether the user is logging in or signing up. */
export type FormMode = 'login' | 'signup';

/** Defines whether the user is interacting with the user or admin flow. */
export type LoginType = 'user' | 'admin';

/** Defines the shape of the form's state. */
export interface LoginFormState {
    email: string;
    password: string;
    confirmPassword: string;
    fullName: string;
    mobileNumber: string;
    rememberMe: boolean;
}

/**
 * Defines the structure for validation errors.
 * It's a partial record mapping form fields to error messages.
 */
export type LoginErrors = Partial<Record<keyof LoginFormState | 'general', string>>;