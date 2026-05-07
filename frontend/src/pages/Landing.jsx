import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Brain, FileSearch, Briefcase, NotebookTabs, Monitor, Wand2, Target } from 'lucide-react';
import Footer from '../components/Footer';

const FEATURES = [
  { id: 'analyzer', label: 'Analyze Resume',    icon: FileSearch,   image: '/dark-mode%20images/Resume Analyzer Image.png'      },
  { id: 'improver', label: 'One-Click Optimize', icon: Wand2,        image: '/dark-mode%20images/One-Click Optimized Image.png'  },
  { id: 'tracker',  label: 'Job Tracker',        icon: Briefcase,    image: '/dark-mode%20images/Job Tracker Image.png'          },
  { id: 'diary',    label: 'Interview Diary',    icon: NotebookTabs, image: '/dark-mode%20images/Interview Diary Image.png'      },
];

const Landing = () => {
  const [activeTab,  setActiveTab]  = useState('analyzer');
  const [shownTab,   setShownTab]   = useState('analyzer');
  const [imgOpacity, setImgOpacity] = useState(1);

  const handleTabChange = (id) => {
    if (id === activeTab) return;
    setActiveTab(id);
    setImgOpacity(0);
    setTimeout(() => { setShownTab(id); setImgOpacity(1); }, 220);
  };

  const shownFeature = FEATURES.find((f) => f.id === shownTab);

  return (
    <div className="min-h-screen font-sans text-gray-900 dark:text-white bg-[#FAFAFA] dark:bg-slate-950 overflow-hidden transition-colors duration-200">

      {/* ── Navigation ─────────────────────────────────────────────────────── */}
      <nav className="fixed w-full bg-white/70 dark:bg-slate-950/80 backdrop-blur-xl border-b border-gray-100 dark:border-slate-800/60 z-50 shadow-sm transition-colors duration-200">
        <div className="relative mx-auto px-6 lg:px-10 h-16 flex items-center justify-between max-w-7xl">

          {/* Left — Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <Brain className="text-indigo-600 dark:text-indigo-400" size={28} />
            <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">Career Copilot</span>
          </Link>

          {/* Center — Nav links (truly centered) */}
          <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-8">
            <a href="#features"     className="text-sm font-medium text-gray-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white transition-colors duration-200">Features</a>
            <a href="#how-it-works" className="text-sm font-medium text-gray-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white transition-colors duration-200">How it Works</a>
            <Link to="/login"       className="text-sm font-medium text-gray-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white transition-colors duration-200">Log in</Link>
          </div>

          {/* Right — CTA */}
          <Link
            to="/signup"
            className="shrink-0 px-5 py-2 text-sm font-bold text-white rounded-full bg-linear-to-r from-blue-500 to-purple-500 hover:opacity-90 transition-opacity duration-200 shadow-lg shadow-indigo-500/25"
          >
            Start Free
          </Link>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-16 overflow-hidden transition-colors duration-200">
        {/* Light mode: curved gradient */}
        <div
          className="absolute top-0 left-0 right-0 h-[800px] bg-gradient-to-b from-[#EBF3FF] to-white dark:hidden z-0"
          style={{ borderBottomLeftRadius: '50% 10%', borderBottomRightRadius: '50% 10%' }}
        />
        {/* Dark mode: ambient glows */}
        <div className="hidden dark:block absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-indigo-600/20 blur-[130px] rounded-full pointer-events-none z-0" />
        <div className="hidden dark:block absolute top-24 left-1/4  w-[400px] h-[400px] bg-purple-700/15 blur-[100px] rounded-full pointer-events-none z-0" />
        <div className="hidden dark:block absolute top-24 right-1/4 w-[350px] h-[350px] bg-blue-700/10   blur-[100px] rounded-full pointer-events-none z-0" />

        <div className="container mx-auto max-w-5xl px-6 relative z-10 flex flex-col items-center text-center">
          <h1 className="text-5xl md:text-6xl lg:text-[72px] font-black tracking-tight mb-6 leading-[1.1] text-slate-900 dark:text-white max-w-4xl mt-8">
            Turn your resume into an{' '}
            <span className="text-blue-600 dark:text-transparent dark:bg-clip-text dark:bg-linear-to-r dark:from-indigo-400 dark:to-purple-400">
              interview magnet
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-3xl mx-auto font-medium">
            Analyze your resume, optimize every detail, and track your progress with confidence.
            All in one AI-powered platform designed to help you land more interviews.
          </p>

          <Link
            to="/signup"
            className="px-10 py-4 bg-blue-600 dark:bg-indigo-600 text-white text-[19px] font-bold rounded-lg hover:bg-blue-700 dark:hover:bg-indigo-500 transition-all shadow-[0_4px_14px_rgba(37,99,235,0.3)] dark:shadow-[0_4px_24px_rgba(99,102,241,0.4)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.4)] dark:hover:shadow-[0_6px_32px_rgba(99,102,241,0.55)] mb-16 transform hover:-translate-y-0.5"
          >
            Let's get started
          </Link>

          <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-300 mb-6">
            All-in-One Career Platform
          </h3>

          {/* Interactive Feature Tabs */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {FEATURES.map((f) => {
              const isActive = activeTab === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => handleTabChange(f.id)}
                  className={`relative px-5 py-2.5 text-sm font-bold rounded-full flex items-center gap-2 transition-all duration-200 transform
                    ${isActive
                      ? 'text-white scale-[1.04] shadow-[0_0_18px_rgba(79,70,229,0.45)]'
                      : 'bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-indigo-300 dark:hover:border-indigo-600/60 hover:text-indigo-600 dark:hover:text-indigo-300 hover:scale-[1.02] shadow-sm'
                    }`}
                  style={isActive ? { background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' } : {}}
                >
                  <f.icon size={15} strokeWidth={2.5} />
                  {f.label}
                </button>
              );
            })}
          </div>

          {/* Image Display */}
          <div className="w-full max-w-4xl mx-auto">
            <div className="rounded-2xl p-0.75 bg-linear-to-br from-indigo-500/40 via-purple-500/20 to-blue-500/30 shadow-2xl dark:shadow-[0_32px_80px_rgba(0,0,0,0.5)]">
              <div className="rounded-[14px] overflow-hidden bg-white dark:bg-linear-to-b dark:from-slate-900 dark:to-slate-800">
                <div className="flex items-center gap-1.5 px-4 py-3 bg-white/60 dark:bg-slate-800/90 border-b border-slate-200/50 dark:border-slate-700/60 backdrop-blur-sm">
                  <div className="w-3 h-3 rounded-full bg-rose-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  <div className="ml-3 flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-100 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600/50">
                    <shownFeature.icon size={11} className="text-indigo-500 dark:text-indigo-400" />
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">{shownFeature.label}</span>
                  </div>
                </div>
                <div className="w-full relative">
                  <img
                    src={shownFeature.image}
                    alt={shownFeature.label}
                    className="w-full h-auto block"
                    style={{ opacity: imgOpacity, transition: 'opacity 220ms ease-in-out' }}
                    draggable={false}
                  />
                  <div className="absolute bottom-0 left-0 right-0 h-20 dark:bg-linear-to-t dark:from-slate-900 dark:to-transparent pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────────────────── */}
      <section id="features" className="py-32 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800/50 relative transition-colors duration-200 overflow-hidden">
        {/* Dark mode radial glow */}
        <div className="hidden dark:block absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(99,102,241,0.07),transparent)] pointer-events-none" />

        <div className="container mx-auto px-6 max-w-7xl relative z-10">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-indigo-500/10 text-slate-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-widest mb-6 border border-slate-200 dark:border-indigo-500/20">
              Core Toolkit
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white mb-6">
              Everything you need to get hired
            </h2>
            <p className="text-xl text-gray-500 dark:text-slate-400 max-w-2xl mx-auto font-medium">
              A comprehensive, centralized suite of AI tools replacing your messy spreadsheets and scattered notes.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard icon={FileSearch}   color="text-blue-500 dark:text-blue-400"    iconBg="bg-blue-50    dark:bg-blue-500/10    border-blue-100    dark:border-blue-500/20"    title="Resume Matching"      desc="Upload your PDF and paste a URL. Our AI highlights exactly which keywords you are missing to bypass ATS logic." />
            <FeatureCard icon={Briefcase}    color="text-indigo-500 dark:text-indigo-400" iconBg="bg-indigo-50  dark:bg-indigo-500/10  border-indigo-100  dark:border-indigo-500/20"  title="Kanban Board Tracker" desc="Keep all your job applications organized in one beautiful space from the applied to the offer stage." />
            <FeatureCard icon={NotebookTabs} color="text-purple-500 dark:text-purple-400" iconBg="bg-purple-50  dark:bg-purple-500/10  border-purple-100  dark:border-purple-500/20"  title="Interview Diary"      desc="Log questions asked and let our proprietary AI models analyze your recurring failure points completely autonomously." />
            <FeatureCard icon={Wand2}        color="text-rose-500 dark:text-rose-400"     iconBg="bg-rose-50    dark:bg-rose-500/10    border-rose-100    dark:border-rose-500/20"     title="Bullet Rewriter"      desc="Turn weak, generic resume bullets into powerful, accomplishment-driven statements at the click of a button." />
            <FeatureCard icon={Target}       color="text-emerald-500 dark:text-emerald-400" iconBg="bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20" title="Success Predictor"   desc="Evaluate and maximize your chances of getting an interview based on rigorous multidimensional PDF scanning." />
            <FeatureCard icon={Monitor}      color="text-amber-500 dark:text-amber-400"   iconBg="bg-amber-50   dark:bg-amber-500/10   border-amber-100   dark:border-amber-500/20"   title="Clean Analytics"      desc="Visualize your entire job hunt funnel and measure your exact conversion rates with gorgeous dashboard metrics." />
          </div>
        </div>
      </section>

      {/* ── How it Works ───────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-32 bg-[#F8FAFC] dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800/50 relative transition-colors duration-200 overflow-hidden">
        <div className="hidden dark:block absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_100%,rgba(99,102,241,0.06),transparent)] pointer-events-none" />

        <div className="container mx-auto px-6 max-w-6xl relative z-10">
          <div className="text-center mb-24">
            <h2 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-6">
              How Career Copilot works
            </h2>
            <p className="text-xl text-gray-500 dark:text-slate-400 max-w-2xl mx-auto font-medium">
              Three simple steps to supercharge your application process.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-16 relative">
            <div className="hidden md:block absolute top-11.25 left-[15%] right-[15%] h-0.5 bg-linear-to-r from-blue-200 via-indigo-200 to-purple-200 dark:from-blue-500/30 dark:via-indigo-500/30 dark:to-purple-500/30 z-0" />
            <StepItem num="01" lightColor="border-blue-500   bg-blue-50   text-blue-600"   darkColor="dark:border-blue-500   dark:bg-slate-900 dark:text-blue-400"   title="Scan the Target Job" desc="Paste your dream job description into Copilot to identify exactly what the recruiter software is looking for." />
            <StepItem num="02" lightColor="border-indigo-500 bg-indigo-50 text-indigo-600" darkColor="dark:border-indigo-500 dark:bg-slate-900 dark:text-indigo-400" title="Optimize with AI"    desc="Upload your resume and implement the personalized AI keyword suggestions to immediately hit a 90%+ match score." />
            <StepItem num="03" lightColor="border-purple-500 bg-purple-50 text-purple-600" darkColor="dark:border-purple-500 dark:bg-slate-900 dark:text-purple-400" title="Track & Iterate"     desc="Log the application into your Kanban board. If you secure an interview, immediately use the diary to record your learnings." />
          </div>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────────────────────── */}
      <FAQSection />

      <Footer />
    </div>
  );
};

// ── FAQ ──────────────────────────────────────────────────────────────────────

const faqs = [
  {
    question: 'How does the Resume Analyzer work?',
    answer: 'You upload your PDF resume and paste a job description URL or plain text. Our AI parses both and runs an ATS-style keyword match, scoring your resume and highlighting exactly which terms are missing or underrepresented — so you know precisely what to fix before you apply.',
  },
  {
    question: 'Is Career Copilot free to use?',
    answer: 'Yes. You can scan your resume, view your ATS score, and use the Job Tracker completely free. Premium unlocks unlimited scans, advanced AI bullet rewrites, and priority analysis.',
  },
  {
    question: 'What is the One-Click Optimize feature?',
    answer: 'One-Click Optimize rewrites your resume bullet points using AI to make them stronger, more achievement-focused, and packed with the keywords that ATS systems prioritize — all in a single click with no manual editing required.',
  },
  {
    question: 'How does the Job Tracker work?',
    answer: 'The Job Tracker is a Kanban-style board where you organize every application across stages: Applied, Phone Screen, Interview, Offer, and Rejected. Each card stores the company, role, date applied, and any notes — so nothing slips through the cracks.',
  },
  {
    question: 'What is the Interview Diary?',
    answer: 'After each interview, you log the questions you were asked and your answers. Our AI then analyzes your entries over time to surface recurring weak spots and help you prepare smarter for your next conversation.',
  },
  {
    question: 'Is my resume data private and secure?',
    answer: 'Absolutely. Your resume and application data are encrypted at rest and in transit, and are never shared with recruiters, employers, or third-party advertisers. You own your data and can delete it at any time from Settings.',
  },
];

const FAQItem = ({ question, answer, isOpen, onClick }) => (
  <div className={`rounded-xl border transition-all duration-200 overflow-hidden ${
    isOpen
      ? 'border-indigo-200 dark:border-indigo-500/40 bg-white dark:bg-slate-800/80'
      : 'border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800/30 hover:border-indigo-200 dark:hover:border-slate-600 dark:hover:bg-slate-800/50'
  }`}>
    <button onClick={onClick} className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left">
      <span className={`text-base font-bold transition-colors duration-200 ${
        isOpen ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-800 dark:text-white'
      }`}>
        {question}
      </span>
      <span className={`flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full transition-all duration-300 ${
        isOpen
          ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rotate-180'
          : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500'
      }`}>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 4l4 4 4-4" />
        </svg>
      </span>
    </button>
    <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
      <div className="overflow-hidden">
        <p className="px-6 pb-5 pt-4 text-slate-500 dark:text-slate-400 font-medium leading-relaxed text-sm border-t border-slate-100 dark:border-slate-700/40">
          {answer}
        </p>
      </div>
    </div>
  </div>
);

const FAQSection = () => {
  const [openIdx, setOpenIdx] = useState(null);
  const toggle = (idx) => setOpenIdx((prev) => (prev === idx ? null : idx));

  return (
    <section id="faq" className="py-32 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800/50 relative transition-colors duration-200 overflow-hidden">
      <div className="hidden dark:block absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_50%,rgba(99,102,241,0.05),transparent)] pointer-events-none" />

      <div className="container mx-auto px-6 max-w-3xl relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white mb-4">
            Frequently asked questions
          </h2>
          <p className="text-lg text-gray-500 dark:text-slate-400 max-w-xl mx-auto font-medium">
            Everything you need to know before you get started.
          </p>
        </div>

        <div className="space-y-2.5">
          {faqs.map((faq, idx) => (
            <FAQItem key={idx} question={faq.question} answer={faq.answer} isOpen={openIdx === idx} onClick={() => toggle(idx)} />
          ))}
        </div>

        <p className="mt-10 text-center text-sm text-slate-400 dark:text-slate-500 font-medium">
          Still have questions?{' '}
          <a href="mailto:hello@careerpilot.ai" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">
            Email us
          </a>
        </p>
      </div>
    </section>
  );
};

// ── Sub-components ────────────────────────────────────────────────────────────

const FeatureCard = ({ icon: Icon, title, desc, color, iconBg }) => (
  <div className="p-8 bg-white dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/50 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] dark:hover:border-slate-600 dark:hover:bg-slate-800/70 hover:-translate-y-2 transition-all duration-300 group cursor-default">
  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border transition-transform group-hover:scale-110 duration-300 ${iconBg} ${color}`}>
      <Icon size={28} strokeWidth={2.5} />
    </div>
    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{title}</h3>
    <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{desc}</p>
  </div>
);

const StepItem = ({ num, title, desc, lightColor, darkColor }) => (
  <div className="relative z-10 flex flex-col items-center text-center group">
    <div className={`w-20 h-20 border-[3px] rounded-full flex items-center justify-center text-2xl font-black mb-8 shadow-xl transition-all duration-300 group-hover:scale-110 ${lightColor} ${darkColor}`}>
      {num}
    </div>
    <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3">{title}</h3>
    <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-xs">{desc}</p>
  </div>
);

export default Landing;
