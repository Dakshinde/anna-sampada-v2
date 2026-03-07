import React from 'react';

const UserComposterPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-green-800 dark:text-green-200 animate-slide-down">
        Compost Services
      </h1>
      
      <div className="grid lg:grid-cols-2 gap-8">
        {/* COMPOST REQUEST FORM START */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 animate-fade-in">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
            Request Compost Pickup
          </h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Waste Type
              </label>
              <select className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 
                                 dark:border-gray-600 dark:bg-gray-700 dark:text-white
                                 focus:border-green-500 dark:focus:border-green-400 
                                 focus:outline-none transition-all duration-300">
                <option>Select waste type</option>
                <option>Vegetable Peels</option>
                <option>Fruit Waste</option>
                <option>Garden Waste</option>
                <option>Mixed Organic</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Estimated Weight (kg)
              </label>
              <input
                type="number"
                placeholder="10"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 
                           dark:border-gray-600 dark:bg-gray-700 dark:text-white
                           focus:border-green-500 dark:focus:border-green-400 
                           focus:outline-none transition-all duration-300"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Pickup Address
              </label>
              <textarea
                rows="3"
                placeholder="Enter your complete address"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 
                           dark:border-gray-600 dark:bg-gray-700 dark:text-white
                           focus:border-green-500 dark:focus:border-green-400 
                           focus:outline-none transition-all duration-300"
              ></textarea>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Preferred Pickup Date
              </label>
              <input
                type="date"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 
                           dark:border-gray-600 dark:bg-gray-700 dark:text-white
                           focus:border-green-500 dark:focus:border-green-400 
                           focus:outline-none transition-all duration-300"
              />
            </div>
            
            <button className="w-full py-4 bg-green-600 dark:bg-green-500 text-white rounded-xl 
                               hover:bg-green-700 dark:hover:bg-green-600 transform hover:scale-105 
                               transition-all duration-300 shadow-lg font-semibold">
              Request Pickup
            </button>
          </div>
        </div>
        {/* COMPOST REQUEST FORM END */}
        
        {/* COMPOSTER INFO START */}
        <div className="space-y-6 animate-fade-in animation-delay-200">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
              Why Compost?
            </h2>
            
            <div className="space-y-4">
              {[
                { icon: '🌱', title: 'Enriches Soil', desc: 'Natural nutrients for healthy plants' },
                { icon: '♻️', title: 'Reduces Waste', desc: 'Diverts waste from landfills' },
                { icon: '🌍', title: 'Helps Planet', desc: 'Lower carbon footprint' },
                { icon: '💰', title: 'Saves Money', desc: 'Free natural fertilizer' }
              ].map((benefit, idx) => (
                <div key={idx} 
                     className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700 
                                rounded-xl hover:shadow-md transition-all duration-300">
                  <span className="text-3xl">{benefit.icon}</span>
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-white mb-1">
                      {benefit.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{benefit.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-500 to-teal-600 rounded-3xl shadow-xl 
                          p-8 text-white">
            <h3 className="text-xl font-bold mb-4">Your Impact This Month</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm">
                <p className="text-3xl font-bold mb-1">23 kg</p>
                <p className="text-sm opacity-90">Waste Composted</p>
              </div>
              <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm">
                <p className="text-3xl font-bold mb-1">15 kg</p>
                <p className="text-sm opacity-90">CO₂ Reduced</p>
              </div>
            </div>
          </div>
        </div>
        {/* COMPOSTER INFO END */}
      </div>
    </div>
  );
};

export default UserComposterPage;