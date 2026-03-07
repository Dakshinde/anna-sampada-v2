import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ThemeToggle from '../../components/layout/ThemeToggle';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react'; // Import icons

import { apiRequest } from '../../services/api.service'; // Import your central service

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false); // State for password visibility

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
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
    // --- [CLEAN CENTRALIZED CONNECTION] ---
    // The URL logic is now handled inside apiRequest
    const data = await apiRequest('/api/login', {
      method: 'POST',
      body: JSON.stringify({
        email: formData.email,
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
    // Error handling is cleaner because apiRequest throws the backend error
    setErrors({ password: error.message });
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-cyan-50 
                     dark:from-gray-900 dark:via-green-900 dark:to-teal-900 
                     transition-colors duration-500 flex items-center justify-center px-4">
      <ThemeToggle />
      
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
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-xl border-2 ${
                errors.email 
                  ? 'border-red-500' 
                  : 'border-gray-200 dark:border-gray-600 focus:border-green-500'
              } dark:bg-gray-700 dark:text-white focus:outline-none transition-all duration-300`}
              placeholder="you@example.com"
            />
            {errors.email && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Password
            </label>
            {/* --- [NEW] SHOW/HIDE PASSWORD FIELD --- */}
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
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
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.password}</p>
            )}
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-green-600 to-teal-600 
                       text-white rounded-xl hover:from-green-700 hover:to-teal-700 
                       transform hover:scale-105 transition-all duration-300 shadow-lg 
                       disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Logging in...
              </div>
            ) : (
              'Login'
            )}
          </button>
        </form>
        
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