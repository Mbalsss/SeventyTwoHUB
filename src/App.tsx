import React, { Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import AdminLayout from "./layouts/AdminLayout";

// Import error pages directly (not lazy loaded)
import Unauthorized from "./pages/errors/Unauthorized";
import NotFound from "./pages/errors/NotFound";

// Import public pages directly for faster initial load
import SplashScreen from "./pages/SplashScreen";
import WelcomeScreen from "./pages/WelcomeScreen";
import UnifiedLogin from "./pages/UnifiedLogin";

// Lazy load heavy components
const Dashboard = React.lazy(() => import("./pages/Dashboard"));
const ProgramDashboard = React.lazy(() => import("./pages/ProgramDashboard"));
const Analytics = React.lazy(() => import("./pages/Analytics"));
const RoadmapGenerator = React.lazy(() => import("./pages/RoadmapGenerator"));
const Resources = React.lazy(() => import("./pages/Resources"));
const LearningModules = React.lazy(() => import("./pages/LearningModules"));
const Toolkit = React.lazy(() => import("./pages/Toolkit"));
const Community = React.lazy(() => import("./pages/Community"));
const FundingFinder = React.lazy(() => import("./pages/FundingFinder"));
const ExpertSessions = React.lazy(() => import("./pages/ExpertSessions"));
const Marketplace = React.lazy(() => import("./pages/Marketplace"));
const MentorshipHub = React.lazy(() => import("./pages/MentorshipHub"));
const Applications = React.lazy(() => import("./pages/Applications"));
const Profile = React.lazy(() => import("./pages/Profile"));
const DataInput = React.lazy(() => import("./pages/DataInput"));

// Lazy load admin pages
const AdminDashboard = React.lazy(() => import("./pages/admin/AdminDashboard"));
const ProgramManagement = React.lazy(() => import("./pages/admin/ProgramManagement"));

// Lazy load registration pages
const PublicApplicationForm = React.lazy(() => import("./pages/PublicApplicationForm"));
const CreateAccount = React.lazy(() => import("./pages/registration/CreateAccount"));
const CreateAccountWithValidation = React.lazy(() => import("./pages/registration/CreateAccountWithValidation"));
const BusinessInformation = React.lazy(() => import("./pages/registration/BusinessInformation"));
const ApplicationType = React.lazy(() => import("./pages/registration/ApplicationType"));
const Confirmation = React.lazy(() => import("./pages/registration/Confirmation"));

// Loading component
const LoadingFallback: React.FC = () => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
);

// Error Boundary Component
class ErrorBoundary extends React.Component<
    { children: React.ReactNode },
    { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center max-w-md mx-auto p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
              <p className="text-gray-600 mb-4">
                The application encountered an error. Please refresh the page or try again later.
              </p>
              <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
              >
                Refresh Page
              </button>
            </div>
          </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  return (
      <ErrorBoundary>
        <AuthProvider>
          <Router>
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                {/* Root redirect */}
                <Route path="/" element={<Navigate to="/splash" replace />} />

                {/* Public Routes */}
                <Route path="/splash" element={<SplashScreen />} />
                <Route path="/welcome" element={<WelcomeScreen />} />
                <Route path="/login" element={<UnifiedLogin />} />

                {/* Public Registration Routes */}
                <Route path="/apply/:linkId" element={<PublicApplicationForm />} />
                <Route path="/register/account" element={<CreateAccount />} />
                <Route path="/register/account-validated" element={<CreateAccountWithValidation />} />
                <Route path="/register/business" element={<BusinessInformation />} />
                <Route path="/register/application-type" element={<ApplicationType />} />
                <Route path="/register/confirmation" element={<Confirmation />} />

                {/* Admin Routes */}
                <Route
                    path="/admin/*"
                    element={
                      <ProtectedRoute requiredRoles={['admin', 'super_admin', 'program_manager', 'client_admin']}>
                        <AdminLayout />
                      </ProtectedRoute>
                    }
                >
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="programs" element={<ProgramManagement />} />
                </Route>

                {/* User Routes */}
                <Route
                    path="/dashboard/*"
                    element={
                      <ProtectedRoute requiredRoles={['participant']}>
                        <Layout />
                      </ProtectedRoute>
                    }
                >
                  <Route index element={<Dashboard />} />
                  <Route path="program/:programId" element={<ProgramDashboard />} />
                  <Route path="analytics" element={<Analytics />} />
                  <Route path="roadmap" element={<RoadmapGenerator />} />
                  <Route path="resources" element={<Resources />} />
                  <Route path="learning" element={<LearningModules />} />
                  <Route path="toolkit" element={<Toolkit />} />
                  <Route path="community" element={<Community />} />
                  <Route path="funding" element={<FundingFinder />} />
                  <Route path="experts" element={<ExpertSessions />} />
                  <Route path="marketplace" element={<Marketplace />} />
                  <Route path="mentorship" element={<MentorshipHub />} />
                  <Route path="applications" element={<Applications />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="data-input" element={<DataInput />} />
                </Route>

                {/* Error Routes */}
                <Route path="/unauthorized" element={<Unauthorized />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </Router>
        </AuthProvider>
      </ErrorBoundary>
  );
}

export default App;