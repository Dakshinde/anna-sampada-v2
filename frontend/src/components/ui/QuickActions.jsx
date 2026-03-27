// src/components/ui/QuickActions.jsx
import React from 'react';

const QuickActions = ({ onActionClick }) => {
  const actions = [
    "What's in my fridge?",
    "Give me a recipe",
    "How do I donate?",
    "Is my milk safe?"
  ];

  return (
    <div className="flex overflow-x-auto gap-2 pb-2 mr-2 no-scrollbar scroll-smooth">
      {actions.map((action, idx) => (
        <button
          key={idx}
          onClick={() => onActionClick(action)}
          className="whitespace-nowrap px-4 py-1.5 rounded-full bg-green-500/10 hover:bg-green-500/20 text-green-700 dark:text-green-400 border border-green-500/20 text-xs font-semibold transition-colors flex-shrink-0"
        >
          {action}
        </button>
      ))}
    </div>
  );
};

export default QuickActions;
