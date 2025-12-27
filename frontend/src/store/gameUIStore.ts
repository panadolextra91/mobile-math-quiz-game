import { create } from 'zustand';

interface GameUIState {
  // Game state
  isGameOver: boolean;
  showDeathAnimation: boolean;
  showEndGameBoard: boolean;
  endGameTitle: string;
  
  // Animation state
  isAttacking: boolean;
  isHurt: boolean;
  
  // Settings state
  showSettings: boolean;
  musicEnabled: boolean;
  soundEnabled: boolean;
  language: 'english' | 'vietnamese';
  
  // Actions
  setIsGameOver: (isGameOver: boolean) => void;
  setShowDeathAnimation: (show: boolean) => void;
  setShowEndGameBoard: (show: boolean) => void;
  setEndGameTitle: (title: string) => void;
  setIsAttacking: (isAttacking: boolean) => void;
  setIsHurt: (isHurt: boolean) => void;
  setShowSettings: (show: boolean) => void;
  setMusicEnabled: (enabled: boolean) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setLanguage: (language: 'english' | 'vietnamese') => void;
  resetGameUI: () => void;
}

const initialState = {
  isGameOver: false,
  showDeathAnimation: false,
  showEndGameBoard: false,
  endGameTitle: 'Game Over',
  isAttacking: false,
  isHurt: false,
  showSettings: false,
  musicEnabled: true,
  soundEnabled: true,
  language: 'english' as const,
};

export const useGameUIStore = create<GameUIState>((set) => ({
  ...initialState,
  setIsGameOver: (isGameOver) => set({ isGameOver }),
  setShowDeathAnimation: (show) => set({ showDeathAnimation: show }),
  setShowEndGameBoard: (show) => set({ showEndGameBoard: show }),
  setEndGameTitle: (title) => set({ endGameTitle: title }),
  setIsAttacking: (isAttacking) => set({ isAttacking }),
  setIsHurt: (isHurt) => set({ isHurt }),
  setShowSettings: (show) => set({ showSettings: show }),
  setMusicEnabled: (enabled) => set({ musicEnabled: enabled }),
  setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
  setLanguage: (language) => set({ language }),
  resetGameUI: () => set(initialState),
}));

