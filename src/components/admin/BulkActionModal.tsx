import React, { useState } from 'react';
import { X, Users, Shield, Trash2, CheckCircle } from 'lucide-react';

interface BulkActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedUsers: string[];
  onAction: (action: string, data?: any) => Promise<void>;
}

const BulkActionModal: React.FC<BulkActionModalProps> = ({
  isOpen,
  onClose,
  selectedUsers,
  onAction
}) => {
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [roleToAssign, setRoleToAssign] = useState('participant');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const actions = [
    {
      id: 'activate',
      name: 'Activate Users',
      description: 'Activate selected user accounts',
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      id: 'deactivate',
      name: 'Deactivate Users',
      description: 'Temporarily deactivate user accounts',
      icon: Users,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      id: 'assign-role',
      name: 'Assign Role',
      description: 'Assign a role to selected users',
      icon: Shield,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      id: 'delete',
      name: 'Delete Users',
      description: 'Permanently delete user accounts',
      icon: Trash2,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    }
  ];

  const handleAction = async () => {
    if (!activeAction) return;

    try {
      setLoading(true);
      
      const actionData = activeAction === 'assign-role' ? { role: roleToAssign } : undefined;
      await onAction(activeAction, actionData);
      
      onClose();
      setActiveAction(null);
    } catch (error) {
      console.error('Error performing bulk action:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Bulk Actions ({selectedUsers.length} users)
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {!activeAction ? (
          <div className="space-y-3">
            <p className="text-gray-600 text-sm mb-4">
              Select an action to perform on {selectedUsers.length} selected user(s):
            </p>
            
            {actions.map(action => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  onClick={() => setActiveAction(action.id)}
                  className={`w-full flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left ${action.bgColor}`}
                >
                  <Icon className={`w-5 h-5 ${action.color}`} />
                  <div>
                    <div className="font-medium text-gray-900">{action.name}</div>
                    <div className="text-sm text-gray-600">{action.description}</div>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">
                {actions.find(a => a.id === activeAction)?.name}
              </h4>
              <p className="text-sm text-gray-600">
                This action will affect {selectedUsers.length} user(s).
              </p>
            </div>

            {activeAction === 'assign-role' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Role to Assign
                </label>
                <select
                  value={roleToAssign}
                  onChange={(e) => setRoleToAssign(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="participant">Participant</option>
                  <option value="admin">Admin</option>
                  <option value="program_manager">Program Manager</option>
                  <option value="client_admin">Client Admin</option>
                </select>
              </div>
            )}

            {activeAction === 'delete' && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <Trash2 className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-red-900">Permanent Deletion</h4>
                    <p className="text-sm text-red-700 mt-1">
                      This action cannot be undone. All user data, including profiles, businesses, and applications will be permanently deleted.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex space-x-3 pt-4">
              <button
                onClick={() => setActiveAction(null)}
                disabled={loading}
                className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleAction}
                disabled={loading}
                className={`flex-1 py-2 rounded-lg transition-colors disabled:opacity-50 ${
                  activeAction === 'delete'
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-primary-500 hover:bg-primary-600 text-white'
                }`}
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                ) : (
                  'Confirm Action'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkActionModal;