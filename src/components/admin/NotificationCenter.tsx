import React, { useState } from 'react';
import { Bell, X, CheckCircle, AlertTriangle, Info, Clock } from 'lucide-react';

interface Notification {
  id: string;
  type: 'registration' | 'application' | 'system' | 'user';
  title: string;
  message: string;
  timestamp: string;
  priority: 'low' | 'medium' | 'high';
  read?: boolean; // Made optional to accept items without explicit read status
  actionUrl?: string;
}

interface NotificationCenterProps {
  notifications: Notification[];
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ notifications }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState('all');

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: string, priority: string) => {
    if (priority === 'high') return <AlertTriangle className="w-4 h-4 text-red-600" />;
    if (type === 'registration') return <CheckCircle className="w-4 h-4 text-blue-600" />;
    if (type === 'application') return <Clock className="w-4 h-4 text-yellow-600" />;
    return <Info className="w-4 h-4 text-gray-600" />;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500 bg-red-50';
      case 'medium': return 'border-l-yellow-500 bg-yellow-50';
      case 'low': return 'border-l-blue-500 bg-blue-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.read;
    if (filter === 'high') return notification.priority === 'high';
    return true;
  });

  const markAsRead = (notificationId: string) => {
    // In a real app, this would update the database
    console.log('Marking notification as read:', notificationId);
  };

  const markAllAsRead = () => {
    // In a real app, this would update all notifications in the database
    console.log('Marking all notifications as read');
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <Bell className="w-5 h-5 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-primary-600 hover:text-primary-700 text-sm"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex border-b border-gray-200">
            {[
              { id: 'all', name: 'All', count: notifications.length },
              { id: 'unread', name: 'Unread', count: unreadCount },
              { id: 'high', name: 'High Priority', count: notifications.filter(n => n.priority === 'high').length }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
                  filter === tab.id
                    ? 'text-primary-600 border-b-2 border-primary-500'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.name} ({tab.count})
              </button>
            ))}
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {filteredNotifications.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {filteredNotifications.map(notification => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer border-l-4 ${getPriorityColor(notification.priority)} ${
                      !notification.read ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start space-x-3">
                      {getNotificationIcon(notification.type, notification.priority)}
                      <div className="flex-1">
                        <h4 className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                          {notification.title}
                        </h4>
                        <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(notification.timestamp).toLocaleDateString()} at{' '}
                          {new Date(notification.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-primary-500 rounded-full mt-1" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <Bell className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600 text-sm">No notifications</p>
              </div>
            )}
          </div>

          {/* Footer */}
          {filteredNotifications.length > 0 && (
            <div className="p-3 border-t border-gray-200">
              <button className="w-full text-center text-primary-600 hover:text-primary-700 text-sm font-medium">
                View All Notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;