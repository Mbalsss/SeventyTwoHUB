import React, { lazy } from 'react';
import type { RouteConfig } from '../types/auth';

// Lazy load components for better performance
const Dashboard = lazy(() => import('../pages/Dashboard'));
const Analytics = lazy(() => import('../pages/Analytics'));
const RoadmapGenerator = lazy(() => import('../pages/RoadmapGenerator'));
const Resources = lazy(() => import('../pages/Resources'));
const LearningModules = lazy(() => import('../pages/LearningModules'));
const Toolkit = lazy(() => import('../pages/Toolkit'));
const Community = lazy(() => import('../pages/Community'));
const FundingFinder = lazy(() => import('../pages/FundingFinder'));
const ExpertSessions = lazy(() => import('../pages/ExpertSessions'));
const Marketplace = lazy(() => import('../pages/Marketplace'));
const MentorshipHub = lazy(() => import('../pages/MentorshipHub'));
const Applications = lazy(() => import('../pages/Applications'));
const Profile = lazy(() => import('../pages/Profile'));
const DataInput = lazy(() => import('../pages/DataInput'));
const ProgramDashboard = lazy(() => import('../pages/ProgramDashboard'));

// Admin pages
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'));
const AdminProgramManagement = lazy(() => import('../pages/admin/ProgramManagement'));

// Public pages (no lazy loading needed for critical pages)
import SplashScreen from '../pages/SplashScreen';
import WelcomeScreen from '../pages/WelcomeScreen';
import UnifiedLogin from '../pages/UnifiedLogin';
import PublicApplicationForm from '../pages/PublicApplicationForm';
import CreateAccount from '../pages/registration/CreateAccount';
import BusinessInformation from '../pages/registration/BusinessInformation';
import SupportingDocuments from '../pages/registration/SupportingDocuments';
import ApplicationType from '../pages/registration/ApplicationType';
import Confirmation from '../pages/registration/Confirmation';

// Error pages
import Unauthorized from '../pages/errors/Unauthorized';
import NotFound from '../pages/errors/NotFound';

export const publicRoutes: RouteConfig[] = [
  {
    path: '/splash',
    element: SplashScreen,
    isPublic: true,
    layout: 'public'
  },
  {
    path: '/welcome',
    element: WelcomeScreen,
    isPublic: true,
    layout: 'public'
  },
  {
    path: '/login',
    element: UnifiedLogin,
    isPublic: true,
    layout: 'public'
  },
  {
    path: '/apply/:linkId',
    element: PublicApplicationForm,
    isPublic: true,
    layout: 'public'
  },
  {
    path: '/register/account',
    element: CreateAccount,
    isPublic: true,
    layout: 'public'
  },
  {
    path: '/register/business',
    element: BusinessInformation,
    isPublic: true,
    layout: 'public'
  },
  {
    path: '/register/documents',
    element: SupportingDocuments,
    isPublic: true,
    layout: 'public'
  },
  {
    path: '/register/application-type',
    element: ApplicationType,
    isPublic: true,
    layout: 'public'
  },
  {
    path: '/register/confirmation',
    element: Confirmation,
    isPublic: true,
    layout: 'public'
  }
];

export const adminRoutes: RouteConfig[] = [
  {
    path: '/admin/dashboard',
    element: AdminDashboard,
    requiredRoles: ['admin', 'super_admin', 'program_manager', 'client_admin'],
    layout: 'admin',
    isLazy: true
  },
  {
    path: '/admin/programs',
    element: AdminProgramManagement,
    requiredRoles: ['admin', 'super_admin', 'program_manager'],
    layout: 'admin',
    isLazy: true
  }
];

export const userRoutes: RouteConfig[] = [
  {
    path: '/',
    element: Dashboard,
    requiredRoles: ['participant'],
    layout: 'default',
    isLazy: true
  },
  {
    path: '/program/:programId',
    element: ProgramDashboard,
    requiredRoles: ['participant'],
    layout: 'default',
    isLazy: true
  },
  {
    path: '/analytics',
    element: Analytics,
    requiredRoles: ['participant'],
    layout: 'default',
    isLazy: true
  },
  {
    path: '/roadmap',
    element: RoadmapGenerator,
    requiredRoles: ['participant'],
    layout: 'default',
    isLazy: true
  },
  {
    path: '/resources',
    element: Resources,
    requiredRoles: ['participant'],
    layout: 'default',
    isLazy: true
  },
  {
    path: '/learning',
    element: LearningModules,
    requiredRoles: ['participant'],
    layout: 'default',
    isLazy: true
  },
  {
    path: '/toolkit',
    element: Toolkit,
    requiredRoles: ['participant'],
    layout: 'default',
    isLazy: true
  },
  {
    path: '/community',
    element: Community,
    requiredRoles: ['participant'],
    layout: 'default',
    isLazy: true
  },
  {
    path: '/funding',
    element: FundingFinder,
    requiredRoles: ['participant'],
    layout: 'default',
    isLazy: true
  },
  {
    path: '/experts',
    element: ExpertSessions,
    requiredRoles: ['participant'],
    layout: 'default',
    isLazy: true
  },
  {
    path: '/marketplace',
    element: Marketplace,
    requiredRoles: ['participant'],
    layout: 'default',
    isLazy: true
  },
  {
    path: '/mentorship',
    element: MentorshipHub,
    requiredRoles: ['participant'],
    layout: 'default',
    isLazy: true
  },
  {
    path: '/applications',
    element: Applications,
    requiredRoles: ['participant'],
    layout: 'default',
    isLazy: true
  },
  {
    path: '/profile',
    element: Profile,
    requiredRoles: ['participant'],
    layout: 'default',
    isLazy: true
  },
  {
    path: '/data-input',
    element: DataInput,
    requiredRoles: ['participant'],
    layout: 'default',
    isLazy: true
  }
];

export const errorRoutes: RouteConfig[] = [
  {
    path: '/unauthorized',
    element: Unauthorized,
    isPublic: true,
    layout: 'public'
  },
  {
    path: '*',
    element: NotFound,
    isPublic: true,
    layout: 'public'
  }
];

export const allRoutes = [...publicRoutes, ...adminRoutes, ...userRoutes, ...errorRoutes];