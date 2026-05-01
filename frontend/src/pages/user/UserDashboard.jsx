import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import ThemeToggle from '../../components/layout/ThemeToggle';
import ChatbotWidget from '../../components/chatbot/ChatbotWidget';
import UserHomePage from './UserHomePage';
import UserPredictPage from './UserPredictPage';
import UserNGOConnectPage from './UserNGOConnectPage';
import UserComposterPage from './UserComposterPage';
import AboutPage from '../shared/AboutPage';
import ProfilePage from '../user/ProfilePage';


const UserDashboard = () => {
  const navLinks = [
    { to: '/user-dashboard', label: 'Home' },
    { to: '/user-dashboard/predict', label: 'Predict' },
    { to: '/user-dashboard/ngo-connect', label: 'NGO Connect' },
    //{ to: '/user-dashboard/composter', label: 'Composter' },
    { to: '/user-dashboard/about', label: 'About' },
    { to: '/user-dashboard/profile', label: 'Profile' }
  ];
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-cyan-50 
                    dark:from-gray-900 dark:via-green-900 dark:to-teal-900 
                    transition-colors duration-500">
      <ThemeToggle />
      <Navbar links={navLinks} />
      <Routes>
        <Route index element={<UserHomePage />} />
        <Route path="predict" element={<UserPredictPage />} />
        <Route path="ngo-connect" element={<UserNGOConnectPage />} />
        <Route path="composter" element={<UserComposterPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Routes>
    </div>
  );
};

export default UserDashboard;