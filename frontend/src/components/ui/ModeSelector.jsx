// src/components/ui/ModeSelector.jsx
import React from 'react';
import { ArrowLeft } from 'lucide-react';

const MODES = ['Veg', 'Non-Veg', 'Jain'];

const ModeSelector = ({ mode, setMode }) => {
  return (
    <div className="flex flex-wrap justify-center gap-2 p-1 bg-gray-100 rounded-full dark:bg-gray-700">
      {MODES.map((m) => (
        <button
          key={m}
          onClick={() => setMode(m)} // 'setMode' here is the 'selectMode' from the hook
          className={`px-3 py-1 text-xs font-medium rounded-full transition-all ${
            mode === m
              ? 'bg-green-600 text-white shadow'
              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          {m}
        </button>
      ))}
      <button
        onClick={() => setMode('back')} // We'll handle this "back" in the hook
        className="px-2 py-1 text-xs text-gray-500 hover:bg-gray-200 rounded-full"
      >
        <ArrowLeft size={16} />
      </button>
    </div>
  );
};
export default ModeSelector;