import { Link } from 'react-router-dom';
import { Brain } from 'lucide-react';

const TwitterIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const LinkedInIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const GitHubIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.604-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836a9.59 9.59 0 0 1 2.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
  </svg>
);

const footerLinks = {
  product: [
    { label: 'Resume Analyzer', to: '/dashboard/analyzer' },
    { label: 'Job Tracker',     to: '/dashboard/jobs'     },
    { label: 'Interview Diary', to: '/dashboard/diary'    },
  ],
  company: [
    { label: 'About',    to: '/about'      },
    { label: 'Features', href: '/#features' },
    { label: 'FAQ',      href: '/#faq'     },
  ],
  support: [
    { label: 'Contact', to: '/contact'                    },
    { label: 'Email',   href: 'mailto:hello@careerpilot.ai' },
  ],
};

const social = [
  { label: 'Twitter',  href: 'https://twitter.com',  icon: TwitterIcon  },
  { label: 'LinkedIn', href: 'https://linkedin.com', icon: LinkedInIcon },
  { label: 'GitHub',   href: 'https://github.com',   icon: GitHubIcon },
];

const legal = [
  { label: 'Privacy', to: '/privacy' },
  { label: 'Terms',   to: '/terms'   },
];

const linkClass =
  'font-medium text-sm text-slate-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-white transition-colors duration-200';

function FooterLink({ item }) {
  if (item.href) {
    return (
      <a href={item.href} className={linkClass} rel="noopener noreferrer">
        {item.label}
      </a>
    );
  }
  return <Link to={item.to} className={linkClass}>{item.label}</Link>;
}

const Footer = () => (
  <footer className="bg-slate-50 dark:bg-[#111827] pt-24 pb-12 w-full border-t border-slate-200 dark:border-gray-800 transition-colors duration-200">
    <div className="container mx-auto px-6 max-w-7xl">

      {/* Top grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-16">

        {/* Brand */}
        <div className="col-span-2">
          <Link to="/" className="flex items-center gap-2 mb-6 w-fit">
            <Brain className="text-indigo-600 dark:text-indigo-500" size={32} />
            <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Career Copilot</span>
          </Link>
          <p className="text-base text-slate-500 dark:text-gray-400 mb-8 font-medium max-w-sm leading-relaxed">
            Helping you land your dream job with AI-powered resume analysis, job tracking, and interview coaching.
          </p>
          <div className="flex gap-4">
            {social.map(({ label, href, icon: Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 text-slate-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-white hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors duration-200 shadow-sm"
              >
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>

        {/* Product */}
        <div>
          <h4 className="text-slate-900 dark:text-white font-bold mb-6 tracking-wider uppercase text-xs">Product</h4>
          <ul className="space-y-4">
            {footerLinks.product.map((item) => (
              <li key={item.label}><FooterLink item={item} /></li>
            ))}
          </ul>
        </div>

        {/* Company */}
        <div>
          <h4 className="text-slate-900 dark:text-white font-bold mb-6 tracking-wider uppercase text-xs">Company</h4>
          <ul className="space-y-4">
            {footerLinks.company.map((item) => (
              <li key={item.label}><FooterLink item={item} /></li>
            ))}
          </ul>
        </div>

        {/* Support */}
        <div>
          <h4 className="text-slate-900 dark:text-white font-bold mb-6 tracking-wider uppercase text-xs">Support</h4>
          <ul className="space-y-4">
            {footerLinks.support.map((item) => (
              <li key={item.label}><FooterLink item={item} /></li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-slate-200 dark:border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-sm font-medium text-slate-400 dark:text-gray-500">&copy; 2026 AI Career Copilot. All rights reserved.</p>
        <div className="flex gap-6">
          {legal.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className="text-sm font-medium text-slate-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-gray-300 transition-colors duration-200"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>

    </div>
  </footer>
);

export default Footer;
