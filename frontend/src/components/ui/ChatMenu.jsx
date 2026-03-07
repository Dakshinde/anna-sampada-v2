// src/components/ui/ChatMenu.jsx
import React from 'react';
import { UtensilsCrossed, ShieldCheck, BrainCircuit, HeartHandshake, XCircle } from 'lucide-react';

const menuItems = [
  { command: 'recipe', text: "Leftover Recipes", icon: <UtensilsCrossed size={16}/> },
  { command: 'safety', text: "Food Safety Tips", icon: <ShieldCheck size={16}/> },
  { command: 'predict', text: "Predict Spoilage", icon: <BrainCircuit size={16}/> },
  { command: 'ngo', text: "Find NGOs", icon: <HeartHandshake size={16}/> },
  { command: 'exit', text: "Exit", icon: <XCircle size={16}/> },
];

const ChatMenu = ({ onMenuClick }) => (
  <div className="mb-3 grid grid-cols-1 gap-2">
    {menuItems.map((item) => (
      <button
        key={item.command}
        onClick={() => onMenuClick(item.command)}
        className="flex items-center gap-2 p-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg text-sm text-left dark:text-gray-100 transition-all"
      >
        {item.icon}
        <span>{item.text}</span>
      </button>
    ))}
  </div>
);
export default ChatMenu;