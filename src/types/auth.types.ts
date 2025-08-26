import type { User, Session, AuthError } from "@supabase/supabase-js";
import React from 'react';

/**
 * Defines all possible roles a user can have in the system.
 * This is the single, consolidated source of truth for user roles.
 */
export type UserRole =
    | 'participant'
  | 'admin'
  | 'client_admin'
  | 'program_manager'
    | 'super_admin'
    | 'finance';

/** Extends the default Supabase User to include application-specific properties. */
export interface AuthUser extends User {
    userType: 'admin' | 'participant';
    roles: UserRole[];
}

/** Defines the shape of data for updating a user's profile. */
export interface ProfileUpdateData {
    full_name?: string;
    mobile_number?: string;
    avatar_url?: string;
}

/** Defines the public interface of the AuthContext for consumers. */
export interface AuthContextType {
    user: AuthUser | null;
    session: Session | null;
    userType: 'admin' | 'participant' | null;
    roles: UserRole[];
    isAuthenticated: boolean;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<{ userType: 'admin' | 'participant'; error: AuthError | null }>;
    signUp: (email: string, password: string, metadata?: Record<string, unknown>) => Promise<{ user: AuthUser | null; error: AuthError | Error | null }>;
    signOut: () => Promise<void>;
    updateProfile: (profileData: ProfileUpdateData) => Promise<{ success: boolean; error: Error | null }>;
    hasRole: (role: UserRole) => boolean;
    hasAnyRole: (roles: UserRole[]) => boolean;
    setDevUser: (email: string, userType: 'admin' | 'participant', roles?: UserRole[]) => void;
}

/** This type is from your old file and is necessary for your routing. */
export interface RouteConfig {
  path: string;
  element: React.ComponentType;
  requiredRoles?: UserRole[];
  layout?: 'default' | 'admin' | 'public';
  isPublic?: boolean;
  isLazy?: boolean;
}

// NOTE: The 'User' and 'AuthState' types from your old file are no longer needed,
// as they are replaced by the more detailed 'AuthUser' and 'AuthContextType'.