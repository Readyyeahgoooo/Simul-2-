
import React from 'react';
import { GameState, Theme } from '../types';
import { translations } from '../i18n';

interface Props {
  gameState: GameState;
  onExport: () => void;
  onReset: () => void;
  onFinish: () => void;
  theme: Theme;
}

export const Sidebar: React.FC<Props> = ({ gameState, onExport, onReset, onFinish, theme }) => {
  const stats = gameState.stats;
  const t = translations[gameState.language];
  const isLight = theme !== 'black';

  const StatBar = ({ label, value, color }: { label: string, value: number, color: string }) => (
    <div className="mb-6">
      <div className="flex justify-between text-[8px] mb-2 font-black uppercase tracking-widest opacity-40">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className={`h-1.5 w-full rounded-full overflow-hidden ${isLight ? 'bg-slate-200' : 'bg-white/5'}`}>
        <div className={`h-full ${color} transition-all duration-1000 shadow-sm`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );

  return (
    <div className={`w-full md:w-72 p-8 flex flex-col gap-10 overflow-y-auto backdrop-blur-3xl transition-all duration-1000 border-r ${isLight ? 'bg-white/40 border-slate-200 text-slate-800' : 'bg-black/40 border-white/5 text-white'}`}>
      <section>
        <h3 className="text-[9px] font-black uppercase tracking-[0.4em] opacity-30 mb-8">{t.liveMatrix}</h3>
        <StatBar label="Intellect" value={stats.knowledge} color="bg-blue-400" />
        <StatBar label="Reputation" value={stats.reputation} color="bg-indigo-400" />
        <StatBar label="Resources" value={stats.resources} color="bg-emerald-400" />
        <StatBar label="Stress" value={stats.stress} color="bg-rose-400" />
      </section>

      <section className="flex-1">
        <h3 className="text-[9px] font-black mb-6 uppercase tracking-[0.4em] opacity-30">{t.skillDeck}</h3>
        <div className="space-y-3">
          {Object.entries(gameState.skills).length === 0 && <p className="text-[9px] opacity-20 italic">Scanning nodes...</p>}
          {Object.entries(gameState.skills).map(([name, data]) => {
            const skillData = data as { level: string; trend: string };
            return (
              <div key={name} className={`p-3.5 rounded-xl border transition-all ${isLight ? 'bg-white border-slate-100 shadow-sm' : 'bg-white/5 border-white/5'}`}>
                <div className="flex justify-between items-center">
                   <p className="text-[10px] font-black">{name}</p>
                   <span className="text-[8px] font-black uppercase tracking-tighter opacity-40">{skillData.level}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="mt-auto flex flex-col gap-3">
        <button onClick={onFinish} className="w-full py-4 text-[9px] font-black bg-indigo-600 text-white rounded-xl transition-all uppercase tracking-[0.2em] shadow-lg hover:bg-indigo-500">
          {t.finish}
        </button>
        <div className="grid grid-cols-2 gap-2">
           <button onClick={onExport} className={`py-2.5 text-[8px] font-black border rounded-xl transition-all uppercase tracking-widest ${isLight ? 'border-slate-200 text-slate-400 hover:bg-slate-50' : 'border-white/10 text-white/30'}`}>
             {t.export}
           </button>
           <button onClick={onReset} className={`py-2.5 text-[8px] font-black border rounded-xl transition-all uppercase tracking-widest ${isLight ? 'border-slate-200 text-slate-400 hover:bg-slate-50' : 'border-white/10 text-white/30'}`}>
             {t.reset}
           </button>
        </div>
      </div>
    </div>
  );
};
