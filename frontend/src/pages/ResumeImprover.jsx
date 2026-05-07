import React, { useState } from 'react';
import { Sparkles, Copy, RefreshCw, FileText, Check, ArrowRight, Lightbulb, ListChecks, ScanSearch } from 'lucide-react';
import api from '../api';

const MODES = [
  { id: 'improve', label: 'Improve Bullets', icon: Sparkles },
  { id: 'analyze', label: 'Analyze Bullets', icon: ScanSearch },
];

const ResumeImprover = () => {
  const [mode, setMode] = useState('improve');
  const [originalText, setOriginalText] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!originalText.trim()) {
      setError('Please provide bullet points.');
      return;
    }
    setError('');
    setLoading(true);
    setResult(null);

    try {
      let res;
      if (mode === 'improve') {
        res = await api.post('/ai/improve-resume', { bulletPoints: originalText });
        // Legacy array fallback
        if (Array.isArray(res.data)) {
          setResult({ improvedBullets: res.data, whatWasImproved: [], optionalSuggestions: [] });
        } else {
          setResult(res.data);
        }
      } else {
        res = await api.post('/ai/bullet-analysis', { text: originalText });
        setResult(res.data);
      }
    } catch (err) {
      setError('Failed to process. ' + (err.response?.data?.msg || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result?.improvedBullets?.length) return;
    const text = result.improvedBullets.map(b => `• ${b}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleModeSwitch = (newMode) => {
    setMode(newMode);
    setResult(null);
    setError('');
  };

  const hasImproveResult = result && result.improvedBullets?.length > 0;
  const hasAnalyzeResult = result && (result.strengths !== undefined || result.weaknesses !== undefined);

  const buttonLabel = mode === 'improve' ? 'Improve with AI' : 'Analyze with AI';
  const loadingLabel = mode === 'improve' ? 'Polishing your resume bullets...' : 'Analyzing your bullets...';

  return (
    <div className="max-w-6xl mx-auto pb-10 h-full flex flex-col">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Sparkles className="text-indigo-500" /> AI Resume Improver
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
          Improve or analyze your resume bullets — no fake metrics, no fluff.
        </p>
      </header>

      {/* Mode Tabs */}
      <div className="flex gap-2 mb-6">
        {MODES.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => handleModeSwitch(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition border ${
              mode === id
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400'
            }`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 flex-1 min-h-[500px]">

        {/* Left: Input */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/60 flex justify-between items-center">
            <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <FileText size={16} className="text-gray-400 dark:text-gray-500" /> Original Content
            </h3>
            <button
              onClick={() => { setOriginalText(''); setResult(null); setError(''); }}
              className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 font-bold transition-colors"
            >
              Clear
            </button>
          </div>
          <div className="flex-1 p-5">
            <textarea
              value={originalText}
              onChange={(e) => setOriginalText(e.target.value)}
              placeholder={"Paste your resume bullet points here...\n\nE.g.:\n• I made the website much faster and fixed some bugs for the team.\n• Worked on backend APIs using Node.js"}
              className="w-full h-full min-h-[300px] resize-none focus:outline-none text-gray-700 dark:text-gray-200 bg-transparent text-[15px] leading-relaxed placeholder-gray-300 dark:placeholder-gray-600"
            />
          </div>

          <div className="p-5 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60">
            {error && <div className="mb-3 text-xs text-rose-500 dark:text-rose-400 font-bold">{error}</div>}
            <button
              onClick={handleSubmit}
              disabled={loading || !originalText.trim()}
              className="w-full bg-gray-900 dark:bg-indigo-600 text-white font-bold py-3.5 px-4 rounded-xl hover:bg-gray-800 dark:hover:bg-indigo-700 transition disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
            >
              {loading ? (
                <RefreshCw size={18} className="animate-spin text-indigo-400" />
              ) : (
                <>{buttonLabel} <ArrowRight size={16} className="text-emerald-400" /></>
              )}
            </button>
          </div>
        </div>

        {/* Right: Output */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col overflow-hidden">
          <div className="px-5 py-4 border-b border-indigo-100 dark:border-indigo-900/40 bg-indigo-50/30 dark:bg-indigo-900/10 flex justify-between items-center">
            <h3 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-2">
              {mode === 'improve'
                ? <><Sparkles size={16} className="text-indigo-500 dark:text-indigo-400" /> AI Improved Version</>
                : <><ScanSearch size={16} className="text-indigo-500 dark:text-indigo-400" /> AI Analysis</>
              }
            </h3>
            <div className="flex gap-2">
              {(hasImproveResult || hasAnalyzeResult) && (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition text-xs font-bold"
                >
                  <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                  Regenerate
                </button>
              )}
              {hasImproveResult && (
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg text-xs font-bold shadow-sm transition"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-5">

            {/* Empty state */}
            {!result && !loading && (
              <div className="h-full flex flex-col items-center justify-center opacity-40 min-h-[260px]">
                <Sparkles size={48} className="text-gray-300 dark:text-gray-600 mb-4" />
                <p className="text-sm font-bold text-gray-400 dark:text-gray-500">
                  {mode === 'improve' ? 'Your improved content will appear here' : 'Your analysis will appear here'}
                </p>
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className="h-full flex flex-col items-center justify-center min-h-[260px]">
                <div className="w-10 h-10 border-4 border-gray-100 dark:border-gray-700 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                <p className="text-sm font-bold text-indigo-500 dark:text-indigo-400 animate-pulse">{loadingLabel}</p>
              </div>
            )}

            {/* ── IMPROVE MODE OUTPUT ── */}
            {hasImproveResult && (
              <div className="space-y-5 animate-in fade-in duration-300">

                {/* Section 1: Improved Version */}
                <div>
                  <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                    <ListChecks size={14} className="text-indigo-500" /> Improved Version
                  </h4>
                  <ul className="space-y-2.5">
                    {(result.improvedBullets ?? []).map((bullet, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-[14.5px] text-gray-800 dark:text-gray-100 leading-relaxed">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Section 2: What Was Improved */}
                <div className="pt-1 border-t border-gray-100 dark:border-gray-700">
                  <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                    <Check size={14} className="text-emerald-500" /> What Was Improved
                  </h4>
                  {(result.whatWasImproved ?? []).length === 0 ? (
                    <p className="text-sm text-gray-400 dark:text-gray-500 italic">Minimal changes — bullets were already well-structured.</p>
                  ) : (
                    <ul className="space-y-1.5">
                      {result.whatWasImproved.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                          <Check size={13} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>


              </div>
            )}

            {/* ── ANALYZE MODE OUTPUT ── */}
            {hasAnalyzeResult && (
              <div className="space-y-5 animate-in fade-in duration-300">

                {/* Strengths */}
                <div>
                  <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                    <Check size={14} className="text-emerald-500" /> Strengths
                  </h4>
                  {(result.strengths ?? []).length === 0 ? (
                    <p className="text-sm text-gray-400 dark:text-gray-500 italic">No notable strengths identified.</p>
                  ) : (
                    <ul className="space-y-2">
                      {result.strengths.map((item, i) => (
                        <li key={i} className="flex items-start gap-2.5 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/40 rounded-xl text-sm text-gray-700 dark:text-gray-200">
                          <Check size={13} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Weaknesses */}
                <div className="pt-1 border-t border-gray-100 dark:border-gray-700">
                  <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded-full bg-rose-500 inline-flex items-center justify-center text-white text-[9px] font-black flex-shrink-0">!</span> Weaknesses
                  </h4>
                  {(result.weaknesses ?? []).length === 0
                    || (result.weaknesses.length === 1 && result.weaknesses[0].toLowerCase().includes('no major weakness')) ? (
                    <p className="text-sm text-gray-400 dark:text-gray-500 italic">No major weaknesses found.</p>
                  ) : (
                    <ul className="space-y-2">
                      {result.weaknesses.map((item, i) => (
                        <li key={i} className="flex items-start gap-2.5 p-3 bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-800/30 rounded-xl text-sm text-gray-700 dark:text-gray-200">
                          <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-rose-500 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Suggestions */}
                <div className="pt-1 border-t border-gray-100 dark:border-gray-700">
                  <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                    <Lightbulb size={14} className="text-amber-500" /> Suggestions
                  </h4>
                  {(result.suggestions ?? []).length === 0
                    || (result.suggestions.length === 1 && result.suggestions[0].toLowerCase().includes('no additional')) ? (
                    <p className="text-sm text-gray-400 dark:text-gray-500 italic">No additional suggestions — bullets are already strong.</p>
                  ) : (
                    <ul className="space-y-2">
                      {result.suggestions.map((item, i) => (
                        <li key={i} className="flex items-start gap-2.5 p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/30 rounded-xl text-sm text-gray-700 dark:text-gray-200">
                          <Lightbulb size={13} className="text-amber-500 mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>


              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};

export default ResumeImprover;
