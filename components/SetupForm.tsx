
import React, { useState } from 'react';
import { Difficulty, QuestionType, GameMode, SimulationConfig, Language, Theme, Character } from '../types';
import { translations } from '../i18n';

interface Props {
  onStart: (config: SimulationConfig) => void;
  isLoading: boolean;
  onKeySelect: () => void;
  onThemeChange: (theme: Theme) => void;
  currentTheme: Theme;
}

const characterOptions: Character[] = [
  { gender: 'm', type: 'kid' }, { gender: 'f', type: 'kid' },
  { gender: 'm', type: 'teen' }, { gender: 'f', type: 'teen' },
  { gender: 'm', type: 'adult' }, { gender: 'f', type: 'adult' },
  { gender: 'm', type: 'senior' }, { gender: 'f', type: 'senior' },
];

const getCharIcon = (char: Character) => {
  const base = char.gender === 'm' ? '👦' : '👧';
  if (char.type === 'kid') return base;
  if (char.type === 'teen') return char.gender === 'm' ? '👨‍🎓' : '👩‍🎓';
  if (char.type === 'adult') return char.gender === 'm' ? '👨‍💼' : '👩‍💼';
  return char.gender === 'm' ? '👴' : '👵';
};

export const SetupForm: React.FC<Props> = ({ onStart, isLoading, onKeySelect, onThemeChange, currentTheme }) => {
  const [lang, setLang] = useState<Language>('en');
  const t = translations[lang];
  const isLight = currentTheme !== 'black';

  const [config, setConfig] = useState<SimulationConfig>({
    targetLife: 'Senior Counsel',
    timeHorizon: 'Full Career',
    realism: 'Realistic',
    skillPacks: ['General Knowledge'],
    intensity: 'Balanced',
    questionTypes: [QuestionType.MULTIPLE_CHOICE],
    maxEvents: 100,
    difficulty: Difficulty.NORMAL,
    pdfs: [],
    language: 'en',
    theme: 'zinc',
    mode: GameMode.STORY,
    character: characterOptions[4]
  });

  const handleLangChange = (newLang: Language) => {
    setLang(newLang);
    setConfig(prev => ({ ...prev, language: newLang }));
  };

  const toggleQuestionType = (type: QuestionType) => {
    setConfig(prev => {
      const qTypes = prev.questionTypes.includes(type)
        ? prev.questionTypes.filter(t => t !== type)
        : [...prev.questionTypes, type];
      return { ...prev, questionTypes: qTypes.length > 0 ? qTypes : [QuestionType.MULTIPLE_CHOICE] };
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newPdfs: any[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      const p = new Promise((resolve) => {
        reader.onload = (event) => {
          const base64 = (event.target?.result as string).split(',')[1];
          resolve({ name: file.name, data: base64, mimeType: file.type });
        };
        reader.readAsDataURL(file);
      });
      newPdfs.push(await p);
    }
    setConfig(prev => ({ ...prev, pdfs: newPdfs }));
  };

  return (
    <div className={`w-full max-w-3xl p-8 md:p-14 rounded-[3rem] border shadow-2xl transition-all overflow-y-auto max-h-[90vh] ${isLight ? 'bg-white/95 border-slate-100 text-slate-800' : 'bg-[#111] border-white/5 text-white'}`}>
      <div className="flex flex-col md:flex-row justify-between items-start mb-12 gap-8">
        <div>
          <h1 className="text-4xl font-black tracking-tighter mb-1">{t.title}</h1>
          <p className={`text-sm font-bold opacity-60`}>{t.tagline}</p>
        </div>
        <div className="flex flex-col gap-5 items-end">
           <div className={`flex p-1 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-100 shadow-sm' : 'bg-white/5 border-white/10'}`}>
              {(['en', 'zh-CN', 'zh-TW'] as Language[]).map(l => (
                <button 
                  key={l}
                  onClick={() => handleLangChange(l)}
                  className={`px-4 py-2 text-[10px] font-black rounded-xl transition-all ${lang === l ? 'bg-indigo-600 text-white shadow-lg' : 'opacity-40 hover:opacity-100'}`}
                >
                  {l === 'en' ? 'EN' : l === 'zh-CN' ? '简体' : '繁體'}
                </button>
              ))}
           </div>
           <button onClick={onKeySelect} className={`text-[9px] font-black uppercase tracking-[0.2em] opacity-30 hover:opacity-100 transition-opacity`}>
             ⚡ {t.personalKey}
           </button>
        </div>
      </div>

      <div className="space-y-12">
        <section>
          <label className="block text-[10px] font-black uppercase tracking-[0.3em] mb-6 opacity-30">{t.avatar}</label>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
            {characterOptions.map((char, idx) => (
              <button 
                key={idx}
                onClick={() => setConfig({...config, character: char})}
                className={`aspect-square flex items-center justify-center text-3xl rounded-3xl border-2 transition-all hover:scale-105 active:scale-95 ${config.character === char ? 'border-indigo-500 bg-indigo-500/10 shadow-[0_0_20px_rgba(99,102,241,0.2)]' : isLight ? 'border-slate-50 bg-slate-50' : 'border-white/5 bg-white/5'}`}
              >
                {getCharIcon(char)}
              </button>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-[0.3em] mb-4 opacity-30">{t.mode}</label>
            <div className="grid grid-cols-2 gap-3">
               <button onClick={() => setConfig({...config, mode: GameMode.PRACTICE})} className={`py-4 rounded-2xl border-2 text-xs font-black transition-all ${config.mode === GameMode.PRACTICE ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' : isLight ? 'bg-slate-50 border-slate-100' : 'bg-white/5 border-white/5'}`}>
                 {t.modes.practice}
               </button>
               <button onClick={() => setConfig({...config, mode: GameMode.STORY})} className={`py-4 rounded-2xl border-2 text-xs font-black transition-all ${config.mode === GameMode.STORY ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' : isLight ? 'bg-slate-50 border-slate-100' : 'bg-white/5 border-white/5'}`}>
                 {t.modes.story}
               </button>
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-[0.3em] mb-4 opacity-30">{t.difficulty}</label>
            <select value={config.difficulty} onChange={e => setConfig({ ...config, difficulty: e.target.value as Difficulty })} className={`w-full py-4 px-4 rounded-2xl border-2 font-black text-sm outline-none transition-all ${isLight ? 'bg-slate-50 border-slate-100 focus:border-indigo-300' : 'bg-white/5 border-white/5 focus:border-indigo-500'}`}>
              {Object.values(Difficulty).map(d => <option key={d} value={d} className="bg-slate-900 text-white">{d}</option>)}
            </select>
          </div>
        </section>

        <section>
          <label className="block text-[10px] font-black uppercase tracking-[0.3em] mb-4 opacity-30">{t.targetPath}</label>
          <input 
            type="text" 
            value={config.targetLife}
            onChange={e => setConfig({ ...config, targetLife: e.target.value })}
            className={`w-full py-5 px-8 rounded-3xl border-2 text-lg font-black outline-none transition-all ${isLight ? 'bg-slate-50 border-slate-100 focus:border-indigo-300 focus:bg-white' : 'bg-white/5 border-white/5 focus:border-indigo-500 focus:bg-white/10'}`}
          />
        </section>

        <section>
          <label className="block text-[10px] font-black uppercase tracking-[0.3em] mb-4 opacity-30">{t.questionTypes}</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
             <button onClick={() => toggleQuestionType(QuestionType.MULTIPLE_CHOICE)} className={`py-3 px-4 rounded-xl border-2 text-[10px] font-black transition-all ${config.questionTypes.includes(QuestionType.MULTIPLE_CHOICE) ? 'bg-indigo-600/10 border-indigo-500 text-indigo-600' : isLight ? 'bg-slate-50 border-slate-100 opacity-40' : 'bg-white/5 border-white/5 opacity-40'}`}>
               {t.qTypes.mc}
             </button>
             <button onClick={() => toggleQuestionType(QuestionType.SHORT_ANSWER)} className={`py-3 px-4 rounded-xl border-2 text-[10px] font-black transition-all ${config.questionTypes.includes(QuestionType.SHORT_ANSWER) ? 'bg-indigo-600/10 border-indigo-500 text-indigo-600' : isLight ? 'bg-slate-50 border-slate-100 opacity-40' : 'bg-white/5 border-white/5 opacity-40'}`}>
               {t.qTypes.short}
             </button>
             <button onClick={() => toggleQuestionType(QuestionType.LONG_REASONING)} className={`py-3 px-4 rounded-xl border-2 text-[10px] font-black transition-all ${config.questionTypes.includes(QuestionType.LONG_REASONING) ? 'bg-indigo-600/10 border-indigo-500 text-indigo-600' : isLight ? 'bg-slate-50 border-slate-100 opacity-40' : 'bg-white/5 border-white/5 opacity-40'}`}>
               {t.qTypes.long}
             </button>
          </div>
        </section>

        <section>
          <label className="block text-[10px] font-black uppercase tracking-[0.3em] mb-4 opacity-30">{t.theme}</label>
          <div className="flex flex-wrap gap-3">
            {(Object.keys(translations.en.themes) as Theme[]).map(k => (
              <button 
                key={k}
                onClick={() => { onThemeChange(k); setConfig({...config, theme: k}); }}
                className={`px-5 py-3 rounded-2xl border-2 text-[10px] font-black uppercase transition-all ${config.theme === k ? 'border-indigo-500 bg-indigo-500/10' : isLight ? 'border-slate-100 opacity-40' : 'border-white/5 opacity-40'}`}
              >
                {(t.themes as any)[k]}
              </button>
            ))}
          </div>
        </section>

        <section>
          <label className="block text-[10px] font-black uppercase tracking-[0.3em] mb-4 opacity-30">
            {t.pdfUpload} <span className="lowercase font-medium">{t.optional}</span>
          </label>
          <div className="relative group overflow-hidden rounded-3xl border-2 border-dashed border-slate-200 p-8 flex flex-col items-center justify-center transition-all hover:border-indigo-300">
            <input 
              type="file" 
              multiple 
              accept=".pdf" 
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer z-10" 
            />
            <div className="text-center">
               <p className="text-xs font-black uppercase tracking-widest text-indigo-500 mb-2">{t.selectPdfs}</p>
               {config.pdfs.length > 0 ? (
                 <p className="text-[10px] font-bold opacity-60 text-emerald-600">{config.pdfs.length} {t.filesSelected}</p>
               ) : (
                 <p className="text-[10px] font-bold opacity-30">Supports .pdf documents</p>
               )}
            </div>
          </div>
        </section>
      </div>

      <div className="pt-16 mt-8">
        <button 
          onClick={() => onStart(config)}
          disabled={isLoading}
          className="w-full py-6 bg-indigo-600 hover:bg-indigo-500 text-white text-lg font-black rounded-3xl transition-all shadow-2xl active:scale-95 disabled:opacity-50"
        >
          {isLoading ? t.provisioning : t.begin}
        </button>
      </div>
    </div>
  );
};
