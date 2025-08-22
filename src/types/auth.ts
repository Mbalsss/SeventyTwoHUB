export type UserRole = 'participant' | 'admin' | 'client_admin' | 'program_manager' | 'super_admin';

export interface User {
  id: string;
  email: string;
  roles: UserRole[];
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
}

export interface RouteConfig {
  path: string;
  element: React.ComponentType;
  requiredRoles?: UserRole[];
  layout?: 'default' | 'admin' | 'public';
  isPublic?: boolean;
  isLazy?: boolean;
}