import React from 'react';
import { BookOpen, ShieldCheck, Clock, Users, Leaf, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export const ChatMessage = ({ message }) => {
  const { role, text, recipes, safetyTips, isError } = message;
  const isUser = role === 'user';

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-6 group`}>
      <div className={`flex max-w-[85%] gap-2 items-end ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Avatar Layer */}
        {!isUser && (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center flex-shrink-0 shadow-sm">
            <Leaf className="w-4 h-4 text-white" />
          </div>
        )}

        {/* Bubble Layer */}
        <div 
          className={`
            p-4 text-sm leading-relaxed shadow-sm border
            ${isUser 
              ? 'bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl rounded-tr-sm border-transparent' 
              : isError 
                ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-2xl rounded-tl-sm border-red-200 dark:border-red-800'
                : 'bg-gray-100/80 dark:bg-white/5 backdrop-blur-md rounded-2xl rounded-tl-sm text-gray-800 dark:text-gray-100 border-gray-200/50 dark:border-white/10'
            }
          `}
        >
          <div className={`prose prose-sm max-w-none ${isUser ? 'prose-invert' : 'dark:prose-invert'}`}>
            <ReactMarkdown>{text}</ReactMarkdown>
          </div>
          
          {/* Extended Payloads */}
          {safetyTips && safetyTips.length > 0 && <SafetyTips tips={safetyTips} />}
          {recipes && recipes.length > 0 && (
            recipes.map((r, i) => <RecipeCard key={i} recipe={r} />)
          )}
        </div>

      </div>
    </div>
  );
};

// Subcomponents
const RecipeCard = ({ recipe }) => (
  <div className="bg-white dark:bg-gray-800/80 text-gray-800 dark:text-gray-100 p-4 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 mt-3 hover:-translate-y-0.5 transition-transform duration-200">
    <h3 className="font-extrabold text-base flex items-center tracking-tight mb-3">
      <BookOpen className="w-4 h-4 mr-2 text-green-600 dark:text-green-400" />{recipe.title || 'Leftover Recipe'}
    </h3>
    <div className="flex gap-4 text-xs font-semibold text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/40 p-2 rounded-lg mb-3">
      {recipe.estimatedTime && <span className="flex items-center"><Clock className="w-3 h-3 mr-1" />{recipe.estimatedTime}</span>}
      {recipe.servings && <span className="flex items-center"><Users className="w-3 h-3 mr-1" />{recipe.servings} servings</span>}
    </div>
    {recipe.ingredients && (
      <>
        <h5 className="font-bold text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2 mt-4">Ingredients</h5>
        <ul className="list-disc list-inside text-sm space-y-1 ml-1 text-gray-700 dark:text-gray-300">
          {recipe.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}
        </ul>
      </>
    )}
    {recipe.steps && (
      <>
        <h5 className="font-bold text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2 mt-4">Instructions</h5>
        <ol className="list-decimal list-inside text-sm space-y-1.5 ml-1 text-gray-700 dark:text-gray-300">
          {recipe.steps.map((step, i) => <li key={i} className="pl-1">{step}</li>)}
        </ol>
      </>
    )}
  </div>
);

const SafetyTips = ({ tips }) => (
  <div className="mt-3 pt-3 border-t border-gray-200/50 dark:border-gray-600/50">
    <h4 className="font-bold text-sm mb-2 flex items-center text-amber-600 dark:text-amber-400">
      <ShieldCheck className="w-4 h-4 mr-1.5" />Food Safety Parameters
    </h4>
    <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300 ml-1">
      {tips.map((tip, i) => <li key={i}>{tip}</li>)}
    </ul>
  </div>
);

export default ChatMessage;