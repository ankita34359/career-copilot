import { Brain, Mail, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';

const Contact = () => (
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
      <div className="container mx-auto max-w-xl">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-widest mb-6 border border-indigo-100 dark:border-indigo-800/40">
            Contact
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white mb-4">
            Get in Touch
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">
            Have a question or feedback? We'd love to hear from you.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-slate-100 dark:border-gray-700 shadow-sm p-8 space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Your Name</label>
            <input
              type="text"
              placeholder="Jane Doe"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-gray-600 bg-slate-50 dark:bg-gray-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
            <input
              type="email"
              placeholder="jane@example.com"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-gray-600 bg-slate-50 dark:bg-gray-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Message</label>
            <textarea
              rows={5}
              placeholder="Tell us how we can help..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-gray-600 bg-slate-50 dark:bg-gray-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition resize-none"
            />
          </div>
          <button className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors duration-200 shadow-sm">
            <MessageSquare size={16} />
            Send Message
          </button>
        </div>

        <div className="mt-8 flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400 font-medium">
          <Mail size={15} className="text-indigo-500" />
          Or email us directly at{' '}
          <a href="mailto:hello@careerpilot.ai" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">
            hello@careerpilot.ai
          </a>
        </div>
      </div>
    </main>

    <Footer />
  </div>
);

export default Contact;
