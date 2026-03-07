import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';

// Auth Pages
import LandingPage from './pages/auth/LandingPage.jsx';
import LoginPage from './pages/auth/LoginPage.jsx';
import SignupPage from './pages/auth/SignupPage.jsx';

// Dashboards
import UserDashboard from './pages/user/UserDashboard.jsx';
import UnderConstruction from './pages/UnderConstruction.jsx';
import ChatbotWidget from './components/chatbot/ChatbotWidget.jsx'; 

// --- 1. IMPORT THE NEW GUARD ---
import ProtectedRoute from './components/auth/ProtectedRoute.jsx';

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* --- These are your PUBLIC routes --- */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            {/* --- 2. WRAP YOUR PRIVATE ROUTES --- */}
            <Route element={<ProtectedRoute />}>
              {/* These routes can ONLY be seen if you are logged in */}
              <Route path="/user-dashboard/*" element={<UserDashboard />} />
              <Route path="/ngo-dashboard/*" element={<UnderConstruction />} />
              <Route path="/composter-dashboard/*" element={<UnderConstruction />} />
            </Route>
            
          </Routes>
          
          <ChatbotWidget />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;