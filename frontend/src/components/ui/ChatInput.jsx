// src/components/ui/ChatInput.jsx
import React from 'react';
import { Send } from 'lucide-react';

// This is now a "controlled" component.
// It receives 'input' and 'setInput' from its parent.
const ChatInput = ({ onSend, disabled, input, setInput }) => {
  
  // This is the form's submit handler
  const handleSubmit = (e) => {
    e.preventDefault();
    onSend(); // This will call the handleSubmit in the parent
  };
  
  // This handles the Enter key
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <input
        type="text"
        value={input} // Use the 'input' prop
        onChange={(e) => setInput(e.target.value)} // Use the 'setInput' prop
        onKeyPress={handleKeyPress}
        placeholder="Type your message..."
        disabled={disabled}
        className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
      />
      <button
        type="submit" // This triggers the form's onSubmit
        disabled={disabled || !input.trim()}
        className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center disabled:opacity-50"
      >
        <Send size={20} />
      </button>
    </form>
  );
};

export default ChatInput;