import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTemperatureHigh, FaTint, FaSmog } from 'react-icons/fa';

const foodTypes = ['Cooked Rice', 'Milk', 'Paneer', 'Roti', 'Dal'];
const smellOptions = ['Normal', 'Stale/Slightly Off', 'Sour/Fermented', 'Foul/Musty'];
const appearanceOptions = ['Normal/Glossy', 'Dull/Dry', 'Slimy/Discolored', 'Visible Mold'];
const storageOptions = ['Refrigerator', 'Room Temperature'];
const coolingOptions = ['Cooled in shallow container', 'Left to cool in deep pot', 'Not Applicable'];

const UserPredictPage = () => {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    foodType: '',
    hoursSinceCooking: '',
    initialHoursAtRoom: '',
    observedSmell: 'Normal',
    observedAppearance: 'Normal/Glossy',
    storageLocation: 'Refrigerator',
    coolingMethod: 'Not Applicable',
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    if (!formData.foodType) {
      setError('Please select a food type.');
      return;
    }
    setError(null);
    setStep(1);
  };

  const handleBack = () => setStep(0);

  const handlePredict = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    if (formData.foodType !== 'Cooked Rice') {
      setResult({ status: 'Not Available', message: 'Prediction not available yet.', is_safe: null });
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hours_since_cooking: formData.hoursSinceCooking,
          initial_hours_at_room_temp: formData.initialHoursAtRoom,
          observed_smell: formData.observedSmell,
          observed_appearance: formData.observedAppearance,
          storage_location: formData.storageLocation,
          cooling_method: formData.coolingMethod,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Prediction failed');
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const stepVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-green-800 dark:text-green-200 mb-10 text-center animate-slide-down">
        Food Freshness Predictor
      </h1>

      {/* Result Card */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`rounded-3xl p-8 mb-10 shadow-xl text-center border-4 ${
              result.is_safe === false
                ? 'border-red-500 bg-red-50 dark:bg-red-900'
                : 'border-green-500 bg-green-50 dark:bg-green-900'
            }`}
          >
            <h2 className="text-3xl font-bold mb-2 text-gray-800 dark:text-white">
              {result.status}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 text-lg">{result.message}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Step Form */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 animate-fade-in">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="step0"
              variants={stepVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Food Type
              </label>
              <select
                name="foodType"
                value={formData.foodType}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-green-500 dark:focus:border-green-400 transition-all duration-300"
              >
                <option value="">Choose</option>
                {foodTypes.map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
              {error && <p className="text-red-600 mt-2">{error}</p>}
              <button
                onClick={handleNext}
                className="mt-6 w-full py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-300 font-semibold"
              >
                Next
              </button>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="step1"
              variants={stepVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              {/* Rice Inputs */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Hours Since Cooking
                  </label>
                  <input
                    type="number"
                    name="hoursSinceCooking"
                    value={formData.hoursSinceCooking}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-green-500 dark:focus:border-green-400 transition-all duration-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Hours at Room Temp
                  </label>
                  <input
                    type="number"
                    name="initialHoursAtRoom"
                    value={formData.initialHoursAtRoom}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-green-500 dark:focus:border-green-400 transition-all duration-300"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Observed Smell
                  </label>
                  <select
                    name="observedSmell"
                    value={formData.observedSmell}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-green-500 dark:focus:border-green-400 transition-all duration-300"
                  >
                    {smellOptions.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Appearance
                  </label>
                  <select
                    name="observedAppearance"
                    value={formData.observedAppearance}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-green-500 dark:focus:border-green-400 transition-all duration-300"
                  >
                    {appearanceOptions.map(a => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Storage Location
                  </label>
                  <select
                    name="storageLocation"
                    value={formData.storageLocation}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-green-500 dark:focus:border-green-400 transition-all duration-300"
                  >
                    {storageOptions.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Cooling Method
                  </label>
                  <select
                    name="coolingMethod"
                    value={formData.coolingMethod}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-green-500 dark:focus:border-green-400 transition-all duration-300"
                  >
                    {coolingOptions.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <button
                  onClick={handleBack}
                  className="py-3 px-6 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-white rounded-xl hover:bg-gray-400 transition-all duration-300"
                >
                  Back
                </button>
                <button
                  onClick={handlePredict}
                  disabled={loading}
                  className="py-3 px-6 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-300"
                >
                  {loading ? 'Analyzing...' : 'Predict'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default UserPredictPage;
