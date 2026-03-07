// src/services/chatbot.service.js

async function sendToGemini({ userMessage, history = [], mode = 'Veg', userId = null }) {
  // 1. DYNAMIC URL: Pick Render in production, localhost in development
  const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // 2. PAYLOAD: Ensure userId is included for your Firebase logging logic
  const payload = {
    message: userMessage,
    history: history,
    mode: mode,
    userId: userId // Critical for your log_chat_to_firestore function
  };

  try {
    const res = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || `Error: ${res.status}`);
    }

    const data = await res.json();
    return data; // returns { text, structured }

  } catch (e) {
    console.error('Chat service error:', e);
    return {
      text: `Unable to connect to Anna's brain: ${e.message}`,
      structured: {
        replyText: `Network error: ${e.message}`,
        safetyTips: ['Check if the backend server on Render is awake.']
      }
    };
  }
}

export const chatbotService = { sendToGemini };