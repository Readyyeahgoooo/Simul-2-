
import React, { useState, useEffect, useRef } from 'react';
import { GameResponse, Language, Theme, GameMode } from '../types';
import { translations } from '../i18n';

interface Props {
  response: GameResponse;
  onAction: (input: string) => void;
  isLoading: boolean;
  history: Array<{ turn: number; event: string; choice?: string }>;
  language: Language;
  theme: Theme;
}

export const GameConsole: React.FC<Props> = ({ response, onAction, isLoading, history, language, theme }) => {
  const [inputValue, setInputValue] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const t = translations[language];
  const isLight = theme !== 'black';

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, response, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    onAction(inputValue);
    setInputValue('');
  };

  const bubbleClass = isLight 
    ? 'bg-white border-slate-100 text-slate-800 shadow-sm' 
    : 'bg-[#1a1a1a] border-white/5 text-white shadow-xl';
  
  const choiceBubbleClass = 'bg-indigo-600 text-white shadow-md';

  return (
    <div className="flex-1 flex flex-col min-h-0 relative">
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 md:px-16 py-12 space-y-16">
        {history.map((h, i) => (
          <div key={i} className="animate-in fade-in slide-in-from-bottom-6 duration-500 max-w-4xl mx-auto w-full">
            <div className="flex items-center gap-4 mb-5">
               <span className={`text-[10px] font-black uppercase tracking-[0.4em] ${isLight ? 'text-slate-300' : 'text-white/20'}`}>{t.turn} {h.turn}</span>
               <div className={`h-[1px] flex-1 ${isLight ? 'bg-slate-100' : 'bg-white/5'}`} />
            </div>
            <div className={`text-lg md:text-2xl leading-[1.6] font-medium whitespace-pre-wrap p-10 md:p-14 rounded-[2.5rem] border ${bubbleClass}`}>
              {h.event}
            </div>
            {h.choice && (
              <div className="mt-8 flex justify-end animate-in fade-in slide-in-from-right-4">
                <div className={`px-8 py-3 rounded-2xl font-black text-sm uppercase tracking-widest ${choiceBubbleClass}`}>
                   {h.choice}
                </div>
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 py-8 max-w-4xl mx-auto w-full">
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse delay-200" />
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse delay-500" />
          </div>
        )}
      </div>

      <div className={`p-8 md:p-12 backdrop-blur-3xl border-t ${isLight ? 'bg-white/60 border-slate-200' : 'bg-[#0a0a0a]/80 border-white/5'}`}>
        <div className="max-w-4xl mx-auto">
          {response.options && response.options.length > 0 && !isLoading && (
            <div className="flex flex-wrap gap-3 mb-10">
              {response.options.map(opt => (
                <button 
                  key={opt}
                  onClick={() => onAction(opt)}
                  className={`px-8 py-3.5 rounded-2xl border-2 text-[11px] font-black uppercase tracking-[0.2em] transition-all hover:scale-105 active:scale-95 ${isLight ? 'bg-white border-slate-200 hover:border-indigo-400 text-slate-600' : 'bg-indigo-600/10 border-indigo-500/30 text-indigo-100'}`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}

          {response.question && !isLoading && (
            <div className={`mb-12 p-10 md:p-14 rounded-[3rem] border-4 animate-in slide-in-from-bottom-4 shadow-2xl ${isLight ? 'bg-indigo-50/30 border-indigo-100' : 'bg-indigo-900/10 border-indigo-500/20'}`}>
              <div className="flex items-center gap-3 mb-6">
                 <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                 <span className={`text-[10px] font-black uppercase tracking-[0.5em] ${isLight ? 'text-indigo-600' : 'text-indigo-400'}`}>
                    Professional Matrix Challenge
                 </span>
              </div>
              <p className={`text-xl md:text-3xl font-black leading-tight mb-10 ${isLight ? 'text-slate-900' : 'text-white'}`}>{response.question.text}</p>
              {response.question.choices && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {response.question.choices.map(c => (
                    <button 
                      key={c}
                      onClick={() => onAction(c)}
                      className={`text-left p-6 rounded-3xl border-2 text-sm font-bold transition-all hover:scale-[1.02] active:scale-[0.98] ${isLight ? 'bg-white border-slate-100 hover:border-indigo-400 text-slate-700 shadow-sm' : 'bg-white/5 border-white/5 hover:border-indigo-500/50 text-white'}`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="relative group">
            <input 
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              disabled={isLoading}
              placeholder={isLoading ? t.calculating : t.placeholder}
              className={`w-full border-2 rounded-[2rem] py-6 pl-10 pr-24 outline-none transition-all text-lg font-bold shadow-xl ${isLight ? 'bg-white border-slate-100 focus:border-indigo-400 text-slate-900 placeholder-slate-300' : 'bg-white/5 border-white/5 focus:border-indigo-500 text-white placeholder-white/20'}`}
            />
            <button 
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className={`absolute right-4 top-1/2 -translate-y-1/2 w-16 h-16 rounded-[1.5rem] flex items-center justify-center transition-all ${isLoading || !inputValue.trim() ? 'bg-slate-100 text-slate-300' : 'bg-indigo-600 hover:bg-indigo-500 text-white active:scale-90 shadow-lg'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
