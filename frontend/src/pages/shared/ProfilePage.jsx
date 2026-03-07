import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, LogOut } from 'lucide-react';

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/'); // Navigate back to landing page
  };

  // Show loading or a redirect if user data isn't ready
  if (!user) {
    return (
      <div className="p-8 text-center dark:text-white">
        Loading user data...
      </div>
    );
  }

  // Once user data is loaded:
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-green-800 dark:text-green-200">
        My Profile
      </h1>
      
      <div className="max-w-lg mx-auto bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8">
        <div className="flex flex-col items-center">
          {/* A generic profile icon */}
          <div className="w-24 h-24 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center mb-4">
            <User className="w-12 h-12 text-green-600 dark:text-green-300" />
          </div>

          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            {user.name}
          </h2>
          <p className="text-md text-gray-500 dark:text-gray-400 capitalize">
            {user.role}
          </p>
        </div>

        <div className="mt-8 space-y-4">
          {/* Email Info */}
          <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
            <Mail className="w-5 h-5 text-green-600 dark:text-green-400" />
            <span className="ml-4 text-gray-700 dark:text-gray-300">{user.email}</span>
          </div>
          
          {/* Phone Info (if it exists) */}
          {user.phone && (
            <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <Phone className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="ml-4 text-gray-700 dark:text-gray-300">{user.phone}</span>
            </div>
          )}
        </div>

        <button
          onClick={handleLogout}
          className="w-full mt-8 py-3 bg-red-600 text-white rounded-xl 
                     hover:bg-red-700 transition-all duration-300 
                     font-semibold flex items-center justify-center gap-2"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;