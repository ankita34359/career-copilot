import React, { useState } from 'react';
import {
  X, Target, BookOpen, Calendar, AlertCircle, Clock,
  ExternalLink, Zap, CheckCircle2, ChevronDown, ChevronRight,
  Layers, HelpCircle, Link2, Building2,
} from 'lucide-react';

// ── Helpers ───────────────────────────────────────────────────────────────────

const diffCls = {
  Easy:   'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400',
  Medium: 'bg-amber-100   dark:bg-amber-900/40   text-amber-700   dark:text-amber-400',
  Hard:   'bg-rose-100    dark:bg-rose-900/40    text-rose-700    dark:text-rose-400',
  easy:   'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400',
  medium: 'bg-amber-100   dark:bg-amber-900/40   text-amber-700   dark:text-amber-400',
  hard:   'bg-rose-100    dark:bg-rose-900/40    text-rose-700    dark:text-rose-400',
};

const priorityCls = {
  high:   { badge: 'bg-rose-100    dark:bg-rose-900/40    text-rose-700    dark:text-rose-400',    dot: 'bg-rose-500'    },
  medium: { badge: 'bg-amber-100   dark:bg-amber-900/40   text-amber-700   dark:text-amber-400',   dot: 'bg-amber-500'   },
  low:    { badge: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500' },
};

const freqCls = {
  'Very High': 'bg-rose-50    dark:bg-rose-900/30    text-rose-600    dark:text-rose-400    border-rose-200    dark:border-rose-800/40',
  'High':      'bg-amber-50   dark:bg-amber-900/30   text-amber-600   dark:text-amber-400   border-amber-200   dark:border-amber-800/40',
  'Medium':    'bg-slate-100  dark:bg-slate-700/50   text-slate-500   dark:text-slate-400   border-slate-200   dark:border-slate-600/40',
};

const weekPalette = [
  { border: 'border-l-indigo-500',  badge: 'bg-indigo-100  dark:bg-indigo-900/40  text-indigo-700  dark:text-indigo-300  border-indigo-200  dark:border-indigo-700',  line: 'border-indigo-200  dark:border-indigo-800',  dot: 'bg-indigo-500'  },
  { border: 'border-l-purple-500',  badge: 'bg-purple-100  dark:bg-purple-900/40  text-purple-700  dark:text-purple-300  border-purple-200  dark:border-purple-700',  line: 'border-purple-200  dark:border-purple-800',  dot: 'bg-purple-500'  },
  { border: 'border-l-emerald-500', badge: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700', line: 'border-emerald-200 dark:border-emerald-800', dot: 'bg-emerald-500' },
  { border: 'border-l-blue-500',    badge: 'bg-blue-100    dark:bg-blue-900/40    text-blue-700    dark:text-blue-300    border-blue-200    dark:border-blue-700',    line: 'border-blue-200    dark:border-blue-800',    dot: 'bg-blue-500'    },
];

const SectionHeader = ({ icon: Icon, iconCls, title }) => (
  <h3 className="text-sm font-black flex items-center gap-2 text-slate-800 dark:text-gray-100 mb-5 uppercase tracking-wider">
    <Icon size={15} className={iconCls} /> {title}
  </h3>
);

const ResourcePill = ({ name, url, type }) => (
  <a
    href={url}
    target="_blank"
    rel="noopener noreferrer"
    className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600 text-slate-600 dark:text-slate-300 hover:border-indigo-400 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
  >
    <ExternalLink size={10} />
    {name}
    {type && <span className="text-slate-400 dark:text-slate-500 font-normal">· {type}</span>}
  </a>
);

// ── Subtopic accordion ────────────────────────────────────────────────────────
const SubtopicRow = ({ sub }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-lg border border-slate-100 dark:border-gray-700 overflow-hidden">
      <button
        onClick={() => setOpen(p => !p)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-50 dark:bg-gray-700/50 hover:bg-slate-100 dark:hover:bg-gray-700 transition-colors text-left"
      >
        <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{sub.name}</span>
        {open ? <ChevronDown size={13} className="text-slate-400" /> : <ChevronRight size={13} className="text-slate-400" />}
      </button>
      {open && (
        <div className="px-4 py-3 bg-white dark:bg-gray-800 space-y-2">
          {sub.description && (
            <p className="text-[11px] text-slate-500 dark:text-slate-400 italic leading-relaxed">{sub.description}</p>
          )}
          {sub.concepts?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {sub.concepts.map((c, i) => (
                <span key={i} className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800/40">
                  {c}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ── Main modal ────────────────────────────────────────────────────────────────
const StudyGuideModal = ({ isOpen, onClose, data }) => {
  const [activeTopicIdx, setActiveTopicIdx] = useState(0);

  if (!isOpen) return null;

  const activeTopic = data.topics?.[activeTopicIdx];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-md" onClick={onClose} />

      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[92vh] overflow-hidden flex flex-col">

        {/* Header */}
        <div className="px-8 py-5 bg-linear-to-r from-slate-900 to-indigo-950 text-white flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-lg font-black tracking-tight flex items-center gap-2.5">
              <BookOpen size={18} className="text-indigo-400" /> Personalized Study Guide
            </h2>
            <p className="text-slate-400 text-xs font-medium mt-0.5">Generated by Career Copilot AI</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={18} /></button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 bg-slate-50 dark:bg-gray-900 divide-y divide-slate-200 dark:divide-gray-800">

          {/* ── Focus Areas ───────────────────────────────────────────────── */}
          <section className="px-8 py-6">
            <SectionHeader icon={Target} iconCls="text-rose-500" title="Top Focus Areas" />
            <div className="grid md:grid-cols-3 gap-4">
              {data.focus_areas?.map((area, i) => {
                const p = priorityCls[area.priority] ?? priorityCls.low;
                return (
                  <div key={i} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-slate-100 dark:border-gray-700 shadow-sm">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">{area.title}</h4>
                      <span className={`shrink-0 flex items-center gap-1 text-[9px] uppercase font-black px-2 py-0.5 rounded-full ${p.badge}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${p.dot}`} />{area.priority}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{area.reason}</p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ── Core Concepts ─────────────────────────────────────────────── */}
          <section className="px-8 py-6">
            <SectionHeader icon={BookOpen} iconCls="text-indigo-500" title="Core Concepts" />

            {/* Topic tabs */}
            <div className="flex gap-2 flex-wrap mb-5">
              {data.topics?.map((t, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTopicIdx(i)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                    activeTopicIdx === i
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                      : 'bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 text-slate-600 dark:text-slate-400 hover:border-indigo-300'
                  }`}
                >
                  {i + 1}. {t.title}
                </button>
              ))}
            </div>

            {activeTopic && (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-slate-100 dark:border-gray-700 shadow-sm overflow-hidden">

                {/* Topic title bar */}
                <div className="px-6 py-4 border-b border-slate-100 dark:border-gray-700 flex flex-wrap items-center justify-between gap-3 bg-slate-50 dark:bg-gray-800">
                  <div>
                    <h4 className="text-base font-black text-slate-900 dark:text-white">{activeTopic.title}</h4>
                    {activeTopic.why_important && (
                      <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mt-0.5 flex items-center gap-1">
                        <Zap size={11} /> {activeTopic.why_important}
                      </p>
                    )}
                  </div>
                  <span className={`text-[10px] uppercase font-black px-2.5 py-1 rounded-lg ${diffCls[activeTopic.difficulty] ?? diffCls.medium}`}>
                    {activeTopic.difficulty}
                  </span>
                </div>

                <div className="p-6 grid lg:grid-cols-3 gap-6">

                  {/* Col 1 — Subtopics + explanation */}
                  <div className="space-y-4">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                        <Layers size={10} /> Subtopics
                      </p>
                      <div className="space-y-1.5">
                        {activeTopic.subtopics?.map((sub, i) => (
                          <SubtopicRow key={i} sub={sub} />
                        ))}
                      </div>
                    </div>
                    <div className="bg-slate-50 dark:bg-gray-700/40 rounded-lg p-3 border border-slate-100 dark:border-gray-600">
                      <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Overview</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed italic">{activeTopic.explanation}</p>
                    </div>
                    {/* Resources */}
                    {activeTopic.resources?.length > 0 && (
                      <div>
                        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                          <Link2 size={10} /> Resources
                        </p>
                        <div className="space-y-1.5">
                          {activeTopic.resources.map((r, i) => (
                            <a
                              key={i}
                              href={r.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-start gap-2.5 p-2.5 rounded-lg border border-slate-100 dark:border-gray-700 bg-slate-50 dark:bg-gray-700/30 hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors group"
                            >
                              <ExternalLink size={12} className="text-indigo-500 shrink-0 mt-0.5 group-hover:text-indigo-600" />
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 truncate">{r.name}</p>
                                {r.type && <p className="text-[10px] text-slate-400 dark:text-slate-500">{r.type}{r.description ? ` · ${r.description}` : ''}</p>}
                              </div>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Col 2 — Top Interview Questions */}
                  <div>
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                      <HelpCircle size={10} /> Highly Asked Questions
                    </p>
                    <div className="space-y-2">
                      {activeTopic.top_interview_questions?.map((q, i) => (
                        <a
                          key={i}
                          href={q.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block p-3 rounded-lg border border-slate-100 dark:border-gray-700 bg-slate-50 dark:bg-gray-700/30 hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 transition-colors group"
                        >
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 leading-snug flex items-center gap-1.5">
                              <ExternalLink size={10} className="shrink-0 text-indigo-400" />
                              {q.question}
                            </span>
                            <span className={`shrink-0 text-[9px] font-black px-1.5 py-0.5 rounded ${diffCls[q.difficulty] ?? diffCls.Medium}`}>
                              {q.difficulty}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            {q.frequency && (
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${freqCls[q.frequency] ?? freqCls.Medium}`}>
                                {q.frequency} freq
                              </span>
                            )}
                            {q.companies?.slice(0, 3).map((c, ci) => (
                              <span key={ci} className="flex items-center gap-0.5 text-[9px] font-semibold text-slate-400 dark:text-slate-500">
                                <Building2 size={8} /> {c}
                              </span>
                            ))}
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>

                  {/* Col 3 — Action Items */}
                  <div>
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                      <AlertCircle size={10} className="text-indigo-500" /> Action Items
                    </p>
                    <div className="space-y-2.5">
                      {activeTopic.action_items?.map((item, j) => {
                        const isObj = typeof item === 'object';
                        return (
                          <div key={j} className="rounded-lg border border-indigo-100 dark:border-indigo-800/40 bg-indigo-50/50 dark:bg-indigo-900/15 p-3">
                            <div className="flex items-start gap-2.5">
                              <span className="w-5 h-5 bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-400 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">
                                {j + 1}
                              </span>
                              <div className="min-w-0">
                                <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                                  {isObj ? item.step : item}
                                </p>
                                {isObj && (
                                  <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                    {item.url ? (
                                      <a href={item.url} target="_blank" rel="noopener noreferrer"
                                        className="flex items-center gap-1 text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
                                        <ExternalLink size={9} /> {item.resource}
                                      </a>
                                    ) : item.resource && (
                                      <span className="flex items-center gap-1 text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">
                                        <ExternalLink size={9} /> {item.resource}
                                      </span>
                                    )}
                                    {item.time_estimate && (
                                      <span className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                                        <Clock size={9} /> {item.time_estimate}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>
              </div>
            )}
          </section>

          {/* ── Weekly Master Plan ────────────────────────────────────────── */}
          <section className="px-8 py-6">
            <SectionHeader icon={Calendar} iconCls="text-emerald-500" title="Weekly Master Plan" />
            <div className="space-y-5">
              {data.weekly_plan?.map((week, wi) => {
                const wc = weekPalette[wi % weekPalette.length];
                return (
                  <div key={wi} className={`bg-white dark:bg-gray-800 rounded-xl border border-slate-100 dark:border-gray-700 border-l-4 ${wc.border} shadow-sm overflow-hidden`}>

                    {/* Week header */}
                    <div className="px-6 py-4 bg-slate-50 dark:bg-gray-800/80 border-b border-slate-100 dark:border-gray-700 flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${wc.badge} uppercase tracking-wider`}>
                          Week {wi + 1}
                        </span>
                        <h4 className="text-sm font-black text-slate-900 dark:text-white mt-1.5">{week.focus}</h4>
                        {week.total_hours && (
                          <p className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1 mt-0.5">
                            <Clock size={10} /> {week.total_hours} total
                          </p>
                        )}
                      </div>
                      {week.weekly_goal && (
                        <div className="flex items-start gap-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/40 rounded-lg px-3 py-2 max-w-sm">
                          <CheckCircle2 size={13} className="text-emerald-500 shrink-0 mt-0.5" />
                          <p className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold leading-snug">{week.weekly_goal}</p>
                        </div>
                      )}
                    </div>

                    {/* Day blocks */}
                    <div className="p-5 grid md:grid-cols-3 gap-4">
                      {week.days?.map((day, di) => (
                        <div key={di} className="rounded-xl border border-slate-100 dark:border-gray-700 bg-slate-50 dark:bg-gray-700/30 p-4 flex flex-col gap-3">
                          {/* Day header */}
                          <div className="flex items-center justify-between gap-2">
                            <div>
                              <p className={`text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500`}>{day.range}</p>
                              <p className="text-xs font-bold text-slate-800 dark:text-white mt-0.5">{day.topic}</p>
                            </div>
                            {day.time_estimate && (
                              <span className="flex items-center gap-1 text-[9px] font-semibold text-slate-500 dark:text-slate-400 bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-full px-2 py-0.5 shrink-0">
                                <Clock size={8} /> {day.time_estimate}
                              </span>
                            )}
                          </div>

                          {/* Tasks */}
                          <ul className="space-y-1.5">
                            {day.tasks?.map((task, ti) => (
                              <li key={ti} className="flex items-start gap-2 text-[11px] text-slate-600 dark:text-slate-300 font-medium leading-snug">
                                <div className={`w-1.5 h-1.5 rounded-full ${wc.dot} shrink-0 mt-1.5`} />
                                {task}
                              </li>
                            ))}
                          </ul>

                          {/* Practice target */}
                          {day.practice_target && (
                            <div className="flex items-start gap-1.5 bg-white dark:bg-gray-700/60 rounded-lg px-2.5 py-2 border border-slate-200 dark:border-gray-600 mt-auto">
                              <Target size={11} className="text-indigo-500 shrink-0 mt-0.5" />
                              <p className="text-[10px] text-indigo-700 dark:text-indigo-300 font-semibold leading-snug">{day.practice_target}</p>
                            </div>
                          )}

                          {/* Day resources */}
                          {day.resources?.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {day.resources.map((r, ri) => (
                                <a key={ri} href={r.url} target="_blank" rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-[9px] font-semibold px-2 py-0.5 rounded-full bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-300 transition-colors">
                                  <ExternalLink size={8} /> {r.name}
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}

                      {/* Fallback: flat task list (old schema) */}
                      {!week.days && week.tasks?.map((task, ti) => (
                        <div key={ti} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300 font-medium">
                          <div className={`w-1.5 h-1.5 rounded-full ${wc.dot} shrink-0 mt-1.5`} />
                          {task}
                        </div>
                      ))}
                    </div>

                    {/* Weekly resources footer */}
                    {(week.weekly_resources ?? week.resources)?.length > 0 && (
                      <div className="px-5 pb-4 pt-0">
                        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Resources This Week</p>
                        <div className="flex flex-wrap gap-2">
                          {(week.weekly_resources ?? week.resources).map((r, ri) => {
                            const isObj = typeof r === 'object';
                            return isObj ? (
                              <a key={ri} href={r.url} target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-full bg-slate-100 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-300 transition-colors">
                                <ExternalLink size={10} /> {r.name}
                                {r.purpose && <span className="text-slate-400 dark:text-slate-500 font-normal">· {r.purpose}</span>}
                              </a>
                            ) : (
                              <span key={ri} className="flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-full bg-slate-100 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 text-slate-600 dark:text-slate-300">
                                {r}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default StudyGuideModal;
