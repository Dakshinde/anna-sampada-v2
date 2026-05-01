// src/components/chatbot/ChatbotWidget.jsx
import React, { useState, useContext, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Sparkles, Leaf } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  
  const [input, setInput] = useState(''); 
  const bottomRef = useRef(null);
  const [size, setSize] = useState({ width: null, height: null });
  const resizingRef = useRef({ active: false, startX: 0, startY: 0, startW: 0, startH: 0 });

  // Auto-scroll to bottom whenever messages array changes
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  // Initialize size on mount (respect viewport and sensible bounds)
  useEffect(() => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const defaultW = Math.min(Math.max(Math.round(vw * 0.45), 360), 720); // between 360 and 720
    const defaultH = Math.min(Math.max(Math.round(vh * 0.75), 400), Math.round(vh * 0.9));
    // Try to restore from localStorage
    try {
      const saved = JSON.parse(localStorage.getItem('chatbot_size') || 'null');
      if (saved && saved.width && saved.height) {
        setSize({ width: saved.width, height: saved.height });
      } else {
        setSize({ width: defaultW, height: defaultH });
      }
    } catch (e) {
      setSize({ width: defaultW, height: defaultH });
    }
  }, []);

  // Save size
  useEffect(() => {
    if (size.width && size.height) {
      try { localStorage.setItem('chatbot_size', JSON.stringify(size)); } catch (e) {}
    }
  }, [size]);

  const clamp = (val, min, max) => Math.max(min, Math.min(max, val));

  const startResize = (e, mode = 'corner') => {
    e.preventDefault();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    resizingRef.current = {
      active: true,
      mode,
      startX: clientX,
      startY: clientY,
      startW: size.width,
      startH: size.height,
    };
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', stopResize);
    window.addEventListener('touchmove', onPointerMove, { passive: false });
    window.addEventListener('touchend', stopResize);
  };

  const onPointerMove = (e) => {
    if (!resizingRef.current.active) return;
    e.preventDefault();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const dx = clientX - resizingRef.current.startX;
    const dy = clientY - resizingRef.current.startY;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const minW = 320;
    const maxW = Math.round(vw - 48);
    const minH = 300;
    const maxH = Math.round(vh * 0.95);
    const newW = clamp(
      resizingRef.current.mode === 'vertical' ? resizingRef.current.startW + dx : resizingRef.current.startW + dx,
      minW,
      maxW
    );
    const newH = clamp(
      resizingRef.current.mode === 'horizontal' ? resizingRef.current.startH + dy : resizingRef.current.startH + dy,
      minH,
      maxH
    );
    setSize({ width: newW, height: newH });
  };

  const stopResize = () => {
    resizingRef.current.active = false;
    window.removeEventListener('mousemove', onPointerMove);
    window.removeEventListener('mouseup', stopResize);
    window.removeEventListener('touchmove', onPointerMove);
    window.removeEventListener('touchend', stopResize);
  };

  const handleSubmit = () => {
    if (!input.trim()) return;
    sendMessage(input); 
    setInput('');
  };

  // Handle clicks on follow-up buttons rendered inside messages
  const handleFollowUpClick = (label) => {
    const l = (label || '').toString().trim();
    if (!l) return;
    if (l.toLowerCase() === 'go home' || l.toLowerCase() === 'home') {
      toggleChat();
      navigate('/');
      return;
    }
    if (l.toLowerCase() === 'exit' || l.toLowerCase() === 'close') {
      toggleChat();
      return;
    }
    // Treat as a user message by default
    sendMessage(l);
  };

  

  if (!user) return null;

  return (
    <div aria-live="polite">
      {/* Floating Action Button */}
      <div className="fixed md:bottom-6 bottom-4 md:right-6 right-4 z-50">
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
            className="fixed md:bottom-24 bottom-6 md:right-6 right-4 z-50 max-w-[calc(100vw-1.5rem)] max-h-[95vh] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-2xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden"
            style={{ width: size.width ? `${size.width}px` : undefined, height: size.height ? `${size.height}px` : undefined }}
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
                  <ChatMessage key={msg.id} message={msg} onFollowUpClick={(label) => handleFollowUpClick(label)} />
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

                     {/* Quick Actions removed to prevent overlap on content */}
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

            {/* Resize hit zones */}
            <div
              onMouseDown={(e) => startResize(e, 'vertical')}
              onTouchStart={(e) => startResize(e, 'vertical')}
              className="absolute top-0 right-0 w-3 h-full cursor-ew-resize z-20 bg-transparent"
              aria-hidden
            />
            <div
              onMouseDown={(e) => startResize(e, 'horizontal')}
              onTouchStart={(e) => startResize(e, 'horizontal')}
              className="absolute left-0 bottom-0 h-3 w-full cursor-ns-resize z-20 bg-transparent"
              aria-hidden
            />
            <button
              type="button"
              onMouseDown={(e) => startResize(e, 'corner')}
              onTouchStart={(e) => startResize(e, 'corner')}
              aria-label="Resize chatbot"
              className="absolute bottom-2 right-2 z-30 flex h-8 w-8 items-center justify-center rounded-xl border border-gray-200/80 bg-white/90 text-gray-400 shadow-lg backdrop-blur-sm cursor-se-resize hover:text-gray-600 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800/90 dark:text-gray-500 dark:hover:text-gray-300"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 21H3V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M3 21L10 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M15 3H21V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
              </svg>
            </button>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatbotWidget;