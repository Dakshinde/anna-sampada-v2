import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import InstallAppButton from '../pwa/InstallAppButton.jsx';

const Navbar = ({ links }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-lg sticky top-0 z-40 transition-colors duration-300">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Brand */}
          <div className="flex items-center">
            <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-teal-600 
                             dark:from-green-400 dark:to-teal-400 bg-clip-text text-transparent">
              AnnaSampada
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-1">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 rounded-lg transition-all duration-300
                  ${isActive(link.to)
                    ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 font-semibold'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-gray-700'}`}
              >
                {link.label}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg text-red-600 dark:text-red-400 
                         hover:bg-red-50 dark:hover:bg-gray-700 transition-all duration-300"
            >
              Logout
            </button>
            <div className="pl-2 flex items-center">
              <InstallAppButton />
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 animate-slide-down">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-2 rounded-lg transition-all duration-300
                  ${isActive(link.to)
                    ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 font-semibold'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-gray-700'}`}
              >
                {link.label}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="block w-full text-left px-4 py-2 rounded-lg text-red-600 
                         dark:text-red-400 hover:bg-red-50 dark:hover:bg-gray-700 
                         transition-all duration-300"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
