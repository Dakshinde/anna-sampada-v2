import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, LogOut, Edit, ShieldCheck, ShieldAlert, Building, Recycle } from 'lucide-react';

// Helper component to show the right icon for the role
const RoleIcon = ({ role }) => {
  if (role === 'ngo') {
    return <Building className="w-16 h-16 text-green-600 dark:text-green-400" />;
  }
  if (role === 'composter') {
    return <Recycle className="w-16 h-16 text-green-600 dark:text-green-400" />;
  }
  return <User className="w-16 h-16 text-green-600 dark:text-green-400" />;
};

// Helper component for the Verification Status
const VerificationBadge = ({ status }) => {
  if (status.verified) {
    return (
      <div className="flex items-center justify-center p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
        <ShieldCheck className="w-5 h-5 text-green-600 dark:text-green-400" />
        <span className="ml-3 font-medium text-green-800 dark:text-green-300">Account Verified</span>
      </div>
    );
  }
  if (status.pending) {
    return (
      <div className="flex items-center justify-center p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
        <ShieldAlert className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
        <span className="ml-3 font-medium text-yellow-800 dark:text-yellow-300">Verification Pending</span>
      </div>
    );
  }
  return null;
};

const ProfilePage = () => {
  const { user, role, verificationStatus, logout } = useAuth();
  const navigate = useNavigate();

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/'); // Navigate back to landing page
  };

  // Show loading or a redirect if user data isn't ready
  if (!user) {
    // You can add a loading spinner here
    return (
      <div className="p-8 text-center dark:text-white">
        Loading user data...
      </div>
    );
  }

  // Once user data is loaded:
  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <h1 className="text-4xl font-bold mb-8 text-green-800 dark:text-green-200">
        My Profile
      </h1>
      
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8">
        
        {/* --- Profile Header --- */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-32 h-32 bg-green-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4 border-4 border-white dark:border-gray-800 shadow-md">
            <RoleIcon role={role} />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white">{user.name}</h2>
          <span className="capitalize px-3 py-1 text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full mt-2">
            {role}
          </span>
        </div>

        {/* --- Verification Status (for NGO/Composter) --- */}
        {role !== 'user' && (
          <div className="mb-6">
            <VerificationBadge status={verificationStatus} />
          </div>
        )}

        {/* --- Contact Information --- */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white border-b dark:border-gray-700 pb-2">
            Contact Information
          </h3>
          <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <Mail className="w-5 h-5 text-gray-400" />
            <span className="ml-4 text-gray-700 dark:text-gray-300">{user.email}</span>
          </div>
          
          {user.phone && (
            <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <Phone className="w-5 h-5 text-gray-400" />
              <span className="ml-4 text-gray-700 dark:text-gray-300">{user.phone}</span>
            </div>
          )}
        </div>

        {/* --- Actions --- */}
        <div className="mt-8 pt-6 border-t dark:border-gray-700 flex flex-col sm:flex-row gap-3">
          <button
            disabled
            className="flex-1 py-3 px-4 bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-xl font-semibold flex items-center justify-center gap-2 cursor-not-allowed"
          >
            <Edit size={18} />
            Edit Profile (Soon)
          </button>
          <button
            onClick={handleLogout}
            className="flex-1 py-3 px-4 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-300 font-semibold flex items-center justify-center gap-2"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;