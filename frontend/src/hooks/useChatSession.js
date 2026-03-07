import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { chatbotService } from '../services/chatbot.service.js';
import { useAuth } from '../context/AuthContext.jsx'; // <-- FIX: Import your useAuth hook

// This is the starting message.
const initialMessage = {
  id: 'init',
  role: 'model',
  text: "Hi! I'm Anna. How can I help you today?"
};

export const useChatSession = (initialMode = 'veg') => {
  const navigate = useNavigate();
  const { user } = useAuth(); // <-- FIX: Call the hook to get the user
  const [isOpen, setIsOpen] = useState(false);
  
  // This controls the UI: 'menu', 'selecting_mode', 'chatting'
  const [conversationState, setConversationState] = useState('menu'); 
  
  const [messages, setMessages] = useState([initialMessage]);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState(initialMode);
  const chatHistoryRef = useRef(null);

  const toggleChat = () => setIsOpen(prev => !prev);

  // This connects your "Talk to Anna" homepage button
  useEffect(() => {
    const handleOpenChat = () => setIsOpen(true);
    window.addEventListener('openChatbot', handleOpenChat);
    return () => window.removeEventListener('openChatbot', handleOpenChat);
  }, []); // Runs once

  // Auto-scroll
  useEffect(() => {
    if (chatHistoryRef.current)
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
  }, [messages]);

  // Handles the JSON response from app.py
  const handleBotResponse = (response) => {
    const data = response.structured || {};
    // Check for navigation command from the bot
    if (data.command === 'navigate') {
      navigate(data.payload);
      setIsOpen(false);
      return;
    }
    setMessages(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role: 'model',
        text: data.replyText || response.text,
        recipes: data.recipes || [],
        safetyTips: data.safetyTips || [],
      },
    ]);
  };

  // Handles the Main Menu button clicks
  const handleMenuCommand = (command) => {
    switch (command) {
      case 'recipe':
        setConversationState('selecting_mode'); // Go to Veg/Non-Veg
        setMessages(prev => [
          ...prev,
          { id: crypto.randomUUID(), role: 'model', text: "Great! Please select your dietary preference." },
        ]);
        break;
      case 'safety':
        setConversationState('chatting'); // Go to text input
        setMessages(prev => [
          ...prev,
          { id: crypto.randomUUID(), role: 'model', text: "Sure, I can help with food safety. What are you wondering about?" },
        ]);
        break;
      case 'predict':
        // This is an app feature. We navigate directly.
        navigate('/user-dashboard/predict'); // <-- YOUR PREDICT PAGE
        setIsOpen(false);
        break;
      case 'ngo':
        // This is an app feature. We navigate directly.
        navigate('/user-dashboard/ngo-connect'); // <-- YOUR NGO PAGE
        setIsOpen(false);
        break;
      case 'exit':
        toggleChat();
        break;
    }
  };

  // Handles the Veg/Non-Veg/Jain selection
  const selectMode = (selectedMode) => {
    // This handles the "Back" button in the ModeSelector
    if (selectedMode === 'back') {
      setConversationState('menu');
      // We remove the last message ("Please select your dietary preference")
      setMessages(prev => prev.slice(0, -1)); 
      return;
    }
    setMode(selectedMode);
    setConversationState('chatting'); // Go to text input
    setMessages(prev => [
      ...prev,
      { id: crypto.randomUUID(), role: 'model', text: `Okay (Mode: ${selectedMode}). What leftover ingredients do you have?` },
    ]);
  };

  // Sends the final text message to the backend
  const sendMessage = useCallback(async (text) => {
    if (!text.trim()) return;
    setConversationState('chatting'); // Lock into chat mode
    const userMsg = { id: crypto.randomUUID(), role: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);
    const apiHistory = messages.slice(-6).map(msg => ({
      role: msg.role,
      content: msg.text,
    }));
    try {
      const res = await chatbotService.sendToGemini({
        userMessage: text,
        history: apiHistory,
        mode,
        userId: user ? user.uid : null // <-- This will now work
      });
      handleBotResponse(res);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { id: crypto.randomUUID(), role: 'model', text: err.message, isError: true },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, mode, navigate, user]); // <-- FIX: Add 'user' dependency

  // Resets the chat
  const clearHistory = () => {
    setMessages([initialMessage]); // <-- FIX: Reset to the one initial message
    setConversationState('menu'); // Reset flow to menu
  };

  return {
    isOpen, messages, isLoading, mode, conversationState,
    chatHistoryRef, toggleChat, sendMessage, handleMenuCommand,
    selectMode, clearHistory,
  };
};

export default useChatSession;