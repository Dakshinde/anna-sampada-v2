import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, Handshake, Search } from 'lucide-react';
import ThemeToggle from '../../components/layout/ThemeToggle';
import Footer from '../../components/layout/Footer';

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    { title: 'Predict Freshness', desc: 'AI-powered assessment of food quality to reduce spoilage.', icon: <Search className="w-8 h-8 text-green-600 dark:text-green-400" /> },
    { title: 'Connect with NGOs', desc: 'Easily donate surplus food to trusted local partners.', icon: <Handshake className="w-8 h-8 text-teal-600 dark:text-teal-400" /> },
    { title: 'Smart Composting', desc: 'Turn unavoidable waste into nutrient-rich compost.', icon: <Leaf className="w-8 h-8 text-cyan-600 dark:text-cyan-400" /> },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-white via-green-50 to-teal-50 
                    dark:from-gray-900 dark:via-gray-900 dark:to-teal-900 transition-colors duration-500">
      
      {/* Top Bar */}
      <div className="flex justify-between items-center p-6 container mx-auto">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-teal-600 dark:from-green-400 dark:to-teal-400 bg-clip-text text-transparent">
          AnnaSampada
        </h1>
        <ThemeToggle />
      </div>

      {/* HERO */}
      <div className="flex-1 flex flex-col justify-center items-center text-center px-6">
        <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-green-600 via-teal-600 to-cyan-600 
                      dark:from-green-400 dark:via-teal-400 dark:to-cyan-400 bg-clip-text text-transparent">
          Transforming Food Waste into Hope
        </h2>

        <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 max-w-2xl mb-10">
          Join our mission to reduce food waste, feed communities, and protect our planet. 
          We connect surplus food with those in need and promote sustainable composting.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => navigate('/login')}
            className="px-8 py-3 bg-green-600 text-white text-lg rounded-xl 
                       hover:bg-green-700 transition-all duration-300 shadow-sm hover:shadow-md"
          >
            Login
          </button>

          <button
            onClick={() => navigate('/signup')}
            className="px-8 py-3 border-2 border-green-600 text-green-700 
                       dark:text-green-400 dark:border-green-400 text-lg rounded-xl 
                       hover:bg-green-50 dark:hover:bg-gray-800 transition-all duration-300 shadow-sm hover:shadow-md"
          >
            Sign Up
          </button>
        </div>
      </div>

      {/* FEATURES */}
      <div className="container mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <div key={idx} className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300">
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FOOTER */}
      <Footer type = "landing" />
    </div>
  );
};

export default LandingPage;
