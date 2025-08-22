import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

interface AdminToastProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

const AdminToast: React.FC<AdminToastProps> = ({ toasts, onRemove }) => {
  useEffect(() => {
    toasts.forEach(toast => {
      if (toast.duration !== 0) {
        const timer = setTimeout(() => {
          onRemove(toast.id);
        }, toast.duration || 5000);

        return () => clearTimeout(timer);
      }
    });
  }, [toasts, onRemove]);

  const getToastStyles = (type: string) => {
    switch (type) {
      case 'success':
        return {
          icon: <CheckCircle className="w-5 h-5 text-green-600" />,
          bg: 'bg-green-50 border-green-200',
          text: 'text-green-800'
        };
      case 'error':
        return {
          icon: <XCircle className="w-5 h-5 text-red-600" />,
          bg: 'bg-red-50 border-red-200',
          text: 'text-red-800'
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-5 h-5 text-yellow-600" />,
          bg: 'bg-yellow-50 border-yellow-200',
          text: 'text-yellow-800'
        };
      case 'info':
        return {
          icon: <Info className="w-5 h-5 text-blue-600" />,
          bg: 'bg-blue-50 border-blue-200',
          text: 'text-blue-800'
        };
      default:
        return {
          icon: <Info className="w-5 h-5 text-gray-600" />,
          bg: 'bg-gray-50 border-gray-200',
          text: 'text-gray-800'
        };
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map(toast => {
        const styles = getToastStyles(toast.type);
        
        return (
          <div
            key={toast.id}
            className={`max-w-sm w-full border rounded-lg p-4 shadow-lg animate-slide-up ${styles.bg}`}
          >
            <div className="flex items-start space-x-3">
              {styles.icon}
              <div className="flex-1">
                <h4 className={`font-medium ${styles.text}`}>{toast.title}</h4>
                {toast.message && (
                  <p className={`text-sm mt-1 ${styles.text} opacity-90`}>{toast.message}</p>
                )}
              </div>
              <button
                onClick={() => onRemove(toast.id)}
                className={`p-1 rounded hover:bg-black hover:bg-opacity-10 transition-colors ${styles.text}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Toast Hook
export const useAdminToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { ...toast, id }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const success = (title: string, message?: string, duration?: number) => {
    addToast({ type: 'success', title, message, duration });
  };

  const error = (title: string, message?: string, duration?: number) => {
    addToast({ type: 'error', title, message, duration });
  };

  const warning = (title: string, message?: string, duration?: number) => {
    addToast({ type: 'warning', title, message, duration });
  };

  const info = (title: string, message?: string, duration?: number) => {
    addToast({ type: 'info', title, message, duration });
  };

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
    ToastContainer: () => <AdminToast toasts={toasts} onRemove={removeToast} />
  };
};

export default AdminToast;