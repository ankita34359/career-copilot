import React, { useContext, useEffect, useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LayoutDashboard, FileSearch, Briefcase, NotebookTabs, LogOut, CodeSquare, Menu, Sparkles, Files } from 'lucide-react';
import NotificationBell from '../components/NotificationBell';
import GlobalSearch from '../components/GlobalSearch';

const DashboardLayout = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    try {
      localStorage.removeItem('token');
    } finally {
      if (typeof logout === 'function') logout();
      navigate('/login');
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.avatar-container')) {
        setOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Resume Analyzer', path: '/dashboard/analyzer', icon: FileSearch },
    { name: 'Resume Improver', path: '/dashboard/improver', icon: Sparkles },
    { name: 'My Resumes', path: '/dashboard/resumes', icon: Files },
    { name: 'Job Tracker', path: '/dashboard/jobs', icon: Briefcase },
    { name: 'Interview Diary', path: '/dashboard/diary', icon: NotebookTabs },
  ];

  return (
    <div className="flex h-screen bg-[#F8FAFC] dark:bg-gray-900 font-sans transition-colors duration-200">
      {/* Sidebar */}
      <aside className="w-[280px] bg-white dark:bg-gray-800 border-r border-slate-200 dark:border-gray-700 flex-col hidden md:flex z-10 shadow-sm transition-colors duration-200">
        <div className="h-[72px] flex items-center px-8 border-b border-slate-100 dark:border-gray-700">
          <CodeSquare className="text-indigo-600 mr-3" size={28} />
          <span className="text-[22px] font-black text-slate-900 dark:text-white tracking-tight">Career Copilot</span>
        </div>

        <div className="px-6 pt-6 pb-2 text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
          Main Menu
        </div>

        <nav className="flex-1 px-4 py-2 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`group flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-50/80 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 shadow-sm border border-indigo-100/50 dark:border-indigo-800/50'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-gray-700 hover:text-slate-900 dark:hover:text-white border border-transparent'
                }`}
              >
                <Icon
                  size={20}
                  strokeWidth={isActive ? 2.5 : 2}
                  className={`transition-colors duration-200 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-indigo-500'}`}
                />
                <span className={`text-[15px] ${isActive ? 'font-bold' : 'font-semibold'}`}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100 dark:border-gray-700 bg-slate-50/50 dark:bg-gray-800/50">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-300 hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:text-rose-700 dark:hover:text-rose-400 rounded-xl transition-colors font-bold border border-transparent hover:border-rose-100 dark:hover:border-rose-800/40 shadow-sm"
          >
            <LogOut size={20} className="text-slate-400 dark:text-slate-500" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Top Navbar */}
        <header className="h-[72px] bg-white dark:bg-gray-800 border-b border-slate-200 dark:border-gray-700 flex items-center justify-between px-6 sm:px-8 z-10 relative shadow-sm transition-colors duration-200">
          <div className="flex items-center flex-1">
            <button className="md:hidden text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mr-4">
              <Menu size={24} />
            </button>
            <div className="hidden sm:block w-full max-w-md">
              <GlobalSearch />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <NotificationBell />
            <div className="relative avatar-container border-l border-slate-200 dark:border-gray-700 pl-6">
              <div className="flex items-center gap-3">
                <span
                  onClick={() => navigate('/dashboard')}
                  className="hidden md:block text-[15px] font-bold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                >
                  {user?.name?.split(' ')[0] || 'User'}
                </span>

                <div
                  onClick={() => setOpen((prev) => !prev)}
                  className="cursor-pointer hover:scale-105 transition group"
                >
                  {user?.image ? (
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 dark:bg-gray-700 shadow-sm border-2 border-white dark:border-gray-700 ring-2 ring-slate-100 dark:ring-gray-600 flex items-center justify-center">
                      <img
                        src={user.image}
                        alt={user?.name ? `${user.name} profile` : 'User profile'}
                        className="w-full h-full object-contain object-center"
                      />
                    </div>
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center font-bold text-[15px] shadow-sm transform group-hover:scale-105 transition-transform border-2 border-white dark:border-gray-700 ring-2 ring-slate-100 dark:ring-gray-600">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                </div>
              </div>

              {open && (
                <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-slate-200 dark:border-gray-700 z-50 overflow-hidden">
                  <button
                    onClick={() => {
                      setOpen(false);
                      navigate('/profile');
                    }}
                    className="block w-full text-left px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-gray-700 transition"
                  >
                    Profile
                  </button>
                  <button
                    onClick={() => {
                      setOpen(false);
                      navigate('/settings');
                    }}
                    className="block w-full text-left px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-gray-700 transition"
                  >
                    Settings
                  </button>
                  <button
                    onClick={() => {
                      setOpen(false);
                      handleLogout();
                    }}
                    className="block w-full text-left px-4 py-2.5 text-sm font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto bg-[#F8FAFC] dark:bg-gray-900 transition-colors duration-200">
          <div className="max-w-[1400px] mx-auto p-6 lg:p-10">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
