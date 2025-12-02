import React, { useState, useCallback, useEffect } from 'react';
import { WordItem, WordStatus } from './types';
import { generatePronunciation, playAudioBuffer } from './services/geminiService';
import { InputSection } from './components/InputSection';
import { WordButton } from './components/WordButton';

const App: React.FC = () => {
  const [words, setWords] = useState<WordItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Add new words to the Unheard list
  const handleAddWords = useCallback((newWordTexts: string[]) => {
    const newWords: WordItem[] = newWordTexts.map((text) => ({
      id: crypto.randomUUID(),
      text,
      status: WordStatus.UNHEARD,
      isLoading: false,
      audioBuffer: null,
    }));
    setWords((prev) => [...prev, ...newWords]);
    setError(null);
  }, []);

  // Handle clicking a word
  const handleWordClick = useCallback(async (word: WordItem) => {
    // If we already have the audio buffer, just play it.
    if (word.audioBuffer) {
      playAudioBuffer(word.audioBuffer);
      // If it was unheard, move it to heard
      if (word.status === WordStatus.UNHEARD) {
        setWords((prev) =>
          prev.map((w) =>
            w.id === word.id ? { ...w, status: WordStatus.HEARD } : w
          )
        );
      }
      return;
    }

    // Otherwise, fetch from API
    setWords((prev) =>
      prev.map((w) => (w.id === word.id ? { ...w, isLoading: true } : w))
    );
    setError(null);

    try {
      const buffer = await generatePronunciation(word.text);
      
      playAudioBuffer(buffer);

      setWords((prev) =>
        prev.map((w) =>
          w.id === word.id
            ? {
                ...w,
                status: WordStatus.HEARD,
                isLoading: false,
                audioBuffer: buffer, // Cache the buffer
              }
            : w
        )
      );
    } catch (err) {
      console.error(err);
      setError("無法播放聲音，請檢查 API Key 或網路連線 (Failed to load audio)");
      setWords((prev) =>
        prev.map((w) => (w.id === word.id ? { ...w, isLoading: false } : w))
      );
    }
  }, []);

  // Reset all words
  const handleClear = () => {
    setWords([]);
    setError(null);
  };

  // Filter words by status
  const unheardWords = words.filter((w) => w.status === WordStatus.UNHEARD);
  const heardWords = words.filter((w) => w.status === WordStatus.HEARD);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <div className="flex-grow py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl tracking-tight mb-2">
              Word<span className="text-primary">Sound</span>
            </h1>
            <p className="max-w-md mx-auto text-lg text-gray-600">
              將單字轉換為發音按鈕的學習工具
            </p>
          </div>

          {/* API Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r shadow-sm flex items-start animate-pulse">
              <svg className="h-6 w-6 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Input Area */}
          <InputSection onAddWords={handleAddWords} />

          {/* Main Content Area - Grid Layout */}
          {(unheardWords.length > 0 || heardWords.length > 0) && (
            <div className="grid grid-cols-1 gap-10">
              
              {/* Section: Words to Learn */}
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 ring-1 ring-black/5">
                <div className="bg-gradient-to-r from-primary to-indigo-700 px-6 py-4 flex justify-between items-center shadow-sm">
                  <h3 className="text-xl font-bold text-white flex items-center">
                    <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                    點擊發音 (未播放: {unheardWords.length})
                  </h3>
                  {words.length > 0 && (
                     <button 
                       onClick={handleClear}
                       className="text-xs text-white/90 hover:text-white hover:bg-white/20 uppercase font-bold tracking-wider border border-white/30 px-3 py-1.5 rounded transition-colors"
                     >
                       清除全部 (Clear)
                     </button>
                  )}
                </div>
                
                <div className="p-8 min-h-[200px] bg-slate-50 transition-all">
                  {unheardWords.length === 0 && heardWords.length > 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 text-gray-400 animate-in fade-in duration-500">
                       <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-4">
                         <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                       </div>
                       <p className="text-xl font-bold text-gray-700">太棒了！</p>
                       <p className="text-gray-500">您已經聽完了所有單字。</p>
                    </div>
                  ) : unheardWords.length === 0 ? (
                     <div className="flex flex-col items-center justify-center h-40 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl bg-white/50">
                       <p>請在上方輸入單字來開始</p>
                     </div>
                  ) : (
                    <div className="flex flex-wrap gap-4 justify-center content-start">
                      {unheardWords.map((word) => (
                        <WordButton key={word.id} word={word} onClick={handleWordClick} />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Section: Already Heard */}
              {heardWords.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 opacity-90 transition-all hover:opacity-100">
                  <div className="bg-gray-100 px-6 py-3 border-b border-gray-200 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                    <h3 className="text-lg font-bold text-gray-600">
                      已聽過 (Heard: {heardWords.length})
                    </h3>
                  </div>
                  <div className="p-6 bg-gray-50/50">
                    <div className="flex flex-wrap gap-3 justify-center">
                      {heardWords.map((word) => (
                        <WordButton key={word.id} word={word} onClick={handleWordClick} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6 mt-auto">
        <div className="max-w-4xl mx-auto px-4 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} WordSound. Powered by Google Gemini.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;