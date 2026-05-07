import React, { useState, useEffect, useCallback } from 'react';
import { FileText, Star, ExternalLink, Trash2, Loader2, UploadCloud, Crown, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api';

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

function ScoreBadge({ score }) {
  if (score >= 70) return (
    <span className="px-2 py-0.5 rounded-full text-xs font-black bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/40">
      {score}%
    </span>
  );
  if (score >= 45) return (
    <span className="px-2 py-0.5 rounded-full text-xs font-black bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-800/40">
      {score}%
    </span>
  );
  return (
    <span className="px-2 py-0.5 rounded-full text-xs font-black bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-800/40">
      {score}%
    </span>
  );
}

const Resumes = () => {
  const [resumes, setResumes]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [actionId, setActionId] = useState(null);  // id of resume currently being actioned
  const [toast, setToast]       = useState(null);   // { message, type: 'error'|'success' }

  const showToast = (message, type = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchResumes = useCallback(async () => {
    try {
      const res = await api.get('/resume/all');
      setResumes(res.data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchResumes(); }, [fetchResumes]);

  const handleViewResume = async (resume) => {
    setActionId(resume._id);
    try {
      const res = await api.get(`/resume/${resume._id}/file`, { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      window.open(url, '_blank');
    } catch (err) {
      // Axios wraps non-2xx as errors; parse the JSON message from the blob
      let message = 'Could not open resume.';
      try {
        const text = await err.response?.data?.text?.();
        const json = JSON.parse(text);
        if (json?.message) message = json.message;
      } catch { /* ignore parse failure */ }
      showToast(message);
    } finally {
      setActionId(null);
    }
  };

  const handleSetPrimary = async (resume) => {
    if (resume.isPrimary) return;
    setActionId(resume._id);
    try {
      await api.patch(`/resume/set-primary/${resume._id}`);
      setResumes((prev) => prev.map((r) => ({ ...r, isPrimary: r._id === resume._id })));
      showToast('Primary resume updated', 'success');
    } catch {
      showToast('Failed to update primary resume.');
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (resume) => {
    if (!window.confirm(`Delete "${resume.fileName}"? This cannot be undone.`)) return;
    setActionId(resume._id);
    try {
      await api.delete(`/resume/${resume._id}`);
      setResumes((prev) => prev.filter((r) => r._id !== resume._id));
    } catch {
      showToast('Failed to delete resume.');
    } finally {
      setActionId(null);
    }
  };

  const primary = resumes.find((r) => r.isPrimary);

  return (
    <div className="max-w-3xl mx-auto pb-10">
      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-5 py-3 rounded-2xl shadow-xl text-sm font-bold text-white transition-all ${
          toast.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
        }`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FileText className="text-indigo-500" size={24} />
            My Resumes
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {resumes.length > 0
              ? `${resumes.length} resume${resumes.length > 1 ? 's' : ''} uploaded — primary drives your dashboard ATS score`
              : 'Analyze a resume to save it here'}
          </p>
        </div>
        <Link
          to="/dashboard/analyzer"
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-colors shadow-sm"
        >
          <UploadCloud size={15} />
          Analyze New
        </Link>
      </div>

      {/* Primary resume highlight */}
      {primary && (
        <div className="mb-6 flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/40 rounded-2xl">
          <Crown size={18} className="text-amber-500 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-black text-amber-700 dark:text-amber-400">Primary Resume</p>
            <p className="text-xs text-amber-600 dark:text-amber-500 font-medium truncate">{primary.fileName}</p>
          </div>
          <ScoreBadge score={primary.atsScore} />
        </div>
      )}

      {/* Migration notice — shown only when some resumes predate file storage */}
      {!loading && resumes.some((r) => !r.hasFile) && (
        <div className="mb-4 flex items-start gap-3 px-4 py-3.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/40 rounded-xl">
          <RefreshCw size={15} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 dark:text-amber-400 font-medium leading-relaxed">
            Some resumes were saved before PDF storage was enabled and can't be viewed directly.{' '}
            <Link to="/dashboard/analyzer" className="font-black underline underline-offset-2">
              Re-analyze them
            </Link>{' '}
            to enable the View button. You can safely delete the old entries afterwards.
          </p>
        </div>
      )}

      {/* List */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-slate-100 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-slate-100 dark:border-gray-700 border-t-indigo-500 rounded-full animate-spin" />
          </div>
        ) : resumes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-6">
            <FileText size={40} className="text-slate-200 dark:text-gray-600 mb-4" />
            <p className="text-base font-bold text-slate-400 dark:text-slate-500">No resumes saved yet</p>
            <p className="text-sm text-slate-300 dark:text-slate-600 mt-1">
              Run a Resume Analyzer scan and save the result as your primary resume.
            </p>
          </div>
        ) : (
          resumes.map((resume, idx) => {
            const isBusy = actionId === resume._id;
            return (
              <div
                key={resume._id}
                className={`flex items-center gap-4 px-5 py-4 transition-colors hover:bg-slate-50 dark:hover:bg-gray-700/40 ${
                  idx < resumes.length - 1 ? 'border-b border-slate-100 dark:border-gray-700/60' : ''
                } ${resume.isPrimary ? 'bg-amber-50/40 dark:bg-amber-900/10' : ''}`}
              >
                {/* Icon */}
                <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center border ${
                  resume.isPrimary
                    ? 'bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-700/40'
                    : 'bg-slate-50 dark:bg-gray-700 border-slate-100 dark:border-gray-600'
                }`}>
                  <FileText size={18} className={resume.isPrimary ? 'text-amber-500' : 'text-slate-400 dark:text-slate-500'} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold text-slate-800 dark:text-white truncate max-w-[260px]" title={resume.fileName}>
                      {resume.fileName}
                    </p>
                    {resume.isPrimary && (
                      <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 rounded-full text-[10px] font-black border border-amber-200 dark:border-amber-700/40 flex-shrink-0">
                        <Star size={9} className="fill-amber-400 text-amber-400" />
                        Primary
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                      {formatDate(resume.createdAt)}
                    </span>
                    <ScoreBadge score={resume.atsScore} />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* View */}
                  {resume.hasFile && (
                    <button
                      onClick={() => handleViewResume(resume)}
                      disabled={isBusy}
                      title="View Resume"
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 border border-indigo-100 dark:border-indigo-800/40 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {isBusy ? <Loader2 size={12} className="animate-spin" /> : <ExternalLink size={12} />}
                      View
                    </button>
                  )}

                  {/* Re-analyze — always shown so user can update the stored PDF */}
                  <Link
                    to="/dashboard/analyzer"
                    title={resume.hasFile ? 'Run a new analysis' : 'Re-analyze to enable viewing'}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors border ${
                      resume.hasFile
                        ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 border-indigo-100 dark:border-indigo-800/40'
                        : 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/40 border-amber-100 dark:border-amber-800/40'
                    }`}
                  >
                    <RefreshCw size={12} />
                    Re-analyze
                  </Link>

                  {/* Set Primary */}
                  {!resume.isPrimary && (
                    <button
                      onClick={() => handleSetPrimary(resume)}
                      disabled={isBusy}
                      title="Set as Primary"
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/40 border border-amber-100 dark:border-amber-800/40 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {isBusy ? <Loader2 size={12} className="animate-spin" /> : <Star size={12} />}
                      Set Primary
                    </button>
                  )}

                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(resume)}
                    disabled={isBusy}
                    title="Delete"
                    className="p-1.5 text-slate-300 dark:text-slate-600 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {isBusy ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Resumes;
