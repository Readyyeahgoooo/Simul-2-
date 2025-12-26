
import React, { useState, useEffect, useRef } from 'react';
import { 
  Difficulty, 
  QuestionType, 
  GameMode,
  GameState, 
  SimulationConfig, 
  GameResponse,
  PlayerStats,
  Language,
  Theme
} from './types';
import { GeminiService } from './services/geminiService';
import { INITIAL_STATS } from './constants';
import { SetupForm } from './components/SetupForm';
import { Sidebar } from './components/Sidebar';
import { GameConsole } from './components/GameConsole';
import { AchievementModal } from './components/AchievementModal';
import { SettlementScreen } from './components/SettlementScreen';
import { translations } from './i18n';

// More modern, lighter "Human-designed" themes
const themeConfigs: Record<Theme, string> = {
  black: 'bg-[#0a0a0a] text-[#f5f5f5]',
  sky: 'bg-[#f4f7fb] text-[#1e293b]', // Slate Blue Neutral
  emerald: 'bg-[#f0f9f4] text-[#064e3b]', // Sage Neutral
  amber: 'bg-[#fdf8f4] text-[#451a03]', // Sand Neutral
  zinc: 'bg-[#ffffff] text-[#0f172a]' // Pure Studio
};

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isSetup, setIsSetup] = useState(true);
  const [showSettlement, setShowSettlement] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastResponse, setLastResponse] = useState<GameResponse | null>(null);
  const [currentTheme, setCurrentTheme] = useState<Theme>('zinc');
  const [currentLanguage, setCurrentLanguage] = useState<Language>('en');
  
  const getGemini = () => new GeminiService();
  const t = translations[currentLanguage];

  const handleStart = async (config: SimulationConfig) => {
    setLoading(true);
    setCurrentTheme(config.theme);
    setCurrentLanguage(config.language);
    try {
      const response = await getGemini().startSimulation(config);
      setGameState({
        playerProfile: {
          name: "User",
          role: config.targetLife,
          goal: "Success",
          chapter: 1,
          difficulty: config.difficulty,
          turnCount: 1,
          mode: config.mode,
          character: config.character
        },
        skills: {},
        stats: { ...INITIAL_STATS },
        inventory: [],
        achievements: [],
        history: [{ turn: 1, event: response.event }],
        language: config.language
      });
      setLastResponse(response);
      setIsSetup(false);
      setShowSettlement(false);
    } catch (error: any) {
      if (error?.message?.includes('429')) {
        alert("System limit reached. Please use your Personal Key for uninterrupted simulation.");
        //@ts-ignore
        if (window.aistudio) window.aistudio.openSelectKey();
      } else {
        alert("Sync error. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTurn = async (input: string) => {
    if (!gameState) return;
    setLoading(true);
    try {
      const response = await getGemini().nextTurn(gameState, input);
      const nextTurnCount = gameState.playerProfile.turnCount + 1;
      const nextChapter = Math.floor(nextTurnCount / 10) + 1;
      
      const newStats = { ...gameState.stats };
      if (response.statChanges) {
        Object.keys(response.statChanges).forEach((key) => {
          const k = key as keyof PlayerStats;
          newStats[k] = Math.max(0, Math.min(100, newStats[k] + (response.statChanges![k] || 0)));
        });
      }

      setGameState(prev => {
        if (!prev) return null;
        return {
          ...prev,
          playerProfile: { ...prev.playerProfile, turnCount: nextTurnCount, chapter: nextChapter },
          stats: newStats,
          inventory: response.itemDrop ? [...prev.inventory, { ...response.itemDrop, id: Date.now().toString() }] : prev.inventory,
          achievements: response.achievement ? [...prev.achievements, { ...response.achievement, id: Date.now().toString(), timestamp: new Date().toLocaleTimeString() }] : prev.achievements,
          skills: { ...prev.skills, ...response.skillUpdates },
          history: [...prev.history, { turn: nextTurnCount, event: response.event, choice: input }],
          summary: response.summaryUpdate || prev.summary
        };
      });
      setLastResponse(response);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const isLight = currentTheme !== 'black';
  const borderColor = isLight ? 'border-slate-200' : 'border-white/10';

  if (isSetup) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 vibe-pattern transition-all duration-1000 ${themeConfigs[currentTheme]} ${isLight ? 'vibe-pattern-light' : ''}`}>
        <SetupForm 
          onStart={handleStart} 
          isLoading={loading} 
          onKeySelect={() => window.aistudio?.openSelectKey()} 
          onThemeChange={setCurrentTheme} 
          currentTheme={currentTheme} 
        />
      </div>
    );
  }

  if (showSettlement && gameState) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 vibe-pattern transition-all duration-1000 ${themeConfigs[currentTheme]} ${isLight ? 'vibe-pattern-light' : ''}`}>
        <SettlementScreen 
           gameState={gameState} 
           onRestart={() => setIsSetup(true)} 
           theme={currentTheme}
        />
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col md:flex-row vibe-pattern ${themeConfigs[currentTheme]} ${isLight ? 'vibe-pattern-light' : ''} font-['Space_Grotesk'] overflow-hidden transition-all duration-1000`}>
      <Sidebar 
        gameState={gameState!} 
        onExport={() => {}} 
        onReset={() => setIsSetup(true)}
        onFinish={() => setShowSettlement(true)}
        theme={currentTheme}
      />

      <div className="flex-1 flex flex-col relative h-screen overflow-hidden">
        <header className={`p-4 border-b ${borderColor} flex justify-between items-center ${isLight ? 'bg-white/60' : 'bg-black/20'} backdrop-blur-md z-10 mx-2 mt-2 rounded-xl`}>
          <div>
            <h1 className="text-lg font-bold tracking-tight">{t.title}</h1>
            <p className="text-[9px] font-black uppercase tracking-[0.3em] opacity-40">
               {t.chapter} {gameState?.playerProfile.chapter} • {t.turn} {gameState?.playerProfile.turnCount}
            </p>
          </div>
          <div className="flex gap-4">
            <span className={`text-[8px] border ${borderColor} px-3 py-1 rounded-full bg-indigo-500/5 uppercase font-black tracking-widest text-indigo-600`}>
              {gameState?.playerProfile.mode}
            </span>
          </div>
        </header>

        <GameConsole 
          response={lastResponse!} 
          onAction={handleTurn} 
          isLoading={loading}
          history={gameState?.history || []}
          language={currentLanguage}
          theme={currentTheme}
        />

        {gameState?.achievements.slice(-1).map(ach => (
          <AchievementModal key={ach.id} achievement={ach} />
        ))}
      </div>
    </div>
  );
};

export default App;
