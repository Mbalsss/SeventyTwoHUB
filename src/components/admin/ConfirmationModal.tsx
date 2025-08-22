import React from 'react';
import { AlertTriangle, X, CheckCircle, XCircle } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  type?: 'danger' | 'warning' | 'info';
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = 'warning',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  loading = false
}) => {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          icon: <XCircle className="w-6 h-6 text-red-600" />,
          iconBg: 'bg-red-100',
          confirmButton: 'bg-red-500 hover:bg-red-600 text-white'
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-6 h-6 text-yellow-600" />,
          iconBg: 'bg-yellow-100',
          confirmButton: 'bg-yellow-500 hover:bg-yellow-600 text-white'
        };
      case 'info':
        return {
          icon: <CheckCircle className="w-6 h-6 text-blue-600" />,
          iconBg: 'bg-blue-100',
          confirmButton: 'bg-blue-500 hover:bg-blue-600 text-white'
        };
      default:
        return {
          icon: <AlertTriangle className="w-6 h-6 text-yellow-600" />,
          iconBg: 'bg-yellow-100',
          confirmButton: 'bg-yellow-500 hover:bg-yellow-600 text-white'
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <div className="flex items-center space-x-4 mb-4">
          <div className={`p-2 rounded-full ${styles.iconBg}`}>
            {styles.icon}
          </div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        
        <p className="text-gray-600 mb-6">{message}</p>
        
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 py-2 px-4 rounded-lg transition-colors disabled:opacity-50 ${styles.confirmButton}`}
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;