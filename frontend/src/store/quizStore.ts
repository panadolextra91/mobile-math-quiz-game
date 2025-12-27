import { create } from 'zustand';
import { Question } from '@/services/api';

interface QuizState {
  currentQuestion: Question | null;
  isAnswering: boolean;
  questionGenerated: boolean;
  lastQuestionObstacleId: string | null;
  
  // Actions
  setCurrentQuestion: (question: Question | null) => void;
  setIsAnswering: (isAnswering: boolean) => void;
  setQuestionGenerated: (generated: boolean) => void;
  setLastQuestionObstacleId: (id: string | null) => void;
  resetQuiz: () => void;
}

const initialState = {
  currentQuestion: null,
  isAnswering: false,
  questionGenerated: false,
  lastQuestionObstacleId: null,
};

export const useQuizStore = create<QuizState>((set) => ({
  ...initialState,
  setCurrentQuestion: (question) => set({ currentQuestion: question }),
  setIsAnswering: (isAnswering) => set({ isAnswering }),
  setQuestionGenerated: (generated) => set({ questionGenerated: generated }),
  setLastQuestionObstacleId: (id) => set({ lastQuestionObstacleId: id }),
  resetQuiz: () => set(initialState),
}));

