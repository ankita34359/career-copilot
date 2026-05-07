import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Bell, CheckCheck, Info, CheckCircle, AlertTriangle, Inbox, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const POLL_INTERVAL = 30_000;
const DROPDOWN_LIMIT = 3;

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
  success: <CheckCircle size={15} className="text-emerald-500 flex-shrink-0 mt-0.5" />,
  warning: <AlertTriangle size={15} className="text-amber-500 flex-shrink-0 mt-0.5" />,
  info:    <Info size={15} className="text-indigo-400 flex-shrink-0 mt-0.5" />,
};

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState({});
  const bellRef    = useRef(null);
  const dropdownRef = useRef(null);
  const navigate   = useNavigate();

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const displayed   = notifications.slice(0, DROPDOWN_LIMIT);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch { /* non-critical */ }
  }, []);

  // Initial fetch + polling
  useEffect(() => {
    fetchNotifications();
    const timer = setInterval(fetchNotifications, POLL_INTERVAL);
    return () => clearInterval(timer);
  }, [fetchNotifications]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target) &&
        bellRef.current    && !bellRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Recalculate on resize
  useEffect(() => {
    if (!open) return;
    const onResize = () => calcPos();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [open]);

  function calcPos() {
    if (!bellRef.current) return;
    const rect = bellRef.current.getBoundingClientRect();
    setDropdownStyle({
      position: 'fixed',
      top:      rect.bottom + 8,
      right:    window.innerWidth - rect.right,
      width:    340,
      zIndex:   99999,          // above every stacking context on every page
    });
  }

  const handleToggle = () => {
    if (!open) {
      calcPos();
      fetchNotifications();
    }
    setOpen((prev) => !prev);
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch { /* silent */ }
  };

  const handleClickNotification = async (notification) => {
    setOpen(false);
    if (!notification.isRead) {
      try {
        await api.patch(`/notifications/${notification._id}/read`);
        setNotifications((prev) =>
          prev.map((n) => n._id === notification._id ? { ...n, isRead: true } : n)
        );
      } catch { /* silent */ }
    }
    if (notification.actionLink) navigate(notification.actionLink);
  };

  const handleViewAll = () => {
    setOpen(false);
    navigate('/notifications');
  };

  // ── Dropdown rendered via portal directly on <body> ──────────────────────
  // This bypasses every ancestor stacking context (transform, z-index, overflow)
  // so the dropdown always floats above ALL page content on every route.
  const dropdown = open ? createPortal(
    <div
      ref={dropdownRef}
      style={dropdownStyle}
      className="flex flex-col rounded-2xl shadow-2xl border border-slate-200 dark:border-gray-600 overflow-hidden"
      // Explicit solid background — Tailwind dark: classes can be unreliable
      // inside a portal if the dark class is on <html>; use inline color as guarantee
      style={{
        ...dropdownStyle,
        backgroundColor: document.documentElement.classList.contains('dark') ? '#1e293b' : '#ffffff',
        borderColor:     document.documentElement.classList.contains('dark') ? '#475569' : '#e2e8f0',
      }}
    >
      {/* ── Header ── */}
      <div
        className="flex items-center justify-between px-4 py-3 flex-shrink-0 border-b"
        style={{
          backgroundColor: document.documentElement.classList.contains('dark') ? '#0f172a' : '#f8fafc',
          borderColor:     document.documentElement.classList.contains('dark') ? '#334155' : '#e2e8f0',
        }}
      >
        <div className="flex items-center gap-2">
          <Bell size={15} className="text-indigo-500" />
          <span className="text-sm font-bold" style={{ color: document.documentElement.classList.contains('dark') ? '#f1f5f9' : '#1e293b' }}>
            Notifications
          </span>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.5 text-[10px] font-black bg-rose-500 text-white rounded-full leading-none">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1 text-xs font-bold text-indigo-500 hover:text-indigo-400 transition-colors"
          >
            <CheckCheck size={13} />
            Mark all read
          </button>
        )}
      </div>

      {/* ── Scrollable list ── */}
      <div style={{ overflowY: 'auto', maxHeight: 240 }}>
        {displayed.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
            <Inbox size={32} className="mb-3" style={{ color: document.documentElement.classList.contains('dark') ? '#334155' : '#cbd5e1' }} />
            <p className="text-sm font-bold" style={{ color: document.documentElement.classList.contains('dark') ? '#64748b' : '#94a3b8' }}>
              No notifications yet
            </p>
          </div>
        ) : (
          displayed.map((n, idx) => {
            const isDark = document.documentElement.classList.contains('dark');
            return (
              <button
                key={n._id}
                onClick={() => handleClickNotification(n)}
                className="w-full text-left flex items-start gap-3 px-4 py-3.5 transition-colors"
                style={{
                  backgroundColor: !n.isRead
                    ? (isDark ? 'rgba(99,102,241,0.08)' : 'rgba(238,242,255,0.7)')
                    : 'transparent',
                  borderBottom: idx < displayed.length - 1
                    ? `1px solid ${isDark ? '#1e293b' : '#f1f5f9'}`
                    : 'none',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = isDark ? '#1e293b' : '#f8fafc'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = !n.isRead
                  ? (isDark ? 'rgba(99,102,241,0.08)' : 'rgba(238,242,255,0.7)')
                  : 'transparent'}
              >
                <div className="mt-0.5 flex-shrink-0">
                  {TYPE_ICON[n.type] ?? TYPE_ICON.info}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm leading-snug truncate"
                    style={{
                      fontWeight: !n.isRead ? 700 : 600,
                      color: !n.isRead
                        ? (isDark ? '#f1f5f9' : '#1e293b')
                        : (isDark ? '#cbd5e1' : '#334155'),
                    }}
                  >
                    {n.title}
                  </p>
                  <p className="text-xs mt-0.5 leading-relaxed line-clamp-2" style={{ color: isDark ? '#64748b' : '#94a3b8' }}>
                    {n.message}
                  </p>
                  <p className="text-[11px] mt-1 font-medium" style={{ color: isDark ? '#475569' : '#94a3b8' }}>
                    {timeAgo(n.createdAt)}
                  </p>
                </div>
                {!n.isRead && (
                  <span className="flex-shrink-0 mt-1.5 block h-2 w-2 rounded-full bg-indigo-500" />
                )}
              </button>
            );
          })
        )}
      </div>

      {/* ── Footer ── */}
      <div
        className="flex-shrink-0 border-t"
        style={{
          backgroundColor: document.documentElement.classList.contains('dark') ? '#0f172a' : '#f8fafc',
          borderColor:     document.documentElement.classList.contains('dark') ? '#334155' : '#e2e8f0',
        }}
      >
        <button
          onClick={handleViewAll}
          className="w-full flex items-center justify-center gap-2 py-3 text-xs font-bold text-indigo-500 hover:text-indigo-400 transition-colors"
        >
          View All Notifications
          <ArrowRight size={13} />
        </button>
      </div>
    </div>,
    document.body   // ← renders outside React tree into <body>, root stacking context
  ) : null;

  return (
    <>
      {/* Bell Button */}
      <button
        ref={bellRef}
        onClick={handleToggle}
        className="text-slate-400 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 relative transition-colors h-10 w-10 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-gray-700"
        aria-label="Notifications"
      >
        <Bell size={22} />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 flex h-2.5 w-2.5 items-center justify-center">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
            <span className="relative block h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-gray-800" />
          </span>
        )}
      </button>

      {dropdown}
    </>
  );
};

export default NotificationBell;
