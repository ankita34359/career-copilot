import React, { useState, useEffect, useCallback } from 'react';
import { Bell, CheckCheck, Info, CheckCircle, AlertTriangle, Inbox } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);

  if (mins < 1)   return 'just now';
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

const TYPE_ICON = {
  success: <CheckCircle size={16} className="text-emerald-500 flex-shrink-0 mt-0.5" />,
  warning: <AlertTriangle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />,
  info:    <Info size={16} className="text-indigo-400 flex-shrink-0 mt-0.5" />,
};

const TYPE_BADGE = {
  success: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800/40',
  warning: 'bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800/40',
  info:    'bg-slate-50 dark:bg-gray-700/40 border-slate-100 dark:border-gray-700',
};

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      // silent
    }
  };

  const handleClickNotification = async (notification) => {
    if (!notification.isRead) {
      try {
        await api.patch(`/notifications/${notification._id}/read`);
        setNotifications((prev) =>
          prev.map((n) => n._id === notification._id ? { ...n, isRead: true } : n)
        );
      } catch {
        // silent
      }
    }
    if (notification.actionLink) {
      navigate(notification.actionLink);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="max-w-2xl mx-auto pb-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Bell className="text-indigo-500" size={24} />
            Notifications
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-xl text-sm font-bold transition-colors border border-indigo-100 dark:border-indigo-800/40"
          >
            <CheckCheck size={15} />
            Mark all as read
          </button>
        )}
      </div>

      {/* List */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-slate-100 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-slate-100 dark:border-gray-700 border-t-indigo-500 rounded-full animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-6">
            <Inbox size={40} className="text-slate-200 dark:text-gray-600 mb-4" />
            <p className="text-base font-bold text-slate-400 dark:text-slate-500">No notifications yet</p>
            <p className="text-sm text-slate-300 dark:text-slate-600 mt-1">
              Actions like adding jobs, logging interviews, or analyzing resumes will appear here.
            </p>
          </div>
        ) : (
          notifications.map((n, idx) => (
            <button
              key={n._id}
              onClick={() => handleClickNotification(n)}
              className={`w-full text-left flex items-start gap-4 px-5 py-4 transition-colors hover:bg-slate-50 dark:hover:bg-gray-700/50 ${
                idx < notifications.length - 1 ? 'border-b border-slate-100 dark:border-gray-700/60' : ''
              } ${!n.isRead ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : ''}`}
            >
              {/* Icon badge */}
              <div className={`flex-shrink-0 w-9 h-9 rounded-xl border flex items-center justify-center ${TYPE_BADGE[n.type] ?? TYPE_BADGE.info}`}>
                {TYPE_ICON[n.type] ?? TYPE_ICON.info}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <p className={`text-sm leading-snug ${!n.isRead ? 'font-bold text-slate-800 dark:text-white' : 'font-semibold text-slate-700 dark:text-slate-200'}`}>
                    {n.title}
                  </p>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium flex-shrink-0 mt-0.5">
                    {timeAgo(n.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                  {n.message}
                </p>
              </div>

              {/* Unread dot */}
              {!n.isRead && (
                <div className="flex-shrink-0 mt-1.5">
                  <span className="block h-2 w-2 rounded-full bg-indigo-500" />
                </div>
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;
