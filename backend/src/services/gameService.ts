import { GameSession, BoostType, QuizType, DifficultyLevel } from '../types';
import { questionGenerator } from '../utils/questionGenerator';
import { randomUUID } from 'crypto';
import { prisma } from '../lib/prisma';

class GameService {
  private readonly MAX_HEALTH = 3;
  private readonly STREAK_FOR_BOOST = 3;
  private readonly MAX_QUESTIONS = {
    [DifficultyLevel.EASY]: 10,
    [DifficultyLevel.MEDIUM]: 15,
    [DifficultyLevel.HARD]: 20,
  };

  /**
   * Create a new game session
   */
  async createSession(
    playerName: string,
    quizType: QuizType,
    difficulty: DifficultyLevel
  ): Promise<GameSession> {
    const session = await prisma.gameSession.create({
      data: {
        playerName,
        quizType,
        difficulty,
        currentQuestionIndex: 0,
        score: 0,
        streak: 0,
        health: this.MAX_HEALTH,
        maxHealth: this.MAX_HEALTH,
        boosts: [],
        questionsAnswered: 0,
        questionsCorrect: 0,
        startTime: new Date(),
      },
    });

    return this.mapToGameSession(session);
  }

  /**
   * Get game session
   */
  async getSession(sessionId: string): Promise<GameSession | undefined> {
    const session = await prisma.gameSession.findUnique({
      where: { id: sessionId },
    });

    return session ? this.mapToGameSession(session) : undefined;
  }

  /**
   * Submit answer and update game state
   */
  async submitAnswer(
    sessionId: string,
    questionId: string,
    answer: number,
    isCorrect: boolean
  ): Promise<{
    session: GameSession;
    earnedBoost: boolean;
    gameOver: boolean;
  }> {
    const session = await prisma.gameSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      const error = new Error('Session not found') as Error & { statusCode?: number };
      error.statusCode = 404;
      throw error;
    }

    const questionsAnswered = session.questionsAnswered + 1;
    let questionsCorrect = session.questionsCorrect;
    let streak = session.streak;
    let score = session.score;
    let health = session.health;
    let boosts = [...session.boosts];

    if (isCorrect) {
      questionsCorrect++;
      streak++;
      const hasDoublePoints = boosts.includes(BoostType.DOUBLE_POINTS);
      score += this.calculatePoints(session.difficulty as DifficultyLevel, streak, hasDoublePoints);
      
      // Remove double points boost after use
      if (hasDoublePoints) {
        boosts = boosts.filter(b => b !== BoostType.DOUBLE_POINTS);
      }
    } else {
      // Check if shield boost is active
      const hasShield = boosts.includes(BoostType.SHIELD);
      if (!hasShield) {
        health--;
        streak = 0;
      } else {
        // Remove shield after use
        boosts = boosts.filter(b => b !== BoostType.SHIELD);
      }
    }

    const earnedBoost = streak > 0 && streak % this.STREAK_FOR_BOOST === 0;
    const maxQuestions = this.MAX_QUESTIONS[session.difficulty];
    const reachedQuestionLimit = questionsAnswered >= maxQuestions;
    const gameOver = health <= 0 || reachedQuestionLimit;

    const updatedSession = await prisma.gameSession.update({
      where: { id: sessionId },
      data: {
        currentQuestionIndex: session.currentQuestionIndex + 1,
        questionsAnswered,
        questionsCorrect,
        streak,
        score,
        health,
        boosts,
        endTime: gameOver ? new Date() : undefined,
      },
    });

    return {
      session: this.mapToGameSession(updatedSession),
      earnedBoost,
      gameOver,
    };
  }

  /**
   * Apply boost to session
   */
  async applyBoost(sessionId: string, boostType: BoostType): Promise<GameSession> {
    const session = await prisma.gameSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      const error = new Error('Session not found') as Error & { statusCode?: number };
      error.statusCode = 404;
      throw error;
    }

    const boosts = [...session.boosts, boostType];

    const updatedSession = await prisma.gameSession.update({
      where: { id: sessionId },
      data: { boosts },
    });

    return this.mapToGameSession(updatedSession);
  }

  /**
   * Use erase obstacle boost
   */
  async useEraseObstacle(sessionId: string): Promise<GameSession> {
    const session = await prisma.gameSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      const error = new Error('Session not found') as Error & { statusCode?: number };
      error.statusCode = 404;
      throw error;
    }

    const boosts = session.boosts.filter(b => b !== BoostType.ERASE_OBSTACLE);

    const updatedSession = await prisma.gameSession.update({
      where: { id: sessionId },
      data: { boosts },
    });

    return this.mapToGameSession(updatedSession);
  }

  /**
   * Calculate points based on difficulty and streak
   */
  private calculatePoints(
    difficulty: DifficultyLevel,
    streak: number,
    hasDoublePoints: boolean
  ): number {
    const basePoints = {
      [DifficultyLevel.EASY]: 10,
      [DifficultyLevel.MEDIUM]: 20,
      [DifficultyLevel.HARD]: 30,
    };

    const base = basePoints[difficulty];
    const streakMultiplier = Math.min(1 + streak * 0.1, 2); // Max 2x multiplier
    const doublePointsMultiplier = hasDoublePoints ? 2 : 1;
    return Math.floor(base * streakMultiplier * doublePointsMultiplier);
  }

  /**
   * End game session
   */
  async endSession(sessionId: string): Promise<GameSession | undefined> {
    const session = await prisma.gameSession.update({
      where: { id: sessionId },
      data: { endTime: new Date() },
    });

    return this.mapToGameSession(session);
  }

  /**
   * Clean up old sessions (older than 1 hour)
   */
  async cleanupOldSessions(): Promise<void> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    await prisma.gameSession.deleteMany({
      where: {
        startTime: {
          lt: oneHourAgo,
        },
      },
    });
  }

  /**
   * Map Prisma model to GameSession type
   */
  private mapToGameSession(session: any): GameSession {
    return {
      id: session.id,
      playerName: session.playerName,
      quizType: session.quizType as QuizType,
      difficulty: session.difficulty as DifficultyLevel,
      currentQuestionIndex: session.currentQuestionIndex,
      score: session.score,
      streak: session.streak,
      health: session.health,
      maxHealth: session.maxHealth,
      boosts: session.boosts as BoostType[],
      questionsAnswered: session.questionsAnswered,
      questionsCorrect: session.questionsCorrect,
      startTime: session.startTime,
      endTime: session.endTime || undefined,
    };
  }
}

export const gameService = new GameService();
