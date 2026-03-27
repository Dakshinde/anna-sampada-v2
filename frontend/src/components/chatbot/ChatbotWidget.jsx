// src/components/chatbot/ChatbotWidget.jsx
import React, { useState, useContext, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Sparkles, Leaf } from 'lucide-react';
import useChatSession from '../../hooks/useChatSession.js'; 
import ChatMessage from '../ui/ChatMessage.jsx';
import ChatInput from '../ui/ChatInput.jsx';
import ModeSelector from '../ui/ModeSelector.jsx';
import TypingIndicator from '../ui/TypingIndicator.jsx';
import ChatMenu from '../ui/ChatMenu.jsx';
import QuickActions from '../ui/QuickActions.jsx';
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
  
  const [input, setInput] = useState(''); 
  const bottomRef = useRef(null);

  // Auto-scroll to bottom whenever messages array changes
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  const handleSubmit = () => {
    if (!input.trim()) return;
    sendMessage(input); 
    setInput('');
  };

  const handleQuickAction = (text) => {
    sendMessage(text);
  };

  if (!user) return null;

  return (
    <div aria-live="polite">
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          aria-label={isOpen ? 'Close chatbot' : 'Open chatbot'}
          onClick={toggleChat}
          className="bg-green-600 hover:bg-green-700 text-white rounded-full w-14 h-14 shadow-lg shadow-green-600/30 flex items-center justify-center transition-transform hover:scale-105"
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}><X size={28} strokeWidth={2.5}/></motion.div>
            ) : (
              <motion.div key="msg" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}><Leaf size={28} strokeWidth={2.5}/></motion.div>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Main Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
            className="fixed bottom-24 right-6 z-50 w-[400px] max-w-[calc(100vw-3rem)] h-[75vh] max-h-[800px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-2xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <header className="flex items-center justify-between px-5 py-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 z-10 sticky top-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-md">
                  <Leaf className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-base font-bold text-gray-900 dark:text-white leading-tight">Anna Assistant</div>
                  <div className="text-xs font-semibold text-green-600 dark:text-green-400">
                    {conversationState === 'menu' && 'Main Menu'}
                    {conversationState === 'selecting_mode' && 'Select Diet'}
                    {conversationState === 'chatting' && `System Active • ${mode}`}
                  </div>
                </div>
              </div>
              <button
                title="Clear chat"
                onClick={clearHistory}
                className="text-xs font-bold px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
              >
                Reset
              </button>
            </header>

            {/* Chat Content / Scroll Area */}
            <div className="flex-1 flex flex-col min-h-0 relative bg-gray-50 dark:bg-gray-900 overflow-hidden">
              
              {/* Message List */}
              <div
                ref={chatHistoryRef}
                className="flex-1 px-5 pt-6 pb-28 space-y-2 overflow-y-auto no-scrollbar scroll-smooth"
              >
                {/* Intro message buffer */}
                {messages.length === 0 && (
                  <div className="text-center pb-8 pt-4">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center mx-auto mb-4">
                       <Leaf className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-gray-400 dark:text-gray-500 text-sm font-semibold max-w-[80%] mx-auto">
                      Your AI assistant specialized in zero-waste management and meal forecasting.
                    </h3>
                  </div>
                )}

                {messages.map((msg) => (
                  <ChatMessage key={msg.id} message={msg} />
                ))}
                
                {isLoading && <TypingIndicator />}
                
                {/* Auto-scroll anchor */}
                <div ref={bottomRef} className="h-1 pb-16" />
              </div>

              {/* Absolute Positioned Bottom Controls */}
              <div className="absolute bottom-[4.5rem] left-0 right-0 px-4 pointer-events-none z-10 transition-transform">
                <div className="pointer-events-auto">
                   <AnimatePresence mode="wait">
                    {!isLoading && conversationState === 'menu' && (
                      <motion.div key="menu" variants={flowVariants} initial="hidden" animate="visible" exit="exit" className="bg-white dark:bg-gray-800 p-2 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 mx-2 mb-2">
                        <ChatMenu onMenuClick={handleMenuCommand} />
                      </motion.div>
                    )}
                    {!isLoading && conversationState === 'selecting_mode' && (
                      <motion.div key="mode" variants={flowVariants} initial="hidden" animate="visible" exit="exit" className="bg-white dark:bg-gray-800 p-2 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 mx-2 mb-2">
                        <ModeSelector mode={mode} setMode={selectMode} />
                      </motion.div>
                    )}
                   </AnimatePresence>

                   {/* Quick Actions Component */}
                   {!isLoading && conversationState === 'chatting' && (
                       <QuickActions onActionClick={handleQuickAction} />
                   )}
                </div>
              </div>

              {/* The Floating Chat Input */}
              {conversationState === 'chatting' && (
                <ChatInput
                  onSend={handleSubmit}
                  disabled={isLoading}
                  input={input}
                  setInput={setInput}
                />
              )}
              
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatbotWidget;