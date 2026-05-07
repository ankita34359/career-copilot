import { useState, useEffect } from 'react';
import api from '../api';
import { NotebookPen, TrendingUp, TrendingDown, Clock, Search, BrainCircuit, Trash2, Edit3 } from 'lucide-react';

const InterviewDiary = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    company: '', role: '', rounds: 1, result: 'Pending', struggles: '', keyLearnings: '', topics: ''
  });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [insights, setInsights] = useState(null);

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const res = await api.get('/diary');
      setEntries(res.data);
      if (res.data.length > 0) {
        generateInsights();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generateInsights = async () => {
    setAiLoading(true);
    try {
      const res = await api.post('/ai/pattern-recognition');
      console.log('[Pattern] API response:', res.data);
      if (res.data) setInsights(res.data);
    } catch (err) {
      console.error(err);
      setInsights({ strengths: [], weaknesses: [], error: true });
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('[Diary] Submitting formData:', formData);
      if (editingId) {
        await api.put(`/diary/${editingId}`, formData);
      } else {
        await api.post('/diary', formData);
      }
      closeForm();
      fetchEntries();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (entry) => {
    setFormData({
      company: entry.company, role: entry.role || '', rounds: entry.rounds,
      result: entry.result,
      struggles:    entry.struggles    || entry.weakness  || '',
      keyLearnings: entry.keyLearnings || entry.learnings || '',
      topics:       entry.topics       || '',
    });
    setEditingId(entry._id);
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this interview log?')) {
      try {
        await api.delete(`/diary/${id}`);
        fetchEntries();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
    setFormData({ company: '', role: '', rounds: 1, result: 'Pending', struggles: '', keyLearnings: '', topics: '' });
  };

  return (
    <div className="max-w-7xl mx-auto pb-10">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">Interview Diary</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm font-medium">Log your interview experiences and let AI discover your blind spots.</p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-indigo-700 shadow-md transition"
        >
          <NotebookPen size={18} />
          Log Interview
        </button>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">

        {/* Left: Table of Entries */}
        <div className="lg:col-span-8 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/60 flex justify-between items-center">
            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-widest flex items-center gap-2">
              <Clock size={16} className="text-gray-400 dark:text-gray-500" /> Recent Logs
            </h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={14} />
              <input
                type="text"
                placeholder="Search company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-8 flex justify-center">
                <div className="animate-spin w-8 h-8 border-4 border-indigo-200 dark:border-indigo-900 border-t-indigo-600 rounded-full"></div>
              </div>
            ) : entries.length === 0 ? (
              <div className="p-12 text-center text-sm font-bold text-gray-400 dark:text-gray-500">No interview logs found. Add one!</div>
            ) : (
              <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
                <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 font-bold border-b border-gray-200 dark:border-gray-600">
                  <tr>
                    <th className="px-6 py-4">Company & Role</th>
                    <th className="px-6 py-4">Rounds</th>
                    <th className="px-6 py-4">Result</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {entries
                    .filter(entry =>
                      entry.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      (entry.role && entry.role.toLowerCase().includes(searchQuery.toLowerCase()))
                    )
                    .map(entry => (
                      <tr key={entry._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition whitespace-nowrap group">
                        <td className="px-6 py-4">
                          <div className="font-bold text-gray-900 dark:text-white">{entry.company}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{entry.role || 'General'}</div>
                        </td>
                        <td className="px-6 py-4 font-medium">{entry.rounds}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${
                            entry.result === 'Passed'
                              ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40'
                              : entry.result === 'Failed'
                                ? 'bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/40'
                                : 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/40'
                          }`}>
                            {entry.result}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs font-medium">
                          {new Date(entry.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition duration-200">
                            <button
                              onClick={() => handleEdit(entry)}
                              className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded shadow-sm hover:border-indigo-200 dark:hover:border-indigo-600"
                              title="Edit"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(entry._id)}
                              className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-rose-600 dark:hover:text-rose-400 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded shadow-sm hover:border-rose-200 dark:hover:border-rose-600"
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right: AI Insights — intentionally dark panel */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-gradient-to-br from-gray-900 to-indigo-950 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
            <div className="absolute -top-4 -right-4 p-4 opacity-10"><BrainCircuit size={120} /></div>

            <h3 className="text-sm font-bold text-indigo-300 uppercase tracking-widest mb-6 flex items-center gap-2 relative z-10">
              <Sparkles size={16} /> AI Pattern Recognition
            </h3>

            {entries.length === 0 ? (
              <div className="relative z-10 text-center py-6 text-gray-400 text-sm font-medium">
                Log an interview to unlock personalized AI insights.
              </div>
            ) : aiLoading ? (
              <div className="relative z-10 flex flex-col items-center justify-center py-6">
                <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-400 rounded-full animate-spin mb-3"></div>
                <div className="text-xs font-bold text-indigo-300 animate-pulse">Analyzing failure patterns...</div>
              </div>
            ) : insights ? (
              <div className="relative z-10 space-y-5 animate-in fade-in duration-500">
                {insights.error && (
                  <p className="text-xs text-rose-300 font-medium">
                    AI is temporarily unavailable. Try again later.
                  </p>
                )}

                {/* Strengths */}
                <div>
                  <div className="flex items-center gap-2 text-emerald-400 mb-2">
                    <TrendingUp size={14} />
                    <span className="text-xs font-bold uppercase tracking-wider">Strengths</span>
                  </div>
                  {insights.strengths?.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {insights.strengths.map((s, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 font-medium italic">No clear strengths detected yet.</p>
                  )}
                </div>

                {/* Weaknesses */}
                <div>
                  <div className="flex items-center gap-2 text-rose-400 mb-2">
                    <TrendingDown size={14} />
                    <span className="text-xs font-bold uppercase tracking-wider">Needs Improvement</span>
                  </div>
                  {insights.weaknesses?.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {insights.weaknesses.map((w, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30"
                        >
                          {w}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 font-medium italic">No recurring weaknesses found.</p>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/60">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">{editingId ? 'Edit Interview' : 'Log New Interview'}</h2>
              <button
                onClick={closeForm}
                className="text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 font-bold text-sm transition"
              >
                Cancel
              </button>
            </div>

            <div className="p-6 overflow-y-auto w-full">
              <form id="diary-form" onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Company</label>
                    <input
                      required type="text" value={formData.company}
                      onChange={e => setFormData({...formData, company: e.target.value})}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:bg-white dark:focus:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-xl text-sm font-medium"
                      placeholder="e.g. Stripe"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Role Applied</label>
                    <input
                      required type="text" value={formData.role}
                      onChange={e => setFormData({...formData, role: e.target.value})}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:bg-white dark:focus:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-xl text-sm font-medium"
                      placeholder="e.g. Frontend Dev"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Rounds Completed</label>
                    <input
                      required type="number" min="1" value={formData.rounds}
                      onChange={e => setFormData({...formData, rounds: e.target.value})}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:bg-white dark:focus:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-xl text-sm font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Overall Result</label>
                    <select
                      value={formData.result}
                      onChange={e => setFormData({...formData, result: e.target.value})}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:bg-white dark:focus:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-xl text-sm font-medium"
                    >
                      <option>Pending</option>
                      <option>Passed</option>
                      <option>Failed</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-rose-500 dark:text-rose-400 uppercase tracking-wider mb-1.5">Struggles</label>
                  <textarea
                    value={formData.struggles}
                    onChange={e => setFormData({...formData, struggles: e.target.value})}
                    className="w-full h-20 p-4 bg-rose-50/50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800/40 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:bg-white dark:focus:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-rose-400 rounded-xl text-sm font-medium resize-none"
                    placeholder="What questions stumped you? Where did you lose confidence?"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1.5">Key Learnings</label>
                  <textarea
                    value={formData.keyLearnings}
                    onChange={e => setFormData({...formData, keyLearnings: e.target.value})}
                    className="w-full h-20 p-4 bg-emerald-50/50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/40 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:bg-white dark:focus:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 rounded-xl text-sm font-medium resize-none"
                    placeholder="What went well? What will you do differently next time?"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider mb-1.5">
                    Topics Covered
                    <span className="ml-1.5 px-1.5 py-0.5 rounded text-indigo-500 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/40 text-xs font-bold normal-case tracking-normal border border-indigo-200 dark:border-indigo-700">
                      powers AI insights
                    </span>
                  </label>
                  <input
                    type="text"
                    value={formData.topics}
                    onChange={e => setFormData({...formData, topics: e.target.value})}
                    className="w-full px-4 py-2.5 bg-indigo-50/50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:bg-white dark:focus:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-xl text-sm font-medium"
                    placeholder="DSA, React, System Design, Communication, Project Explanation"
                  />
                  <p className="mt-1.5 text-xs text-indigo-400 dark:text-indigo-500 font-medium">
                    Fill this for accurate pattern analysis — the AI reads these tags.
                  </p>
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/60">
              <button
                form="diary-form"
                type="submit"
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md transition flex justify-center items-center gap-2 cursor-pointer"
              >
                {editingId ? 'Save Changes' : 'Save & Analyze Log'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Local Sparkles icon
function Sparkles(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
      <path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>
    </svg>
  );
}

export default InterviewDiary;
