import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Briefcase, NotebookTabs, ArrowUpRight, Activity, Lightbulb, Target, TrendingUp, Sparkles, LayoutDashboard, FileText, Loader2, CheckCircle2, AlertTriangle, ExternalLink } from 'lucide-react';
import api from '../api';
import StudyGuideModal from '../components/StudyGuideModal';
import { formatTimestamp } from '../utils/formatDate';

const DashboardHome = () => {
  const { user } = useContext(AuthContext);

  const [stats, setStats] = useState({
    atsScore: null,
    primaryResumeId: null,
    primaryFileName: null,
    jobsApplied: 0,
    interviews: 0,
    successRate: 0,
    strongAreas: [],
    weakAreas: [],
  });

  const [isGeneratingGuide, setIsGeneratingGuide] = useState(false);
  const [studyGuideData, setStudyGuideData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [guideError, setGuideError] = useState(null);

  const [activities, setActivities] = useState([]);
  const [isLoadingActivities, setIsLoadingActivities] = useState(true);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  const [viewResumeError, setViewResumeError] = useState('');

  const handleViewPrimaryResume = async () => {
    if (!stats.primaryResumeId) return;
    setViewResumeError('');
    try {
      const res = await api.get(`/resume/${stats.primaryResumeId}/file`, { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      window.open(url, '_blank');
    } catch (err) {
      let message = 'Could not open resume.';
      try {
        const text = await err.response?.data?.text?.();
        const json = JSON.parse(text);
        if (json?.message) message = json.message;
      } catch { /* ignore */ }
      setViewResumeError(message);
      setTimeout(() => setViewResumeError(''), 5000);
    }
  };

  const generateStudyGuide = async () => {
    setIsGeneratingGuide(true);
    setGuideError(null);
    try {
      const res = await api.post('/ai/study-guide');
      setStudyGuideData(res.data);
      setIsModalOpen(true);
    } catch (err) {
      console.error(err);
      setGuideError(err.response?.data?.msg || 'AI service temporarily unavailable. Please try again.');
    } finally {
      setIsGeneratingGuide(false);
    }
  };

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoadingStats(true);
      try {
        const res = await api.get('/dashboard/stats');
        setStats(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoadingStats(false);
      }
    };

    const fetchActivities = async () => {
      setIsLoadingActivities(true);
      try {
        const res = await api.get('/activity');
        setActivities(res.data?.activities || []);
      } catch (err) {
        console.error(err);
        setActivities([]);
      } finally {
        setIsLoadingActivities(false);
      }
    };

    fetchStats();
    fetchActivities();
  }, []);

  return (
    <div className="max-w-7xl mx-auto pb-12 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-gray-100 dark:border-gray-700 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <LayoutDashboard className="text-indigo-600" size={28} />
            Dashboard Overview
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium ml-10">
            Good to see you back, {user?.name?.split(' ')[0] || 'User'}. Here's your career progress.
          </p>
        </div>
        <Link
          to="/dashboard/analyzer"
          className="group relative inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white shadow-lg transition-all duration-300 transform hover:-translate-y-1"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl blur-md opacity-40 group-hover:opacity-70 transition-opacity"></div>
          <span className="relative flex items-center gap-2">
            <Sparkles size={16} className="animate-pulse" /> New AI Scan
          </span>
        </Link>
      </div>

      {/* Top Value Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">

        {/* ATS Score Card (Green) */}
        <div className="bg-gradient-to-br from-white to-emerald-50/30 dark:from-gray-800 dark:to-gray-800 rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.2)] border border-emerald-100/50 dark:border-emerald-900/30 hover:shadow-[0_15px_30px_rgba(16,185,129,0.1)] dark:hover:shadow-[0_15px_30px_rgba(16,185,129,0.05)] transition-all duration-300 transform hover:-translate-y-1 group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">ATS Score</p>
              <h3 className="text-4xl font-black text-slate-900 dark:text-white">
                {isLoadingStats ? '—' : stats.atsScore != null ? `${stats.atsScore}%` : 'N/A'}
              </h3>
              {!isLoadingStats && stats.primaryFileName && (
                <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-1 truncate max-w-[140px]" title={stats.primaryFileName}>
                  {stats.primaryFileName}
                </p>
              )}
            </div>
            <div className="p-3.5 bg-emerald-100 dark:bg-emerald-900/40 rounded-2xl text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
              <Target size={24} strokeWidth={2.5} />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 flex-wrap">
            <div className="flex items-center text-xs text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-100/60 dark:bg-emerald-900/30 rounded-md px-2.5 py-1.5">
              {stats.atsScore != null
                ? <><ArrowUpRight size={14} className="mr-1" /> Primary Resume score</>
                : <span>Upload a resume to view ATS score</span>}
            </div>
            {stats.primaryResumeId && (
              <button
                onClick={handleViewPrimaryResume}
                className="flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100/60 dark:bg-emerald-900/30 hover:bg-emerald-200/60 dark:hover:bg-emerald-900/50 rounded-md px-2.5 py-1.5 transition-colors"
              >
                <ExternalLink size={12} />
                View Resume
              </button>
            )}
          </div>
          {viewResumeError && (
            <p className="mt-2 text-[11px] font-semibold text-rose-500 dark:text-rose-400 leading-snug">
              {viewResumeError}
            </p>
          )}
        </div>

        {/* Jobs Applied Card (Blue) */}
        <div className="bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-800 dark:to-gray-800 rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.2)] border border-blue-100/50 dark:border-blue-900/30 hover:shadow-[0_15px_30px_rgba(59,130,246,0.1)] dark:hover:shadow-[0_15px_30px_rgba(59,130,246,0.05)] transition-all duration-300 transform hover:-translate-y-1 group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Jobs Applied</p>
              <h3 className="text-4xl font-black text-slate-900 dark:text-white">
                {isLoadingStats ? '—' : stats.jobsApplied}
              </h3>
            </div>
            <div className="p-3.5 bg-blue-100 dark:bg-blue-900/40 rounded-2xl text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
              <Briefcase size={24} strokeWidth={2.5} />
            </div>
          </div>
          <div className="mt-6 flex items-center text-xs text-blue-700 dark:text-blue-400 font-bold bg-blue-100/60 dark:bg-blue-900/30 rounded-md px-2.5 py-1.5 w-fit">
            <span>Applied + Interviewing</span>
          </div>
        </div>

        {/* Interviews Card (Purple) */}
        <div className="bg-gradient-to-br from-white to-purple-50/30 dark:from-gray-800 dark:to-gray-800 rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.2)] border border-purple-100/50 dark:border-purple-900/30 hover:shadow-[0_15px_30px_rgba(168,85,247,0.1)] dark:hover:shadow-[0_15px_30px_rgba(168,85,247,0.05)] transition-all duration-300 transform hover:-translate-y-1 group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Interviews</p>
              <h3 className="text-4xl font-black text-slate-900 dark:text-white">
                {isLoadingStats ? '—' : stats.interviews}
              </h3>
            </div>
            <div className="p-3.5 bg-purple-100 dark:bg-purple-900/40 rounded-2xl text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
              <NotebookTabs size={24} strokeWidth={2.5} />
            </div>
          </div>
          <div className="mt-6 flex items-center text-xs text-purple-700 dark:text-purple-400 font-bold bg-purple-100/60 dark:bg-purple-900/30 rounded-md px-2.5 py-1.5 w-fit">
            <span>Active interview stages</span>
          </div>
        </div>

        {/* Success Rate Card (Rose) */}
        <div className="bg-gradient-to-br from-white to-rose-50/30 dark:from-gray-800 dark:to-gray-800 rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.2)] border border-rose-100/50 dark:border-rose-900/30 hover:shadow-[0_15px_30px_rgba(244,63,94,0.1)] dark:hover:shadow-[0_15px_30px_rgba(244,63,94,0.05)] transition-all duration-300 transform hover:-translate-y-1 group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Success Rate</p>
              <h3 className="text-4xl font-black text-slate-900 dark:text-white">
                {isLoadingStats ? '—' : `${stats.successRate}%`}
              </h3>
            </div>
            <div className="p-3.5 bg-rose-100 dark:bg-rose-900/40 rounded-2xl text-rose-600 dark:text-rose-400 group-hover:scale-110 transition-transform">
              <TrendingUp size={24} strokeWidth={2.5} />
            </div>
          </div>
          <div className="mt-6 flex items-center text-xs text-rose-700 dark:text-rose-400 font-bold bg-rose-100/60 dark:bg-rose-900/30 rounded-md px-2.5 py-1.5 w-fit">
            <Activity size={14} className="mr-1" />
            <span>Weighted hybrid score</span>
          </div>
        </div>

      </div>

      {/* Middle Sections */}
      <div className="flex flex-col lg:flex-row items-start gap-6">

        {/* Left Col: Recent Activity */}
        <div className="lg:w-2/3 w-full">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-[0_4px_40px_rgba(0,0,0,0.02)] dark:shadow-[0_4px_40px_rgba(0,0,0,0.2)] border border-slate-100 dark:border-gray-700 overflow-hidden h-full">
            <div className="px-8 py-6 border-b border-slate-100 dark:border-gray-700 flex justify-between items-center bg-[#FAFAFA] dark:bg-gray-800/60">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Recent Activity</h3>
              <Link
                to="/dashboard/jobs"
                className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600 px-4 py-2 rounded-lg shadow-sm transition hover:shadow"
              >
                View Pipeline
              </Link>
            </div>
            <div className="p-8">
              <div className="relative pl-8 border-l-[3px] border-indigo-100 dark:border-indigo-900 space-y-10 ml-2">
                {isLoadingActivities ? (
                  <div className="py-10 flex items-center gap-3 text-slate-500 dark:text-slate-400 font-semibold">
                    <Loader2 size={18} className="animate-spin" />
                    Loading recent activity...
                  </div>
                ) : activities.length === 0 ? (
                  <div className="py-10 text-slate-500 dark:text-slate-400 font-semibold">
                    No active applications yet. Track a job with status Applied or Interviewing to see it here.
                  </div>
                ) : (
                  activities.map((activity, idx) => (
                    <div key={`${activity.type}-${activity.timestamp}-${idx}`} className="relative group">
                      <div className="absolute -left-[51px] bg-white dark:bg-gray-800 p-1.5 rounded-full border-[3px] mt-0.5 group-hover:scale-110 transition-transform shadow-sm border-blue-200 dark:border-blue-800">
                        <div className="p-1.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400">
                          <Briefcase size={16} />
                        </div>
                      </div>

                      <p className="text-[11px] font-black text-slate-400 dark:text-slate-500 mb-1.5 uppercase tracking-widest">
                        {formatTimestamp(activity.timestamp)}
                      </p>

                      <div className="bg-slate-50 dark:bg-gray-700/50 border border-slate-100 dark:border-gray-600 rounded-2xl p-5 mt-2 transition duration-300 hover:shadow-md group-hover:shadow-md group-hover:bg-blue-50/50 dark:group-hover:bg-blue-900/20 group-hover:border-blue-100 dark:group-hover:border-blue-800/50">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          {activity.title}
                          {activity.meta?.role && (
                            <span className="text-slate-400 dark:text-slate-500 font-medium"> — {activity.meta.role}</span>
                          )}
                        </h4>
                        <div className="mt-3 inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50">
                          Status: {activity.meta?.status || 'Applied'}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: AI Insights — intentionally dark panel */}
        <div className="lg:w-1/3 w-full self-start">
          <div className="bg-slate-900 rounded-3xl shadow-2xl border border-slate-800 overflow-hidden text-white relative self-start group">
            <div className="absolute -top-32 -right-32 w-64 h-64 rounded-full bg-indigo-600 opacity-30 blur-[80px] group-hover:bg-indigo-500 transition-colors duration-700"></div>
            <div className="absolute -bottom-32 -left-32 w-64 h-64 rounded-full bg-purple-600 opacity-20 blur-[80px] group-hover:bg-purple-500 transition-colors duration-700"></div>

            <div className="px-8 py-6 border-b border-slate-800 flex justify-between items-center relative z-10 bg-slate-900/50 backdrop-blur-sm">
              <h3 className="text-lg font-black flex items-center gap-3 tracking-wide">
                <Lightbulb size={20} className="text-amber-400" /> AI Insights
              </h3>
            </div>

            <div className="p-8 space-y-8 relative z-10 flex flex-col">

              {/* Strong Areas */}
              <div className="pb-8 border-b border-slate-800/80">
                <p className="text-[11px] text-emerald-400 font-black uppercase tracking-widest mb-3 flex items-center gap-2">
                  <CheckCircle2 size={14} /> Strong Areas
                </p>
                {stats.strongAreas.length > 0 ? (
                  <ul className="space-y-2">
                    {stats.strongAreas.map((area, i) => (
                      <li key={i} className="text-sm text-slate-300 leading-relaxed font-medium flex items-start gap-2">
                        <span className="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span>
                        <span>
                          <span className="text-white font-bold">{area.company}</span>
                          {area.role ? ` (${area.role})` : ''}: {area.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-400 font-medium">
                    No strengths logged yet. Add learnings in your Interview Diary after a passed interview.
                  </p>
                )}
              </div>

              {/* Needs Improvement */}
              <div className="flex-1 pb-8 border-b border-slate-800/80">
                <p className="text-[11px] text-rose-400 font-black uppercase tracking-widest mb-3 flex items-center gap-2">
                  <AlertTriangle size={14} /> Needs Improvement
                </p>
                {stats.weakAreas.length > 0 ? (
                  <ul className="space-y-2">
                    {stats.weakAreas.map((area, i) => (
                      <li key={i} className="text-sm text-slate-300 leading-relaxed font-medium flex items-start gap-2">
                        <span className="mt-1 w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0"></span>
                        <span>
                          <span className="text-white font-bold">{area.company}</span>
                          {area.role ? ` (${area.role})` : ''}: {area.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-400 font-medium">
                    No weaknesses logged yet. Log interview feedback in your Interview Diary to see coaching tips here.
                  </p>
                )}
              </div>

              <button
                onClick={generateStudyGuide}
                disabled={isGeneratingGuide}
                className="w-full py-4 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:from-slate-600 disabled:to-slate-700 text-white rounded-xl text-sm font-bold transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] transform hover:-translate-y-0.5 cursor-pointer relative z-20 disabled:cursor-not-allowed"
              >
                {isGeneratingGuide
                  ? <><Loader2 size={18} className="animate-spin" /> Generating AI Guide...</>
                  : 'Generate Study Guide'}
              </button>
              {guideError && (
                <div className="flex items-start gap-2 bg-rose-900/30 border border-rose-800/50 rounded-xl px-4 py-3 relative z-20">
                  <AlertTriangle size={15} className="text-rose-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-rose-300 font-medium leading-relaxed">{guideError}</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {studyGuideData && (
        <StudyGuideModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          data={studyGuideData}
        />
      )}

    </div>
  );
};

export default DashboardHome;
