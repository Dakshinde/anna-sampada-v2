// src/services/chatbot.service.js
async function sendToGemini({ userMessage, history = [], mode = 'Veg' }) {
  // Payload keys MUST match your app.py /api/chat endpoint
  const payload = {
    message: userMessage,
    history: history,
    mode: mode
  };

  try {
    // URL MUST match your app.py endpoint
    const res = await fetch('http://127.0.0.1:5000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || `Error: ${res.status}`);
    }

    const data = await res.json();
    return data; // This will be the full { text, structured } object

  } catch (e) {
    console.error('Chat service error:', e);
    return {
      text: `A network error occurred: ${e.message}`,
      structured: {
        replyText: `A network error occurred: ${e.message}`,
        safetyTips: ['Please check that the backend server is running.']
      }
    };
  }
}

// Export it as a named 'chatbotService' to match the hook
export const chatbotService = { sendToGemini };