import { Brain, BarChart2, Sparkles, Kanban, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';

const features = [
  {
    icon: BarChart2,
    title: 'Resume Analyzer',
    desc: 'Upload your PDF and get an instant ATS score with keyword gap analysis tailored to any job description.',
    iconColor: 'text-blue-600 dark:text-blue-400',
    iconBg: 'bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20',
    lightGlow: 'rgba(37,99,235,0.06)',
    darkGlow: 'rgba(59,130,246,0.12)',
  },
  {
    icon: Sparkles,
    title: 'One-Click Resume Improver',
    desc: 'Instantly rewrite weak bullet points into achievement-driven statements packed with ATS-priority keywords.',
    iconColor: 'text-purple-600 dark:text-purple-400',
    iconBg: 'bg-purple-50 dark:bg-purple-500/10 border-purple-100 dark:border-purple-500/20',
    lightGlow: 'rgba(147,51,234,0.06)',
    darkGlow: 'rgba(168,85,247,0.12)',
  },
  {
    icon: Kanban,
    title: 'Job Tracker',
    desc: 'Organize every application on a Kanban board — Applied, Interviewing, Offer, Rejected — nothing slips.',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    iconBg: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20',
    lightGlow: 'rgba(5,150,105,0.06)',
    darkGlow: 'rgba(52,211,153,0.12)',
  },
  {
    icon: BookOpen,
    title: 'Interview Diary',
    desc: 'Log questions and answers after every interview. AI surfaces your recurring blind spots over time.',
    iconColor: 'text-indigo-600 dark:text-indigo-400',
    iconBg: 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-100 dark:border-indigo-500/20',
    lightGlow: 'rgba(79,70,229,0.06)',
    darkGlow: 'rgba(99,102,241,0.12)',
  },
  {
    icon: Brain,
    title: 'AI Insights',
    desc: 'Identify strengths and weaknesses across all your interviews and get a personalised prep roadmap.',
    iconColor: 'text-pink-600 dark:text-pink-400',
    iconBg: 'bg-pink-50 dark:bg-pink-500/10 border-pink-100 dark:border-pink-500/20',
    lightGlow: 'rgba(219,39,119,0.06)',
    darkGlow: 'rgba(236,72,153,0.12)',
  },
];

const FeatureCard = ({ icon: Icon, title, desc, iconColor, iconBg }) => (
  <div className="group relative rounded-xl border border-gray-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 p-7 shadow-sm hover:shadow-md dark:hover:shadow-xl hover:scale-[1.02] hover:border-blue-300 dark:hover:border-blue-500/30 hover:bg-gray-50 dark:hover:bg-slate-800/80 transition-all duration-300 cursor-default overflow-hidden">
    {/* Hover glow overlay */}
    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-xl bg-[radial-gradient(ellipse_80%_70%_at_50%_-10%,rgba(99,102,241,0.05),transparent)] dark:bg-[radial-gradient(ellipse_80%_70%_at_50%_-10%,rgba(99,102,241,0.1),transparent)]" />

    <div className={`relative w-12 h-12 rounded-xl flex items-center justify-center mb-5 border ${iconBg}`}>
      <Icon size={22} strokeWidth={2} className={iconColor} />
    </div>
    <h3 className="relative text-base font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
    <p className="relative text-sm text-gray-500 dark:text-slate-400 font-medium leading-relaxed">{desc}</p>
  </div>
);

const About = () => (
  <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 transition-colors duration-200">

    {/* ── Nav ─────────────────────────────────────────────────────────────── */}
    <nav className="fixed w-full bg-white/70 dark:bg-slate-950/80 backdrop-blur-xl border-b border-gray-100 dark:border-slate-800/60 z-50 shadow-sm transition-colors duration-200">
      <div className="relative mx-auto px-6 lg:px-10 h-16 flex items-center justify-between max-w-7xl">

        {/* Left — Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <Brain className="text-indigo-600 dark:text-indigo-400" size={28} />
          <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">Career Copilot</span>
        </Link>

        {/* Right — CTA */}
        <Link
          to="/signup"
          className="shrink-0 px-5 py-2 text-sm font-bold text-white rounded-full bg-linear-to-r from-blue-500 to-purple-500 hover:opacity-90 transition-opacity duration-200 shadow-lg shadow-indigo-500/25"
        >
          Get Started
        </Link>
      </div>
    </nav>

    <main className="flex-1 pt-16 pb-0">

      {/* ── Hero Header ─────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden py-12 px-6 bg-linear-to-b from-[#EBF3FF] to-white dark:from-slate-950 dark:to-slate-900 transition-colors duration-200">
        {/* Light mode: soft blue top wash */}
        <div className="absolute top-0 left-0 right-0 h-64 bg-linear-to-b from-blue-50/60 to-transparent dark:hidden pointer-events-none" />
        {/* Dark mode: ambient glows */}
        <div className="hidden dark:block absolute top-0 left-1/2 -translate-x-1/2 w-175 h-64 bg-indigo-600/15 blur-[120px] rounded-full pointer-events-none" />
        <div className="hidden dark:block absolute top-12 left-1/4 w-96 h-64 bg-purple-700/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="hidden dark:block absolute top-12 right-1/4 w-80 h-64 bg-blue-700/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="container mx-auto max-w-6xl relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-indigo-500/10 text-slate-500 dark:text-indigo-400 text-xs font-bold uppercase tracking-widest mb-4 border border-slate-200 dark:border-indigo-500/20">
            Our Story
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white mb-4 leading-[1.1]">
            Everything you need to land your{' '}
            <span className="text-blue-600 dark:text-transparent dark:bg-clip-text dark:bg-linear-to-r dark:from-blue-400 dark:to-purple-400">
              next job
            </span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">
            One platform. Five powerful AI tools. Built to replace the chaos of spreadsheets and scattered notes with a clear, confident job search system.
          </p>
        </div>
      </div>

      {/* ── Feature Cards ───────────────────────────────────────────────────── */}
      <section className="relative py-10 px-6 bg-linear-to-b from-white via-gray-50 to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 overflow-hidden transition-colors duration-200">
        {/* Dark mode radial overlay */}
        <div className="hidden dark:block absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(99,102,241,0.07),transparent)] pointer-events-none" />
        {/* Light mode subtle divider glow */}
        <div className="dark:hidden absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-blue-200 to-transparent pointer-events-none" />

        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f) => (
              <FeatureCard key={f.title} {...f} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Mission Strip ───────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-gray-50 dark:bg-slate-950 border-t border-gray-100 dark:border-slate-800/50 transition-colors duration-200">
        <div className="container mx-auto max-w-3xl text-center">
          <p className="text-xl md:text-2xl font-medium text-gray-700 dark:text-slate-300 leading-relaxed">
            Our mission is simple:{' '}
            <span className="font-bold text-blue-600 dark:text-transparent dark:bg-clip-text dark:bg-linear-to-r dark:from-indigo-400 dark:to-purple-400">
              Help you land the job you actually want, faster.
            </span>
          </p>
        </div>
      </section>

    </main>

    <Footer />
  </div>
);

export default About;
