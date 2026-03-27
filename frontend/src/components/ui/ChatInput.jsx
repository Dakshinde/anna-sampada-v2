// src/components/ui/ChatInput.jsx
import React from 'react';
import { Send, CornerDownLeft } from 'lucide-react';

const ChatInput = ({ onSend, disabled, input, setInput }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSend();
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="p-3 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 absolute bottom-0 left-0 right-0 shadow-[0_-10px_30px_rgba(0,0,0,0.02)]">
      <form 
        onSubmit={handleSubmit} 
        className="flex items-center gap-2 p-1.5 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-[0_0_20px_rgba(0,0,0,0.05)] dark:shadow-[0_0_20px_rgba(0,0,0,0.3)] focus-within:ring-2 focus-within:ring-green-500/20 transition-all duration-300"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Reply to Anna..."
          disabled={disabled}
          className="flex-1 bg-transparent px-4 py-2 focus:outline-none dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm"
        />
        <button
          type="submit"
          disabled={disabled || !input.trim()}
          className="w-9 h-9 bg-green-600 text-white rounded-xl flex items-center justify-center disabled:opacity-50 disabled:bg-gray-300 dark:disabled:bg-gray-700 hover:bg-green-700 transition-colors"
        >
          <CornerDownLeft className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

export default ChatInput;