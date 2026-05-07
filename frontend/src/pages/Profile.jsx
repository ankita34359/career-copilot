import React, { useContext, useEffect, useRef, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { User, Mail, Briefcase, Camera, CheckCircle2, Loader2 } from 'lucide-react';
import api from '../api';

/** Downscale + JPEG so base64 fits API/DB limits and saves reliably */
function compressDataUrlForAvatar(dataUrl, maxSide = 720, quality = 0.85) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        let w = img.width;
        let h = img.height;
        if (w > maxSide || h > maxSide) {
          if (w >= h) {
            h = Math.round((h * maxSide) / w);
            w = maxSide;
          } else {
            w = Math.round((w * maxSide) / h);
            h = maxSide;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', quality));
      } catch (e) {
        reject(e);
      }
    };
    img.onerror = () => reject(new Error('Image load failed'));
    img.src = dataUrl;
  });
}

const Profile = () => {
  const { user, refreshUser } = useContext(AuthContext);
  const fileInputRef = useRef(null);
  const savedTimerRef = useRef(null);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState('');
  const [role, setRole] = useState('');
  const [imagePreview, setImagePreview] = useState('');

  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  const clearSavedTimer = () => {
    if (savedTimerRef.current) {
      clearTimeout(savedTimerRef.current);
      savedTimerRef.current = null;
    }
  };

  const markDirty = () => {
    clearSavedTimer();
    setJustSaved(false);
  };

  useEffect(() => () => clearSavedTimer(), []);

  useEffect(() => {
    if (!user) return;
    setFullName(user.name || '');
    setEmail(user.email || '');
    setBio(user.bio || '');
    setSkills(user.skills || '');
    setRole(user.role || '');
    setImagePreview(user.image || '');
    clearSavedTimer();
    setJustSaved(false);
  }, [user]);

  const displayRole = role?.trim() || 'Student / Developer';

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      const raw = reader.result;
      if (typeof raw !== 'string') return;
      markDirty();
      try {
        const compressed = await compressDataUrlForAvatar(raw);
        setImagePreview(compressed);
      } catch {
        setImagePreview(raw);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    clearSavedTimer();
    setJustSaved(false);
    try {
      await api.put('/auth/me', {
        name: fullName.trim(),
        bio: bio.trim(),
        skills: skills.trim(),
        role: role.trim(),
        image: imagePreview || '',
      });
      if (typeof refreshUser === 'function') await refreshUser();
      setJustSaved(true);
      savedTimerRef.current = setTimeout(() => {
        setJustSaved(false);
        savedTimerRef.current = null;
      }, 2800);
    } catch (err) {
      console.error(err);
      const status = err.response?.status;
      const data = err.response?.data;
      let serverMsg =
        (typeof data === 'object' && data?.msg) ||
        (typeof data === 'string' ? data : null);
      if (typeof serverMsg === 'string' && /cannot\s+(patch|put)\s+\/api\/auth\/me/i.test(serverMsg)) {
        serverMsg = null;
      }
      if (typeof serverMsg === 'string' && serverMsg.trim().startsWith('<!DOCTYPE')) {
        serverMsg = null;
      }
      const message =
        serverMsg ||
        (status === 404
          ? 'Profile update is not available on the server. Stop Node, restart the backend from this project folder, and try again.'
          : null) ||
        (status === 413 ? 'Upload too large. Try a smaller image.' : null) ||
        'Failed to save profile.';
      alert(message);
    } finally {
      setSaving(false);
    }
  };

  const initial = fullName?.charAt(0)?.toUpperCase() || user?.name?.charAt(0)?.toUpperCase() || 'U';

  return (
    <div className="max-w-5xl mx-auto p-6 pb-12 animate-fade-in">
      <header className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
          <User className="text-indigo-600" size={28} />
          Profile
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">Manage your personal information</p>
      </header>

      {/* Profile summary card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-slate-100 dark:border-gray-700 p-6 sm:p-8 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start gap-8">
          <div className="flex-shrink-0">
            {imagePreview ? (
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-xl overflow-hidden bg-slate-100 dark:bg-gray-700 shadow-sm border border-slate-200 dark:border-gray-600 ring-2 ring-slate-50 dark:ring-gray-700 flex items-center justify-center">
                <img
                  src={imagePreview}
                  alt="Profile"
                  className="w-full h-full object-contain object-center"
                />
              </div>
            ) : (
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center text-4xl font-black shadow-sm border border-white dark:border-gray-700 ring-2 ring-slate-100 dark:ring-gray-600">
                {initial}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0 space-y-2">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {fullName || user?.name || 'Your name'}
            </h2>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600 dark:text-slate-300 font-medium">
              <span className="inline-flex items-center gap-2">
                <Mail size={16} className="text-slate-400 dark:text-slate-500" />
                {email || user?.email || '—'}
              </span>
              <span className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <Briefcase size={16} className="text-slate-400 dark:text-slate-500" />
                {displayRole}
              </span>
            </div>
            {bio?.trim() && (
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed pt-2 border-t border-slate-100 dark:border-gray-700 mt-4">
                {bio.trim()}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Editable form */}
      <form onSubmit={handleSave} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-slate-100 dark:border-gray-700 p-6 sm:p-8">
        <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6">Edit details</h3>

        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-6 pb-6 border-b border-slate-100 dark:border-gray-700">
            <div className="flex items-center gap-4">
              <div className="relative">
                {imagePreview ? (
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 shadow-sm flex items-center justify-center">
                    <img
                      src={imagePreview}
                      alt="Profile"
                      className="w-full h-full object-contain object-center"
                    />
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center text-xl font-bold border border-slate-200 dark:border-gray-600 shadow-sm">
                    {initial}
                  </div>
                )}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Avatar</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition shadow-sm"
                >
                  <Camera size={16} />
                  Change Avatar
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Full name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => { markDirty(); setFullName(e.target.value); }}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-gray-600 bg-slate-50/50 dark:bg-gray-700 text-slate-900 dark:text-gray-100 font-medium placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:bg-white dark:focus:bg-gray-700 focus:border-indigo-300 dark:focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition text-sm"
              placeholder="Your full name"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Email</label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-gray-600 bg-slate-100 dark:bg-gray-700/50 text-slate-500 dark:text-slate-400 font-medium cursor-not-allowed text-sm"
            />
            <p className="mt-1.5 text-xs text-slate-400 dark:text-slate-500 font-medium">Email cannot be changed from this screen.</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Role</label>
            <input
              type="text"
              value={role}
              onChange={(e) => { markDirty(); setRole(e.target.value); }}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-gray-600 bg-slate-50/50 dark:bg-gray-700 text-slate-900 dark:text-gray-100 font-medium placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:bg-white dark:focus:bg-gray-700 focus:border-indigo-300 dark:focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition text-sm"
              placeholder="e.g. Student, Frontend Developer"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => { markDirty(); setBio(e.target.value); }}
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-gray-600 bg-slate-50/50 dark:bg-gray-700 text-slate-900 dark:text-gray-100 font-medium placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:bg-white dark:focus:bg-gray-700 focus:border-indigo-300 dark:focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition text-sm resize-y min-h-[120px]"
              placeholder="A short bio about you..."
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Skills</label>
            <input
              type="text"
              value={skills}
              onChange={(e) => { markDirty(); setSkills(e.target.value); }}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-gray-600 bg-slate-50/50 dark:bg-gray-700 text-slate-900 dark:text-gray-100 font-medium placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:bg-white dark:focus:bg-gray-700 focus:border-indigo-300 dark:focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition text-sm"
              placeholder="e.g. React, Node.js, System Design (comma-separated)"
            />
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className={`inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 font-bold shadow-sm transition disabled:opacity-60 disabled:cursor-not-allowed ${
              justSaved && !saving
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/30 cursor-default'
                : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 hover:shadow-md'
            }`}
          >
            {saving ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Saving...
              </>
            ) : justSaved ? (
              <>
                <CheckCircle2 size={18} className="shrink-0" />
                Successfully Saved
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;
