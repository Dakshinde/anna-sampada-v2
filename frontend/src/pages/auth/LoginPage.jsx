import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ThemeToggle from '../../components/layout/ThemeToggle';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react'; // Import icons

import { apiRequest } from '../../services/api.service'; // Import your central service
import { signInWithGoogle } from '../../config/firebase'; // Google Auth

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [debounceTimer, setDebounceTimer] = useState(null);

  // Prevent pasting into password fields
  const preventPasteFor = (fieldName) => (e) => {
    e.preventDefault();
    setErrors((prev) => ({
      ...prev,
      [fieldName]: 'Pasting is not allowed; please type the password manually.'
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Email-specific handling: debounce and limit localpart
    if (name === 'email') {
      if (debounceTimer) clearTimeout(debounceTimer);
      const atIndex = value.indexOf('@');
      if (atIndex > 64) {
        // Prevent localpart from exceeding 64 chars
        const localpart = value.substring(0, 64);
        const domain = value.substring(atIndex);
        setFormData(prev => ({ ...prev, email: localpart + domain }));
      } else {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
      const timer = setTimeout(() => {
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
      }, 300);
      setDebounceTimer(timer);
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
      if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: '' }));
      }
    }
  };

  // Announce first error for screen readers
  const firstError = Object.values(errors)[0] || '';

  const validate = () => {
    const newErrors = {};
    
    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (formData.email.length > 254) {
      newErrors.email = 'Email must not exceed 254 characters';
    } else if (!/^[^@]+@[^@]+\.[^@]+$/.test(formData.email)) {
      newErrors.email = 'Email format is invalid (must contain @ and domain)';
    } else {
      const [localpart] = formData.email.split('@');
      if (localpart.length > 64) {
        newErrors.email = 'Email localpart (before @) must not exceed 64 characters';
      } else if (localpart.length === 0) {
        newErrors.email = 'Email localpart (before @) cannot be empty';
      }
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setLoading(true);
    setErrors({});
    try {
      const data = await apiRequest('/api/login', {
        method: 'POST',
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password
        })
      });

    // --- SUCCESS ---
    const userData = {
      id: data.email, 
      name: data.name || 'User', 
      email: data.email,
      role: data.role
    };
    
    const verificationStatus = {
      verified: data.role === 'user', 
      pending: data.role !== 'user'
    };

    // Store login timestamp for the Reviewer's "Session Timeout" requirement
    localStorage.setItem('lastLogin', Date.now().toString());

    // Update auth context
    login(userData, data.role, verificationStatus);
    
    // Navigate to dashboard
    navigate(`/${data.role}-dashboard`);
    
  } catch (error) {
      console.error('Login error:', error);
      setErrors((prev) => ({ ...prev, password: error.message || 'Login failed' }));
    } finally {
      setLoading(false);
    }
  };
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrors({});
    try {
      const user = await signInWithGoogle();
      const idToken = await user.getIdToken();
      const data = await apiRequest('/api/login', {
        method: 'POST',
        body: JSON.stringify({
          idToken,
          email: user.email,
          name: user.displayName
        })
      });

      const userData = {
        id: data.email,
        name: data.name || user.displayName || 'User',
        email: data.email,
        role: data.role || 'user'
      };
      const verificationStatus = {
        verified: userData.role === 'user',
        pending: userData.role !== 'user'
      };
      localStorage.setItem('lastLogin', Date.now().toString());
      login(userData, userData.role, verificationStatus);
      navigate(`/${userData.role}-dashboard`);
    } catch (error) {
      console.error('Google Sign-In error:', error);
      setErrors({ email: error.message || 'Google Sign-In failed or was cancelled.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-cyan-50 
                     dark:from-gray-900 dark:via-green-900 dark:to-teal-900 
                     transition-colors duration-500 flex items-center justify-center px-4">
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 w-full max-w-md 
                      animate-scale-in">
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-gradient-to-br from-green-500 to-teal-500 
                          rounded-full mb-4">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            Welcome Back
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Login to continue managing food waste
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div aria-live="polite" className="sr-only">{firstError}</div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              maxLength={254}
              autoComplete="email"
              data-testid="login-email"
              aria-describedby={errors.email ? 'email-error' : undefined}
              className={`w-full px-4 py-3 rounded-xl border-2 ${
                errors.email 
                  ? 'border-red-500' 
                  : 'border-gray-200 dark:border-gray-600 focus:border-green-500'
              } dark:bg-gray-700 dark:text-white focus:outline-none transition-all duration-300`}
              placeholder="you@example.com"
            />
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">Max 64 characters before @, 254 total</p>
            {errors.email && (
              <p id="email-error" className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                onPaste={preventPasteFor('password')}
                autoComplete="current-password"
                data-testid="login-password"
                aria-describedby={errors.password ? 'password-error' : undefined}
                className={`w-full px-4 py-3 rounded-xl border-2 ${
                  errors.password 
                    ? 'border-red-500' 
                    : 'border-gray-200 dark:border-gray-600 focus:border-green-500'
                } dark:bg-gray-700 dark:text-white focus:outline-none transition-all duration-300`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-pressed={showPassword}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && (
              <p id="password-error" className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.password}</p>
            )}
          </div>
          
          <button
            type="submit"
            disabled={loading}
            data-testid="login-submit"
            className="w-full py-4 bg-gradient-to-r from-green-600 to-teal-600 
                       text-white rounded-xl hover:from-green-700 hover:to-teal-700 
                       transform hover:scale-105 transition-all duration-300 shadow-lg 
                       disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Logging in...
              </div>
            ) : (
              'Login'
            )}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-center space-x-2">
          <div className="h-px bg-gray-300 dark:bg-gray-600 flex-1"></div>
          <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">OR</span>
          <div className="h-px bg-gray-300 dark:bg-gray-600 flex-1"></div>
        </div>

        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="mt-6 w-full py-3 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 
                     text-gray-700 dark:text-white rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 
                     transform hover:scale-105 transition-all duration-300 shadow-sm flex items-center justify-center gap-3 font-semibold"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Continue with Google
        </button>
        
        <div className="mt-4 text-center">
          <Link to="/forgot-password" className="text-sm text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400">
            Forgot Password?
          </Link>
        </div>

        <div className="mt-6 text-center">
          <p className="text-gray-600 dark:text-gray-300">
            Don't have an account?{' '}
            <Link to="/signup" className="text-green-600 dark:text-green-400 hover:underline font-semibold">
              Sign Up
            </Link>
          </p>
        </div>
        
        <div className="mt-4 text-center">
          <Link to="/" className="text-sm text-gray-500 dark:text-gray-400 hover:text-green-600">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;