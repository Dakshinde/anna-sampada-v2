import React from 'react';
import { Users, Heart, Leaf, ShoppingCart } from 'lucide-react';

const statsData = [
  { number: '10K+', label: 'Meals Donated', icon: <ShoppingCart className="w-10 h-10 text-green-500 mx-auto mb-3" /> },
  { number: '500+', label: 'Active Users', icon: <Users className="w-10 h-10 text-teal-500 mx-auto mb-3" /> },
  { number: '5T+', label: 'Waste Composted', icon: <Leaf className="w-10 h-10 text-cyan-500 mx-auto mb-3" /> },
];

const AboutPage = () => {
  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <h1 className="text-5xl md:text-6xl font-extrabold text-center text-green-700 dark:text-green-300 mb-12 animate-slide-down">
          About AnnaSampada
        </h1>

        {/* Mission Section */}
        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-10 mb-16 animate-fade-in">
          <h2 className="text-3xl font-bold mb-4 text-gray-800 dark:text-white">Our Mission</h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
            AnnaSampada is dedicated to creating a sustainable food ecosystem by connecting food donors with NGOs and composting services. 
            We leverage AI technology to predict food freshness and provide intelligent solutions for food waste management.
          </p>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            Our platform bridges the gap between surplus food and those in need, while promoting environmental sustainability through efficient composting practices.
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {statsData.map((stat, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 text-center transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl animate-fade-in"
              style={{ animationDelay: `${idx * 0.2}s`, animationFillMode: 'both' }}
            >
              {stat.icon}
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">{stat.number}</div>
              <div className="text-gray-600 dark:text-gray-300">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-br from-green-500 to-teal-600 rounded-3xl shadow-xl p-10 text-white text-center animate-fade-in">
          <h2 className="text-3xl font-bold mb-4">Join Our Movement</h2>
          <p className="mb-8 text-lg opacity-90">
            Together, we can make a significant impact on food waste and hunger. Every contribution counts, whether it's donating surplus food or composting organic waste.
          </p>
          <button className="px-8 py-3 bg-white text-green-600 font-semibold rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-300">
            Get Started Today
          </button>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
