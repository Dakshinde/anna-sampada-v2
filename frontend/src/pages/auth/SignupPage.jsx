import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ThemeToggle from '../../components/layout/ThemeToggle';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react'; // Import icons
import { apiRequest } from '../../services/api.service'; // Import your central service

const SignupPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState('user');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    registrationNumber: ''
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false); // State for visibility

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    // ... (Your validation logic is perfect, no changes) ...
    const newErrors = {};
    if (!formData.name) {
      newErrors.name = selectedRole === 'user' ? 'Name is required' : 'Organization name is required';
    }
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (selectedRole !== 'user' && !formData.registrationNumber) {
      newErrors.registrationNumber = 'Registration number is required';
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
    // Constructing the payload exactly as your Flask backend expects
    const payload = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      role: selectedRole,
      registrationNumber: formData.registrationNumber
    };

    // --- [CENTRALIZED BACKEND CONNECTION] ---
    // This automatically uses https://anna-sampada-v2.onrender.com in production
    const data = await apiRequest('/api/signup', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    
    // --- SUCCESS LOGIC ---
    const userData = {
      id: data.email,
      name: formData.name,
      email: data.email,
      role: data.role
    };
    
    const verificationStatus = {
      verified: data.role === 'user', // Instant access for standard users
      pending: data.role !== 'user'   // Reviewer requirement: NGOs must be verified
    };
    
    // Safety Fix: Store timestamp for the "Login Timeout" security requirement
    localStorage.setItem('lastLogin', Date.now().toString());

    // Update auth context and move to dashboard
    login(userData, data.role, verificationStatus);
    navigate(`/${data.role}-dashboard`);
    
  } catch (error) {
    console.error('Signup error:', error);
    // Displaying the specific backend error (e.g., "Email already exists")
    setErrors({ email: error.message }); 
  } finally {
    setLoading(false);
  }
};
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-cyan-50 
                     dark:from-gray-900 dark:via-green-900 dark:to-teal-900 
                     transition-colors duration-500 flex items-center justify-center px-4 py-12">
      <ThemeToggle />
      
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 w-full max-w-2xl 
                      animate-scale-in">
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-gradient-to-br from-green-500 to-teal-500 
                          rounded-full mb-4">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            Create Account
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Join us in reducing food waste
          </p>
        </div>
        
        {/* Role Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            I am signing up as:
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'user', label: 'User', icon: '👤' },
              { id: 'ngo', label: 'NGO', icon: '🏢' },
              { id: 'composter', label: 'Composter', icon: '♻️' }
            ].map((role) => (
              <button
                key={role.id}
                type="button"
                onClick={() => setSelectedRole(role.id)}
                className={`p-4 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${
                  selectedRole === role.id
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/30 scale-105 shadow-lg'
                    : 'border-gray-200 dark:border-gray-600 hover:border-green-300'
                }`}
              >
                <div className="text-3xl mb-2">{role.icon}</div>
                <div className="text-sm font-medium text-gray-800 dark:text-white">
                  {role.label}
                </div>
              </button>
            ))}
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {selectedRole === 'user' ? 'Full Name' : 'Organization Name'}
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-xl border-2 ${
                errors.name 
                  ? 'border-red-500' 
                  : 'border-gray-200 dark:border-gray-600 focus:border-green-500'
              } dark:bg-gray-700 dark:text-white focus:outline-none transition-all duration-300`}
              placeholder={selectedRole === 'user' ? 'John Doe' : 'Organization Name'}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
            )}
          </div>

          {/* Email & Phone */}
          <div className="grid md:grid-cols-2 gap-4">
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
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-xl border-2 ${
                  errors.phone 
                    ? 'border-red-500' 
                    : 'border-gray-200 dark:border-gray-600 focus:border-green-500'
                } dark:bg-gray-700 dark:text-white focus:outline-none transition-all duration-300`}
                placeholder="+91 98765 43210"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.phone}</p>
              )}
            </div>
          </div>

          {/* Password Fields */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
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
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl border-2 ${
                    errors.confirmPassword 
                      ? 'border-red-500' 
                      : 'border-gray-200 dark:border-gray-600 focus:border-green-500'
                  } dark:bg-gray-700 dark:text-white focus:outline-none transition-all duration-300`}
                  placeholder="••••••••"
                />
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.confirmPassword}</p>
              )}
            </div>
          </div>

          {/* NGO/Composter Specific Fields */}
          {(selectedRole === 'ngo' || selectedRole === 'composter') && (
            <div className="mt-6 space-y-4 animate-slide-down">
              <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 
                              dark:border-blue-800 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" 
                       fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-1">
                      Verification Required
                    </h4>
                    <p className="text-sm text-blue-700 dark:text-blue-400">
                      Your account will be pending verification after signup.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {selectedRole === 'ngo' ? 'NGO Registration Number' : 'Business Registration Number'}
                </label>
                <input
                  type="text"
                  name="registrationNumber"
                  value={formData.registrationNumber}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl border-2 ${
                    errors.registrationNumber 
                      ? 'border-red-500' 
                      : 'border-gray-200 dark:border-gray-600 focus:border-green-500'
                  } dark:bg-gray-700 dark:text-white focus:outline-none transition-all duration-300`}
                  placeholder="REG123456789"
                />
                {errors.registrationNumber && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.registrationNumber}</p>
                )}
              </div>
            </div>
          )}
          
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-green-600 to-teal-600 
                       text-white rounded-xl hover:from-green-7DEN 700 hover:to-teal-700 
                       transform hover:scale-105 transition-all duration-300 shadow-lg 
                       disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Creating Account...
              </div>
            ) : (
              (selectedRole === 'ngo' || selectedRole === 'composter') 
                ? 'Submit for Verification' 
                : 'Sign Up'
            )}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-gray-600 dark:text-gray-300">
            Already have an account?{' '}
            <Link to="/login" className="text-green-600 dark:text-green-400 hover:underline font-semibold">
              Login
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

export default SignupPage;