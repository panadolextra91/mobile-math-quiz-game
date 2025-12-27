import { create } from 'zustand';
import { GameSession } from '@/services/api';

interface GameSessionState {
  session: GameSession | null;
  setSession: (session: GameSession | null) => void;
  updateSession: (updates: Partial<GameSession>) => void;
  resetSession: () => void;
}

export const useGameSessionStore = create<GameSessionState>((set) => ({
  session: null,
  setSession: (session) => set({ session }),
  updateSession: (updates) =>
    set((state) => ({
      session: state.session ? { ...state.session, ...updates } : null,
    })),
  resetSession: () => set({ session: null }),
}));

