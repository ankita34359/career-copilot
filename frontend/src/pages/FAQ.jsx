import { useState } from 'react';
import { Brain, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';

const faqs = [
  {
    q: 'Is Career Copilot free to use?',
    a: 'Yes — you can analyze your resume and run a full ATS match scan completely free. Premium features unlock unlimited scans and advanced AI coaching.',
  },
  {
    q: 'How does the Resume Analyzer work?',
    a: 'You upload your PDF resume and paste a job description URL or text. Our AI parses both and highlights missing keywords, weak phrasing, and ATS red flags with a detailed score breakdown.',
  },
  {
    q: 'What is the Job Tracker?',
    a: 'A Kanban-style board where you organize every application by stage — Applied, Phone Screen, Interview, Offer, Rejected — so nothing slips through the cracks.',
  },
  {
    q: 'What is the Interview Diary for?',
    a: 'Log questions asked in real interviews and let our AI find recurring patterns in what you struggle with, so you can prepare smarter for the next one.',
  },
  {
    q: 'Is my data private and secure?',
    a: 'Absolutely. Your resume and application data are stored securely and never shared with third parties or recruiters. You own your data.',
  },
];

const FAQItem = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-slate-200 dark:border-gray-700 rounded-2xl overflow-hidden transition-colors duration-200">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-5 text-left bg-white dark:bg-gray-800 hover:bg-slate-50 dark:hover:bg-gray-700/50 transition-colors duration-200"
      >
        <span className="text-base font-bold text-slate-800 dark:text-white pr-4">{q}</span>
        <ChevronDown
          size={18}
          className={`text-slate-400 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="px-6 pb-5 bg-white dark:bg-gray-800 text-slate-500 dark:text-slate-400 font-medium leading-relaxed text-sm border-t border-slate-100 dark:border-gray-700 pt-4">
          {a}
        </div>
      )}
    </div>
  );
};

const FAQ = () => (
  <div className="min-h-screen flex flex-col bg-[#FAFAFA] dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">

    <nav className="fixed w-full bg-white/70 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800 z-50 shadow-sm">
      <div className="container mx-auto px-6 lg:px-12 h-20 flex justify-between items-center max-w-7xl">
        <Link to="/" className="flex items-center gap-2">
          <Brain className="text-indigo-600" size={28} />
          <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">Career Copilot</span>
        </Link>
        <Link to="/signup" className="px-5 py-2 bg-indigo-600 text-white text-sm font-bold rounded-full hover:bg-indigo-700 transition-colors">
          Get Started
        </Link>
      </div>
    </nav>

    <main className="flex-1 pt-40 pb-24 px-6">
      <div className="container mx-auto max-w-2xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-widest mb-6 border border-indigo-100 dark:border-indigo-800/40">
            FAQ
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">
            Everything you need to know about Career Copilot.
          </p>
        </div>
        <div className="space-y-3">
          {faqs.map((item) => <FAQItem key={item.q} {...item} />)}
        </div>
      </div>
    </main>

    <Footer />
  </div>
);

export default FAQ;
