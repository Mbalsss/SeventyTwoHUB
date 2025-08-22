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

const AdminSettings: React.FC = () => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('general');
  const [settings, setSettings] = useState({
    general: {
      platformName: 'BizBoost Hub',
      platformDescription: 'Empowering South African entrepreneurs',
      maintenanceMode: false,
      registrationEnabled: true,
      defaultLanguage: 'en'
    },
    security: {
      requireEmailVerification: false,
      sessionTimeout: 24,
      maxLoginAttempts: 5,
      passwordMinLength: 6,
      twoFactorRequired: false
    },
    notifications: {
      emailNotifications: true,
      adminAlerts: true,
      systemUpdates: true,
      marketingEmails: false
    },
    integrations: {
      supabaseConnected: true,
      emailServiceConnected: false,
      analyticsConnected: false,
      paymentGatewayConnected: false
    }
  });
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const sections = [
    { id: 'general', name: 'General', icon: Settings },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'integrations', name: 'Integrations', icon: Database },
    { id: 'access', name: 'Access Control', icon: Key }
  ];

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // Load settings from database or localStorage
      const savedSettings = localStorage.getItem('adminSettings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      
      // Save to localStorage (in production, save to database)
      localStorage.setItem('adminSettings', JSON.stringify(settings));
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setLastSaved(new Date());
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (section: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
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
                      value={settings.general.platformName}
                      onChange={(e) => updateSetting('general', 'platformName', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Default Language</label>
                    <select
                      value={settings.general.defaultLanguage}
                      onChange={(e) => updateSetting('general', 'defaultLanguage', e.target.value)}
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
                    value={settings.general.platformDescription}
                    onChange={(e) => updateSetting('general', 'platformDescription', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                
                <div className="space-y-4">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={settings.general.maintenanceMode}
                      onChange={(e) => updateSetting('general', 'maintenanceMode', e.target.checked)}
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
                      checked={settings.general.registrationEnabled}
                      onChange={(e) => updateSetting('general', 'registrationEnabled', e.target.checked)}
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
                      value={settings.security.sessionTimeout}
                      onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      min="1"
                      max="168"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Max Login Attempts</label>
                    <input
                      type="number"
                      value={settings.security.maxLoginAttempts}
                      onChange={(e) => updateSetting('security', 'maxLoginAttempts', parseInt(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      min="3"
                      max="10"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Password Min Length</label>
                    <input
                      type="number"
                      value={settings.security.passwordMinLength}
                      onChange={(e) => updateSetting('security', 'passwordMinLength', parseInt(e.target.value))}
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
                      checked={settings.security.requireEmailVerification}
                      onChange={(e) => updateSetting('security', 'requireEmailVerification', e.target.checked)}
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
                      checked={settings.security.twoFactorRequired}
                      onChange={(e) => updateSetting('security', 'twoFactorRequired', e.target.checked)}
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
                      checked={settings.notifications.emailNotifications}
                      onChange={(e) => updateSetting('notifications', 'emailNotifications', e.target.checked)}
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
                      checked={settings.notifications.adminAlerts}
                      onChange={(e) => updateSetting('notifications', 'adminAlerts', e.target.checked)}
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
                      checked={settings.notifications.systemUpdates}
                      onChange={(e) => updateSetting('notifications', 'systemUpdates', e.target.checked)}
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
                
                <div className="space-y-4">
                  {[
                    { 
                      name: 'Supabase Database', 
                      key: 'supabaseConnected', 
                      description: 'Database and authentication service',
                      testable: true
                    },
                    { 
                      name: 'Email Service', 
                      key: 'emailServiceConnected', 
                      description: 'Email delivery and notifications',
                      testable: true
                    },
                    { 
                      name: 'Analytics Service', 
                      key: 'analyticsConnected', 
                      description: 'User behavior and platform analytics',
                      testable: false
                    },
                    { 
                      name: 'Payment Gateway', 
                      key: 'paymentGatewayConnected', 
                      description: 'Payment processing for premium features',
                      testable: false
                    }
                  ].map((integration, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          settings.integrations[integration.key] ? 'bg-green-500' : 'bg-red-500'
                        }`} />
                        <div>
                          <div className="font-medium text-gray-900">{integration.name}</div>
                          <div className="text-sm text-gray-600">{integration.description}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {integration.testable && (
                          <button
                            onClick={() => testConnection(integration.key.replace('Connected', ''))}
                            className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                          >
                            Test
                          </button>
                        )}
                        <button
                          onClick={() => updateSetting('integrations', integration.key, !settings.integrations[integration.key])}
                          className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                            settings.integrations[integration.key]
                              ? 'bg-red-500 text-white hover:bg-red-600'
                              : 'bg-green-500 text-white hover:bg-green-600'
                          }`}
                        >
                          {settings.integrations[integration.key] ? 'Disconnect' : 'Connect'}
                        </button>
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