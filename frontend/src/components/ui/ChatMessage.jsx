import React from 'react';
import { BookOpen, ShieldCheck, Clock, Users } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export const ChatMessage = ({ message }) => {
  const { role, text, recipes, safetyTips, isError } = message;
  const isUser = role === 'user';
  const bubbleClass = isUser
    ? 'bg-green-600 text-white'
    : isError
    ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200'
    : 'bg-gray-200 dark:bg-gray-700 dark:text-gray-200';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`p-3 rounded-lg max-w-[85%] ${bubbleClass} shadow-sm`}>
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <ReactMarkdown>{text}</ReactMarkdown>
        </div>
        {safetyTips && safetyTips.length > 0 && <SafetyTips tips={safetyTips} />}
        {recipes && recipes.length > 0 && (
          recipes.map((r, i) => <RecipeCard key={i} recipe={r} />)
        )}
      </div>
    </div>
  );
};
const RecipeCard = ({ recipe }) => (
  <div className="bg-white/90 dark:bg-gray-800 text-gray-800 dark:text-gray-100 p-3 rounded-md border dark:border-gray-600 mt-2">
    <h3 className="font-bold text-base flex items-center">
      <BookOpen className="w-4 h-4 mr-2" />{recipe.title || 'Leftover Recipe'}
    </h3>
    <div className="flex gap-4 text-xs text-gray-600 dark:text-gray-400 my-2">
      {recipe.estimatedTime && <span className="flex items-center"><Clock className="w-3 h-3 mr-1" />{recipe.estimatedTime}</span>}
      {recipe.servings && <span className="flex items-center"><Users className="w-3 h-3 mr-1" />{recipe.servings} servings</span>}
    </div>
    {recipe.ingredients && (
      <>
        <h5 className="font-semibold text-sm mt-2">Ingredients:</h5>
        <ul className="list-disc list-inside text-sm">
          {recipe.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}
        </ul>
      </>
    )}
    {recipe.steps && (
      <>
        <h5 className="font-semibold text-sm mt-2">Steps:</h5>
        <ol className="list-decimal list-inside text-sm">
          {recipe.steps.map((step, i) => <li key={i}>{step}</li>)}
        </ol>
      </>
    )}
  </div>
);
const SafetyTips = ({ tips }) => (
  <div className="mt-2 pt-2 border-t border-gray-300 dark:border-gray-600">
    <h4 className="font-bold text-sm mb-1 flex items-center"><ShieldCheck className="w-4 h-4 mr-2" />Food Safety Tips</h4>
    <ul className="list-disc list-inside space-y-1 text-sm">
      {tips.map((tip, i) => <li key={i}>{tip}</li>)}
    </ul>
  </div>
);
export default ChatMessage;