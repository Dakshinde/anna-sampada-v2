import React from 'react';

const ProgressBar = ({ progress, label, showPercentage = true }) => {
  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </span>
          {showPercentage && (
            <span className="text-sm font-semibold text-green-600 dark:text-green-400">
              {progress}%
            </span>
          )}
        </div>
      )}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-green-500 to-teal-500 rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
          style={{ width: `${progress}%` }}
        >
          <div className="absolute inset-0 animate-shimmer"></div>
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;