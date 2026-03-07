// src/components/ui/TypingIndicator.jsx
import React from 'react';

const TypingIndicator = () => (
  <div className="flex justify-start">
    <div className="p-3 rounded-lg bg-gray-200 dark:bg-gray-700">
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-75"></div>
        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-150"></div>
        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-225"></div>
      </div>
    </div>
  </div>
);
export default TypingIndicator;