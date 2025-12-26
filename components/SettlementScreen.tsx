
import React from 'react';
import { GameState, Theme, Difficulty } from '../types';
import { translations } from '../i18n';

interface Props {
  gameState: GameState;
  onRestart: () => void;
  theme: Theme;
}

export const SettlementScreen: React.FC<Props> = ({ gameState, onRestart, theme }) => {
  const t = translations[gameState.language].settlement;
  const isLight = theme !== 'black';
  const { stats, playerProfile } = gameState;

  const diffMultiplier = {
    [Difficulty.EASY]: 0.7,
    [Difficulty.NORMAL]: 1.0,
    [Difficulty.HARD]: 1.4,
    [Difficulty.EXPERT]: 2.0
  }[playerProfile.difficulty];

  const rawScore = (stats.knowledge * 1.5 + stats.reputation * 1.2 + stats.resources * 1.0) - (stats.stress * 0.5);
  const finalScore = rawScore * diffMultiplier;

  let grade: 'S' | 'A' | 'B' | 'C' | 'D' = 'D';
  if (finalScore > 250) grade = 'S';
  else if (finalScore > 180) grade = 'A';
  else if (finalScore > 120) grade = 'B';
  else if (finalScore > 70) grade = 'C';

  return (
    <div className={`w-full max-w-lg p-12 rounded-[2.5rem] border shadow-2xl animate-in zoom-in duration-500 ${isLight ? 'bg-white text-slate-900 border-slate-200' : 'bg-black text-white border-white/10'}`}>
      <div className="text-center mb-10">
        <h2 className="text-[9px] font-black uppercase tracking-[0.5em] opacity-30 mb-2">{t.title}</h2>
        <h1 className="text-2xl font-black tracking-tight">{playerProfile.role}</h1>
        <p className="text-[10px] opacity-40 mt-1 uppercase tracking-widest">{playerProfile.difficulty} Synchronized</p>
      </div>

      <div className="flex justify-center mb-12">
        <div className="relative group">
           <div className="w-36 h-36 rounded-full border-4 border-indigo-500/10 flex items-center justify-center transition-transform group-hover:scale-110">
              <span className="text-8xl font-black text-indigo-600 italic drop-shadow-2xl">{grade}</span>
           </div>
           <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-5 py-1.5 bg-indigo-600 text-white text-[9px] font-black rounded-full shadow-lg">
              {t.grade}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-10">
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
           <span className="text-[8px] font-bold opacity-40 uppercase block mb-1">{t.intellect}</span>
           <span className="text-lg font-black">{stats.knowledge}%</span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
           <span className="text-[8px] font-bold opacity-40 uppercase block mb-1">{t.reputation}</span>
           <span className="text-lg font-black">{stats.reputation}%</span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
           <span className="text-[8px] font-bold opacity-40 uppercase block mb-1">{t.resources}</span>
           <span className="text-lg font-black">{stats.resources}%</span>
        </div>
      </div>

      <div className="text-center mb-12 italic text-sm text-slate-500 leading-relaxed px-4">
        "{t.sentences[grade]}"
      </div>

      <button 
        onClick={onRestart}
        className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl transition-all shadow-xl uppercase tracking-[0.3em] text-[10px]"
      >
        {t.restart}
      </button>
    </div>
  );
};
