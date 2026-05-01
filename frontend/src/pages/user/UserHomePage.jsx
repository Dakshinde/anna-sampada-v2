import React from 'react';
import { Link } from 'react-router-dom';
import { Handshake, Search, Leaf, MessageSquare, ShieldCheck, UtensilsCrossed, ArrowRight, Sparkles } from "lucide-react"; 
import Footer from '../../components/layout/Footer';
import { useAuth } from '../../context/AuthContext';

const UserHomePage = () => {
  const { user } = useAuth();
  const userName = user?.name || 'User';

  const foodSafetyTips = [
    {
      title: 'Keep leftovers cold fast',
      detail: 'Refrigerate cooked food within 2 hours, and within 1 hour if the room is very warm.',
    },
    {
      title: 'Separate raw and ready-to-eat foods',
      detail: 'Use different boards and containers to avoid cross-contamination.',
    },
    {
      title: 'Reheat thoroughly',
      detail: 'Heat leftovers until they are steaming hot all the way through before serving.',
    },
  ];

  const compostingTips = [
    {
      title: 'Balance greens and browns',
      detail: 'Mix fruit and vegetable scraps with dry leaves, cardboard, or paper to reduce odor.',
    },
    {
      title: 'Avoid meat and dairy in home compost',
      detail: 'These can attract pests and slow down safe composting in simple household systems.',
    },
    {
      title: 'Keep the pile lightly moist',
      detail: 'A compost pile should feel like a wrung-out sponge for better decomposition.',
    },
  ];

  const bentoCardClass = "bg-white/60 dark:bg-gray-800/40 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-3xl p-8 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 relative overflow-hidden group";

  return (
    <div className="bg-gradient-to-br from-green-50 via-gray-50 to-teal-50 dark:from-gray-900 dark:via-gray-900 dark:to-green-900/30 min-h-screen flex flex-col font-sans">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-0 right-1/4 w-[30rem] h-[30rem] bg-teal-500/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2"></div>
      
      <div className="container mx-auto px-6 py-10 flex-1 max-w-7xl relative z-10">
        
        {/* Welcome Header */}
        <div className="mb-10 animate-fade-in flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/60 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-sm font-medium mb-4 backdrop-blur-md">
              <Leaf className="w-4 h-4 text-green-500" />
             Dashboard
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-teal-500">{userName}</span>
            </h1>
          </div>
        </div>

        {/* BENTO GRID */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-12">

          {/* ROW 1: Large Prediction Card (Col 8) & Stats Card (Col 4) */}
          
          {/* Main Action - Predict Freshness (entire card clickable) */}
          <Link to="/user-dashboard/predict" className={`md:col-span-8 ${bentoCardClass} flex flex-col justify-between min-h-[300px] group`}>
            <div className="absolute right-0 bottom-0 w-64 h-64 bg-gradient-to-tl from-green-500/10 to-transparent rounded-full blur-2xl translate-y-1/3 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="bg-green-100 dark:bg-green-900/30 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 border border-green-200 dark:border-green-800/50">
              <Search className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">Analyze Food Freshness</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-xl mb-8 leading-relaxed">
                Use our multi-model AI pipeline or connect IoT "Digital Nose" sensors to assess storage conditions and predict spoilage limits instantly.
              </p>
              
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors shadow-lg shadow-green-600/20 hover:shadow-green-600/40" aria-hidden>
                Start Prediction <ArrowRight className="w-5 h-5" />
              </div>
            </div>
          </Link>

          {/* Tips Column */}
          <div className={`md:col-span-4 self-start ${bentoCardClass} flex flex-col p-6`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800/50 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">Food Safety Tips</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Quick guidance you can trust</p>
              </div>
            </div>
            <div className="space-y-3">
              {foodSafetyTips.map((tip, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-white/40 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-700/50 transition-colors hover:bg-white/60 dark:hover:bg-gray-800/60">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 p-2 rounded-xl bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800/50">
                      <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{tip.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{tip.detail}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ROW 2: NGO Connect (Col 4) | Chatbot Tip (Col 4) | Recent Activity (Col 4) */}

          {/* Donate Food Block */}
          <Link to="/user-dashboard/ngo-connect" className={`md:col-span-4 self-start ${bentoCardClass} flex flex-col justify-center min-h-[220px]`}>
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
              <Handshake className="w-32 h-32 text-teal-600" />
            </div>
            <div className="bg-teal-100 dark:bg-teal-900/30 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border border-teal-200 dark:border-teal-800/50 z-10">
              <Handshake className="w-7 h-7 text-teal-600 dark:text-teal-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 z-10">Donate Surplus</h3>
            <p className="text-gray-600 dark:text-gray-400 z-10">Connect dynamically with local verified NGOs.</p>
          </Link>

          {/* Anna's Chatbot Block */}
          <button onClick={() => window.dispatchEvent(new Event('toggleChatbot'))} className={`md:col-span-4 self-start ${bentoCardClass} text-left flex flex-col justify-center min-h-[220px]`}>
             <div className="bg-cyan-100 dark:bg-cyan-900/30 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border border-cyan-200 dark:border-cyan-800/50">
              <MessageSquare className="w-7 h-7 text-cyan-600 dark:text-cyan-400" />
            </div>
            <div className="flex items-center gap-2 mb-2">
               <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Ask "Anna"</h3>
               <Sparkles className="w-5 h-5 text-cyan-500" />
            </div>
            <p className="text-gray-600 dark:text-gray-400">Generate clever recipes for your remaining ingredients.</p>
          </button>

          {/* Composting Tips */}
          <div className={`md:col-span-4 self-start ${bentoCardClass} flex flex-col p-6`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-teal-100 dark:bg-teal-900/30 border border-teal-200 dark:border-teal-800/50 flex items-center justify-center">
                <Leaf className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">Composting Tips</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Small habits, big waste reduction</p>
              </div>
            </div>
            <div className="space-y-3">
              {compostingTips.map((tip, idx) => (
                <div key={idx} className="flex items-start gap-4 p-4 rounded-2xl bg-white/40 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-700/50 transition-colors hover:bg-white/60 dark:hover:bg-gray-800/60">
                  <div className="mt-1 bg-white dark:bg-gray-800 p-2 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <Leaf className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">{tip.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">{tip.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      <Footer type="dashboard" />
    </div>
  );
};

export default UserHomePage;