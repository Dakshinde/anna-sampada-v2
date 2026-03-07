import React from "react";
import { motion } from "framer-motion";
import { ChevronLeft, AlertCircle } from "lucide-react";

export default function UnsupportedFoodForm({ foodType, handleBack }) {
  return (
    <motion.div
      key="step1-unsupported"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="py-8 text-center"
    >
      <div className="flex flex-col items-center justify-center h-full min-h-[300px]">
        <AlertCircle className="w-16 h-16 text-yellow-500 mb-4" />
        <h2 className="text-2xl font-semibold mb-2 text-gray-800 dark:text-gray-100">
          Prediction Not Available
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Predictions for <span className="font-semibold">{foodType}</span> are not yet supported.
        </p>
        <button
          onClick={handleBack}
          className="py-3 px-6 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white rounded-lg flex items-center hover:bg-gray-300 dark:hover:bg-gray-500"
        >
          <ChevronLeft className="w-5 h-5 mr-1" /> Go Back
        </button>
      </div>
    </motion.div>
  );
}
