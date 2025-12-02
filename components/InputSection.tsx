import React, { useState, useCallback } from 'react';

interface InputSectionProps {
  onAddWords: (words: string[]) => void;
}

export const InputSection: React.FC<InputSectionProps> = ({ onAddWords }) => {
  const [inputText, setInputText] = useState('');

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    // Split by spaces, commas, newlines, or dots to handle sentences and lists
    const words = inputText
      .split(/[\s,\n\.]+/)
      .map(w => w.trim())
      .filter(w => w.length > 0);

    if (words.length > 0) {
      onAddWords(words);
      setInputText('');
    }
  }, [inputText, onAddWords]);

  const handleSample = () => {
    const sampleWords = ['Apple', 'Delicious', 'Elephant', 'Sunshine', 'Future'];
    onAddWords(sampleWords);
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">輸入英文單字 (Input Words)</h2>
        <button
          onClick={handleSample}
          type="button"
          className="text-sm text-primary hover:text-indigo-700 font-medium underline decoration-dashed underline-offset-4"
        >
          試試看範例 (Try Sample)
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
        <textarea
          className="flex-grow p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none outline-none transition-all h-28 sm:h-auto text-lg placeholder-gray-400"
          placeholder="在此輸入單字，系統會自動將它們切換成按鈕..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="h-12 sm:h-auto px-8 bg-primary hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed transition-all flex items-center justify-center sm:self-start whitespace-nowrap"
        >
          建立按鈕
          <br className="hidden sm:block" />
          (Create)
        </button>
      </form>
      <p className="mt-3 text-sm text-gray-500">
        提示：您可以使用空白、逗號或換行來分隔多個單字。
      </p>
    </div>
  );
};