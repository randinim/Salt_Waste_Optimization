import React, { useState } from 'react';
import { Notification, NotificationType } from '@/dtos/compass/types';
import { X, Bell, CheckCheck, Filter, Package, HandshakeIcon, CheckCircle } from 'lucide-react';
import { Button } from './Button';
import { Badge } from './Badge';

interface NotificationPanelProps {
  notifications: Notification[];
  onClose: () => void;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onNotificationClick?: (notification: Notification) => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  notifications,
  onClose,
  onMarkAsRead,
  onMarkAllAsRead,
  onNotificationClick,
}) => {
  const [filter, setFilter] = useState<NotificationType | 'all'>('all');

  const filteredNotifications = filter === 'all' 
    ? notifications 
    : notifications.filter(n => n.type === filter);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.NEW_OFFER:
        return <Package size={20} className="text-blue-600" />;
      case NotificationType.DEAL_ACCEPTED:
        return <HandshakeIcon size={20} className="text-emerald-600" />;
      case NotificationType.DEAL_COMPLETED:
        return <CheckCircle size={20} className="text-green-600" />;
      case NotificationType.COUNTER_OFFER:
        return <Package size={20} className="text-amber-600" />;
    }
  };

  const getNotificationColor = (type: NotificationType) => {
    switch (type) {
      case NotificationType.NEW_OFFER:
        return 'bg-blue-50 border-blue-200';
      case NotificationType.DEAL_ACCEPTED:
        return 'bg-emerald-50 border-emerald-200';
      case NotificationType.DEAL_COMPLETED:
        return 'bg-green-50 border-green-200';
      case NotificationType.COUNTER_OFFER:
        return 'bg-amber-50 border-amber-200';
    }
  };

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
      <div className="bg-white w-full sm:w-96 h-full shadow-2xl flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-5">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <Bell size={24} />
              <h2 className="text-xl font-bold">Notifications</h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition"
            >
              <X size={20} />
            </button>
          </div>
          
          {unreadCount > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-blue-100 text-sm">{unreadCount} unread</span>
              <button
                onClick={onMarkAllAsRead}
                className="text-xs bg-white/20 px-3 py-1 rounded-full hover:bg-white/30 transition flex items-center gap-1"
              >
                <CheckCheck size={14} />
                Mark all read
              </button>
            </div>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 p-3 border-b border-slate-200 overflow-x-auto">
          <FilterTab 
            active={filter === 'all'} 
            onClick={() => setFilter('all')}
            label="All"
            count={notifications.length}
          />
          <FilterTab 
            active={filter === NotificationType.NEW_OFFER} 
            onClick={() => setFilter(NotificationType.NEW_OFFER)}
            label="Offers"
            count={notifications.filter(n => n.type === NotificationType.NEW_OFFER).length}
          />
          <FilterTab 
            active={filter === NotificationType.DEAL_ACCEPTED} 
            onClick={() => setFilter(NotificationType.DEAL_ACCEPTED)}
            label="Accepted"
            count={notifications.filter(n => n.type === NotificationType.DEAL_ACCEPTED).length}
          />
          <FilterTab 
            active={filter === NotificationType.DEAL_COMPLETED} 
            onClick={() => setFilter(NotificationType.DEAL_COMPLETED)}
            label="Completed"
            count={notifications.filter(n => n.type === NotificationType.DEAL_COMPLETED).length}
          />
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8">
              <Bell size={48} className="mb-3 opacity-30" />
              <p className="text-center">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 cursor-pointer transition ${
                    !notification.read ? 'bg-blue-50/50' : 'bg-white hover:bg-slate-50'
                  }`}
                  onClick={() => {
                    if (!notification.read) {
                      onMarkAsRead(notification.id);
                    }
                    onNotificationClick?.(notification);
                  }}
                >
                  <div className="flex gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      getNotificationColor(notification.type)
                    }`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className={`font-semibold text-sm ${
                          !notification.read ? 'text-slate-900' : 'text-slate-700'
                        }`}>
                          {notification.title}
                        </h4>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-sm text-slate-600 mb-2">{notification.message}</p>
                      <span className="text-xs text-slate-400">
                        {formatTime(notification.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const FilterTab: React.FC<{ 
  active: boolean; 
  onClick: () => void; 
  label: string;
  count: number;
}> = ({ active, onClick, label, count }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition ${
      active 
        ? 'bg-blue-600 text-white' 
        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
    }`}
  >
    {label} {count > 0 && `(${count})`}
  </button>
);
