import React, { useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Settings as SettingsIcon,
  User,
  Mail,
  Lock,
  Shield,
  Bell,
  Moon,
  LogOut,
  X,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import api from '../api';

const LS_NOTIFY = 'careerCopilot_pref_emailNotifications';

function ToggleSwitch({ enabled, onChange, id }) {
  return (
    <button
      type="button"
      id={id}
      role="switch"
      aria-checked={enabled}
      onClick={() => onChange(!enabled)}
      className={`relative h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 ${
        enabled ? 'bg-indigo-600 shadow-inner' : 'bg-gray-300 dark:bg-gray-600'
      }`}
    >
      <span
        className={`pointer-events-none absolute top-1 left-1 h-4 w-4 rounded-full bg-white shadow transition-transform ${
          enabled ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

const Settings = () => {
  const { user, logout } = useContext(AuthContext);
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const savedTimerRef = useRef(null);

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  const [pwdOpen, setPwdOpen] = useState(false);
  const [pwdCurrent, setPwdCurrent] = useState('');
  const [pwdNew, setPwdNew] = useState('');
  const [pwdConfirm, setPwdConfirm] = useState('');
  const [pwdSubmitting, setPwdSubmitting] = useState(false);

  useEffect(() => {
    const n = localStorage.getItem(LS_NOTIFY);
    setEmailNotifications(n !== 'false');
  }, []);

  const clearSavedTimer = () => {
    if (savedTimerRef.current) {
      clearTimeout(savedTimerRef.current);
      savedTimerRef.current = null;
    }
  };

  useEffect(() => () => clearSavedTimer(), []);

  const markDirtyPrefs = () => {
    clearSavedTimer();
    setJustSaved(false);
  };

  const handleSavePreferences = (e) => {
    e.preventDefault();
    setSaving(true);
    localStorage.setItem(LS_NOTIFY, emailNotifications ? 'true' : 'false');
    setTimeout(() => {
      setSaving(false);
      setJustSaved(true);
      clearSavedTimer();
      savedTimerRef.current = setTimeout(() => {
        setJustSaved(false);
        savedTimerRef.current = null;
      }, 2800);
    }, 150);
  };

  const openPasswordModal = () => {
    setPwdCurrent('');
    setPwdNew('');
    setPwdConfirm('');
    setPwdOpen(true);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwdNew !== pwdConfirm) {
      alert('New passwords do not match.');
      return;
    }
    setPwdSubmitting(true);
    try {
      await api.post('/auth/change-password', {
        currentPassword: pwdCurrent,
        newPassword: pwdNew,
      });
      setPwdOpen(false);
      alert('Password updated successfully.');
    } catch (err) {
      const msg = err.response?.data?.msg || 'Could not update password.';
      alert(msg);
    } finally {
      setPwdSubmitting(false);
    }
  };

  const handleLogoutAllDevices = () => {
    if (
      !window.confirm(
        'Sign out on this browser and clear saved preferences here? Other sessions stay active until they expire.'
      )
    ) {
      return;
    }
    localStorage.removeItem('token');
    localStorage.removeItem('careerCopilot_pref_darkMode');
    localStorage.removeItem(LS_NOTIFY);
    if (typeof logout === 'function') logout();
    navigate('/login');
  };

  return (
    <div className="max-w-5xl mx-auto p-6 pb-12 animate-fade-in">
      <header className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
          <SettingsIcon className="text-indigo-600" size={28} />
          Settings
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">Manage your account preferences</p>
      </header>

      {/* Account settings */}
      <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-slate-100 dark:border-gray-700 overflow-hidden mb-6">
        <div className="px-6 sm:px-8 py-4 bg-[#FAFAFA] dark:bg-gray-800/60 border-b border-slate-100 dark:border-gray-700">
          <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Account settings</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">Sign-in identity and contact</p>
        </div>
        <div className="p-6 sm:p-8 space-y-5 max-w-xl">
          <div>
            <label className="flex items-center gap-2 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
              <User size={14} aria-hidden /> Username
            </label>
            <input
              type="text"
              readOnly
              value={user?.name || ''}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-gray-600 bg-slate-50 dark:bg-gray-700 text-slate-700 dark:text-gray-200 font-medium text-sm cursor-default"
            />
          </div>
          <div>
            <label className="flex items-center gap-2 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
              <Mail size={14} aria-hidden /> Email
            </label>
            <input
              type="email"
              readOnly
              value={user?.email || ''}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-gray-600 bg-slate-50 dark:bg-gray-700 text-slate-700 dark:text-gray-200 font-medium text-sm cursor-default"
            />
          </div>
          <button
            type="button"
            onClick={openPasswordModal}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition shadow-sm"
          >
            <Lock size={16} />
            Change Password
          </button>
        </div>
      </section>

      {/* Security settings */}
      <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-slate-100 dark:border-gray-700 overflow-hidden mb-6">
        <div className="px-6 sm:px-8 py-4 bg-[#FAFAFA] dark:bg-gray-800/60 border-b border-slate-100 dark:border-gray-700 flex items-start gap-3">
          <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 shrink-0">
            <Shield size={18} aria-hidden />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Security settings</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">Password and active sessions</p>
          </div>
        </div>
        <div className="p-6 sm:p-8 flex flex-col sm:flex-row flex-wrap gap-3">
          <button
            type="button"
            onClick={openPasswordModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 hover:bg-slate-200 dark:hover:bg-gray-600 transition"
          >
            <Lock size={16} />
            Change Password
          </button>
          <button
            type="button"
            onClick={handleLogoutAllDevices}
            className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800/40 hover:bg-rose-100 dark:hover:bg-rose-900/30 transition"
          >
            <LogOut size={16} />
            Logout from all devices
          </button>
        </div>
      </section>

      {/* Preferences */}
      <form onSubmit={handleSavePreferences}>
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-slate-100 dark:border-gray-700 overflow-hidden mb-6">
          <div className="px-6 sm:px-8 py-4 bg-[#FAFAFA] dark:bg-gray-800/60 border-b border-slate-100 dark:border-gray-700">
            <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Preferences</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">Appearance and notifications</p>
          </div>
          <div className="p-6 sm:p-8 divide-y divide-slate-100 dark:divide-gray-700 max-w-xl">

            {/* Dark Mode — instant toggle, no save needed */}
            <div className="flex items-center justify-between gap-4 py-4 first:pt-0">
              <div className="flex items-start gap-3 min-w-0">
                <div className="p-2 rounded-xl bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-slate-300 shrink-0">
                  <Moon size={18} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">Dark mode</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                    {isDark ? 'Dark theme is active' : 'Switch to dark theme — applies instantly'}
                  </p>
                </div>
              </div>
              <ToggleSwitch
                id="dark-toggle"
                enabled={isDark}
                onChange={toggleTheme}
              />
            </div>

            {/* Notifications */}
            <div className="flex items-center justify-between gap-4 py-4">
              <div className="flex items-start gap-3 min-w-0">
                <div className="p-2 rounded-xl bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-slate-300 shrink-0">
                  <Bell size={18} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">Notifications</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                    Email alerts and product tips (stored on this device)
                  </p>
                </div>
              </div>
              <ToggleSwitch
                id="notify-toggle"
                enabled={emailNotifications}
                onChange={(v) => {
                  markDirtyPrefs();
                  setEmailNotifications(v);
                }}
              />
            </div>
          </div>

          <div className="px-6 sm:px-8 py-6 border-t border-slate-100 dark:border-gray-700 bg-slate-50/50 dark:bg-gray-800/40">
            <button
              type="submit"
              disabled={saving}
              className={`inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 font-bold shadow-sm transition disabled:opacity-60 disabled:cursor-not-allowed ${
                justSaved && !saving
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/25 cursor-default'
                  : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 hover:shadow-md'
              }`}
            >
              {saving ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Saving…
                </>
              ) : justSaved ? (
                <>
                  <CheckCircle2 size={18} className="shrink-0" />
                  Successfully Saved
                </>
              ) : (
                'Update Settings'
              )}
            </button>
          </div>
        </section>
      </form>

      {pwdOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-slate-200 dark:border-gray-700 w-full max-w-md overflow-hidden"
            role="dialog"
            aria-modal="true"
          >
            <div className="px-6 py-4 border-b border-slate-100 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Change password</h3>
              <button
                type="button"
                onClick={() => !pwdSubmitting && setPwdOpen(false)}
                className="p-2 rounded-lg text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-gray-700 transition"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleChangePassword} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                  Current password
                </label>
                <input
                  type="password"
                  required
                  value={pwdCurrent}
                  onChange={(e) => setPwdCurrent(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-gray-600 bg-slate-50/50 dark:bg-gray-700 text-slate-900 dark:text-gray-100 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-300 dark:focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                  New password
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={pwdNew}
                  onChange={(e) => setPwdNew(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-gray-600 bg-slate-50/50 dark:bg-gray-700 text-slate-900 dark:text-gray-100 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-300 dark:focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                  Confirm new password
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={pwdConfirm}
                  onChange={(e) => setPwdConfirm(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-gray-600 bg-slate-50/50 dark:bg-gray-700 text-slate-900 dark:text-gray-100 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-300 dark:focus:border-indigo-500"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  disabled={pwdSubmitting}
                  onClick={() => setPwdOpen(false)}
                  className="flex-1 py-3 rounded-xl font-bold text-sm text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-gray-700 hover:bg-slate-200 dark:hover:bg-gray-600 transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={pwdSubmitting}
                  className="flex-1 py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-sm disabled:opacity-60 inline-flex items-center justify-center gap-2"
                >
                  {pwdSubmitting ? <Loader2 size={18} className="animate-spin" /> : null}
                  Update password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
