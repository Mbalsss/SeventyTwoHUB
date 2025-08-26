import { supabase } from "../supabaseClient";
import type { AuthError } from "@supabase/supabase-js";
import type { UserRole, ProfileUpdateData, AuthUser } from "../types/auth.types";

const ROLE_FETCH_TIMEOUT = 3000; // 3 seconds

/**
 * Determines user type based on email domain rules.
 * @param email The user's email address.
 * @returns 'admin' or 'participant'.
 */
export const determineUserType = (email: string): 'admin' | 'participant' => {
    if (!email) return 'participant';
    const isAdmin = email.includes('admin') ||
        email.endsWith('@bizboost.co.za') ||
        email.endsWith('@seda.org.za');
    return isAdmin ? 'admin' : 'participant';
};

/**
 * Fetches user roles from the database with a timeout fallback.
 * @param userId The user's unique ID.
 * @param email The user's email, used for fallback logic.
 * @returns A promise that resolves to an array of UserRole.
 */
export const fetchUserRoles = async (userId: string, email: string): Promise<UserRole[]> => {
    try {
        const rolePromise = supabase.from("user_roles").select("role").eq("user_id", userId);
        const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error('Role fetch timed out')), ROLE_FETCH_TIMEOUT);
        });

        const { data, error } = await Promise.race([rolePromise, timeoutPromise]);
        if (error) throw error;
        const roles = data?.map((r: { role: string }) => r.role as UserRole) || [];
        return roles.length > 0 ? roles : [determineUserType(email)];
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown role fetch error';
        console.warn(`AuthQueries - Role fetch failed, using fallback: ${message}`);
        return [determineUserType(email)];
    }
};

/**
 * Signs a user in with their email and password.
 * @returns The determined userType and an error, if any.
 */
export const signInUser = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    const userType = determineUserType(data.user?.email || '');
    return { userType, error };
};

/**
 * Signs up a new user, checking for existing profiles first.
 * @returns The new user object and an error, if any.
 */
export const signUpUser = async (email: string, password: string, metadata: Record<string, unknown> = {}) => {
    const { data: existingUser } = await supabase.from("profiles").select("id").eq("email", email.trim().toLowerCase()).maybeSingle();
    if (existingUser) {
        return { user: null, error: new Error('Email already in use. Please try logging in instead.') };
    }

    const intendedUserType = determineUserType(email);
    const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { data: { ...metadata, intended_role: intendedUserType } }
    });

    if (data.user) {
        const enhancedUser: AuthUser = { ...data.user, userType: intendedUserType, roles: [intendedUserType] };
        return { user: enhancedUser, error: null };
    }
    return { user: null, error };
};

/**
 * Signs the current user out.
 */
export const signOutUser = async (): Promise<{ error: AuthError | null }> => {
    return supabase.auth.signOut();
};

/**
 * Updates the profile for a given user.
 * @returns The updated profile data and an error, if any.
 */
export const updateUserProfile = async (userId: string, profileData: ProfileUpdateData) => {
    const { data, error } = await supabase.from('profiles').update(profileData).eq('id', userId).select().single();
    return { data, error };
};