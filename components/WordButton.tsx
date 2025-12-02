import React from 'react';
import { WordItem, WordStatus } from '../types';

interface WordButtonProps {
  word: WordItem;
  onClick: (word: WordItem) => void;
}

export const WordButton: React.FC<WordButtonProps> = ({ word, onClick }) => {
  const isUnheard = word.status === WordStatus.UNHEARD;

  // Dynamic classes based on status and loading state
  const baseClasses = "relative group overflow-hidden px-6 py-3 rounded-full text-lg font-medium transition-all duration-300 transform hover:-translate-y-1 active:scale-95 shadow-sm flex items-center justify-center gap-2";
  
  const statusClasses = isUnheard
    ? "bg-white text-primary border-2 border-primary hover:bg-primary hover:text-white hover:shadow-lg hover:shadow-primary/30"
    : "bg-secondary/10 text-secondary border-2 border-secondary/20 hover:bg-secondary hover:text-white";

  const loadingClasses = word.isLoading ? "cursor-wait opacity-80" : "cursor-pointer";

  return (
    <button
      onClick={() => !word.isLoading && onClick(word)}
      disabled={word.isLoading}
      className={`${baseClasses} ${statusClasses} ${loadingClasses}`}
    >
      {/* Loading Spinner */}
      {word.isLoading && (
        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      
      {/* Icon for Heard status (Replay) */}
      {!isUnheard && !word.isLoading && (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
        </svg>
      )}
      
      {/* Text */}
      <span>{word.text}</span>
    </button>
  );
};