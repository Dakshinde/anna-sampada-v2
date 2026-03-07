// src/components/layout/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = ({ type = 'landing' }) => {
  const year = new Date().getFullYear();

  if (type === 'dashboard') {
    // --- Minimal footer for dashboard pages ---
    return (
      <footer className="bg-gray-100 dark:bg-gray-900 border-t dark:border-gray-800 text-center py-4 text-sm text-gray-600 dark:text-gray-400">
        © {year} AnnaSampada — Sustainability Through Technology.
      </footer>
    );
  }

  // --- Full footer for landing page ---
  return (
    <footer className="bg-gray-100 dark:bg-gray-900 border-t dark:border-gray-800 py-10">
      <div className="container mx-auto px-6 text-center md:text-left grid md:grid-cols-3 gap-8">
        {/* Column 1: About */}
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">AnnaSampada</h4>
          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
            Transforming food waste into hope — connecting surplus food with communities in need.
          </p>
        </div>

        {/* Column 2: Quick Links */}
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Quick Links</h4>
          <ul className="text-gray-600 dark:text-gray-400 text-sm space-y-1">
            <li><Link to="/about" className="hover:text-green-600">About Us</Link></li>
            <li><Link to="/contact" className="hover:text-green-600">Contact</Link></li>
            <li><Link to="/privacy" className="hover:text-green-600">Privacy Policy</Link></li>
          </ul>
        </div>

        {/* Column 3: Contact */}
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Connect</h4>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            <a href="mailto:hello@annasampada.org" className="hover:text-green-600">
              hello@annasampada.org
            </a>
          </p>
        </div>
      </div>

      {/* Bottom Line */}
      <p className="text-center text-gray-500 dark:text-gray-500 text-xs mt-8">
        © {year} AnnaSampada. All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;
