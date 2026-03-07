import React from 'react';
import { Link } from 'react-router-dom';
import { Handshake, Search, Gift, Leaf, MessageSquare, BarChart2, ShieldCheck, Heart, UtensilsCrossed } from "lucide-react"; // Added new icons
import Footer from '../../components/layout/Footer';
import { useAuth } from '../../context/AuthContext'; // Import useAuth to get user's name

const UserHomePage = () => {
  const { user } = useAuth(); // Get user data to personalize the welcome
  const userName = user?.name || 'User'; // Fallback if name isn't set

  // --- NEW: Professional Stats Bar ---
  // This is a new UI element, it doesn't break any logic.
  const statsData = [
    { title: 'Spoilage Checks', value: '14', icon: <ShieldCheck className="w-6 h-6 text-blue-500" />, color: 'bg-blue-100 dark:bg-blue-800' },
    { title: 'Donations Made', value: '3', icon: <Heart className="w-6 h-6 text-green-500" />, color: 'bg-green-100 dark:bg-green-800' },
    { title: 'Recipes Found', value: '8', icon: <UtensilsCrossed className="w-6 h-6 text-yellow-500" />, color: 'bg-yellow-100 dark:bg-yellow-800' },
  ];

  // Your existing Quick Actions - NO LOGIC CHANGE
  const quickActions = [
    { title: 'Predict Freshness', desc: 'Check food quality', link: '/user-dashboard/predict', icon: <Search className="w-6 h-6" />, color: 'bg-green-500' },
    { title: 'Donate Food', desc: 'Connect with NGOs', link: '/user-dashboard/ngo-connect', icon: <Handshake className="w-6 h-6" />, color: 'bg-teal-500' },
    { title: 'Talk to Anna', desc: 'Chat with our AI assistant', link:  '#', icon: <MessageSquare className="w-6 h-6" />, color: 'bg-cyan-500', openChat: true },
  ];

  // Your existing Recent Activities - NO LOGIC CHANGE
  const recentActivities = [
    { action: 'Donated rice to Hope Foundation', time: '2 hours ago', icon: <Gift className="w-5 h-5 text-green-600" /> },
    { action: 'Composted vegetable waste', time: '1 day ago', icon: <Leaf className="w-5 h-5 text-teal-600" /> },
    { action: 'Predicted food freshness', time: '2 days ago', icon: <Search className="w-5 h-5 text-cyan-600" /> },
  ];

  return (
    // --- [FIX] Replaced photo bg with a clean, light gradient ---
    <div className="bg-gradient-to-br from-green-50 via-gray-50 to-teal-50 dark:from-gray-900 dark:via-gray-900 dark:to-green-900/30 min-h-screen flex flex-col">
      
      {/* Use a max-width container for a professional, centered layout */}
      <div className="container mx-auto px-4 py-10 flex-1 max-w-7xl">
        
        {/* Welcome Section */}
        <div className="mb-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-3xl shadow-lg p-8 border border-gray-200 dark:border-gray-700 animate-slide-down">
          {/* [FIX] Larger, bolder font */}
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
            Welcome back, {userName}
          </h1>
          {/* [FIX] Slightly larger, cleaner subtext */}
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Here’s your food waste management overview.
          </p>
        </div>

        {/* --- [NEW] Stats Section --- */}
        <div className="mb-10 animate-fade-in animation-delay-200">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Your Impact</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {statsData.map((stat, idx) => (
              <div key={idx} className="bg-white dark:bg-gray-800 rounded-3xl shadow-md p-6 flex items-center gap-5 border border-gray-100 dark:border-gray-700">
                <div className={`p-4 rounded-full ${stat.color}`}>
                  {stat.icon}
                </div>
                <div>
                  <p className="text-4xl font-bold text-gray-800 dark:text-white">{stat.value}</p>
                  <p className="text-md text-gray-600 dark:text-gray-400">{stat.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* --- [END OF NEW SECTION] --- */}

        {/* Quick Actions */}
        <div className="mb-10 animate-fade-in animation-delay-400">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Quick Actions</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {quickActions.map((action, idx) => (
              action.openChat ? (
                // This is your working button, no logic changed
                <button
                  key={idx}
                  onClick={() => window.dispatchEvent(new Event('openChatbot'))}
                  className="w-full text-left bg-white dark:bg-gray-800 rounded-3xl shadow-md p-6 
                             hover:shadow-xl transform hover:scale-[1.03] transition-all duration-300 group border border-gray-100 dark:border-gray-700"
                >
                  <div className={`inline-flex p-4 rounded-2xl ${action.color} text-white mb-4 
                                   group-hover:scale-110 transition-transform duration-300`}>
                    {action.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">{action.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{action.desc}</p>
                </button>
              ) : (
                // This is your working Link, no logic changed
                <Link
                  key={idx}
                  to={action.link}
                  className="bg-white dark:bg-gray-800 rounded-3xl shadow-md p-6 
                             hover:shadow-xl transform hover:scale-[1.03] transition-all duration-300 group border border-gray-100 dark:border-gray-700"
                >
                  <div className={`inline-flex p-4 rounded-2xl ${action.color} text-white mb-4 
                                   group-hover:scale-110 transition-transform duration-300`}>
                    {action.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">{action.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{action.desc}</p>
                </Link>
              )
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-md p-8 animate-fade-in animation-delay-600">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivities.map((activity, idx) => (
              <div
                key={idx}
                className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 
                           rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 
                           transition-all duration-300"
              >
                <div>{activity.icon}</div>
                <div className="flex-1">
                  <p className="text-gray-800 dark:text-white font-medium">{activity.action}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer type="dashboard" />
    </div>
  );
};

export default UserHomePage;