
export enum Difficulty {
  EASY = 'Easy',
  NORMAL = 'Normal',
  HARD = 'Hard',
  EXPERT = 'Expert'
}

export enum QuestionType {
  MULTIPLE_CHOICE = 'Multiple Choice',
  SHORT_ANSWER = 'Short Answer',
  LONG_REASONING = 'Long-form Reasoning'
}

export enum GameMode {
  PRACTICE = 'Practice',
  STORY = 'Story'
}

export type Language = 'en' | 'zh-CN' | 'zh-TW';
export type Theme = 'black' | 'sky' | 'emerald' | 'amber' | 'zinc';

export type CharacterType = 'kid' | 'teen' | 'adult' | 'senior';
export type CharacterGender = 'm' | 'f';

export interface Character {
  type: CharacterType;
  gender: CharacterGender;
}

export interface PlayerStats {
  knowledge: number;
  confidence: number;
  stress: number;
  resources: number;
  reputation: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  effect?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  timestamp: string;
}

export interface GameState {
  playerProfile: {
    name: string;
    role: string;
    goal: string;
    chapter: number;
    difficulty: Difficulty;
    turnCount: number;
    mode: GameMode;
    character: Character;
  };
  skills: Record<string, { level: string; trend: string }>;
  stats: PlayerStats;
  inventory: InventoryItem[];
  achievements: Achievement[];
  history: Array<{
    turn: number;
    event: string;
    choice?: string;
    feedback?: string;
  }>;
  summary?: string;
  language: Language;
}

export interface SimulationConfig {
  targetLife: string;
  timeHorizon: string;
  realism: string;
  skillPacks: string[];
  intensity: string;
  questionTypes: QuestionType[];
  maxEvents: number;
  difficulty: Difficulty;
  pdfs: { name: string; data: string; mimeType: string }[];
  language: Language;
  theme: Theme;
  mode: GameMode;
  character: Character;
}

export interface GameResponse {
  event: string;
  options?: string[];
  question?: {
    text: string;
    type: QuestionType;
    choices?: string[];
  };
  statChanges?: Partial<PlayerStats>;
  skillUpdates?: Record<string, { level: string; trend: string }>;
  itemDrop?: InventoryItem;
  achievement?: Achievement;
  summaryUpdate?: string;
}
