// src/components/ui/TypingIndicator.jsx
import React from 'react';
import { Leaf } from 'lucide-react';

const TypingIndicator = () => (
  <div className="flex justify-start items-end gap-2 mb-4 animate-fade-in">
    {/* AI Avatar */}
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center flex-shrink-0 shadow-sm">
      <Leaf className="w-4 h-4 text-white" />
    </div>
    
    {/* Bubble */}
    <div className="px-4 py-3.5 rounded-2xl rounded-tl-sm bg-gray-100/80 dark:bg-white/5 backdrop-blur-md border border-gray-200/50 dark:border-white/10 shadow-sm">
      <div className="flex space-x-1.5 items-center h-2">
        <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
    </div>
  </div>
);

export default TypingIndicator;