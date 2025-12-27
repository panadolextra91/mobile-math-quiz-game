const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  details?: Array<{ path: string; message: string }>;
}

// Game Session Types
export interface GameSession {
  id: string;
  playerName: string;
  quizType: 'arithmetics' | 'equations';
  difficulty: 'easy' | 'medium' | 'hard';
  currentQuestionIndex: number;
  score: number;
  streak: number;
  health: number;
  maxHealth: number;
  boosts: string[];
  questionsAnswered: number;
  questionsCorrect: number;
  startTime: string;
  endTime?: string;
}

export interface CreateGameSessionRequest {
  playerName: string;
  quizType: 'arithmetics' | 'equations';
  difficulty: 'easy' | 'medium' | 'hard';
}

/**
 * Create a new game session
 */
export async function createGameSession(
  request: CreateGameSessionRequest
): Promise<GameSession> {
  const response = await fetch(`${API_BASE_URL}/game/session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  const result: ApiResponse<GameSession> = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error || 'Failed to create game session');
  }

  return result.data;
}

/**
 * Get game session by ID
 */
export async function getGameSession(sessionId: string): Promise<GameSession> {
  const response = await fetch(`${API_BASE_URL}/game/session/${sessionId}`);

  const result: ApiResponse<GameSession> = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error || 'Failed to get game session');
  }

  return result.data;
}

/**
 * Submit an answer to a question
 */
export interface SubmitAnswerRequest {
  sessionId: string;
  questionId: string;
  answer: number;
  isCorrect: boolean;
}

export interface SubmitAnswerResponse {
  session: GameSession;
  earnedBoost: boolean;
  gameOver: boolean;
}

export async function submitAnswer(
  request: SubmitAnswerRequest
): Promise<SubmitAnswerResponse> {
  const response = await fetch(`${API_BASE_URL}/game/answer`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  const result: ApiResponse<SubmitAnswerResponse> = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error || 'Failed to submit answer');
  }

  return result.data;
}

/**
 * Apply a boost
 */
export interface ApplyBoostRequest {
  sessionId: string;
  boostType: 'erase_obstacle' | 'double_points' | 'shield';
}

export async function applyBoost(
  request: ApplyBoostRequest
): Promise<GameSession> {
  const response = await fetch(`${API_BASE_URL}/game/boost`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  const result: ApiResponse<GameSession> = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error || 'Failed to apply boost');
  }

  return result.data;
}

/**
 * Use erase obstacle boost
 */
export async function useEraseObstacle(sessionId: string): Promise<GameSession> {
  const response = await fetch(`${API_BASE_URL}/game/boost/erase`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sessionId }),
  });

  const result: ApiResponse<GameSession> = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error || 'Failed to use erase obstacle boost');
  }

  return result.data;
}

/**
 * End game session
 */
export async function endGameSession(sessionId: string): Promise<GameSession> {
  const response = await fetch(`${API_BASE_URL}/game/session/${sessionId}/end`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const result: ApiResponse<GameSession> = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error || 'Failed to end game session');
  }

  return result.data;
}

/**
 * Generate quiz questions
 */
export interface GenerateQuizRequest {
  type: 'arithmetics' | 'equations';
  difficulty: 'easy' | 'medium' | 'hard';
  count?: number;
}

export interface Question {
  id: string;
  type: 'arithmetics' | 'equations';
  difficulty: 'easy' | 'medium' | 'hard';
  question: string;
  correctAnswer: number;
  options: number[];
  explanation: string;
  metadata: {
    operation?: string;
    operands?: number[];
  };
}

export interface GenerateQuizResponse {
  questions: Question[];
  count: number;
  type: 'arithmetics' | 'equations';
  difficulty: 'easy' | 'medium' | 'hard';
}

export async function generateQuiz(
  request: GenerateQuizRequest
): Promise<GenerateQuizResponse> {
  const response = await fetch(`${API_BASE_URL}/quiz/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  const result: ApiResponse<GenerateQuizResponse> = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error || 'Failed to generate quiz');
  }

  return result.data;
}

/**
 * Leaderboard Types
 */
export interface LeaderboardEntry {
  playerName: string;
  score: number;
  questionsCorrect: number;
  questionsAnswered: number;
  accuracy: number;
  quizType: 'arithmetics' | 'equations';
  difficulty: 'easy' | 'medium' | 'hard';
  completedAt: string;
}

export interface GetLeaderboardParams {
  limit?: number;
  quizType?: 'arithmetics' | 'equations';
  difficulty?: 'easy' | 'medium' | 'hard';
  timeframe?: 'daily' | 'weekly' | 'all-time';
}

/**
 * Get leaderboard with optional filters
 */
export async function getLeaderboard(
  params: GetLeaderboardParams = {}
): Promise<LeaderboardEntry[]> {
  const queryParams = new URLSearchParams();
  
  if (params.limit !== undefined) {
    queryParams.append('limit', params.limit.toString());
  }
  if (params.quizType) {
    queryParams.append('quizType', params.quizType);
  }
  if (params.difficulty) {
    queryParams.append('difficulty', params.difficulty);
  }
  if (params.timeframe) {
    queryParams.append('timeframe', params.timeframe);
  }

  const url = `${API_BASE_URL}/leaderboard${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await fetch(url);

  const result: ApiResponse<LeaderboardEntry[]> = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error || 'Failed to get leaderboard');
  }

  return result.data;
}

/**
 * Get player's best score
 */
export async function getPlayerBestScore(
  playerName: string
): Promise<LeaderboardEntry | null> {
  const response = await fetch(`${API_BASE_URL}/leaderboard/player/${encodeURIComponent(playerName)}`);

  const result: ApiResponse<LeaderboardEntry | null> = await response.json();

  if (!result.success) {
    throw new Error(result.error || 'Failed to get player best score');
  }

  return result.data || null;
}

/**
 * Get player's rank
 */
export interface GetPlayerRankParams {
  quizType?: 'arithmetics' | 'equations';
  difficulty?: 'easy' | 'medium' | 'hard';
}

export async function getPlayerRank(
  playerName: string,
  params: GetPlayerRankParams = {}
): Promise<number | null> {
  const queryParams = new URLSearchParams();
  
  if (params.quizType) {
    queryParams.append('quizType', params.quizType);
  }
  if (params.difficulty) {
    queryParams.append('difficulty', params.difficulty);
  }

  const url = `${API_BASE_URL}/leaderboard/player/${encodeURIComponent(playerName)}/rank${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await fetch(url);

  const result: ApiResponse<{ rank: number | null }> = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error || 'Failed to get player rank');
  }

  return result.data.rank;
}

/**
 * Player Statistics Types
 */
export interface Achievement {
  id: string;
  name: string;
  description: string;
  unlockedAt: string;
}

export interface QuizTypeStats {
  games: number;
  accuracy: number;
  bestScore: number;
}

export interface DifficultyStats {
  games: number;
  accuracy: number;
  bestScore: number;
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
  quizTypeStats: {
    arithmetics: QuizTypeStats;
    equations: QuizTypeStats;
  };
  difficultyStats: {
    easy: DifficultyStats;
    medium: DifficultyStats;
    hard: DifficultyStats;
  };
}

/**
 * Get player statistics
 */
export async function getPlayerStats(
  playerName: string
): Promise<PlayerStats> {
  const response = await fetch(`${API_BASE_URL}/stats/player/${encodeURIComponent(playerName)}`);

  const result: ApiResponse<PlayerStats> = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error || 'Failed to get player stats');
  }

  return result.data;
}

/**
 * Health check
 */
export interface HealthCheckResponse {
  status: string;
  timestamp: string;
  uptime: number;
}

export async function healthCheck(): Promise<HealthCheckResponse> {
  const response = await fetch(`${API_BASE_URL.replace('/api', '')}/health`);

  if (!response.ok) {
    throw new Error('Health check failed');
  }

  return await response.json();
}
