import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Search, BookOpen, Briefcase, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const DEBOUNCE_MS  = 300;
const MIN_QUERY    = 2;

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const STATUS_COLOR = {
  Applied:      'text-blue-500',
  Interviewing: 'text-amber-500',
  Offer:        'text-emerald-500',
  Rejected:     'text-rose-500',
};

const GlobalSearch = () => {
  const [query,   setQuery]   = useState('');
  const [results, setResults] = useState(null);   // null = not yet searched
  const [loading, setLoading] = useState(false);
  const [open,    setOpen]    = useState(false);
  const [dropPos, setDropPos] = useState({});

  const inputRef    = useRef(null);
  const wrapperRef  = useRef(null);
  const dropRef     = useRef(null);
  const timerRef    = useRef(null);
  const controllerRef = useRef(null);   // AbortController for in-flight requests
  const navigate    = useNavigate();

  // ── Position the portal dropdown below the input ───────────────────────────
  const calcPos = useCallback(() => {
    if (!wrapperRef.current) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    setDropPos({
      position: 'fixed',
      top:   rect.bottom + 6,
      left:  rect.left,
      width: rect.width,
      zIndex: 99999,
    });
  }, []);

  // ── Debounced search ───────────────────────────────────────────────────────
  const doSearch = useCallback(async (q) => {
    if (q.length < MIN_QUERY) {
      setResults(null);
      setOpen(false);
      return;
    }

    // Cancel any in-flight request
    if (controllerRef.current) controllerRef.current.abort();
    controllerRef.current = new AbortController();

    setLoading(true);
    setOpen(true);
    calcPos();

    try {
      const res = await api.get('/search', {
        params: { q },
        signal: controllerRef.current.signal,
      });
      setResults(res.data);
    } catch (err) {
      if (err.name !== 'CanceledError' && err.code !== 'ERR_CANCELED') {
        setResults({ interviews: [], jobs: [] });
      }
    } finally {
      setLoading(false);
    }
  }, [calcPos]);

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);

    clearTimeout(timerRef.current);
    if (val.trim().length < MIN_QUERY) {
      setResults(null);
      setOpen(false);
      return;
    }
    timerRef.current = setTimeout(() => doSearch(val.trim()), DEBOUNCE_MS);
  };

  // ── Close on outside click ─────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (
        wrapperRef.current  && !wrapperRef.current.contains(e.target) &&
        dropRef.current     && !dropRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Recalculate on resize when open
  useEffect(() => {
    if (!open) return;
    const onResize = () => calcPos();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [open, calcPos]);

  // Cleanup timer on unmount
  useEffect(() => () => clearTimeout(timerRef.current), []);

  // ── Navigation ─────────────────────────────────────────────────────────────
  const handleSelect = (path) => {
    setOpen(false);
    setQuery('');
    setResults(null);
    navigate(path);
  };

  // ── Keyboard navigation ────────────────────────────────────────────────────
  const allItems = [
    ...(results?.interviews ?? []).map((r) => ({ ...r, _kind: 'interview' })),
    ...(results?.jobs       ?? []).map((r) => ({ ...r, _kind: 'job' })),
  ];
  const [cursor, setCursor] = useState(-1);

  useEffect(() => { setCursor(-1); }, [results]);

  const handleKeyDown = (e) => {
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setCursor((c) => Math.min(c + 1, allItems.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setCursor((c) => Math.max(c - 1, -1));
    } else if (e.key === 'Enter' && cursor >= 0) {
      e.preventDefault();
      const item = allItems[cursor];
      handleSelect(item._kind === 'interview' ? '/dashboard/diary' : '/dashboard/jobs');
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  // ── Dark mode detection ────────────────────────────────────────────────────
  const isDark = document.documentElement.classList.contains('dark');

  // ── Dropdown content ───────────────────────────────────────────────────────
  const hasInterviews = results?.interviews?.length > 0;
  const hasJobs       = results?.jobs?.length > 0;
  const isEmpty       = results && !hasInterviews && !hasJobs && !loading;

  const dropdown = open ? createPortal(
    <div
      ref={dropRef}
      style={{
        ...dropPos,
        backgroundColor: isDark ? '#1e293b' : '#ffffff',
        borderColor:     isDark ? '#334155' : '#e2e8f0',
        maxHeight: 400,
        overflowY: 'auto',
        borderRadius: 14,
        border: '1px solid',
        boxShadow: '0 12px 40px rgba(0,0,0,0.18)',
      }}
    >
      {/* Loading */}
      {loading && (
        <div
          className="flex items-center gap-2.5 px-4 py-4"
          style={{ color: isDark ? '#94a3b8' : '#64748b' }}
        >
          <Loader2 size={15} className="animate-spin flex-shrink-0" />
          <span className="text-sm font-medium">Searching…</span>
        </div>
      )}

      {/* Empty state */}
      {isEmpty && (
        <div
          className="px-4 py-6 text-center text-sm font-medium"
          style={{ color: isDark ? '#64748b' : '#94a3b8' }}
        >
          No results found for &ldquo;{query}&rdquo;
        </div>
      )}

      {/* Interview results */}
      {!loading && hasInterviews && (
        <div>
          <div
            className="flex items-center gap-2 px-4 pt-3.5 pb-1.5 text-[11px] font-black uppercase tracking-widest"
            style={{ color: isDark ? '#6366f1' : '#6366f1' }}
          >
            <BookOpen size={11} />
            Interviews
          </div>
          {results.interviews.map((item, i) => {
            const globalIdx = i;
            const isActive  = cursor === globalIdx;
            return (
              <button
                key={item._id}
                onClick={() => handleSelect('/dashboard/diary')}
                className="w-full text-left flex items-center gap-3 px-4 py-2.5 transition-colors"
                style={{
                  backgroundColor: isActive
                    ? (isDark ? '#334155' : '#f1f5f9')
                    : 'transparent',
                }}
                onMouseEnter={() => setCursor(globalIdx)}
                onMouseLeave={() => setCursor(-1)}
              >
                <div
                  className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: isDark ? '#312e81' : '#eef2ff' }}
                >
                  <BookOpen size={13} className="text-indigo-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm font-bold truncate"
                    style={{ color: isDark ? '#f1f5f9' : '#1e293b' }}
                  >
                    {item.company}
                    {item.role && (
                      <span
                        className="font-semibold ml-1"
                        style={{ color: isDark ? '#94a3b8' : '#64748b' }}
                      >
                        — {item.role}
                      </span>
                    )}
                  </p>
                  <p
                    className="text-[11px] font-medium"
                    style={{ color: isDark ? '#475569' : '#94a3b8' }}
                  >
                    {formatDate(item.createdAt)}
                    {item.result && ` · ${item.result}`}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Divider between sections */}
      {!loading && hasInterviews && hasJobs && (
        <div
          className="mx-4 my-1"
          style={{ height: 1, backgroundColor: isDark ? '#1e293b' : '#f1f5f9' }}
        />
      )}

      {/* Job results */}
      {!loading && hasJobs && (
        <div>
          <div
            className="flex items-center gap-2 px-4 pt-3.5 pb-1.5 text-[11px] font-black uppercase tracking-widest"
            style={{ color: isDark ? '#6366f1' : '#6366f1' }}
          >
            <Briefcase size={11} />
            Jobs
          </div>
          {results.jobs.map((item, i) => {
            const globalIdx = (results?.interviews?.length ?? 0) + i;
            const isActive  = cursor === globalIdx;
            return (
              <button
                key={item._id}
                onClick={() => handleSelect('/dashboard/jobs')}
                className="w-full text-left flex items-center gap-3 px-4 py-2.5 transition-colors"
                style={{
                  backgroundColor: isActive
                    ? (isDark ? '#334155' : '#f1f5f9')
                    : 'transparent',
                }}
                onMouseEnter={() => setCursor(globalIdx)}
                onMouseLeave={() => setCursor(-1)}
              >
                <div
                  className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: isDark ? '#052e16' : '#f0fdf4' }}
                >
                  <Briefcase size={13} className="text-emerald-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm font-bold truncate"
                    style={{ color: isDark ? '#f1f5f9' : '#1e293b' }}
                  >
                    {item.company}
                    <span
                      className="font-semibold ml-1"
                      style={{ color: isDark ? '#94a3b8' : '#64748b' }}
                    >
                      — {item.role}
                    </span>
                  </p>
                  <p
                    className={`text-[11px] font-semibold ${STATUS_COLOR[item.status] ?? 'text-slate-400'}`}
                  >
                    {item.status}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Bottom padding */}
      {!loading && (hasInterviews || hasJobs) && <div className="h-2" />}
    </div>,
    document.body
  ) : null;

  return (
    <>
      <div ref={wrapperRef} className="w-full max-w-md relative group">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <Search
            className="h-[18px] w-[18px] text-slate-400 transition-colors"
            style={{ color: open ? '#6366f1' : undefined }}
          />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => { if (results) { calcPos(); setOpen(true); } }}
          onKeyDown={handleKeyDown}
          placeholder="Search jobs, interviews…"
          className="block w-full pl-[42px] pr-4 py-2.5 border border-slate-200 dark:border-gray-600 rounded-xl leading-5 bg-slate-50/50 dark:bg-gray-700 text-slate-900 dark:text-gray-100 placeholder-slate-400 dark:placeholder-gray-400 focus:outline-none focus:bg-white dark:focus:bg-gray-700 focus:border-indigo-300 dark:focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 sm:text-sm transition-all font-medium"
        />
      </div>
      {dropdown}
    </>
  );
};

export default GlobalSearch;
