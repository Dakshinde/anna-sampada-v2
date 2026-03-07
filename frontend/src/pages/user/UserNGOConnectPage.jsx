import React, { useState, useContext } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Loader2, Send, CheckCircle, AlertTriangle, MapPin } from 'lucide-react';

// --- This is our static list of NGOs to replace the live map ---
const staticNgos = [
  { id: '1', name: 'Hope Foundation', distance: '1.2 km', rating: 4.8 },
  { id: '2', name: 'Food For All', distance: '2.5 km', rating: 4.6 },
  { id: '3', name: 'Care & Share NGO', distance: '3.8 km', rating: 4.9 },
  { id: '4', name: 'Roti Bank (Mumbai)', distance: '4.1 km', rating: 4.7 },
];

// This file is now connected and working
const UserNGOConnectPage = () => {
  const { user } = useAuth();
  const [selectedNgo, setSelectedNgo] = useState(null);
  const [formData, setFormData] = useState({
    foodDetails: '', // Renamed from 'Food Type'
    quantity: '',
    pickupAddress: '',
    donorContact: user?.phone || user?.email || '', // Pre-fill from Auth
    // We removed 'availableUntil' to match the backend
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedNgo) {
      setError('Please select an NGO from the list on the right.');
      return;
    }
    
    setLoading(true);

    try {
      // These keys match your app.py notify-ngo endpoint
      const payload = {
        ngo_name: selectedNgo.name,
        foodDetails: `${formData.foodDetails} (Quantity: ${formData.quantity} kg)`,
        pickupAddress: formData.pickupAddress,
        donorContact: formData.donorContact,
      };

      const res = await fetch('http://127.0.0.1:5000/api/notify-ngo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send notification.');

      setSuccess(`Notification sent to ${selectedNgo.name}!`);
      setSelectedNgo(null); // Reset selection
      setFormData({ foodDetails: '', quantity: '', pickupAddress: '', donorContact: user?.phone || user?.email || '' });

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-green-800 dark:text-green-200 animate-slide-down">
        Connect with NGOs
      </h1>
      
      <div className="grid lg:grid-cols-2 gap-8">
        
        {/* --- [FIXED] FOOD DONATION FORM START --- */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 animate-fade-in">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
            1. Fill Donation Details
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Food Type & Details
              </label>
              <input
                type="text"
                name="foodDetails" // Added name
                value={formData.foodDetails} // Added value
                onChange={handleChange} // Added onChange
                placeholder="e.g., Cooked Rice, Fresh Vegetables"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-green-500 focus:outline-none"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Quantity (in kg, approx.)
              </label>
              <input
                type="number"
                name="quantity" // Added name
                value={formData.quantity} // Added value
                onChange={handleChange} // Added onChange
                placeholder="5"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-green-500 focus:outline-none"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Your Pickup Address
              </label>
              <textarea
                rows="3"
                name="pickupAddress" // Added name
                value={formData.pickupAddress} // Added value
                onChange={handleChange} // Added onChange
                placeholder="Enter your complete address"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-green-500 focus:outline-none"
                required
              ></textarea>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Your Contact (Phone or Email)
              </label>
              <input
                type="text"
                name="donorContact" // Added name
                value={formData.donorContact} // Added value
                onChange={handleChange} // Added onChange
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-green-500 focus:outline-none"
                required
              />
            </div>
            
            {/* --- Error/Success Messages --- */}
            {error && (
              <div className="p-3 bg-red-100 text-red-700 rounded-lg flex items-center gap-2">
                <AlertTriangle size={18} /> {error}
              </div>
            )}
            {success && (
              <div className="p-3 bg-green-100 text-green-700 rounded-lg flex items-center gap-2">
                <CheckCircle size={18} /> {success}
              </div>
            )}
            
            <button 
              type="submit" 
              disabled={loading || !selectedNgo} // Button is disabled until an NGO is selected
              className="w-full py-4 bg-green-600 dark:bg-green-500 text-white rounded-xl 
                         hover:bg-green-700 dark:hover:bg-green-600 transform hover:scale-105 
                         transition-all duration-300 shadow-lg font-semibold disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin mx-auto" /> : 
               selectedNgo ? `Notify ${selectedNgo.name}` : 'Please Select an NGO'}
            </button>
          </form>
        </div>
        {/* --- FOOD DONATION FORM END --- */}
        
        {/* --- [FIXED] STATIC NGO LIST START --- */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 animate-fade-in animation-delay-200">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
            2. Select a Nearby NGO (Demo)
          </h2>
          
          {/* This is your beautiful map placeholder */}
          <div className="bg-gradient-to-br from-green-100 to-teal-100 dark:from-gray-700 
                          dark:to-gray-600 rounded-xl h-60 flex items-center justify-center 
                          mb-6 relative overflow-hidden">
            <div className="text-center z-10">
              <MapPin className="w-16 h-16 mx-auto mb-4 text-green-600 dark:text-green-400" />
              <p className="text-gray-600 dark:text-gray-300 font-medium">
                Live Map Disabled (No API Key)
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Showing demo list below.
              </p>
            </div>
          </div>
          
          <div className="space-y-3">
            {staticNgos.map((ngo) => (
              <button
                key={ngo.id}
                type="button"
                onClick={() => setSelectedNgo(ngo)}
                className={`w-full flex items-center justify-between p-4 bg-gray-50 
                            dark:bg-gray-700 rounded-xl hover:shadow-md 
                            transition-all duration-300 border-2 text-left
                            ${selectedNgo?.id === ngo.id 
                              ? 'border-green-500 shadow-md' // Highlight selected NGO
                              : 'border-transparent dark:border-gray-700'
                            }`}
              >
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-white">{ngo.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{ngo.distance} away</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-yellow-500">★</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">{ngo.rating}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
        {/* --- STATIC NGO LIST END --- */}
      </div>
    </div>
  );
};

export default UserNGOConnectPage;