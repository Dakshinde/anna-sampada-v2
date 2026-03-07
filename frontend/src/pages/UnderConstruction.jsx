import React from 'react';
import { Link } from 'react-router-dom';
import { HardHat } from 'lucide-react';

const UnderConstruction = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 text-center px-4">
      <HardHat className="w-24 h-24 text-yellow-500 mb-6" />
      <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
        Page Under Construction
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
        This feature is still being built. Please check back later!
      </p>
      <Link
        to="/user-dashboard"
        className="px-6 py-3 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition-colors"
      >
        Back to Dashboard
      </Link>
    </div>
  );
};

export default UnderConstruction;