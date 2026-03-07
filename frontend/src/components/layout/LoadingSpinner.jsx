import React from 'react';

const LoadingSpinner = ({ size = 'md', text = 'Loading...' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20'
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className={`${sizeClasses[size]} relative animate-spin`}>
        <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-gray-700"></div>
        <div className="absolute inset-0 rounded-full border-4 border-green-500 border-t-transparent animate-spin"></div>
      </div>
      {text && (
        <p className="mt-4 text-gray-600 dark:text-gray-300 animate-pulse">{text}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;