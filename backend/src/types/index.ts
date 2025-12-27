export enum QuizType {
  ARITHMETICS = 'arithmetics',
  EQUATIONS = 'equations',
}

export enum DifficultyLevel {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
}

export interface Question {
  id: string;
  type: QuizType;
  difficulty: DifficultyLevel;
  question: string;
  correctAnswer: number;
  options: number[];
  metadata?: {
    operation?: string;
    operands?: number[];
  };
}

export interface Quiz {
  id: string;
  type: QuizType;
  difficulty: DifficultyLevel;
  questions: Question[];
  createdAt: Date;
}

export interface GameSession {
  id: string;
  playerName: string;
  quizType: QuizType;
  difficulty: DifficultyLevel;
  currentQuestionIndex: number;
  score: number;
  streak: number;
  health: number;
  maxHealth: number;
  boosts: BoostType[];
  questionsAnswered: number;
  questionsCorrect: number;
  startTime: Date;
  endTime?: Date;
}

export enum BoostType {
  ERASE_OBSTACLE = 'erase_obstacle',
  DOUBLE_POINTS = 'double_points',
  SHIELD = 'shield',
}

export interface LeaderboardEntry {
  playerName: string;
  score: number;
  questionsCorrect: number;
  questionsAnswered: number;
  accuracy: number;
  quizType: QuizType;
  difficulty: DifficultyLevel;
  completedAt: Date;
}

export interface PlayerStats {
  playerName: string;
  totalGames: number;
  totalQuestionsAnswered: number;
  totalQuestionsCorrect: number;
  overallAccuracy: number;
  bestScore: number;
  longestStreak: number;
  achievements: Achievement[];
  quizTypeStats: Record<QuizType, {
    games: number;
    accuracy: number;
    bestScore: number;
  }>;
  difficultyStats: Record<DifficultyLevel, {
    games: number;
    accuracy: number;
    bestScore: number;
  }>;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  unlockedAt: Date;
}

