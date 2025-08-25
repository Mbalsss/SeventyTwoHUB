import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Shield, 
  Bell, 
  Database, 
  Mail, 
  Globe,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Key,
  Lock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { 
  getAdminSettings, 
  updateAdminSettings, 
  subscribeToAdminSettings,
  type AdminSettings as AdminSettingsType 
} from '../../lib/adminSettings';

const AdminSettings: React.FC = () => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('general');
  const [settings, setSettings] = useState<AdminSettingsType | null>(null);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sections = [
    { id: 'general', name: 'General', icon: Settings },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'integrations', name: 'Integrations', icon: Database },
    { id: 'access', name: 'Access Control', icon: Key }
  ];

  useEffect(() => {
    loadSettings();
    
    // Subscribe to real-time settings changes
    const subscription = subscribeToAdminSettings((updatedSettings) => {
      if (updatedSettings) {
        setSettings(updatedSettings);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const adminSettings = await getAdminSettings();
      
      if (adminSettings) {
        setSettings(adminSettings);
      } else {
        setError('No admin settings found. Please contact support.');
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      setError('Failed to load admin settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      if (!settings) {
        throw new Error('No settings to save');
      }
      
      setSaving(true);
      setError(null);
      
      const updatedSettings = await updateAdminSettings(settings);
      setSettings(updatedSettings);
      
      setLastSaved(new Date());
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      setError('Failed to save settings. Please try again.');
      alert('Error saving settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: keyof AdminSettingsType, value: any) => {
    if (!settings) return;
    
    setSettings(prev => prev ? ({
      ...prev,
      [key]: value
    }) : null);
  };

  const testConnection = async (service: string) => {
    try {
      switch (service) {
        case 'supabase':
          const { data, error } = await supabase.from('profiles').select('count').limit(1);
          if (error) throw error;
          alert('Supabase connection successful!');
          break;
        case 'email':
          // Test email service
          alert('Email service test would be implemented here');
          break;
        default:
          alert(`${service} connection test would be implemented here`);
      }
    } catch (error) {
      console.error(`Error testing ${service} connection:`, error);
      alert(`Error testing ${service} connection`);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading admin settings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <p className="text-red-800">{error}</p>
        </div>
        <button
          onClick={loadSettings}
          className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No settings available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Platform Settings</h2>
          <p className="text-gray-600">Configure platform settings and preferences</p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          {lastSaved && (
            <span className="text-sm text-gray-500">
              Last saved: {lastSaved.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={saveSettings}
            disabled={saving}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 transition-colors flex items-center space-x-2"
          >
            {saving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <nav className="space-y-2">
              {sections.map(section => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeSection === section.id
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="font-medium">{section.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            {activeSection === 'general' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">General Settings</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Platform Name</label>
                    <input
                      type="text"
                      value={settings.platform_name}
                      onChange={(e) => updateSetting('platform_name', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Default Language</label>
                    <select
                      value={settings.default_language}
                      onChange={(e) => updateSetting('default_language', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="en">English</option>
                      <option value="af">Afrikaans</option>
                      <option value="zu">isiZulu</option>
                      <option value="xh">isiXhosa</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Platform Description</label>
                  <textarea
                    value={settings.platform_description}
                    onChange={(e) => updateSetting('platform_description', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                
                <div className="space-y-4">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={settings.maintenance_mode}
                      onChange={(e) => updateSetting('maintenance_mode', e.target.checked)}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <div>
                      <span className="font-medium text-gray-900">Maintenance Mode</span>
                      <p className="text-sm text-gray-600">Temporarily disable platform access for maintenance</p>
                    </div>
                  </label>
                  
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={settings.registration_enabled}
                      onChange={(e) => updateSetting('registration_enabled', e.target.checked)}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <div>
                      <span className="font-medium text-gray-900">Enable New Registrations</span>
                      <p className="text-sm text-gray-600">Allow new users to register for the platform</p>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {activeSection === 'security' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Security Settings</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (hours)</label>
                    <input
                      type="number"
                      value={settings.session_timeout_hours}
                      onChange={(e) => updateSetting('session_timeout_hours', parseInt(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      min="1"
                      max="168"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Max Login Attempts</label>
                    <input
                      type="number"
                      value={settings.max_login_attempts}
                      onChange={(e) => updateSetting('max_login_attempts', parseInt(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      min="3"
                      max="10"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Password Min Length</label>
                    <input
                      type="number"
                      value={settings.password_min_length}
                      onChange={(e) => updateSetting('password_min_length', parseInt(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      min="6"
                      max="20"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={settings.require_email_verification}
                      onChange={(e) => updateSetting('require_email_verification', e.target.checked)}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <div>
                      <span className="font-medium text-gray-900">Require Email Verification</span>
                      <p className="text-sm text-gray-600">Users must verify their email before accessing the platform</p>
                    </div>
                  </label>
                  
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={settings.two_factor_required_for_admins}
                      onChange={(e) => updateSetting('two_factor_required_for_admins', e.target.checked)}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <div>
                      <span className="font-medium text-gray-900">Require Two-Factor Authentication</span>
                      <p className="text-sm text-gray-600">Mandatory 2FA for all admin accounts</p>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {activeSection === 'notifications' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Notification Settings</h3>
                
                <div className="space-y-4">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={settings.email_notifications_enabled}
                      onChange={(e) => updateSetting('email_notifications_enabled', e.target.checked)}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <div>
                      <span className="font-medium text-gray-900">Email Notifications</span>
                      <p className="text-sm text-gray-600">Send email notifications for important events</p>
                    </div>
                  </label>
                  
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={settings.admin_alerts_enabled}
                      onChange={(e) => updateSetting('admin_alerts_enabled', e.target.checked)}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <div>
                      <span className="font-medium text-gray-900">Admin Alerts</span>
                      <p className="text-sm text-gray-600">Receive alerts for pending reviews and system issues</p>
                    </div>
                  </label>
                  
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={settings.system_updates_enabled}
                      onChange={(e) => updateSetting('system_updates_enabled', e.target.checked)}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <div>
                      <span className="font-medium text-gray-900">System Updates</span>
                      <p className="text-sm text-gray-600">Notifications about platform updates and maintenance</p>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {activeSection === 'integrations' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Service Integrations</h3>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start space-x-3">
                    <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900">Integration Status</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        These settings show the current status of external service integrations. 
                        Changes here are for display purposes only and don't affect actual connections.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {[
                    { 
                      name: 'Supabase Database', 
                      connected: true,
                      description: 'Database and authentication service',
                      testable: true
                    },
                    { 
                      name: 'Email Service', 
                      connected: false,
                      description: 'Email delivery and notifications',
                      testable: true
                    },
                    { 
                      name: 'Analytics Service', 
                      connected: false,
                      description: 'User behavior and platform analytics',
                      testable: false
                    },
                    { 
                      name: 'Payment Gateway', 
                      connected: false,
                      description: 'Payment processing for premium features',
                      testable: false
                    }
                  ].map((integration, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          integration.connected ? 'bg-green-500' : 'bg-red-500'
                        }`} />
                        <div>
                          <div className="font-medium text-gray-900">{integration.name}</div>
                          <div className="text-sm text-gray-600">{integration.description}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {integration.testable && (
                          <button
                            onClick={() => testConnection(integration.name.toLowerCase().replace(' ', '_'))}
                            className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                          >
                            Test
                          </button>
                        )}
                        <span className={`px-3 py-1 rounded-lg text-sm ${
                          integration.connected
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {integration.connected ? 'Connected' : 'Disconnected'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSection === 'access' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Access Control</h3>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-yellow-900">Admin Access Management</h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        Manage admin roles and permissions. Changes take effect immediately.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Current Admin Users</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-medium">A</span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">admin@bizboost.co.za</div>
                            <div className="text-sm text-gray-600">Super Admin</div>
                          </div>
                        </div>
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          Active
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Role Permissions</h4>
                    <div className="space-y-3">
                      {[
                        { role: 'Super Admin', permissions: ['Full platform access', 'User management', 'System settings'] },
                        { role: 'Admin', permissions: ['User management', 'Program management', 'Business reviews'] },
                        { role: 'Program Manager', permissions: ['Program management', 'Application reviews'] },
                        { role: 'Client Admin', permissions: ['Business reviews', 'Registration management'] }
                      ].map((roleInfo, index) => (
                        <div key={index} className="p-3 border border-gray-200 rounded-lg">
                          <div className="font-medium text-gray-900 mb-2">{roleInfo.role}</div>
                          <div className="flex flex-wrap gap-2">
                            {roleInfo.permissions.map((permission, pIndex) => (
                              <span key={pIndex} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                {permission}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;