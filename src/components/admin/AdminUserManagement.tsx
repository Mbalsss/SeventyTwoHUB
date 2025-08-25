import React, { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    Edit,
    Trash2,
    Shield,
    User,
    Mail,
    Phone,
    Calendar,
    MoreVertical,
    UserPlus,
    Key,
    AlertTriangle,
    CheckCircle,
    X,
    Eye,
    EyeOff
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

interface AdminUser {
    id: string;
    full_name: string;
    email: string;
    mobile_number?: string;
    created_at: string;
    updated_at: string;
    roles: string[];
    account_status: string;
    last_sign_in?: string;
    two_factor_enabled: boolean;
}

interface NewUserForm {
    full_name: string;
    email: string;
    mobile_number: string;
    password: string;
    confirmPassword: string;
    roles: string[];
    send_invitation: boolean;
}

const AdminUserManagement: React.FC = () => {
    const { user: currentUser, hasAnyRole } = useAuth();
    const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<AdminUser[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRole, setSelectedRole] = useState('all');
    const [showAddUserModal, setShowAddUserModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [newUserForm, setNewUserForm] = useState<NewUserForm>({
        full_name: '',
        email: '',
        mobile_number: '',
        password: '',
        confirmPassword: '',
        roles: ['admin'],
        send_invitation: true
    });

    const adminRoles = [
        { id: 'admin', name: 'Admin', description: 'Full platform access except system settings' },
        { id: 'super_admin', name: 'Super Admin', description: 'Complete platform control and system settings' },
        { id: 'program_manager', name: 'Program Manager', description: 'Manage programs and applications' },
        { id: 'client_admin', name: 'Client Admin', description: 'Review business registrations and client management' }
    ];

    useEffect(() => {
        loadAdminUsers();
    }, []);

    useEffect(() => {
        filterUsers();
    }, [adminUsers, searchTerm, selectedRole]);

    const loadAdminUsers = async () => {
        try {
            setLoading(true);

            // Load users with admin roles
            const { data: userRoles, error: rolesError } = await supabase
                .from('user_roles')
                .select(`
          user_id,
          role,
          profiles!user_roles_user_id_fkey(
            id,
            full_name,
            mobile_number,
            created_at,
            updated_at,
            account_status,
            two_factor_enabled
          )
        `)
                .in('role', ['admin', 'super_admin', 'program_manager', 'client_admin']);

            if (rolesError) throw rolesError;

            // Group roles by user and get auth metadata
            const userMap = new Map<string, AdminUser>();

            for (const roleData of userRoles || []) {
                const profile = roleData.profiles;
                if (!profile) continue;

                const userId = profile.id;

                // Get user email from auth.users (if accessible)
                let userEmail = 'Email protected';
                try {
                    // Try to get email from auth metadata if available
                    const { data: authUser } = await supabase.auth.admin.getUserById(userId);
                    userEmail = authUser.user?.email || 'Email protected';
                } catch (error) {
                    // Fallback: email is protected for security
                    console.log('Email access restricted for security');
                }

                if (userMap.has(userId)) {
                    // Add role to existing user
                    const existingUser = userMap.get(userId)!;
                    existingUser.roles.push(roleData.role);
                } else {
                    // Create new user entry
                    userMap.set(userId, {
                        id: userId,
                        full_name: profile.full_name,
                        email: userEmail,
                        mobile_number: profile.mobile_number,
                        created_at: profile.created_at,
                        updated_at: profile.updated_at,
                        roles: [roleData.role],
                        account_status: profile.account_status || 'active',
                        two_factor_enabled: profile.two_factor_enabled || false
                    });
                }
            }

            setAdminUsers(Array.from(userMap.values()));
        } catch (error) {
            console.error('Error loading admin users:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterUsers = () => {
        let filtered = [...adminUsers];

        if (searchTerm) {
            filtered = filtered.filter(user =>
                user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (selectedRole !== 'all') {
            filtered = filtered.filter(user => user.roles.includes(selectedRole));
        }

        setFilteredUsers(filtered);
    };

    const validateNewUserForm = (): string | null => {
        if (!newUserForm.full_name.trim()) return 'Full name is required';
        if (!newUserForm.email.trim()) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newUserForm.email)) return 'Invalid email format';
        if (!newUserForm.password) return 'Password is required';
        if (newUserForm.password.length < 8) return 'Password must be at least 8 characters';
        if (newUserForm.password !== newUserForm.confirmPassword) return 'Passwords do not match';
        if (newUserForm.roles.length === 0) return 'At least one role must be assigned';

        // Check for admin email pattern for security
        if (newUserForm.roles.some(role => ['admin', 'super_admin'].includes(role))) {
            if (!newUserForm.email.includes('admin') && !newUserForm.email.endsWith('@bizboost.co.za')) {
                return 'Admin accounts must use an admin email address';
            }
        }

        return null;
    };

    const createAdminUser = async () => {
        try {
            setSubmitting(true);

            const validationError = validateNewUserForm();
            if (validationError) {
                alert(validationError);
                return;
            }

            // Check if user already exists
            const { data: existingUser } = await supabase
                .from('profiles')
                .select('id')
                .eq('email', newUserForm.email.trim().toLowerCase())
                .maybeSingle();

            if (existingUser) {
                alert('A user with this email already exists');
                return;
            }

            // Create user account using Supabase Auth Admin API
            const { data: authData, error: authError } = await supabase.auth.admin.createUser({
                email: newUserForm.email.trim(),
                password: newUserForm.password,
                email_confirm: !newUserForm.send_invitation, // Auto-confirm if not sending invitation
                user_metadata: {
                    full_name: newUserForm.full_name,
                    mobile_number: newUserForm.mobile_number,
                    created_by_admin: currentUser?.id,
                    account_type: 'admin'
                }
            });

            if (authError) throw authError;

            const newUserId = authData.user.id;

            // Create profile record
            const { error: profileError } = await supabase
                .from('profiles')
                .insert({
                    id: newUserId,
                    full_name: newUserForm.full_name,
                    mobile_number: newUserForm.mobile_number || null,
                    account_status: 'approved',
                    two_factor_enabled: false
                });

            if (profileError) throw profileError;

            // Assign roles
            const roleInserts = newUserForm.roles.map(role => ({
                user_id: newUserId,
                role: role
            }));

            const { error: rolesError } = await supabase
                .from('user_roles')
                .insert(roleInserts);

            if (rolesError) throw rolesError;

            // Send invitation email if requested
            if (newUserForm.send_invitation) {
                try {
                    const { error: inviteError } = await supabase.auth.admin.inviteUserByEmail(
                        newUserForm.email.trim(),
                        {
                            redirectTo: `${window.location.origin}/login`,
                            data: {
                                full_name: newUserForm.full_name,
                                roles: newUserForm.roles
                            }
                        }
                    );

                    if (inviteError) {
                        console.warn('Invitation email failed:', inviteError);
                        // Don't fail the whole operation if email fails
                    }
                } catch (emailError) {
                    console.warn('Email invitation error:', emailError);
                }
            }

            // Reset form and reload users
            setNewUserForm({
                full_name: '',
                email: '',
                mobile_number: '',
                password: '',
                confirmPassword: '',
                roles: ['admin'],
                send_invitation: true
            });

            setShowAddUserModal(false);
            await loadAdminUsers();

            alert(`Admin user created successfully! ${newUserForm.send_invitation ? 'Invitation email sent.' : 'User can now log in.'}`);
        } catch (error) {
            console.error('Error creating admin user:', error);
            alert('Error creating admin user. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const updateUserRoles = async (userId: string, newRoles: string[]) => {
        try {
            // Remove existing roles
            const { error: deleteError } = await supabase
                .from('user_roles')
                .delete()
                .eq('user_id', userId);

            if (deleteError) throw deleteError;

            // Add new roles
            if (newRoles.length > 0) {
                const roleInserts = newRoles.map(role => ({
                    user_id: userId,
                    role: role
                }));

                const { error: insertError } = await supabase
                    .from('user_roles')
                    .insert(roleInserts);

                if (insertError) throw insertError;
            }

            await loadAdminUsers();
            alert('User roles updated successfully!');
        } catch (error) {
            console.error('Error updating user roles:', error);
            alert('Error updating user roles');
        }
    };

    const deleteAdminUser = async (userId: string, userName: string) => {
        if (!confirm(`Are you sure you want to delete admin user "${userName}"? This action cannot be undone.`)) {
            return;
        }

        try {
            // Delete user roles first (due to foreign key constraints)
            const { error: rolesError } = await supabase
                .from('user_roles')
                .delete()
                .eq('user_id', userId);

            if (rolesError) throw rolesError;

            // Delete profile
            const { error: profileError } = await supabase
                .from('profiles')
                .delete()
                .eq('id', userId);

            if (profileError) throw profileError;

            // Delete from auth (if accessible)
            try {
                await supabase.auth.admin.deleteUser(userId);
            } catch (authError) {
                console.warn('Could not delete from auth:', authError);
                // Continue anyway as profile is deleted
            }

            await loadAdminUsers();
            alert('Admin user deleted successfully');
        } catch (error) {
            console.error('Error deleting admin user:', error);
            alert('Error deleting admin user');
        }
    };

    const toggleUserStatus = async (userId: string, currentStatus: string) => {
        try {
            const newStatus = currentStatus === 'active' ? 'suspended' : 'active';

            const { error } = await supabase
                .from('profiles')
                .update({
                    account_status: newStatus,
                    updated_at: new Date().toISOString()
                })
                .eq('id', userId);

            if (error) throw error;

            await loadAdminUsers();
            alert(`User ${newStatus === 'active' ? 'activated' : 'suspended'} successfully`);
        } catch (error) {
            console.error('Error updating user status:', error);
            alert('Error updating user status');
        }
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'super_admin': return 'bg-red-100 text-red-800';
            case 'admin': return 'bg-blue-100 text-blue-800';
            case 'program_manager': return 'bg-green-100 text-green-800';
            case 'client_admin': return 'bg-purple-100 text-purple-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800';
            case 'suspended': return 'bg-red-100 text-red-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const canManageUser = (targetUser: AdminUser): boolean => {
        // Super admins can manage anyone
        if (hasAnyRole(['super_admin'])) return true;

        // Admins can manage non-super-admin users
        if (hasAnyRole(['admin']) && !targetUser.roles.includes('super_admin')) return true;

        // Users cannot manage themselves for role changes
        if (targetUser.id === currentUser?.id) return false;

        return false;
    };

    const canDeleteUser = (targetUser: AdminUser): boolean => {
        // Only super admins can delete users
        if (!hasAnyRole(['super_admin'])) return false;

        // Cannot delete yourself
        if (targetUser.id === currentUser?.id) return false;

        return true;
    };

    if (loading) {
        return (
            <div className="text-center py-8">
                <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading admin users...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Admin User Management</h2>
                    <p className="text-gray-600">Manage admin users and their roles</p>
                </div>

                {hasAnyRole(['admin', 'super_admin']) && (
                    <button
                        onClick={() => setShowAddUserModal(true)}
                        className="mt-4 sm:mt-0 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center space-x-2"
                    >
                        <UserPlus className="w-4 h-4" />
                        <span>Add Admin User</span>
                    </button>
                )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {adminRoles.map(role => {
                    const count = adminUsers.filter(user => user.roles.includes(role.id)).length;
                    return (
                        <div key={role.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                            <div className="text-2xl font-bold text-gray-900">{count}</div>
                            <div className="text-gray-600 text-sm">{role.name}s</div>
                        </div>
                    );
                })}
            </div>

            {/* Search and Filters */}
            <div className="bg-gray-50 rounded-xl p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search admin users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                    </div>

                    <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                        <option value="all">All Roles</option>
                        {adminRoles.map(role => (
                            <option key={role.id} value={role.id}>{role.name}</option>
                        ))}
                    </select>

                    <div className="text-sm text-gray-600 flex items-center">
                        Total: {filteredUsers.length} admin users
                    </div>
                </div>
            </div>

            {/* Admin Users List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                User
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Roles
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                2FA
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Created
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {filteredUsers.map(user => (
                            <tr key={user.id} className="hover:bg-gray-50">
                                <td className="px-4 py-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-medium">
                          {user.full_name.split(' ').map(n => n[0]).join('')}
                        </span>
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900 text-sm">{user.full_name}</div>
                                            <div className="text-gray-500 text-xs">{user.email}</div>
                                            {user.mobile_number && (
                                                <div className="text-gray-500 text-xs">{user.mobile_number}</div>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-4">
                                    <div className="flex flex-wrap gap-1">
                                        {user.roles.map(role => (
                                            <span
                                                key={role}
                                                className={`px-2 py-1 text-xs rounded-full ${getRoleColor(role)}`}
                                            >
                          {adminRoles.find(r => r.id === role)?.name || role}
                        </span>
                                        ))}
                                    </div>
                                </td>
                                <td className="px-4 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(user.account_status)}`}>
                      {user.account_status}
                    </span>
                                </td>
                                <td className="px-4 py-4">
                                    <div className="flex items-center space-x-1">
                                        {user.two_factor_enabled ? (
                                            <CheckCircle className="w-4 h-4 text-green-600" />
                                        ) : (
                                            <X className="w-4 h-4 text-red-600" />
                                        )}
                                        <span className="text-xs text-gray-600">
                        {user.two_factor_enabled ? 'Enabled' : 'Disabled'}
                      </span>
                                    </div>
                                </td>
                                <td className="px-4 py-4 text-sm text-gray-500">
                                    {new Date(user.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-4">
                                    <div className="flex items-center space-x-2">
                                        {canManageUser(user) && (
                                            <>
                                                <button
                                                    onClick={() => {
                                                        setSelectedUser(user);
                                                        setShowEditModal(true);
                                                    }}
                                                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                                    title="Edit user"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>

                                                <button
                                                    onClick={() => toggleUserStatus(user.id, user.account_status)}
                                                    className="p-1 text-gray-400 hover:text-yellow-600 transition-colors"
                                                    title={user.account_status === 'active' ? 'Suspend user' : 'Activate user'}
                                                >
                                                    <Shield className="w-4 h-4" />
                                                </button>
                                            </>
                                        )}

                                        {canDeleteUser(user) && (
                                            <button
                                                onClick={() => deleteAdminUser(user.id, user.full_name)}
                                                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                                title="Delete user"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add User Modal */}
            {showAddUserModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-gray-900">Add Admin User</h3>
                            <button
                                onClick={() => setShowAddUserModal(false)}
                                className="p-1 hover:bg-gray-100 rounded transition-colors"
                            >
                                <X className="w-4 h-4 text-gray-500" />
                            </button>
                        </div>

                        <form onSubmit={(e) => { e.preventDefault(); createAdminUser(); }} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Full Name <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        value={newUserForm.full_name}
                                        onChange={(e) => setNewUserForm(prev => ({ ...prev, full_name: e.target.value }))}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        placeholder="Enter full name"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email Address <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="email"
                                        value={newUserForm.email}
                                        onChange={(e) => setNewUserForm(prev => ({ ...prev, email: e.target.value }))}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        placeholder="admin@bizboost.co.za"
                                        required
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    Admin emails should contain 'admin' or end with '@bizboost.co.za'
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Mobile Number
                                </label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="tel"
                                        value={newUserForm.mobile_number}
                                        onChange={(e) => setNewUserForm(prev => ({ ...prev, mobile_number: e.target.value }))}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        placeholder="+27 XX XXX XXXX"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Password <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={newUserForm.password}
                                        onChange={(e) => setNewUserForm(prev => ({ ...prev, password: e.target.value }))}
                                        className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        placeholder="Create secure password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    Minimum 8 characters with mixed case, numbers, and symbols
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Confirm Password <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        value={newUserForm.confirmPassword}
                                        onChange={(e) => setNewUserForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                        className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        placeholder="Confirm password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Admin Roles <span className="text-red-500">*</span>
                                </label>
                                <div className="space-y-2">
                                    {adminRoles.map(role => (
                                        <label key={role.id} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={newUserForm.roles.includes(role.id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setNewUserForm(prev => ({ ...prev, roles: [...prev.roles, role.id] }));
                                                    } else {
                                                        setNewUserForm(prev => ({ ...prev, roles: prev.roles.filter(r => r !== role.id) }));
                                                    }
                                                }}
                                                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 mt-0.5"
                                            />
                                            <div>
                                                <div className="font-medium text-gray-900 text-sm">{role.name}</div>
                                                <div className="text-gray-600 text-xs">{role.description}</div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <label className="flex items-start space-x-3">
                                    <input
                                        type="checkbox"
                                        checked={newUserForm.send_invitation}
                                        onChange={(e) => setNewUserForm(prev => ({ ...prev, send_invitation: e.target.checked }))}
                                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 mt-0.5"
                                    />
                                    <div>
                                        <span className="text-sm font-medium text-gray-900">Send Invitation Email</span>
                                        <p className="text-xs text-gray-600 mt-1">
                                            Send an email invitation with login instructions. If unchecked, user can log in immediately.
                                        </p>
                                    </div>
                                </label>
                            </div>

                            <div className="flex space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowAddUserModal(false)}
                                    disabled={submitting}
                                    className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 transition-colors"
                                >
                                    {submitting ? (
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                                    ) : (
                                        'Create Admin User'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit User Modal */}
            {showEditModal && selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-gray-900">Edit User Roles</h3>
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="p-1 hover:bg-gray-100 rounded transition-colors"
                            >
                                <X className="w-4 h-4 text-gray-500" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <h4 className="font-medium text-gray-900 mb-2">{selectedUser.full_name}</h4>
                                <p className="text-gray-600 text-sm">{selectedUser.email}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Assigned Roles
                                </label>
                                <div className="space-y-2">
                                    {adminRoles.map(role => (
                                        <label key={role.id} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={selectedUser.roles.includes(role.id)}
                                                onChange={(e) => {
                                                    const newRoles = e.target.checked
                                                        ? [...selectedUser.roles, role.id]
                                                        : selectedUser.roles.filter(r => r !== role.id);
                                                    setSelectedUser(prev => prev ? { ...prev, roles: newRoles } : null);
                                                }}
                                                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 mt-0.5"
                                            />
                                            <div>
                                                <div className="font-medium text-gray-900 text-sm">{role.name}</div>
                                                <div className="text-gray-600 text-xs">{role.description}</div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="flex space-x-3 pt-4">
                                <button
                                    onClick={() => setShowEditModal(false)}
                                    className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        updateUserRoles(selectedUser.id, selectedUser.roles);
                                        setShowEditModal(false);
                                    }}
                                    className="flex-1 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                                >
                                    Update Roles
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {filteredUsers.length === 0 && !loading && (
                <div className="text-center py-12">
                    <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No admin users found</h3>
                    <p className="text-gray-600">Create your first admin user to get started.</p>
                </div>
            )}
        </div>
    );
};

export default AdminUserManagement;