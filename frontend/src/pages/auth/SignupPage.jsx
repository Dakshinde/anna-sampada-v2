import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ThemeToggle from '../../components/layout/ThemeToggle';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react'; // Import icons
import { apiRequest } from '../../services/api.service'; // Import your central service
import { signInWithGoogle } from '../../config/firebase'; // Google Auth

const SignupPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState('user');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    registrationNumber: ''
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [debounceTimer, setDebounceTimer] = useState(null);

  // Prevent pasting into password fields (keeps some security/testing constraint)
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
      setFormData((prev) => ({ ...prev, [name]: value }));
      if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Announce first error for screen readers
  const firstError = Object.values(errors)[0] || '';

  // Password strength validation
  const validatePasswordStrength = (pwd) => {
    if (!pwd) return { valid: false, message: 'Password is required' };
    if (pwd.length < 8) return { valid: false, message: 'Password must be at least 8 characters' };
    if (!/[A-Z]/.test(pwd)) return { valid: false, message: 'Password must contain at least one uppercase letter' };
    if (!/[a-z]/.test(pwd)) return { valid: false, message: 'Password must contain at least one lowercase letter' };
    if (!/[0-9]/.test(pwd)) return { valid: false, message: 'Password must contain at least one number' };
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)) return { valid: false, message: 'Password must contain at least one special character (!@#$%^&* etc.)' };
    return { valid: true, message: '' };
  };

  // Phone validation - only digits, exactly 10
  const validatePhone = (phone) => {
    const cleaned = phone.replace(/\D/g, '');
    if (!cleaned) return { valid: false, message: 'Phone number is required' };
    if (cleaned.length !== 10) return { valid: false, message: 'Phone number must be exactly 10 digits' };
    return { valid: true, message: '' };
  };

  const validate = () => {
    const newErrors = {};
    
    // First Name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    } else if (formData.firstName.trim().length > 18) {
      newErrors.firstName = 'First name must not exceed 18 characters';
    } else if (!/^[a-zA-Z\s'-]+$/.test(formData.firstName)) {
      newErrors.firstName = 'First name can only contain letters, spaces, hyphens, and apostrophes';
    }

    // Last Name validation
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    } else if (formData.lastName.trim().length > 18) {
      newErrors.lastName = 'Last name must not exceed 18 characters';
    } else if (!/^[a-zA-Z\s'-]+$/.test(formData.lastName)) {
      newErrors.lastName = 'Last name can only contain letters, spaces, hyphens, and apostrophes';
    }

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

    // Phone validation
    const phoneValidation = validatePhone(formData.phone);
    if (!phoneValidation.valid) {
      newErrors.phone = phoneValidation.message;
    }
    
    // Trim phone if exactly 10 digits for later use
    if (formData.phone.length === 10 && /^\d{10}$/.test(formData.phone)) {
      // Phone is valid, can proceed
    }

    // Password validation
    const passwordValidation = validatePasswordStrength(formData.password);
    if (!passwordValidation.valid) {
      newErrors.password = passwordValidation.message;
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Registration number validation (for NGO/Composter)
    if (selectedRole !== 'user') {
      if (!formData.registrationNumber.trim()) {
        newErrors.registrationNumber = 'Registration number is required';
      } else if (formData.registrationNumber.trim().length < 5) {
        newErrors.registrationNumber = 'Registration number must be at least 5 characters';
      } else if (formData.registrationNumber.trim().length > 30) {
        newErrors.registrationNumber = 'Registration number must not exceed 30 characters';
      }
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
      const payload = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
        email: formData.email.trim(),
        phone: formData.phone.replace(/\D/g, ''),
        password: formData.password,
        role: selectedRole,
        registrationNumber: formData.registrationNumber.trim()
      };

      const data = await apiRequest('/api/signup', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      const userData = {
        id: data.email,
        name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
        email: data.email,
        role: data.role
      };

      const verificationStatus = {
        verified: data.role === 'user',
        pending: data.role !== 'user'
      };

      localStorage.setItem('lastLogin', Date.now().toString());
      login(userData, data.role, verificationStatus);
      navigate(`/${data.role}-dashboard`);
    } catch (error) {
      console.error('Signup error:', error);
      setErrors((prev) => ({ ...prev, email: error.message || 'Signup failed' }));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    if (selectedRole !== 'user' && !formData.registrationNumber) {
      setErrors({ registrationNumber: 'Registration number is required to sign up as an NGO or Composter' });
      return;
    }
    setLoading(true);
    setErrors({});
    try {
      const user = await signInWithGoogle();
      const idToken = await user.getIdToken();
      const nameParts = (user.displayName || '').split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      const payload = {
        idToken,
        firstName,
        lastName,
        name: user.displayName || `${formData.firstName} ${formData.lastName}`,
        email: user.email,
        role: selectedRole,
        registrationNumber: formData.registrationNumber
      };
      const data = await apiRequest('/api/signup', { method: 'POST', body: JSON.stringify(payload) });
      const userData = { id: data.email, name: user.displayName || `${formData.firstName} ${formData.lastName}`, email: data.email, role: data.role };
      const verificationStatus = { verified: data.role === 'user', pending: data.role !== 'user' };
      localStorage.setItem('lastLogin', Date.now().toString());
      login(userData, data.role, verificationStatus);
      navigate(`/${data.role}-dashboard`);
    } catch (error) {
      console.error('Google Signup error:', error);
      setErrors({ email: error.message || 'Google Sign-Up failed or was cancelled.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-cyan-50 dark:from-gray-900 dark:via-green-900 dark:to-teal-900 transition-colors duration-500 flex items-center justify-center px-4 py-12">
      <ThemeToggle />
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 w-full max-w-2xl animate-scale-in">
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-gradient-to-br from-green-500 to-teal-500 rounded-full mb-4">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Create Account</h2>
          <p className="text-gray-600 dark:text-gray-300">Join us in reducing food waste</p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">I am signing up as:</label>
          <div className="grid grid-cols-3 gap-3">
            {[{ id: 'user', label: 'User', icon: '👤' }, { id: 'ngo', label: 'NGO', icon: '🏢' }, { id: 'composter', label: 'Composter', icon: '♻️' }].map((role) => (
              <button
                key={role.id}
                type="button"
                onClick={() => setSelectedRole(role.id)}
                aria-pressed={selectedRole === role.id}
                className={`p-4 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${selectedRole === role.id ? 'border-green-500 bg-green-50 dark:bg-green-900/30 scale-105 shadow-lg' : 'border-gray-200 dark:border-gray-600 hover:border-green-300'}`}>
                <div className="text-3xl mb-2">{role.icon}</div>
                <div className="text-sm font-medium text-gray-800 dark:text-white">{role.label}</div>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div aria-live="polite" className="sr-only">{firstError}</div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">First Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                maxLength={18}
                autoComplete="given-name"
                data-testid="signup-firstName"
                aria-describedby={errors.firstName ? 'firstName-error' : undefined}
                className={`w-full px-4 py-3 rounded-xl border-2 ${errors.firstName ? 'border-red-500' : 'border-gray-200 dark:border-gray-600 focus:border-green-500'} dark:bg-gray-700 dark:text-white focus:outline-none transition-all duration-300`}
                placeholder="John"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{formData.firstName.length}/18 characters</p>
              {errors.firstName && <p id="firstName-error" className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.firstName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Last Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                maxLength={18}
                autoComplete="family-name"
                data-testid="signup-lastName"
                aria-describedby={errors.lastName ? 'lastName-error' : undefined}
                className={`w-full px-4 py-3 rounded-xl border-2 ${errors.lastName ? 'border-red-500' : 'border-gray-200 dark:border-gray-600 focus:border-green-500'} dark:bg-gray-700 dark:text-white focus:outline-none transition-all duration-300`}
                placeholder="Doe"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{formData.lastName.length}/18 characters</p>
              {errors.lastName && <p id="lastName-error" className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.lastName}</p>}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address <span className="text-red-500">*</span></label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                maxLength={254}
                autoComplete="email"
                data-testid="signup-email"
                aria-describedby={errors.email ? 'email-error' : undefined}
                className={`w-full px-4 py-3 rounded-xl border-2 ${errors.email ? 'border-red-500' : 'border-gray-200 dark:border-gray-600 focus:border-green-500'} dark:bg-gray-700 dark:text-white focus:outline-none transition-all duration-300`}
                placeholder="you@example.com"
              />
              <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">Max 64 characters before @, 254 total</p>
              {errors.email && <p id="email-error" className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone Number <span className="text-red-500">*</span></label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, '');
                  if (digits.length <= 10) {
                    handleChange({ target: { name: 'phone', value: digits } });
                  }
                }}
                inputMode="numeric"
                pattern="[0-9]{10}"
                maxLength={10}
                autoComplete="tel"
                title="Enter exactly 10 digits"
                data-testid="signup-phone"
                aria-describedby={errors.phone ? 'phone-error' : undefined}
                className={`w-full px-4 py-3 rounded-xl border-2 ${errors.phone ? 'border-red-500' : 'border-gray-200 dark:border-gray-600 focus:border-green-500'} dark:bg-gray-700 dark:text-white focus:outline-none transition-all duration-300`}
                placeholder="9876543210"
              />
              {errors.phone && <p id="phone-error" className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.phone}</p>}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password <span className="text-red-500">*</span></label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  onPaste={preventPasteFor('password')}
                  autoComplete="new-password"
                  data-testid="signup-password"
                  aria-describedby={errors.password ? 'password-error' : undefined}
                  className={`w-full px-4 py-3 rounded-xl border-2 ${errors.password ? 'border-red-500' : 'border-gray-200 dark:border-gray-600 focus:border-green-500'} dark:bg-gray-700 dark:text-white focus:outline-none transition-all duration-300`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-pressed={showPassword}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600"
                  tabIndex="0"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <div className="mt-2 text-xs space-y-1">
                <p className="font-semibold text-gray-700 dark:text-gray-300">Password requirements:</p>
                <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                  <li className={`flex items-center gap-2 ${formData.password.length >= 8 ? 'text-green-600 dark:text-green-400' : ''}`}>
                    <span className={formData.password.length >= 8 ? '✓' : '○'}> Minimum 8 characters</span>
                  </li>
                  <li className={`flex items-center gap-2 ${/[A-Z]/.test(formData.password) ? 'text-green-600 dark:text-green-400' : ''}`}>
                    <span className={/[A-Z]/.test(formData.password) ? '✓' : '○'}> Uppercase letter (A-Z)</span>
                  </li>
                  <li className={`flex items-center gap-2 ${/[a-z]/.test(formData.password) ? 'text-green-600 dark:text-green-400' : ''}`}>
                    <span className={/[a-z]/.test(formData.password) ? '✓' : '○'}> Lowercase letter (a-z)</span>
                  </li>
                  <li className={`flex items-center gap-2 ${/[0-9]/.test(formData.password) ? 'text-green-600 dark:text-green-400' : ''}`}>
                    <span className={/[0-9]/.test(formData.password) ? '✓' : '○'}> Number (0-9)</span>
                  </li>
                  <li className={`flex items-center gap-2 ${/[!@#$%^&*()_+\-=\[\]{};'":\\|,.<>\/?]/.test(formData.password) ? 'text-green-600 dark:text-green-400' : ''}`}>
                    <span className={/[!@#$%^&*()_+\-=\[\]{};'":\\|,.<>\/?]/.test(formData.password) ? '✓' : '○'}> Special character (!@#$%^&*)</span>
                  </li>
                </ul>
              </div>
              {errors.password && <p id="password-error" className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Confirm Password <span className="text-red-500">*</span></label>
              <div className="relative">
                <input
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onPaste={preventPasteFor('confirmPassword')}
                  autoComplete="new-password"
                  data-testid="signup-confirm-password"
                  aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
                  className={`w-full px-4 py-3 rounded-xl border-2 ${errors.confirmPassword ? 'border-red-500' : 'border-gray-200 dark:border-gray-600 focus:border-green-500'} dark:bg-gray-700 dark:text-white focus:outline-none transition-all duration-300`}
                  placeholder="••••••••"
                />
              </div>
              {errors.confirmPassword && <p id="confirmPassword-error" className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.confirmPassword}</p>}
            </div>
          </div>

          {(selectedRole === 'ngo' || selectedRole === 'composter') && (
            <div className="mt-6 space-y-4 animate-slide-down">
              <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-1">Verification Required</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-400">Your account will be pending verification after signup.</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{selectedRole === 'ngo' ? 'NGO Registration Number' : 'Business Registration Number'} <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="registrationNumber"
                  value={formData.registrationNumber}
                  onChange={handleChange}
                  maxLength={30}
                  autoComplete="organization"
                  data-testid="signup-registrationNumber"
                  aria-describedby={errors.registrationNumber ? 'registrationNumber-error' : undefined}
                  className={`w-full px-4 py-3 rounded-xl border-2 ${errors.registrationNumber ? 'border-red-500' : 'border-gray-200 dark:border-gray-600 focus:border-green-500'} dark:bg-gray-700 dark:text-white focus:outline-none transition-all duration-300`}
                  placeholder="REG123456789"
                />
                <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">5-30 characters, alphanumeric only</p>
                {errors.registrationNumber && <p id="registrationNumber-error" className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.registrationNumber}</p>}
              </div>
            </div>
          )}

          <button type="submit" disabled={loading} data-testid="signup-submit" className="w-full py-4 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl hover:from-green-700 hover:to-teal-700 transform hover:scale-105 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg">
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Creating Account...
              </div>
            ) : (selectedRole === 'ngo' || selectedRole === 'composter' ? 'Submit for Verification' : 'Sign Up')}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-center space-x-2">
          <div className="h-px bg-gray-300 dark:bg-gray-600 flex-1" />
          <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">OR</span>
          <div className="h-px bg-gray-300 dark:bg-gray-600 flex-1" />
        </div>

        <button onClick={handleGoogleSignUp} disabled={loading} className="mt-6 w-full py-3 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-white rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transform hover:scale-105 transition-all duration-300 shadow-sm flex items-center justify-center gap-3 font-semibold">
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Sign up with Google
        </button>

        <div className="mt-6 text-center">
          <p className="text-gray-600 dark:text-gray-300">Already have an account?{' '}
            <Link to="/login" className="text-green-600 dark:text-green-400 hover:underline font-semibold">Login</Link>
          </p>
        </div>

        <div className="mt-4 text-center">
          <Link to="/" className="text-sm text-gray-500 dark:text-gray-400 hover:text-green-600">← Back to Home</Link>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
