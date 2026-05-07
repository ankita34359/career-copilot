import React, { useState, useEffect } from 'react';
import api from '../api';
import { Plus, Building2, Calendar, Trash2, GripVertical } from 'lucide-react';

const JobTracker = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ company: '', role: '', status: 'Applied', notes: '' });

  const columns = ['Applied', 'Interviewing', 'Offered', 'Rejected'];

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await api.get('/jobs');
      setJobs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/jobs', formData);
      setIsModalOpen(false);
      setFormData({ company: '', role: '', status: 'Applied', notes: '' });
      fetchJobs();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this application?')) {
      try {
        await api.delete(`/jobs/${id}`);
        fetchJobs();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleDragStart = (e, id) => {
    e.dataTransfer.setData('jobId', id);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('jobId');
    if (!id) return;
    setJobs(jobs.map(job => job._id === id ? { ...job, status: newStatus } : job));
    try {
      await api.put(`/jobs/${id}`, { status: newStatus });
    } catch (err) {
      console.error(err);
      fetchJobs();
    }
  };

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between sm:items-end mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">Job Pipeline</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm font-medium">Drag and drop applications across the Kanban board to update status.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-gray-900 dark:bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-gray-800 dark:hover:bg-indigo-700 shadow-md hover:shadow-lg transition w-fit"
        >
          <Plus size={18} />
          New Application
        </button>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin w-10 h-10 border-4 border-indigo-100 dark:border-indigo-900 border-t-indigo-600 rounded-full"></div>
        </div>
      ) : (
        <div className="flex-1 flex gap-5 overflow-x-auto pb-4">
          {columns.map(status => (
            <div
              key={status}
              className="flex-1 min-w-[280px] w-[280px] bg-slate-100/50 dark:bg-gray-800/50 rounded-2xl p-4 border border-gray-200/60 dark:border-gray-700/60 flex flex-col shadow-inner"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, status)}
            >
              <div className="flex justify-between items-center mb-4 px-1">
                <h3 className="font-extrabold text-gray-600 dark:text-gray-300 uppercase tracking-wider text-xs">{status}</h3>
                <span className="bg-white dark:bg-gray-700 px-2 py-0.5 rounded-lg text-xs font-bold text-gray-400 dark:text-gray-400 border border-gray-200 dark:border-gray-600 shadow-sm">
                  {jobs.filter(j => j.status === status).length}
                </span>
              </div>

              <div className="flex-1 flex flex-col gap-3 min-h-[150px]">
                {jobs.filter(job => job.status === status).map(job => (
                  <div
                    key={job._id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, job._id)}
                    className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-600 transition group cursor-grab active:cursor-grabbing relative"
                  >
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition flex gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(job._id); }}
                        className="text-gray-300 dark:text-gray-600 hover:text-rose-500 dark:hover:text-rose-400 p-1 bg-white dark:bg-gray-700 rounded-md shadow-sm border border-gray-100 dark:border-gray-600"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div className="flex items-start gap-2 mb-3 pr-6">
                      <GripVertical size={16} className="text-gray-300 dark:text-gray-600 mt-0.5 flex-shrink-0" />
                      <h4 className="font-bold text-gray-900 dark:text-white text-sm leading-tight">{job.role}</h4>
                    </div>

                    <div className="pl-6 space-y-3">
                      <div className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-400 text-xs font-bold bg-indigo-50 dark:bg-indigo-900/30 w-fit px-2.5 py-1 rounded-md border border-indigo-100/50 dark:border-indigo-800/30">
                        <Building2 size={12} /> {job.company}
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-1.5 text-gray-400 dark:text-gray-500 text-[10px] font-bold uppercase tracking-wider bg-gray-50 dark:bg-gray-700 px-2 py-0.5 rounded">
                          <Calendar size={12} />
                          {new Date(job.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {jobs.filter(job => job.status === status).length === 0 && (
                  <div className="h-full min-h-[100px] border-2 border-dashed border-gray-300/60 dark:border-gray-600/60 rounded-xl flex items-center justify-center text-xs font-bold text-gray-400 dark:text-gray-500 bg-gray-50/50 dark:bg-gray-700/20">
                    Drop here
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Application Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md p-6 shadow-2xl border border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-5">Add Application to Pipeline</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Company</label>
                <input
                  required
                  type="text"
                  value={formData.company}
                  onChange={e => setFormData({...formData, company: e.target.value})}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:bg-white dark:focus:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-xl text-sm"
                  placeholder="e.g. Google"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Role Title</label>
                <input
                  required
                  type="text"
                  value={formData.role}
                  onChange={e => setFormData({...formData, role: e.target.value})}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:bg-white dark:focus:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-xl text-sm"
                  placeholder="e.g. Software Engineer"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Initial Status</label>
                <select
                  value={formData.status}
                  onChange={e => setFormData({...formData, status: e.target.value})}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:bg-white dark:focus:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-xl text-sm font-medium"
                >
                  {columns.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-gray-700 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl font-bold text-sm transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-md transition"
                >
                  Save Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobTracker;
