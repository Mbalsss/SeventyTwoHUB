import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../types/auth.types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
  requireAdmin?: boolean; // Backward compatibility
  fallbackPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRoles = [],
  requireAdmin = false,
  fallbackPath = '/unauthorized'
}) => {
  const { user, userType, roles, loading, isAuthenticated, hasAnyRole } = useAuth();
  const location = useLocation();

  console.log('ProtectedRoute - Auth check:', {
    hasUser: !!user,
    userType,
    roles,
    requiredRoles,
    requireAdmin,
    loading,
    currentPath: location.pathname,
    isAuthenticated
  });

  // Show loading while auth is initializing
  if (loading) {
    console.log('ProtectedRoute - Auth still loading');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Check if user is authenticated
  if (!isAuthenticated) {
    console.log('ProtectedRoute - Not authenticated, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Log final auth state before rendering
  console.log('ProtectedRoute - Final auth state:', {
    user: !!user,
    userType,
    roles,
    isAuthenticated,
    path: location.pathname
  });

  // Additional security check for admin routes
  if (location.pathname.startsWith('/admin/')) {
    const adminRoles: UserRole[] = ['admin', 'super_admin', 'program_manager', 'client_admin'];
    const isAdmin = hasAnyRole(adminRoles) || userType === 'admin';
    
    if (!isAdmin) {
      console.log('ProtectedRoute - Admin route access denied for user type:', userType);
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // Handle backward compatibility with requireAdmin prop
  if (requireAdmin) {
    const adminRoles: UserRole[] = ['admin', 'super_admin', 'program_manager', 'client_admin'];
    const isAdmin = hasAnyRole(adminRoles) || userType === 'admin';
    
    if (!isAdmin) {
      console.log('ProtectedRoute - Admin access required but user is not admin');
      return <Navigate to={fallbackPath} replace />;
    }
  }

  // Check specific role requirements
  if (requiredRoles.length > 0) {
    const hasRequiredRole = hasAnyRole(requiredRoles);
    
    // Fallback check using userType for backward compatibility
    const fallbackCheck = requiredRoles.some(role => {
      if (userType === 'admin' && ['admin', 'super_admin', 'program_manager', 'client_admin'].includes(role)) {
        return true;
      }
      return userType === 'participant' && role === 'participant';

    });

    if (!hasRequiredRole && !fallbackCheck) {
      console.log('ProtectedRoute - Insufficient permissions:', {
        userType,
        roles,
        requiredRoles,
        hasRequiredRole,
        fallbackCheck
      });
      return <Navigate to={fallbackPath} replace />;
    }
  }

  console.log('ProtectedRoute - Access granted');
  return <>{children}</>;
};

export default ProtectedRoute;