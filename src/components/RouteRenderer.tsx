import React, { Suspense } from 'react';
import { Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import Layout from './Layout';
import AdminLayout from '../layouts/AdminLayout';
import type { RouteConfig } from '../types/auth';

interface RouteRendererProps {
  route: RouteConfig;
}

const LoadingFallback: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

const RouteRenderer: React.FC<RouteRendererProps> = ({ route }) => {
  const Component = route.element;
  
  // Wrap component with Suspense if it's lazy loaded
  const WrappedComponent = route.isLazy ? (
    <Suspense fallback={<LoadingFallback />}>
      <Component />
    </Suspense>
  ) : (
    <Component />
  );

  // Handle public routes
  if (route.isPublic) {
    return (
      <Route
        key={route.path}
        path={route.path}
        element={WrappedComponent}
      />
    );
  }

  // Handle protected routes with layout
  const getLayoutWrapper = () => {
    switch (route.layout) {
      case 'admin':
        return (
          <ProtectedRoute requiredRoles={route.requiredRoles}>
            <AdminLayout>
              {WrappedComponent}
            </AdminLayout>
          </ProtectedRoute>
        );
      
      case 'default':
        return (
          <ProtectedRoute requiredRoles={route.requiredRoles}>
            <Layout>
              {WrappedComponent}
            </Layout>
          </ProtectedRoute>
        );
      
      default:
        return (
          <ProtectedRoute requiredRoles={route.requiredRoles}>
            {WrappedComponent}
          </ProtectedRoute>
        );
    }
  };

  return (
    <Route
      key={route.path}
      path={route.path}
      element={getLayoutWrapper()}
    />
  );
};

export default RouteRenderer;