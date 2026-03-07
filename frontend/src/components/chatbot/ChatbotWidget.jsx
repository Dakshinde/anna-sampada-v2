// src/components/chatbot/ChatbotWidget.jsx
import React, { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import useChatSession from '../../hooks/useChatSession.js'; 
import ChatMessage from '../ui/ChatMessage.jsx';
import ChatInput from '../ui/ChatInput.jsx';
import ModeSelector from '../ui/ModeSelector.jsx';
import TypingIndicator from '../ui/TypingIndicator.jsx';
import ChatMenu from '../ui/ChatMenu.jsx';
import { AuthContext } from '../../context/AuthContext.jsx'; 

const flowVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

const ChatbotWidget = () => {
  const { user } = useContext(AuthContext); 
  const { 
    isOpen, messages, isLoading, mode, chatHistoryRef, 
    conversationState, toggleChat, sendMessage, 
    handleMenuCommand, selectMode, clearHistory 
  } = useChatSession('veg');
  
  // --- [THIS IS THE FIX] ---
  // The parent component must hold the state for the input
  const [input, setInput] = useState(''); 
  // --------------------------

  // This function is passed to ChatInput
  const handleSubmit = () => {
    if (!input.trim()) return;
    sendMessage(input); 
    setInput(''); // Clear the input
  };

  if (!user) return null;

  return (
    <div aria-live="polite">
      {/* Floating button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          aria-label={isOpen ? 'Close chatbot' : 'Open chatbot'}
          onClick={toggleChat}
          className="bg-green-600 hover:bg-green-700 text-white rounded-full w-14 h-14 shadow-lg flex items-center justify-center"
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}><X size={30} /></motion.div>
            ) : (
              <motion.div key="msg" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}><MessageCircle size={30} /></motion.div>
            )}
          </AnimatePresence>
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
            className="fixed bottom-24 right-6 z-50 w-96 max-w-full h-[70vh] bg-white dark:bg-gray-800 rounded-xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <header className="flex items-center justify-between px-4 py-3 border-b dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-green-600 rounded-full flex items-center justify-center text-white font-medium">AI</div>
                <div>
                  <div className="text-sm font-semibold dark:text-white">Anna Assistant</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {conversationState === 'menu' && 'Main Menu'}
                    {conversationState === 'selecting_mode' && 'Select Diet'}
                    {conversationState === 'chatting' && `Active Mode: ${mode}`}
                  </div>
                </div>
              </div>
              <button
                title="Clear chat"
                onClick={clearHistory}
                className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Clear
              </button>
            </header>

            {/* Chat content */}
            <div className="flex-1 flex flex-col min-h-0">
              {/* Message List */}
              <div
                ref={chatHistoryRef}
                className="flex-1 px-3 py-2 space-y-4 overflow-y-auto scroll-smooth"
              >
                {messages.map((msg) => (
                  <ChatMessage key={msg.id} message={msg} />
                ))}
                {isLoading && <TypingIndicator />}
              </div>

              {/* Footer area */}
              <div className="px-3 py-3 border-t dark:border-gray-700">
                <AnimatePresence mode="wait">
                  {!isLoading && conversationState === 'menu' && (
                    <motion.div key="menu" variants={flowVariants} initial="hidden" animate="visible" exit="exit">
                      <ChatMenu onMenuClick={handleMenuCommand} />
                    </motion.div>
                  )}
                  {!isLoading && conversationState === 'selecting_mode' && (
                    <motion.div key="mode" variants={flowVariants} initial="hidden" animate="visible" exit="exit">
                      <ModeSelector mode={mode} setMode={selectMode} />
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {/* --- [THIS IS THE FIX] --- */}
                {/* We now pass the local state and handler down */}
                {conversationState === 'chatting' && (
                  <ChatInput
                    onSend={handleSubmit}
                    disabled={isLoading}
                    input={input}
                    setInput={setInput}
                  />
                )}
                {/* -------------------------- */}
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatbotWidget;