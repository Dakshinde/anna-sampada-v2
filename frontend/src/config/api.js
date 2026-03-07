// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: '/auth/login',
    SIGNUP: '/auth/signup',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh',
    VERIFY_EMAIL: '/auth/verify-email',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password'
  },
  
  // User endpoints
  USER: {
    PROFILE: '/user/profile',
    UPDATE_PROFILE: '/user/profile/update',
    STATS: '/user/stats',
    ACTIVITIES: '/user/activities'
  },
  
  // Food prediction endpoints
  PREDICT: {
    ANALYZE: '/predict/analyze',
    HISTORY: '/predict/history'
  },
  
  // NGO endpoints
  NGO: {
    DONATIONS: '/ngo/donations',
    ACCEPT_DONATION: '/ngo/donations/accept',
    REJECT_DONATION: '/ngo/donations/reject',
    STATS: '/ngo/stats',
    VERIFICATION: '/ngo/verification'
  },
  
  // Composter endpoints
  COMPOSTER: {
    REQUESTS: '/composter/requests',
    ACCEPT_REQUEST: '/composter/requests/accept',
    REJECT_REQUEST: '/composter/requests/reject',
    STATS: '/composter/stats',
    VERIFICATION: '/composter/verification'
  },
  
  // Donation endpoints
  DONATION: {
    CREATE: '/donation/create',
    NEARBY_NGOS: '/donation/nearby-ngos',
    TRACK: '/donation/track'
  },
  
  // Compost endpoints
  COMPOST: {
    REQUEST: '/compost/request',
    NEARBY_COMPOSTERS: '/compost/nearby-composters'
  },
  
  // Chat endpoints
  CHAT: {
    SEND_MESSAGE: '/chat/message',
    HISTORY: '/chat/history'
  },
  
  // Upload endpoints
  UPLOAD: {
    IMAGE: '/upload/image',
    DOCUMENT: '/upload/document'
  }
};

export const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};