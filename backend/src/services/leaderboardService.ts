import { LeaderboardEntry, QuizType, DifficultyLevel } from '../types';
import { prisma } from '../lib/prisma';

class LeaderboardService {
  private readonly MAX_ENTRIES = 1000;

  /**
   * Add entry to leaderboard
   */
  async addEntry(entry: LeaderboardEntry): Promise<void> {
    await prisma.leaderboardEntry.create({
      data: {
        playerName: entry.playerName,
        score: entry.score,
        questionsCorrect: entry.questionsCorrect,
        questionsAnswered: entry.questionsAnswered,
        accuracy: entry.accuracy,
        quizType: entry.quizType,
        difficulty: entry.difficulty,
        completedAt: entry.completedAt,
      },
    });

    // Clean up old entries if we exceed max
    const count = await prisma.leaderboardEntry.count();
    if (count > this.MAX_ENTRIES) {
      // Delete entries beyond the limit, keeping only top scores
      const entriesToKeep = await prisma.leaderboardEntry.findMany({
        orderBy: { score: 'desc' },
        take: this.MAX_ENTRIES,
        select: { id: true },
      });
      
      const idsToKeep = entriesToKeep.map(e => e.id);
      await prisma.leaderboardEntry.deleteMany({
        where: {
          id: {
            notIn: idsToKeep,
          },
        },
      });
    }
  }

  /**
   * Get leaderboard with filters
   */
  async getLeaderboard(
    limit: number = 100,
    quizType?: QuizType,
    difficulty?: DifficultyLevel,
    timeframe?: 'daily' | 'weekly' | 'all-time'
  ): Promise<LeaderboardEntry[]> {
    const where: any = {};

    // Filter by quiz type
    if (quizType) {
      where.quizType = quizType;
    }

    // Filter by difficulty
    if (difficulty) {
      where.difficulty = difficulty;
    }

    // Filter by timeframe
    if (timeframe && timeframe !== 'all-time') {
      const now = new Date();
      const cutoff = new Date();
      
      if (timeframe === 'daily') {
        cutoff.setHours(0, 0, 0, 0);
      } else if (timeframe === 'weekly') {
        cutoff.setDate(now.getDate() - 7);
      }

      where.completedAt = {
        gte: cutoff,
      };
    }

    const entries = await prisma.leaderboardEntry.findMany({
      where,
      orderBy: { score: 'desc' },
      take: limit,
    });

    return entries.map(this.mapToLeaderboardEntry);
  }

  /**
   * Get player's best score
   */
  async getPlayerBestScore(playerName: string): Promise<LeaderboardEntry | undefined> {
    const entry = await prisma.leaderboardEntry.findFirst({
      where: { playerName },
      orderBy: { score: 'desc' },
    });

    return entry ? this.mapToLeaderboardEntry(entry) : undefined;
  }

  /**
   * Get player's rank
   */
  async getPlayerRank(
    playerName: string,
    quizType?: QuizType,
    difficulty?: DifficultyLevel
  ): Promise<number> {
    const where: any = {};

    if (quizType) {
      where.quizType = quizType;
    }

    if (difficulty) {
      where.difficulty = difficulty;
    }

    // Get all entries sorted by score
    const allEntries = await prisma.leaderboardEntry.findMany({
      where,
      orderBy: { score: 'desc' },
      select: { playerName: true },
    });

    const index = allEntries.findIndex(entry => entry.playerName === playerName);
    return index === -1 ? -1 : index + 1;
  }

  /**
   * Map Prisma model to LeaderboardEntry type
   */
  private mapToLeaderboardEntry(entry: any): LeaderboardEntry {
    return {
      playerName: entry.playerName,
      score: entry.score,
      questionsCorrect: entry.questionsCorrect,
      questionsAnswered: entry.questionsAnswered,
      accuracy: entry.accuracy,
      quizType: entry.quizType as QuizType,
      difficulty: entry.difficulty as DifficultyLevel,
      completedAt: entry.completedAt,
    };
  }
}

export const leaderboardService = new LeaderboardService();
