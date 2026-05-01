import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, Handshake, Search, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import ThemeToggle from '../../components/layout/ThemeToggle';
import Footer from '../../components/layout/Footer';
import InstallAppButton from '../../components/pwa/InstallAppButton.jsx';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-gray-900 font-sans transition-colors duration-500 relative overflow-hidden">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500/10 dark:bg-green-500/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2"></div>
      <div className="absolute top-1/2 right-0 w-[30rem] h-[30rem] bg-teal-500/10 dark:bg-teal-500/5 rounded-full blur-3xl pointer-events-none translate-x-1/3"></div>

      {/* --- SUMMER BREEZE BACKGROUND EFFECTS --- */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        
        {/* Layer 1: Flowing Breeze (Blurred Background) */}
        <div className="absolute inset-0 z-0 opacity-30 dark:opacity-20 blur-md">
          {[...Array(15)].map((_, i) => (
            <div
              key={`flow-${i}`}
              className="absolute animate-flowing-breeze"
              style={{
                top: `${(i * 7) % 100}%`,
                left: `${(i * 13) % 100}%`,
                animationDuration: `${(i % 5)*2 + 10}s`,
                animationDelay: `${i * 0.5}s`,
              }}
            >
              <Leaf size={(i % 3) * 10 + 20} className="text-green-300 dark:text-green-700" />
            </div>
          ))}
        </div>

        {/* Layer 2: Dancing Leaves (Sharp Middle-ground) */}
        <div className="absolute inset-0 z-5 opacity-60 dark:opacity-40 drop-shadow-md">
          {[...Array(7)].map((_, i) => (
            <div
              key={`dance-${i}`}
              className="absolute animate-dancing-leaf"
              style={{
                top: `-10vh`,
                left: `${(i * 15) % 100}%`,
                animationDuration: `${(i % 3)*3 + 15}s`,
                animationDelay: `${i * 1.5}s`,
              }}
            >
              <Leaf size={(i % 2) * 20 + 30} className="text-teal-400 dark:text-teal-600" />
            </div>
          ))}
        </div>
      </div>

      {/* Top Bar */}
      <div className="flex justify-between items-center p-6 container mx-auto z-10 relative">
        <h1 className="text-2xl tracking-tight font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Leaf className="w-6 h-6 text-green-600 dark:text-green-500" />
          AnnaSampada
        </h1>
        <div className="flex items-center gap-3">
          <InstallAppButton />
          <ThemeToggle />
        </div>
      </div>

      {/* HERO SECTION */}
      <div className="flex-1 flex flex-col justify-center items-center text-center px-6 pt-16 pb-24 z-10 relative">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 dark:bg-gray-800 text-green-700 dark:text-green-400 text-sm font-medium mb-8 border border-green-200 dark:border-gray-700">
          <Sparkles className="w-4 h-4" />
          AI-Powered Sustainability
        </div>
        
        <h2 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight text-gray-900 dark:text-white max-w-4xl leading-tight">
          Surplus Food <br />
          <span className="bg-gradient-to-r from-green-600 to-teal-500 bg-clip-text text-transparent">
            Gets to the Best.
          </span>
        </h2>

        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mb-10 font-medium leading-relaxed">
          AnnaSampada uses advanced Machine Learning and Generative AI to predict food spoilage, suggest recipes for leftovers, and seamlessly route surplus to those in need.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => navigate('/signup')}
            className="px-8 py-4 bg-green-600 text-white text-lg rounded-2xl font-semibold 
                       hover:bg-green-700 transition-all duration-300 shadow-lg shadow-green-600/20 
                       hover:shadow-green-600/40 hover:-translate-y-1 flex items-center justify-center gap-2"
          >
            Get Started <ArrowRight className="w-5 h-5" />
          </button>

          <button
            onClick={() => navigate('/login')}
            className="px-8 py-4 bg-white/60 dark:bg-gray-800/50 backdrop-blur-md border border-gray-200 
                       dark:border-gray-700 text-gray-800 dark:text-white text-lg rounded-2xl font-semibold 
                       hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 hover:-translate-y-1"
          >
            Sign In
          </button>
        </div>
      </div>

      {/* BENTO GRID FEATURES SECTION */}
      <div className="container mx-auto px-6 pb-24 z-10 relative">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 max-w-6xl mx-auto">
          
          {/* Card 1: Wide Card (Spoilage Prediction) */}
          <div className="md:col-span-8 bg-white/60 dark:bg-gray-800/40 backdrop-blur-xl rounded-3xl p-8 border border-gray-200 dark:border-gray-700/50 hover:shadow-xl hover:shadow-green-500/5 transition-all duration-500 group overflow-hidden relative">
            <div className="absolute right-0 top-0 w-64 h-64 bg-gradient-to-br from-green-500/10 to-transparent rounded-full blur-2xl -translate-y-1/2 translate-x-1/3 group-hover:opacity-100 transition-opacity"></div>
            <div className="bg-green-100 dark:bg-green-900/30 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border border-green-200 dark:border-green-800/50">
              <Search className="w-7 h-7 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">Multi-Model Spoilage AI</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed max-w-lg mb-6">
              Stop guessing. Input storage conditions or connect your IoT "Digital Nose" sensors for Rice, Milk, and more, and let our 5 specialized ML models instantly predict safety.
            </p>
            <div className="flex items-center gap-2 text-sm font-semibold text-green-600 dark:text-green-400">
              <ShieldCheck className="w-4 h-4" /> 98% Confidence Rating
            </div>
          </div>

          {/* Card 2: Square Card (Anna Chatbot) */}
          <div className="md:col-span-4 bg-white/60 dark:bg-gray-800/40 backdrop-blur-xl rounded-3xl p-8 border border-gray-200 dark:border-gray-700/50 hover:shadow-xl hover:shadow-teal-500/5 transition-all duration-500 relative overflow-hidden">
             <div className="bg-teal-100 dark:bg-teal-900/30 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border border-teal-200 dark:border-teal-800/50">
              <Sparkles className="w-7 h-7 text-teal-600 dark:text-teal-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">Meet "Anna"</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Powered by Google Gemini. Ask for leftover recipes based on your strict dietary modes (Veg/Jain), or get instant food safety tips.
            </p>
          </div>

          {/* Card 3: Square Card (Smart Composting) */}
          <div className="md:col-span-5 bg-white/60 dark:bg-gray-800/40 backdrop-blur-xl rounded-3xl p-8 border border-gray-200 dark:border-gray-700/50 hover:shadow-xl hover:shadow-cyan-500/5 transition-all duration-500">
            <div className="bg-cyan-100 dark:bg-cyan-900/30 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border border-cyan-200 dark:border-cyan-800/50">
              <Leaf className="w-7 h-7 text-cyan-600 dark:text-cyan-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">Nutrient Recovery</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              When food is beyond saving, we connect you with commercial composters to turn unavoidable waste into nutrient-rich soil.
            </p>
          </div>

          {/* Card 4: Wide Card (NGO Donation) */}
          <div className="md:col-span-7 bg-white/60 dark:bg-gray-800/40 backdrop-blur-xl rounded-3xl p-8 border border-gray-200 dark:border-gray-700/50 hover:shadow-xl hover:shadow-teal-500/5 transition-all duration-500 group overflow-hidden relative">
            <div className="absolute right-0 bottom-0 w-64 h-64 bg-gradient-to-tl from-teal-500/10 to-transparent rounded-full blur-2xl translate-y-1/3 group-hover:opacity-100 transition-opacity"></div>
            <div className="bg-teal-100 dark:bg-teal-900/30 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border border-teal-200 dark:border-teal-800/50">
              <Handshake className="w-7 h-7 text-teal-600 dark:text-teal-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">Community Donation</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed max-w-lg">
              Have excess, perfectly good food? Our platform instantly connects you with verified local NGOs. We handle the automated alert routing so food goes to plates, not landfills.
            </p>
          </div>

        </div>
      </div>

      {/* FOOTER */}
      <Footer type="landing" />
    </div>
  );
};

export default LandingPage;
