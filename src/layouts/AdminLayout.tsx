import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, LogOut, Users, FileText, BarChart3, Bell, UserCheck, TrendingUp, CheckCircle, Clock, DollarSign, Search, ChevronDown, Plus, Download, Filter, Building2, Cog, Lock, BellRing, Puzzle, UserCog } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AdminMobileNav from '../components/admin/AdminMobileNav';

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const [activeTab, setActiveTab] = React.useState('overview');
  const [notificationCount] = React.useState(5); // Mock notification count

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error during logout:', error);
      navigate('/login');
    }
  };

  const adminNavItems = [
    { id: 'overview', icon: BarChart3, label: 'Overview' },
    { id: 'users', icon: Users, label: 'Users' },
    { id: 'programs', icon: FileText, label: 'Programs' },
    { id: 'registrations', icon: UserCheck, label: 'Registrations' },
    { id: 'analytics', icon: TrendingUp, label: 'Analytics' },
    { id: 'general', icon: Cog, label: 'General' },
    { id: 'security', icon: Lock, label: 'Security' },
    { id: 'notifications', icon: BellRing, label: 'Notifications' },
    { id: 'integrations', icon: Puzzle, label: 'Integrations' },
    { id: 'access-control', icon: UserCog, label: 'Access Control' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      {/* Admin Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Shield className="w-6 h-6 text-primary-500" />
                <span className="text-xl font-bold text-gray-900">SeventyTwo X</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Bell className="w-5 h-5 text-gray-600" />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {notificationCount}
                  </span>
                )}
              </div>
              <span className="text-sm text-gray-600">
                Welcome, {user?.email?.split('@')[0] || 'Admin'}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Admin Sidebar */}
        <nav className="hidden md:block w-64 bg-white shadow-sm h-screen sticky top-16">
          <div className="p-4">
            <ul className="space-y-2">
              {adminNavItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-500'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6">
          {activeTab === 'overview' && (
            <div>
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
                <p className="text-gray-600 mt-1">Monitor platform performance and key metrics</p>
              </div>
              
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <Users className="w-5 h-5 text-blue-500" />
                        <span className="text-green-500 text-sm font-medium">+0%</span>
                      </div>
                      <p className="text-3xl font-bold text-gray-900">0</p>
                      <p className="text-sm text-gray-600">Total Users</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <FileText className="w-5 h-5 text-green-500" />
                        <span className="text-green-500 text-sm font-medium">+12.5%</span>
                      </div>
                      <p className="text-3xl font-bold text-gray-900">0</p>
                      <p className="text-sm text-gray-600">Active Programs</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <Clock className="w-5 h-5 text-orange-500" />
                        <span className="text-green-500 text-sm font-medium">+8.3%</span>
                      </div>
                      <p className="text-3xl font-bold text-gray-900">0</p>
                      <p className="text-sm text-gray-600">Pending Reviews</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <DollarSign className="w-5 h-5 text-purple-500" />
                        <span className="text-green-500 text-sm font-medium">+15.2%</span>
                      </div>
                      <p className="text-3xl font-bold text-gray-900">R2.4M</p>
                      <p className="text-sm text-gray-600">Platform Revenue</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Bottom Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Pending Actions</h3>
                    <span className="text-red-500 text-sm">0 items</span>
                  </div>
                  <div className="flex flex-col items-center justify-center py-8">
                    <CheckCircle className="w-12 h-12 text-green-500 mb-3" />
                    <p className="text-gray-600">All caught up!</p>
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    <p className="text-gray-600 text-center py-8">No recent activity</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'users' && (
            <div>
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Users Management</h1>
                <p className="text-gray-600 mt-1">Manage platform users and their permissions</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6">
                  {/* Search and Filter Bar */}
                  <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Search users..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="flex gap-3">
                      <div className="relative">
                        <select className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                          <option>All Roles</option>
                          <option>Admin</option>
                          <option>User</option>
                          <option>Moderator</option>
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                      </div>
                      <div className="relative">
                        <select className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                          <option>All Status</option>
                          <option>Active</option>
                          <option>Inactive</option>
                          <option>Pending</option>
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                      </div>
                      <div className="relative">
                        <select className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                          <option>Newest First</option>
                          <option>Oldest First</option>
                          <option>Name A-Z</option>
                          <option>Name Z-A</option>
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  {/* Table Header */}
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4">
                            <input type="checkbox" className="rounded border-gray-300" />
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 uppercase tracking-wider">USER</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 uppercase tracking-wider">BUSINESS</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 uppercase tracking-wider">ROLE</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 uppercase tracking-wider">STATUS</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 uppercase tracking-wider">JOINED</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 uppercase tracking-wider">ACTIONS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {/* Empty State */}
                        <tr>
                          <td colSpan={7} className="text-center py-16">
                            <div className="flex flex-col items-center">
                              <Users className="w-12 h-12 text-gray-300 mb-4" />
                              <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                              <p className="text-gray-500">Try adjusting your search criteria or filters.</p>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'programs' && (
            <div>
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Program Management</h1>
                  <p className="text-gray-600 mt-1">Manage training programs and applications</p>
                </div>
                <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>New Program</span>
                </button>
              </div>

              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6">
                  {/* Search and Actions Bar */}
                  <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Search programs..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="flex gap-3">
                      <div className="relative">
                        <select className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                          <option>All Status</option>
                          <option>Active</option>
                          <option>Draft</option>
                          <option>Archived</option>
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                      </div>
                      <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                        <Download className="w-4 h-4" />
                        <span>Export</span>
                      </button>
                      <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                        <Filter className="w-4 h-4" />
                        <span>Filter</span>
                      </button>
                    </div>
                  </div>

                  {/* Empty State */}
                  <div className="text-center py-16">
                    <div className="flex flex-col items-center">
                      <FileText className="w-12 h-12 text-gray-300 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No programs found</h3>
                      <p className="text-gray-500">Create your first program to get started.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'registrations' && (
            <div>
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Business Registration Review</h1>
                  <p className="text-gray-600 mt-1">Review and approve business registration applications</p>
                </div>
                <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center space-x-2">
                  <Download className="w-4 h-4" />
                  <span>Export CSV</span>
                </button>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
                  <div className="text-2xl font-bold text-gray-900">0</div>
                  <div className="text-sm text-gray-600">Pending</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
                  <div className="text-2xl font-bold text-blue-600">0</div>
                  <div className="text-sm text-gray-600">Under Review</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
                  <div className="text-2xl font-bold text-green-600">0</div>
                  <div className="text-sm text-gray-600">Approved</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
                  <div className="text-2xl font-bold text-red-600">0</div>
                  <div className="text-sm text-gray-600">Rejected</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
                  <div className="text-2xl font-bold text-orange-600">0</div>
                  <div className="text-sm text-gray-600">Need Docs</div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6">
                  {/* Search and Filter Bar */}
                  <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Search registrations..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="flex gap-3">
                      <div className="relative">
                        <select className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                          <option>All Status</option>
                          <option>Pending</option>
                          <option>Under Review</option>
                          <option>Approved</option>
                          <option>Rejected</option>
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                      </div>
                      <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg">
                        Show Pending Only
                      </button>
                    </div>
                  </div>

                  {/* Empty State */}
                  <div className="text-center py-16">
                    <div className="flex flex-col items-center">
                      <Building2 className="w-12 h-12 text-gray-300 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No registrations found</h3>
                      <p className="text-gray-500">Business registration applications will appear here.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'analytics' && (
            <div>
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
                <p className="text-gray-600 mt-1">Platform analytics and performance metrics</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center space-x-2 mb-3">
                        <TrendingUp className="w-5 h-5 text-blue-500" />
                        <h3 className="font-semibold">User Engagement</h3>
                      </div>
                      <div className="h-32 bg-gray-100 rounded flex items-center justify-center">
                        <span className="text-gray-500">Chart: User Activity Over Time</span>
                      </div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center space-x-2 mb-3">
                        <BarChart3 className="w-5 h-5 text-green-500" />
                        <h3 className="font-semibold">Program Completion</h3>
                      </div>
                      <div className="h-32 bg-gray-100 rounded flex items-center justify-center">
                        <span className="text-gray-500">Chart: Completion Rates</span>
                      </div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center space-x-2 mb-3">
                        <DollarSign className="w-5 h-5 text-purple-500" />
                        <h3 className="font-semibold">Revenue Trends</h3>
                      </div>
                      <div className="h-32 bg-gray-100 rounded flex items-center justify-center">
                        <span className="text-gray-500">Chart: Monthly Revenue</span>
                      </div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center space-x-2 mb-3">
                        <Users className="w-5 h-5 text-orange-500" />
                        <h3 className="font-semibold">User Growth</h3>
                      </div>
                      <div className="h-32 bg-gray-100 rounded flex items-center justify-center">
                        <span className="text-gray-500">Chart: New User Registrations</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'general' && (
            <div>
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">General Settings</h1>
                  <p className="text-gray-600 mt-1">Configure platform settings and preferences</p>
                </div>
                <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg">
                  Save Changes
                </button>
              </div>

              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6">
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Platform Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Platform Name</label>
                      <input 
                        type="text" 
                        defaultValue="BizBoost Hub" 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {/* Default Language */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Default Language</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        <option>English</option>
                        <option>Spanish</option>
                        <option>French</option>
                        <option>Portuguese</option>
                      </select>
                    </div>
                  </div>

                  {/* Platform Description */}
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Platform Description</label>
                    <textarea 
                      rows={4}
                      defaultValue="Empowering South African entrepreneurs"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                  </div>

                  {/* Checkboxes */}
                  <div className="mt-6 space-y-4">
                    <div className="flex items-start">
                      <input 
                        type="checkbox" 
                        id="maintenance-mode"
                        className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div className="ml-3">
                        <label htmlFor="maintenance-mode" className="text-sm font-medium text-gray-700">
                          Maintenance Mode
                        </label>
                        <p className="text-sm text-gray-500">Temporarily disable platform access for maintenance</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <input 
                        type="checkbox" 
                        id="enable-registrations"
                        defaultChecked
                        className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div className="ml-3">
                        <label htmlFor="enable-registrations" className="text-sm font-medium text-gray-700">
                          Enable New Registrations
                        </label>
                        <p className="text-sm text-gray-500">Allow new users to register for the platform</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div>
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Security Settings</h1>
                <p className="text-gray-600 mt-1">Security and authentication configuration</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6">
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <span className="font-medium">Two-Factor Authentication</span>
                          <p className="text-sm text-gray-500">Require 2FA for all admin accounts</p>
                        </div>
                        <button className="bg-green-500 text-white px-3 py-1 rounded text-sm">Enabled</button>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <span className="font-medium">Password Policy</span>
                          <p className="text-sm text-gray-500">Enforce strong password requirements</p>
                        </div>
                        <button className="bg-blue-500 text-white px-3 py-1 rounded text-sm">Active</button>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <span className="font-medium">Session Timeout</span>
                          <p className="text-sm text-gray-500">Auto logout after inactivity</p>
                        </div>
                        <select className="border rounded px-3 py-1 text-sm">
                          <option>30 minutes</option>
                          <option>1 hour</option>
                          <option>2 hours</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div>
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Notification Settings</h1>
                <p className="text-gray-600 mt-1">Configure notification preferences and delivery methods</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6">
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <span className="font-medium">Email Notifications</span>
                          <p className="text-sm text-gray-500">Send email notifications to users</p>
                        </div>
                        <button className="bg-blue-500 text-white px-3 py-1 rounded text-sm">Enabled</button>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <span className="font-medium">Push Notifications</span>
                          <p className="text-sm text-gray-500">Browser push notifications</p>
                        </div>
                        <button className="bg-green-500 text-white px-3 py-1 rounded text-sm">Active</button>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <span className="font-medium">SMS Notifications</span>
                          <p className="text-sm text-gray-500">Text message notifications</p>
                        </div>
                        <button className="bg-gray-500 text-white px-3 py-1 rounded text-sm">Disabled</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div>
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Integrations</h1>
                <p className="text-gray-600 mt-1">Manage third-party integrations and API connections</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6">
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <span className="font-medium">Google Analytics</span>
                          <p className="text-sm text-gray-500">Track website analytics</p>
                        </div>
                        <button className="bg-green-500 text-white px-3 py-1 rounded text-sm">Connected</button>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <span className="font-medium">Stripe Payment</span>
                          <p className="text-sm text-gray-500">Payment processing integration</p>
                        </div>
                        <button className="bg-blue-500 text-white px-3 py-1 rounded text-sm">Active</button>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <span className="font-medium">Slack Notifications</span>
                          <p className="text-sm text-gray-500">Send alerts to Slack channels</p>
                        </div>
                        <button className="bg-gray-500 text-white px-3 py-1 rounded text-sm">Disabled</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'access-control' && (
            <div>
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Access Control</h1>
                <p className="text-gray-600 mt-1">Manage user roles, permissions, and access levels</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6">
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <span className="font-medium">Role-Based Access</span>
                          <p className="text-sm text-gray-500">Enable role-based permission system</p>
                        </div>
                        <button className="bg-green-500 text-white px-3 py-1 rounded text-sm">Enabled</button>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <span className="font-medium">Admin Approval</span>
                          <p className="text-sm text-gray-500">Require admin approval for new users</p>
                        </div>
                        <button className="bg-blue-500 text-white px-3 py-1 rounded text-sm">Active</button>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <span className="font-medium">IP Restrictions</span>
                          <p className="text-sm text-gray-500">Restrict access by IP address</p>
                        </div>
                        <button className="bg-gray-500 text-white px-3 py-1 rounded text-sm">Disabled</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Navigation */}
      <AdminMobileNav 
        activeTab={activeTab}
        onTabChange={setActiveTab}
        notificationCount={notificationCount}
      />
    </div>
  );
};

export default AdminLayout;