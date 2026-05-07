import { useState } from 'react';
import api from '../api';
import {
  UploadCloud, Link as LinkIcon, FileText, Loader2, Target,
  AlertCircle, Lightbulb, Brain, CheckCircle2, BarChart3,
  Zap, BookOpen, Layout, Code2, Star,
} from 'lucide-react';

// ── Circular Score Ring ────────────────────────────────────────────────────────
const CircularProgress = ({ score }) => {
  const radius = 70;
  const stroke = 12;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let color, strokeColor, label, bgColor, borderColor;

  if (score >= 80) {
    color = 'text-emerald-600 dark:text-emerald-400';
    strokeColor = '#059669';
    label = 'Excellent Match';
    bgColor = 'bg-emerald-50/50 dark:bg-emerald-900/20';
    borderColor = 'border-emerald-100 dark:border-emerald-800/40';
  } else if (score >= 60) {
    color = 'text-amber-500 dark:text-amber-400';
    strokeColor = '#f59e0b';
    label = 'Good Match';
    bgColor = 'bg-amber-50/50 dark:bg-amber-900/20';
    borderColor = 'border-amber-100 dark:border-amber-800/40';
  } else {
    color = 'text-red-500 dark:text-red-400';
    strokeColor = '#ef4444';
    label = 'Low Match';
    bgColor = 'bg-red-50 dark:bg-red-900/20';
    borderColor = 'border-red-100 dark:border-red-800/40';
  }

  return (
    <div className={`flex flex-col items-center p-8 rounded-3xl ${bgColor} border-2 ${borderColor} shadow-sm w-full lg:w-2/3 mx-auto`}>
      <div className="relative flex items-center justify-center w-40 h-40">
        <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
          <circle stroke="#cbd5e1" fill="transparent" strokeWidth={stroke} r={normalizedRadius} cx={radius} cy={radius} />
          <circle
            stroke={strokeColor} fill="transparent" strokeWidth={stroke}
            strokeDasharray={`${circumference} ${circumference}`}
            style={{ strokeDashoffset, transition: 'stroke-dashoffset 1s ease-in-out', strokeLinecap: 'round' }}
            r={normalizedRadius} cx={radius} cy={radius}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-4xl font-black ${color} tracking-tight`}>{score}%</span>
        </div>
      </div>
      <h3 className={`text-xl font-black mt-5 ${color} uppercase tracking-wider`}>{label}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 text-center leading-relaxed font-medium">
        Your resume matches <b>{score}%</b> of this job's requirements based on skills, experience, projects, and formatting.
      </p>
    </div>
  );
};

// ── Score Breakdown Bar ────────────────────────────────────────────────────────
const BreakdownBar = ({ label, score, weight, icon: Icon, color }) => {
  const bar = {
    emerald: 'bg-emerald-500',
    amber:   'bg-amber-500',
    blue:    'bg-blue-500',
    purple:  'bg-purple-500',
  };
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="flex items-center gap-1.5 text-xs font-bold text-gray-600 dark:text-gray-300">
          <Icon size={13} /> {label}
        </span>
        <span className="text-xs font-black text-gray-700 dark:text-gray-200">
          {score}<span className="text-gray-400 font-medium">/100</span>
          <span className="ml-1.5 text-gray-400 font-medium">({weight})</span>
        </span>
      </div>
      <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
        <div
          className={`${bar[color]} h-2 rounded-full transition-all duration-700`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────
const ResumeAnalyzer = () => {
  const [file, setFile]       = useState(null);
  const [jdMode, setJdMode]   = useState('text');
  const [jdText, setJdText]   = useState('');
  const [jdUrl, setJdUrl]     = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(null);
  const [error, setError]     = useState('');
  const [parsedText, setParsedText] = useState('');
  const [resumeId, setResumeId]     = useState(null);
  const [isPrimary, setIsPrimary]   = useState(false);
  const [savingPrimary, setSavingPrimary] = useState(false);
  const [primaryToast, setPrimaryToast]  = useState('');

  const handleAnalyze = async () => {
    if (!file)                                   { setError('Please upload a PDF resume'); return; }
    if (jdMode === 'text' && !jdText.trim())     { setError('Please provide a job description'); return; }
    if (jdMode === 'url'  && !jdUrl.trim())      { setError('Please provide a job URL'); return; }
    if (jdMode === 'url'  && !/^https?:\/\//i.test(jdUrl.trim())) {
      setError('Please enter a valid URL starting with http:// or https://');
      return;
    }

    setError('');
    setLoading(true);
    setResult(null);
    setResumeId(null);
    setIsPrimary(false);
    setPrimaryToast('');

    const formData = new FormData();
    formData.append('resume', file);
    if (jdMode === 'text') formData.append('jdText', jdText);
    if (jdMode === 'url')  formData.append('jdUrl', jdUrl);

    try {
      const res = await api.post('/ai/analyze-resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(res.data);
      setResumeId(res.data.resumeId || null);
      setParsedText('Resume parsed successfully. Skills extracted and scored against the job description.');

      // Check if this resume is already the primary
      if (res.data.resumeId) {
        try {
          const primary = await api.get('/resume/primary');
          if (primary.data && primary.data._id === res.data.resumeId) {
            setIsPrimary(true);
          }
        } catch { /* non-critical */ }
      }
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to analyze. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAsPrimary = async () => {
    if (!resumeId || isPrimary) return;
    setSavingPrimary(true);
    try {
      await api.patch(`/resume/set-primary/${resumeId}`);
      setIsPrimary(true);
      setPrimaryToast('Resume saved as Primary');
      setTimeout(() => setPrimaryToast(''), 3000);
    } catch {
      setPrimaryToast('Failed to save. Please try again.');
      setTimeout(() => setPrimaryToast(''), 3000);
    } finally {
      setSavingPrimary(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-10">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Resume Match Analyzer</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
          Upload your resume and compare it against a Job Description using our deterministic ATS scoring engine.
        </p>
      </header>

      <div className="grid lg:grid-cols-12 gap-8">

        {/* ── Left Column ──────────────────────────────────────────────── */}
        <div className="lg:col-span-5 space-y-6">

          {/* Upload Resume */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-widest mb-4 flex items-center gap-2">
              <UploadCloud size={18} className="text-indigo-500" /> Upload Resume
            </h3>

            <div className="border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-gray-50 dark:hover:bg-gray-700/50 transition cursor-pointer relative bg-slate-50/50 dark:bg-gray-700/30">
              <input
                type="file"
                accept="application/pdf"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={e => setFile(e.target.files[0])}
              />
              <FileText size={32} className={`mb-3 ${file ? 'text-indigo-500' : 'text-gray-400 dark:text-gray-500'}`} />
              {file ? (
                <p className="text-indigo-600 dark:text-indigo-400 font-bold text-sm">{file.name}</p>
              ) : (
                <>
                  <p className="text-sm font-bold text-gray-700 dark:text-gray-200">Click or drag PDF here</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">max. 10MB</p>
                </>
              )}
            </div>

            {result && (
              <div className="mt-6 border-t border-gray-100 dark:border-gray-700 pt-5">
                <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Parse Status</h4>
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg border border-gray-100 dark:border-gray-600 text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-2">
                  <CheckCircle2 size={14} /> {parsedText}
                </div>
              </div>
            )}
          </div>

          {/* Target Job */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-widest flex items-center gap-2">
                <Target size={18} className="text-emerald-500" /> Target Job
              </h3>
              <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                {['text', 'url'].map(mode => (
                  <button
                    key={mode}
                    onClick={() => setJdMode(mode)}
                    className={`px-2 py-1 text-xs rounded-md font-bold transition ${
                      jdMode === mode
                        ? 'bg-white dark:bg-gray-600 shadow-sm text-gray-900 dark:text-white'
                        : 'text-gray-400 dark:text-gray-500'
                    }`}
                  >
                    {mode === 'text' ? 'Text' : 'Link'}
                  </button>
                ))}
              </div>
            </div>

            {jdMode === 'text' ? (
              <textarea
                value={jdText}
                onChange={e => setJdText(e.target.value)}
                placeholder="Paste the full job description here..."
                className="w-full h-40 p-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none text-sm"
              />
            ) : (
              <>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LinkIcon className="text-gray-400 dark:text-gray-500" size={16} />
                  </div>
                  <input
                    type="url"
                    value={jdUrl}
                    onChange={e => setJdUrl(e.target.value)}
                    placeholder="https://company.com/job/123"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-sm"
                  />
                </div>
                <p className="mt-2 text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                  <AlertCircle size={12} />
                  For better result paste the JD text manually, if the URL fails.
                </p>
              </>
            )}

            {error && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-xs font-bold flex items-center gap-2 border border-red-100 dark:border-red-800/40">
                <AlertCircle size={14} /> {error}
              </div>
            )}

            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="w-full mt-5 bg-gray-900 dark:bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-gray-800 dark:hover:bg-indigo-700 transition disabled:opacity-70 flex justify-center items-center gap-2 text-sm shadow-md"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? 'Scoring your resume...' : 'Scan & Match Resume'}
            </button>
          </div>
        </div>

        {/* ── Right Column (Results) ────────────────────────────────────── */}
        <div className="lg:col-span-7 flex flex-col gap-6">

          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex-1 flex flex-col">
            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Brain size={18} className="text-indigo-500" /> Match Results
            </h3>

            {!result && !loading && (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-gray-50/50 dark:bg-gray-700/30 rounded-xl border border-dashed border-gray-200 dark:border-gray-600">
                <Brain className="text-gray-300 dark:text-gray-600 mb-4" size={48} />
                <p className="text-sm font-bold text-gray-400 dark:text-gray-500">Upload resume &amp; job description to see your ATS score.</p>
              </div>
            )}

            {loading && (
              <div className="flex-1 flex flex-col items-center justify-center bg-indigo-50/30 dark:bg-indigo-900/10 rounded-xl gap-3">
                <Loader2 className="animate-spin text-indigo-500" size={32} />
                <p className="text-sm font-bold text-indigo-400 animate-pulse">Scoring your resume...</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">Extracting skills · Matching JD · Generating insights</p>
              </div>
            )}

            {result && (
              <div className="animate-in fade-in duration-500 space-y-8">

                {/* Score Ring */}
                <div className="mb-4 mt-2">
                  <CircularProgress score={result.score} />
                </div>

                {/* Save as Primary */}
                <div className="flex flex-col items-center gap-2">
                  {isPrimary ? (
                    <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/40 rounded-xl text-amber-600 dark:text-amber-400 text-sm font-bold">
                      <Star size={15} className="fill-amber-400 text-amber-400" />
                      This is your Primary Resume
                    </div>
                  ) : (
                    <button
                      onClick={handleSaveAsPrimary}
                      disabled={savingPrimary}
                      className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white rounded-xl text-sm font-bold transition-colors shadow-sm"
                    >
                      {savingPrimary
                        ? <Loader2 size={14} className="animate-spin" />
                        : <Star size={14} />}
                      {savingPrimary ? 'Saving…' : 'Save as Primary Resume'}
                    </button>
                  )}
                  {primaryToast && (
                    <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{primaryToast}</p>
                  )}
                </div>

                {/* Score Breakdown */}
                {result.breakdown && (
                  <div className="bg-gray-50 dark:bg-gray-700/40 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
                    <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <BarChart3 size={14} /> Score Breakdown
                    </h4>
                    <div className="space-y-4">
                      <BreakdownBar label="Skill Match"          score={result.breakdown.skillScore}       weight="50%" icon={Code2}    color="emerald" />
                      <BreakdownBar label="Experience Relevance" score={result.breakdown.experienceScore}  weight="20%" icon={Zap}      color="blue"    />
                      <BreakdownBar label="Project Relevance"    score={result.breakdown.projectScore}     weight="15%" icon={BookOpen} color="purple"  />
                      <BreakdownBar label="ATS Formatting"       score={result.breakdown.formatScore}      weight="15%" icon={Layout}   color="amber"   />
                    </div>
                  </div>
                )}

                {/* Skills */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider border-b border-gray-100 dark:border-gray-700 pb-2 mb-3 flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-emerald-500" /> Matched Skills
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {result.matchedSkills?.length > 0
                        ? result.matchedSkills.map((skill, i) => (
                            <span key={i} className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded text-xs font-bold border border-emerald-100/50 dark:border-emerald-800/30">
                              {skill}
                            </span>
                          ))
                        : <p className="text-xs text-gray-400 dark:text-gray-500 italic">No matching skills detected.</p>
                      }
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider border-b border-gray-100 dark:border-gray-700 pb-2 mb-3 flex items-center gap-2">
                      <AlertCircle size={14} className="text-rose-500" /> Missing Skills
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {result.missingSkills?.length > 0
                        ? result.missingSkills.map((skill, i) => (
                            <span key={i} className="px-2.5 py-1 bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 rounded text-xs font-bold border border-rose-100/50 dark:border-rose-800/30">
                              {skill}
                            </span>
                          ))
                        : <p className="text-xs text-gray-400 dark:text-gray-500 italic">No major skill gaps found!</p>
                      }
                    </div>
                  </div>
                </div>

                {/* Insights & Improvements */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-indigo-50/50 dark:bg-indigo-900/20 rounded-xl p-5 border border-indigo-100/50 dark:border-indigo-800/30">
                    <h4 className="text-xs font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Lightbulb size={14} /> AI Insights
                    </h4>
                    <ul className="space-y-3">
                      {result.insights?.map((insight, i) => (
                        <li key={i} className="flex gap-3 text-sm text-gray-700 dark:text-gray-200 font-medium">
                          <div className="mt-1 text-indigo-400 shrink-0"><Target size={14} /></div>
                          <div>{insight}</div>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-emerald-50/50 dark:bg-emerald-900/20 rounded-xl p-5 border border-emerald-100/50 dark:border-emerald-800/30">
                    <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Brain size={14} /> Improvements
                    </h4>
                    <ul className="space-y-3">
                      {result.improvements?.map((pt, i) => (
                        <li key={i} className="flex gap-3 text-sm text-gray-700 dark:text-gray-200 font-medium">
                          <div className="mt-1 text-emerald-400 shrink-0"><CheckCircle2 size={14} /></div>
                          <div>{pt}</div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ResumeAnalyzer;
