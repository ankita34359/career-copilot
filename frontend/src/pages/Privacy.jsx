import { Brain } from 'lucide-react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';

const Section = ({ title, children }) => (
  <div className="mb-10">
    <h2 className="text-xl font-black text-slate-900 dark:text-white mb-3">{title}</h2>
    <div className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed space-y-3 text-base">{children}</div>
  </div>
);

const Privacy = () => (
  <div className="min-h-screen flex flex-col bg-[#FAFAFA] dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">

    <nav className="fixed w-full bg-white/70 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800 z-50 shadow-sm">
      <div className="container mx-auto px-6 lg:px-12 h-20 flex justify-between items-center max-w-7xl">
        <Link to="/" className="flex items-center gap-2">
          <Brain className="text-indigo-600" size={28} />
          <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">Career Copilot</span>
        </Link>
      </div>
    </nav>

    <main className="flex-1 pt-40 pb-24 px-6">
      <div className="container mx-auto max-w-3xl">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white mb-2">
          Privacy Policy
        </h1>
        <p className="text-slate-400 dark:text-slate-500 font-medium mb-12 text-sm">Last updated: January 2026</p>

        <Section title="1. Information We Collect">
          <p>We collect information you provide directly, including your name, email address, resume content, and job application data you enter into the platform.</p>
          <p>We also collect usage data automatically, such as pages visited, features used, and device information, to improve the product.</p>
        </Section>

        <Section title="2. How We Use Your Information">
          <p>Your data is used solely to provide and improve Career Copilot's features — resume analysis, job tracking, and interview coaching.</p>
          <p>We do not sell your personal data to third parties. We do not share your resume or application details with recruiters or employers.</p>
        </Section>

        <Section title="3. Data Storage and Security">
          <p>All data is stored securely using industry-standard encryption at rest and in transit. Resume PDFs are stored only for the purpose of viewing and re-analysis within the platform.</p>
        </Section>

        <Section title="4. Your Rights">
          <p>You may delete your account and all associated data at any time from the Settings page. You may also request a full export of your data by contacting us at <a href="mailto:hello@careerpilot.ai" className="text-indigo-600 dark:text-indigo-400 hover:underline">hello@careerpilot.ai</a>.</p>
        </Section>

        <Section title="5. Contact">
          <p>Questions about this policy? Email us at <a href="mailto:hello@careerpilot.ai" className="text-indigo-600 dark:text-indigo-400 hover:underline">hello@careerpilot.ai</a>.</p>
        </Section>
      </div>
    </main>

    <Footer />
  </div>
);

export default Privacy;
