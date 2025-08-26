import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "../supabaseClient";
import { determineUserType, fetchUserRoles, signInUser, signUpUser, signOutUser, updateUserProfile } from "../lib/auth.queries";
import type { AuthContextType, AuthUser, ProfileUpdateData, UserRole } from "../types/auth.types";

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const INIT_TIMEOUT = 6000;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [userType, setUserType] = useState<'admin' | 'participant' | null>(null);
    const [roles, setRoles] = useState<UserRole[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDevUser, setIsDevUser] = useState(false);

  const updateUserState = useCallback(async (userParam: User | null, sessionParam: Session | null) => {
    if (!userParam || !sessionParam) {
            setUser(null); setSession(null); setUserType(null); setRoles([]);
            localStorage.clear();
            return;
        }
        try {
      const email = userParam.email || '';
            const determinedUserType = determineUserType(email);
      const fetchedRoles = await fetchUserRoles(userParam.id, email);

      const enhancedUser: AuthUser = { ...userParam, userType: determinedUserType, roles: fetchedRoles };

            setUser(enhancedUser);
      setSession(sessionParam);
            setUserType(determinedUserType);
            setRoles(fetchedRoles);
            localStorage.setItem("userType", determinedUserType);
            localStorage.setItem("userRoles", JSON.stringify(fetchedRoles));
        } catch (error: unknown) {
            console.error("AuthContext - Failed to update user state:", error);
        }
    }, []);

    useEffect(() => {
        let mounted = true;
        const initializeAuth = async () => {
            const { data: { session: initialSession } } = await supabase.auth.getSession();
            if (mounted) {
                await updateUserState(initialSession?.user ?? null, initialSession);
                setLoading(false);
            }
        };
        const initTimeoutId = setTimeout(() => {
            if (mounted && loading) setLoading(false);
        }, INIT_TIMEOUT);

        initializeAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
      // Corrected: The unused 'event' parameter is removed from the signature.
      async (event, newSession) => {
        if (mounted) {
            console.log(`Auth state changed: ${event}`);
            await updateUserState(newSession?.user ?? null, newSession)
        }
            }
        );
        return () => {
            mounted = false;
            clearTimeout(initTimeoutId);
            subscription.unsubscribe();
        };
    }, [updateUserState, loading]);

    const signIn = (email: string, password: string) => signInUser(email, password);
    const signUp = (email: string, password: string, metadata?: Record<string, unknown>) => signUpUser(email, password, metadata);

    const signOut = async () => {
        if (isDevUser) {
            setIsDevUser(false);
            await updateUserState(null, null);
        } else {
            await signOutUser();
        }
    };

    const updateProfile = async (profileData: ProfileUpdateData) => {
        if (!user) return { success: false, error: new Error('Not authenticated') };
        const { data, error } = await updateUserProfile(user.id, profileData);
        if (error) return { success: false, error: new Error(error.message) };
        if (data && user) {
            const updatedUser: AuthUser = { ...user, user_metadata: { ...user.user_metadata, full_name: data.full_name } };
            setUser(updatedUser);
        }
        return { success: true, error: null };
    };

    const hasRole = useCallback((role: UserRole): boolean => roles.includes(role), [roles]);
    const hasAnyRole = useCallback((requiredRoles: UserRole[]): boolean => requiredRoles.some(r => roles.includes(r)), [roles]);

    const setDevUser = useCallback((email: string, devUserType: 'admin' | 'participant', devRoles?: UserRole[]) => {
        const finalRoles = devRoles || [devUserType];
        const devUserId = `dev-${btoa(email).replace(/[^a-zA-Z0-9]/g, '').substring(0, 8)}`;
    // Casting is necessary here to satisfy the full User interface for mocking
    const fakeUser = {
            id: devUserId, email, userType: devUserType, roles: finalRoles, aud: 'authenticated', role: 'authenticated',
            created_at: new Date().toISOString(), updated_at: new Date().toISOString(), is_anonymous: false,
            app_metadata: { provider: 'dev', providers: ['dev'] }, user_metadata: { full_name: 'Dev User' },
        } as AuthUser;
        const fakeSession: Session = {
            access_token: `dev_token_${Date.now()}`, refresh_token: `dev_refresh_${Date.now()}`,
            expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + 3600, token_type: 'bearer', user: fakeUser
        };
        setUser(fakeUser); setSession(fakeSession); setUserType(devUserType); setRoles(finalRoles); setIsDevUser(true); setLoading(false);
        localStorage.setItem("isDevUser", "true");
    }, []);

    const contextValue: AuthContextType = {
        user, session, userType, roles, isAuthenticated: !!user, loading,
        signIn, signUp, signOut, updateProfile, hasRole, hasAnyRole, setDevUser
    };

    return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) throw new Error("useAuth must be used within an AuthProvider");
    return context;
};