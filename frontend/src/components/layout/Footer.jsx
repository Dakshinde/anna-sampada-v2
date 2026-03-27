// src/components/layout/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin, Leaf } from 'lucide-react';

const Footer = ({ type = 'landing' }) => {
  const year = new Date().getFullYear();

  if (type === 'dashboard') {
    return (
      <footer className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 text-center py-6 text-sm text-gray-500 dark:text-gray-400 mt-auto">
        © {year} AnnaSampada — Sustainability Through Technology.
      </footer>
    );
  }

  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 pt-16 pb-8 relative z-10">
      <div className="container mx-auto px-6 grid md:grid-cols-12 gap-12 lg:gap-8 mb-16">
        
        {/* Brand Column (Span 5) */}
        <div className="md:col-span-5">
          <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white mb-4">
            <Leaf className="w-6 h-6 text-green-600 dark:text-green-500" />
            AnnaSampada
          </Link>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed max-w-sm">
            A technology-driven initiative connecting surplus food with communities in need, ensuring a greener, hunger-free future.
          </p>
        </div>

        {/* Quick Links Column (Span 3) */}
        <div className="md:col-span-3">
          <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-5">Quick Links</h4>
          <ul className="space-y-3">
            <li>
              <Link to="/login" className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors">Sign In</Link>
            </li>
            <li>
              <Link to="/signup" className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors">Create Account</Link>
            </li>
          </ul>
        </div>

        {/* Contact Column (Span 4) */}
        <div className="md:col-span-4">
          <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-5">Contact Us</h4>
          <ul className="space-y-4">
            <li>
              <a href="mailto:annasampada@gmail.com" className="group flex items-center gap-3 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors">
                <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center group-hover:bg-green-50 dark:group-hover:bg-green-900/30 group-hover:border-green-200 dark:group-hover:border-green-800 transition-colors">
                  <Mail className="w-4 h-4" />
                </div>
                <span>annasampada@gmail.com</span>
              </a>
            </li>
            <li>
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center">
                  <MapPin className="w-4 h-4" />
                </div>
                <span>Mumbai, Maharashtra, India</span>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <div className="container mx-auto px-6 pt-8 border-t border-gray-200 dark:border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-gray-500 dark:text-gray-500">
          © {year} AnnaSampada. All rights reserved.
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500">
          Designed with purpose.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
