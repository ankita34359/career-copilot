import { Brain } from 'lucide-react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';

const Section = ({ title, children }) => (
  <div className="mb-10">
    <h2 className="text-xl font-black text-slate-900 dark:text-white mb-3">{title}</h2>
    <div className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed space-y-3 text-base">{children}</div>
  </div>
);

const Terms = () => (
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
          Terms of Service
        </h1>
        <p className="text-slate-400 dark:text-slate-500 font-medium mb-12 text-sm">Last updated: January 2026</p>

        <Section title="1. Acceptance of Terms">
          <p>By creating an account or using Career Copilot, you agree to these Terms of Service. If you do not agree, please do not use the platform.</p>
        </Section>

        <Section title="2. Use of the Service">
          <p>Career Copilot is intended for personal, non-commercial use to assist with your own job search. You may not use the platform to analyze resumes for others commercially without explicit written permission.</p>
          <p>You agree not to misuse, reverse-engineer, or attempt to gain unauthorized access to the platform or its underlying systems.</p>
        </Section>

        <Section title="3. Your Content">
          <p>You retain full ownership of any content you upload, including resumes and job application data. By uploading content, you grant Career Copilot a limited license to process it for the purpose of providing the service.</p>
        </Section>

        <Section title="4. Limitation of Liability">
          <p>Career Copilot provides AI-assisted analysis and coaching tools. We do not guarantee employment outcomes. The service is provided "as is" without warranty of any kind.</p>
        </Section>

        <Section title="5. Termination">
          <p>You may terminate your account at any time. We reserve the right to suspend or terminate accounts that violate these terms.</p>
        </Section>

        <Section title="6. Contact">
          <p>Questions? Email us at <a href="mailto:hello@careerpilot.ai" className="text-indigo-600 dark:text-indigo-400 hover:underline">hello@careerpilot.ai</a>.</p>
        </Section>
      </div>
    </main>

    <Footer />
  </div>
);

export default Terms;
