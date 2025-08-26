import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { User, Session } from "@supabase/supabase-js";
import { supabase } from "../supabaseClient";
import type { UserRole } from "../types/auth";

// Enhanced user interface for context
interface AuthUser extends User {
  userType?: 'admin' | 'participant';
  roles?: UserRole[];
}

interface ProfileUpdateData {
  full_name?: string;
  mobile_number?: string;
  avatar_url?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  userType: string | null;
  roles: UserRole[];
  isAuthenticated: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ userType: 'admin' | 'participant'; error?: any }>;
  signUp: (email: string, password: string, metadata?: any) => Promise<{ user: AuthUser | null; error?: any }>;
  signOut: () => Promise<void>;
  updateProfile: (profileData: ProfileUpdateData) => Promise<{ success: boolean; error?: any }>;
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  setDevUser: (email: string, userType: 'admin' | 'participant', roles?: UserRole[]) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Configuration constants
const SESSION_TIMEOUT = 5000; // 5 seconds
const ROLE_FETCH_TIMEOUT = 3000; // 3 seconds
const INIT_TIMEOUT = 6000; // 6 seconds
const USER_STATE_TIMEOUT = 5000; // 5 seconds for user state updates

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userType, setUserType] = useState<string | null>(null);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDevUser, setIsDevUser] = useState(false);

  // Memoized role checking functions
  const hasRole = useCallback((role: UserRole): boolean => {
    return roles.includes(role);
  }, [roles]);

  const hasAnyRole = useCallback((requiredRoles: UserRole[]): boolean => {
    return requiredRoles.some(role => roles.includes(role));
  }, [roles]);

  // Determine user type from email
  const determineUserType = useCallback((email: string): 'admin' | 'participant' => {
    const isAdmin = email.includes('admin') || 
                   email.endsWith('@bizboost.co.za') || 
                   email.endsWith('@seda.org.za');
    return isAdmin ? 'admin' : 'participant';
  }, []);

  // Fetch user roles with timeout
  const fetchUserRoles = useCallback(async (userId: string, email: string): Promise<UserRole[]> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.warn('AuthContext - Role fetch timeout, using fallback roles');
        controller.abort();
      }, ROLE_FETCH_TIMEOUT);
      
      const rolePromise = supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);
      
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Role fetch timeout')), ROLE_FETCH_TIMEOUT);
      });
      
      const { data, error } = await Promise.race([rolePromise, timeoutPromise]);
      
      clearTimeout(timeoutId);

      if (error) {
        console.warn("AuthContext - Role fetch error, using fallback:", error.message);
        // Return fallback roles based on email
        const isAdmin = email.includes('admin') || email.endsWith('@bizboost.co.za');
        return isAdmin ? ['admin'] : ['participant'];
      }
      
      return data?.map((r) => r.role as UserRole) || [];
    } catch (error: any) {
      console.warn("AuthContext - Role fetch failed, using email-based fallback:", error.message);
      // Fallback to email-based role determination
      const isAdmin = email.includes('admin') || email.endsWith('@bizboost.co.za');
      return isAdmin ? ['admin'] : ['participant'];
    }
  }, []);

  // Update auth state safely
  const updateUserState = useCallback(async (authUser: User | null, authSession: Session | null) => {
    try {
      if (authUser && authSession) {
        const email = authUser.email || '';
        const determinedUserType = determineUserType(email);
        
        console.log('AuthContext - Updating user state for:', email, 'as', determinedUserType);
        
        // Use timeout wrapper for role fetching
        const updateStateWithTimeout = async () => {
          try {
            const fetchedRoles = await fetchUserRoles(authUser.id, email);
            
            // Create enhanced user object
            const enhancedUser: AuthUser = {
              ...authUser,
              userType: determinedUserType,
              roles: fetchedRoles
            };
            
            // Update state
            setUser(enhancedUser);
            setSession(authSession);
            setUserType(determinedUserType);
            setRoles(fetchedRoles);
            
            // Persist to localStorage
            localStorage.setItem("userType", determinedUserType);
            localStorage.setItem("userEmail", email);
            localStorage.setItem("userRoles", JSON.stringify(fetchedRoles));
            
            console.log('AuthContext - User state updated successfully:', {
              email,
              userType: determinedUserType,
              roles: fetchedRoles
            });
          } catch (error) {
            console.warn('AuthContext - User state update failed, using defaults:', error);
            
            // Use fallback values
            const fallbackRoles = determinedUserType === 'admin' ? ['admin'] : ['participant'];
            const enhancedUser: AuthUser = {
              ...authUser,
              userType: determinedUserType,
              roles: fallbackRoles
            };
            
            setUser(enhancedUser);
            setSession(authSession);
            setUserType(determinedUserType);
            setRoles(fallbackRoles);
            
            localStorage.setItem("userType", determinedUserType);
            localStorage.setItem("userEmail", email);
            localStorage.setItem("userRoles", JSON.stringify(fallbackRoles));
          }
        };
        
        // Race against timeout
        const timeoutPromise = new Promise<void>((_, reject) => {
          setTimeout(() => reject(new Error('User state update timeout')), USER_STATE_TIMEOUT);
        });
        
        try {
          await Promise.race([updateStateWithTimeout(), timeoutPromise]);
        } catch (timeoutError) {
          console.warn('AuthContext - User state update timeout, using immediate fallback');
          
          // Immediate fallback
          const fallbackRoles = determinedUserType === 'admin' ? ['admin'] : ['participant'];
          const enhancedUser: AuthUser = {
            ...authUser,
            userType: determinedUserType,
            roles: fallbackRoles
          };
          
          setUser(enhancedUser);
          setSession(authSession);
          setUserType(determinedUserType);
          setRoles(fallbackRoles);
          
          localStorage.setItem("userType", determinedUserType);
          localStorage.setItem("userEmail", email);
          localStorage.setItem("userRoles", JSON.stringify(fallbackRoles));
        }
        
      } else {
        // Clear state
        setUser(null);
        setSession(null);
        setUserType(null);
        setRoles([]);
        
        // Clear localStorage
        localStorage.removeItem("userType");
        localStorage.removeItem("userEmail");
        localStorage.removeItem("userRoles");
        localStorage.removeItem("isDevUser");
        localStorage.removeItem("authToken");
        
        console.log('AuthContext - Auth state cleared');
      }
    } catch (error) {
      console.error('AuthContext - Error updating auth state:', error);
      // Always ensure loading resolves
      setLoading(false);
    }
  }, [determineUserType, fetchUserRoles]);

  // DEV BYPASS function
  const setDevUser = useCallback((email: string, userType: 'admin' | 'participant', devRoles?: UserRole[]) => {
    const defaultRoles = devRoles || [userType === 'admin' ? 'admin' : 'participant'];
    
    // Generate consistent dev UUID
    const devUserId = `dev-${btoa(email).replace(/[^a-zA-Z0-9]/g, '').substring(0, 8)}-${userType}`;
    
    console.log('AuthContext - Setting dev user:', { email, userType, roles: defaultRoles });
    
    // Create fake user for development
    const fakeUser: AuthUser = {
      id: devUserId,
      email,
      userType,
      roles: defaultRoles,
      aud: 'authenticated',
      role: 'authenticated',
      email_confirmed_at: new Date().toISOString(),
      phone_confirmed_at: undefined,
      confirmation_sent_at: undefined,
      recovery_sent_at: undefined,
      email_change_sent_at: undefined,
      new_email: undefined,
      new_phone: undefined,
      invited_at: undefined,
      action_link: undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_anonymous: false,
      app_metadata: { provider: 'dev', providers: ['dev'] },
      user_metadata: { full_name: 'Dev User' },
      identities: [],
      factors: []
    };

    // Create fake session
    const fakeSession: Session = {
      access_token: `dev_token_${Date.now()}`,
      refresh_token: `dev_refresh_${Date.now()}`,
      expires_in: 3600,
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      token_type: 'bearer',
      user: fakeUser
    };

    // Update state immediately
    setUser(fakeUser);
    setSession(fakeSession);
    setUserType(userType);
    setRoles(defaultRoles);
    setIsDevUser(true);
    
    // Persist to localStorage
    localStorage.setItem("userType", userType);
    localStorage.setItem("userEmail", email);
    localStorage.setItem("userRoles", JSON.stringify(defaultRoles));
    localStorage.setItem("authToken", fakeSession.access_token);
    localStorage.setItem("isDevUser", "true");
    
    // CRITICAL: Set loading to false for dev users
    setLoading(false);
    
    console.log('AuthContext - Dev user set successfully');
  }, []);

  // Sign in function
  const signIn = async (email: string, password: string) => {
    try {
      console.log('AuthContext - Sign in attempt:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });

      if (error) {
        console.error('AuthContext - Sign in error:', error);
        return { userType: 'participant' as const, error };
      }

      if (data.user && data.session) {
        const determinedUserType = determineUserType(data.user.email || '');
        console.log('AuthContext - Sign in successful:', {
          email: data.user.email,
          userType: determinedUserType
        });
        
        return { userType: determinedUserType, error: null };
      }

      return { userType: 'participant' as const, error: new Error('No user returned') };
    } catch (error) {
      console.error('AuthContext - Sign in catch:', error);
      return { userType: 'participant' as const, error };
    }
  };

  // Sign up function
  const signUp = async (email: string, password: string, metadata?: any) => {
    try {
      console.log('AuthContext - Sign up attempt:', email);
      
      // Check for existing user first to prevent duplicates
      const { data: existingUser } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", email.trim().toLowerCase())
        .maybeSingle();

      if (existingUser) {
        return { user: null, error: { message: 'Email already in use. Please try logging in instead.' } };
      }

      if (!email || !email.includes('@')) {
        return { user: null, error: { message: 'Please enter a valid email address' } };
      }

      if (!password || password.length < 6) {
        return { user: null, error: { message: 'Password must be at least 6 characters long' } };
      }

      const intendedUserType = determineUserType(email);
      
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            ...metadata,
            intended_role: intendedUserType === 'admin' ? 'admin' : 'participant',
            role: intendedUserType === 'admin' ? 'admin' : 'participant'
          }
        }
      });

      if (error) {
        console.error('AuthContext - Sign up error:', error);
        return { user: null, error };
      }

      if (data.user) {
        const enhancedUser: AuthUser = {
          ...data.user,
          userType: intendedUserType,
          roles: intendedUserType === 'admin' ? ['admin'] : ['participant']
        };
        
        console.log('AuthContext - Sign up successful:', email);
        return { user: enhancedUser, error: null };
      }

      return { user: null, error: { message: 'Account creation failed' } };
    } catch (error) {
      console.error('AuthContext - Sign up catch:', error);
      return { user: null, error };
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      console.log('AuthContext - Signing out');
      
      if (!isDevUser) {
        await supabase.auth.signOut();
      }
      
      // Clear all state
      setUser(null);
      setSession(null);
      setUserType(null);
      setRoles([]);
      setIsDevUser(false);
      
      // Clear localStorage
      localStorage.removeItem("userType");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("authToken");
      localStorage.removeItem("userRoles");
      localStorage.removeItem("isDevUser");
      
      console.log('AuthContext - Sign out complete');
    } catch (error) {
      console.error("AuthContext - Sign out error:", error);
      // Force clear state even if API call fails
      setUser(null);
      setSession(null);
      setUserType(null);
      setRoles([]);
      setIsDevUser(false);
      localStorage.clear();
    }
  };

  // Update profile function
  const updateProfile = async (profileData: ProfileUpdateData): Promise<{ success: boolean; error?: any }> => {
    try {
      if (!user) {
        return { success: false, error: { message: 'User not authenticated' } };
      }

      console.log('AuthContext - Updating profile for user:', user.id);
      
      const { data, error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        console.error('AuthContext - Profile update error:', error);
        return { success: false, error: { message: error.message || 'Failed to update profile' } };
      }

      // Update local user state
      if (data && user) {
        const updatedUser: AuthUser = {
          ...user,
          user_metadata: {
            ...user.user_metadata,
            full_name: data.full_name || user.user_metadata?.full_name
          }
        };
        setUser(updatedUser);
      }

      console.log('AuthContext - Profile updated successfully');
      return { success: true };
    } catch (error) {
      console.error('AuthContext - Profile update catch:', error);
      return { success: false, error: { message: 'An unexpected error occurred while updating profile' } };
    }
  };

  // Initialize auth state with timeout protection
  useEffect(() => {
    let mounted = true;
    let initTimeout: NodeJS.Timeout;
    let sessionTimeout: NodeJS.Timeout;

    const initializeAuth = async () => {
      try {
        console.log('AuthContext - Initializing auth state');
        
        // Check for dev user first
        const storedDevUser = localStorage.getItem("isDevUser");
        if (storedDevUser === "true") {
          const storedEmail = localStorage.getItem("userEmail");
          const storedUserType = localStorage.getItem("userType") as 'admin' | 'participant';
          const storedRoles = JSON.parse(localStorage.getItem("userRoles") || '[]');
          
          if (storedEmail && storedUserType) {
            console.log('AuthContext - Restoring dev user from localStorage');
            setDevUser(storedEmail, storedUserType, storedRoles);
            if (mounted) setLoading(false);
            return;
          }
        }
        
        // Create session fetch with timeout
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) => {
          sessionTimeout = setTimeout(() => {
            reject(new Error('Session fetch timeout'));
          }, SESSION_TIMEOUT);
        });
        
        const { data: { session }, error } = await Promise.race([
          sessionPromise,
          timeoutPromise
        ]) as any;
        
        clearTimeout(sessionTimeout);
        
        if (error) {
          console.warn('AuthContext - Session fetch error:', error.message);
          if (mounted) {
            setLoading(false);
          }
          return;
        }

        if (session?.user && mounted) {
          console.log('AuthContext - Valid session found, updating state');
          await updateUserState(session.user, session);
        } else if (mounted) {
          console.log('AuthContext - No valid session found');
          setUser(null);
          setSession(null);
          setUserType(null);
          setRoles([]);
        }
        
        if (mounted) {
          setLoading(false);
        }
      } catch (error: any) {
        console.warn('AuthContext - Initialize auth error:', error.message);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Set maximum initialization timeout
    initTimeout = setTimeout(() => {
      if (mounted && loading) {
        console.warn('AuthContext - Initialization timeout, forcing loading to false');
        setLoading(false);
      }
    }, INIT_TIMEOUT);

    // Initialize
    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!mounted) return;

        console.log('AuthContext - Auth state change:', event);
        
        try {
          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            if (newSession?.user) {
              console.log('AuthContext - Auth event:', event, 'for user:', newSession.user.email);
              await updateUserState(newSession.user, newSession);
            }
          } else if (event === 'SIGNED_OUT') {
            console.log('AuthContext - User signed out');
            setUser(null);
            setSession(null);
            setUserType(null);
            setRoles([]);
            setIsDevUser(false);
            localStorage.removeItem("userType");
            localStorage.removeItem("userEmail");
            localStorage.removeItem("userRoles");
            localStorage.removeItem("isDevUser");
          }
          
          // Ensure loading is false after any auth state change
          if (mounted) {
            setLoading(false);
          }
        } catch (error) {
          console.error('AuthContext - Auth state change error:', error);
          if (mounted) {
            setLoading(false);
          }
        }
      }
    );

    return () => {
      mounted = false;
      clearTimeout(initTimeout);
      clearTimeout(sessionTimeout);
      subscription.unsubscribe();
    };
  }, [determineUserType, fetchUserRoles, updateUserState]);

  const isAuthenticated = !!user && !!session;

  const contextValue: AuthContextType = {
    user,
    session,
    userType,
    roles,
    isAuthenticated,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    hasRole,
    hasAnyRole,
    setDevUser
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};