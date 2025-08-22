// Admin utility functions and helpers

export const formatUserRole = (role: string): string => {
  const roleMap: { [key: string]: string } = {
    'participant': 'Participant',
    'admin': 'Admin',
    'super_admin': 'Super Admin',
    'program_manager': 'Program Manager',
    'client_admin': 'Client Admin'
  };
  
  return roleMap[role] || role;
};

export const formatBusinessType = (type: string): string => {
  const typeMap: { [key: string]: string } = {
    'formal': 'Formal Business',
    'informal': 'Informal Business',
    'startup': 'Startup',
    'cooperative': 'Cooperative',
    'franchise': 'Franchise'
  };
  
  return typeMap[type] || type;
};

export const formatApplicationStatus = (status: string): string => {
  const statusMap: { [key: string]: string } = {
    'draft': 'Draft',
    'submitted': 'Submitted',
    'under_review': 'Under Review',
    'approved': 'Approved',
    'rejected': 'Rejected'
  };
  
  return statusMap[status] || status;
};

export const formatRegistrationStatus = (status: string): string => {
  const statusMap: { [key: string]: string } = {
    'pending': 'Pending Review',
    'under_review': 'Under Review',
    'approved': 'Approved',
    'rejected': 'Rejected',
    'requires_documents': 'Requires Documents'
  };
  
  return statusMap[status] || status;
};

export const getStatusColor = (status: string, type: 'user' | 'program' | 'application' | 'registration'): string => {
  const colorMaps = {
    user: {
      'active': 'bg-green-100 text-green-800',
      'inactive': 'bg-gray-100 text-gray-800',
      'suspended': 'bg-red-100 text-red-800'
    },
    program: {
      'draft': 'bg-yellow-100 text-yellow-800',
      'active': 'bg-green-100 text-green-800',
      'completed': 'bg-blue-100 text-blue-800',
      'cancelled': 'bg-red-100 text-red-800'
    },
    application: {
      'draft': 'bg-gray-100 text-gray-800',
      'submitted': 'bg-yellow-100 text-yellow-800',
      'under_review': 'bg-blue-100 text-blue-800',
      'approved': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800'
    },
    registration: {
      'pending': 'bg-gray-100 text-gray-800',
      'under_review': 'bg-blue-100 text-blue-800',
      'approved': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800',
      'requires_documents': 'bg-yellow-100 text-yellow-800'
    }
  };

  return colorMaps[type][status] || 'bg-gray-100 text-gray-800';
};

export const calculateGrowthRate = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous * 100) * 10) / 10;
};

export const formatCurrency = (amount: number, currency: string = 'ZAR'): string => {
  if (currency === 'ZAR') {
    return `R${amount.toLocaleString()}`;
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const generateReferenceNumber = (prefix: string = 'REF'): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `${prefix}-${timestamp}-${random}`.toUpperCase();
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhoneNumber = (phone: string): boolean => {
  // South African phone number validation
  const phoneRegex = /^(\+27|0)[0-9]{9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const downloadCSV = (content: string, filename: string) => {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const formatTimeAgo = (date: string | Date): string => {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  
  return past.toLocaleDateString();
};

export const groupBy = <T>(array: T[], key: keyof T): { [key: string]: T[] } => {
  return array.reduce((groups, item) => {
    const group = String(item[key]);
    groups[group] = groups[group] || [];
    groups[group].push(item);
    return groups;
  }, {} as { [key: string]: T[] });
};

export const chunk = <T>(array: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

// Permission checking utilities
export const hasAdminPermission = (userRoles: string[], requiredRoles: string[]): boolean => {
  return requiredRoles.some(role => userRoles.includes(role));
};

export const canManageUsers = (userRoles: string[]): boolean => {
  return hasAdminPermission(userRoles, ['admin', 'super_admin']);
};

export const canManagePrograms = (userRoles: string[]): boolean => {
  return hasAdminPermission(userRoles, ['admin', 'super_admin', 'program_manager']);
};

export const canReviewRegistrations = (userRoles: string[]): boolean => {
  return hasAdminPermission(userRoles, ['admin', 'super_admin', 'client_admin']);
};

export const canAccessAnalytics = (userRoles: string[]): boolean => {
  return hasAdminPermission(userRoles, ['admin', 'super_admin', 'program_manager']);
};

export const canModifySettings = (userRoles: string[]): boolean => {
  return hasAdminPermission(userRoles, ['admin', 'super_admin']);
};