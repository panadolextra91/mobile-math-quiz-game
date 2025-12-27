import { PlayerStats, Achievement, QuizType, DifficultyLevel } from '../types';
import { GameSession } from '../types';
import { prisma } from '../lib/prisma';

class StatsService {
  /**
   * Update player stats after game completion
   */
  async updateStats(session: GameSession): Promise<PlayerStats> {
    // Get or create player stats
    let playerStat = await prisma.playerStat.findUnique({
      where: { playerName: session.playerName },
      include: {
        achievements: true,
        quizTypeStats: true,
        difficultyStats: true,
      },
    });

    if (!playerStat) {
      playerStat = await prisma.playerStat.create({
        data: {
          playerName: session.playerName,
          totalGames: 0,
          totalQuestionsAnswered: 0,
          totalQuestionsCorrect: 0,
          overallAccuracy: 0,
          bestScore: 0,
          longestStreak: 0,
        },
        include: {
          achievements: true,
          quizTypeStats: true,
          difficultyStats: true,
        },
      });
    }

    // Update overall stats
    const totalGames = playerStat.totalGames + 1;
    const totalQuestionsAnswered = playerStat.totalQuestionsAnswered + session.questionsAnswered;
    const totalQuestionsCorrect = playerStat.totalQuestionsCorrect + session.questionsCorrect;
    const overallAccuracy = totalQuestionsCorrect / totalQuestionsAnswered;
    const bestScore = Math.max(playerStat.bestScore, session.score);
    const longestStreak = Math.max(playerStat.longestStreak, session.streak);

    // Update or create quiz type stats
    let quizTypeStat = playerStat.quizTypeStats.find(s => s.quizType === session.quizType);
    if (!quizTypeStat) {
      quizTypeStat = await prisma.quizTypeStat.create({
        data: {
          playerStatId: playerStat.id,
          quizType: session.quizType,
          games: 0,
          accuracy: 0,
          bestScore: 0,
        },
      });
    }

    const typeGames = quizTypeStat.games + 1;
    const typeAccuracy = session.questionsCorrect / session.questionsAnswered;
    const typeOverallAccuracy = (quizTypeStat.accuracy * quizTypeStat.games + typeAccuracy) / typeGames;
    const typeBestScore = Math.max(quizTypeStat.bestScore, session.score);

    await prisma.quizTypeStat.update({
      where: { id: quizTypeStat.id },
      data: {
        games: typeGames,
        accuracy: typeOverallAccuracy,
        bestScore: typeBestScore,
      },
    });

    // Update or create difficulty stats
    let difficultyStat = playerStat.difficultyStats.find(s => s.difficulty === session.difficulty);
    if (!difficultyStat) {
      difficultyStat = await prisma.difficultyStat.create({
        data: {
          playerStatId: playerStat.id,
          difficulty: session.difficulty,
          games: 0,
          accuracy: 0,
          bestScore: 0,
        },
      });
    }

    const diffGames = difficultyStat.games + 1;
    const diffAccuracy = session.questionsCorrect / session.questionsAnswered;
    const diffOverallAccuracy = (difficultyStat.accuracy * difficultyStat.games + diffAccuracy) / diffGames;
    const diffBestScore = Math.max(difficultyStat.bestScore, session.score);

    await prisma.difficultyStat.update({
      where: { id: difficultyStat.id },
      data: {
        games: diffGames,
        accuracy: diffOverallAccuracy,
        bestScore: diffBestScore,
      },
    });

    // Update player stat
    const updatedStat = await prisma.playerStat.update({
      where: { id: playerStat.id },
      data: {
        totalGames,
        totalQuestionsAnswered,
        totalQuestionsCorrect,
        overallAccuracy,
        bestScore,
        longestStreak,
      },
      include: {
        achievements: true,
        quizTypeStats: true,
        difficultyStats: true,
      },
    });

    // Check and unlock achievements
    const newAchievements = await this.checkAchievements(updatedStat, session);
    const stats = this.mapToPlayerStats(updatedStat);

    return stats;
  }

  /**
   * Get player stats
   */
  async getStats(playerName: string): Promise<PlayerStats | undefined> {
    const playerStat = await prisma.playerStat.findUnique({
      where: { playerName },
      include: {
        achievements: true,
        quizTypeStats: true,
        difficultyStats: true,
      },
    });

    return playerStat ? this.mapToPlayerStats(playerStat) : undefined;
  }

  /**
   * Check for new achievements
   */
  private async checkAchievements(playerStat: any, session: GameSession): Promise<Achievement[]> {
    const existingIds = new Set(playerStat.achievements.map((a: any) => a.achievementId));
    const newAchievements: Achievement[] = [];

    // Achievement definitions
    const achievementChecks = [
      {
        id: 'first_game',
        name: 'First Steps',
        description: 'Complete your first game',
        check: () => playerStat.totalGames === 1,
      },
      {
        id: 'perfect_game',
        name: 'Perfect Score',
        description: 'Answer all questions correctly in a game',
        check: () => session.questionsCorrect === session.questionsAnswered && session.questionsAnswered > 0,
      },
      {
        id: 'score_100',
        name: 'Century Club',
        description: 'Score 100 points in a single game',
        check: () => session.score >= 100,
      },
      {
        id: 'score_500',
        name: 'Half Grand',
        description: 'Score 500 points in a single game',
        check: () => session.score >= 500,
      },
      {
        id: 'score_1000',
        name: 'Grand Master',
        description: 'Score 1000 points in a single game',
        check: () => session.score >= 1000,
      },
      {
        id: 'streak_10',
        name: 'On Fire',
        description: 'Get a streak of 10 correct answers',
        check: () => session.streak >= 10,
      },
      {
        id: 'accuracy_90',
        name: 'Sharp Mind',
        description: 'Achieve 90% accuracy in a game',
        check: () => {
          const accuracy = session.questionsCorrect / session.questionsAnswered;
          return accuracy >= 0.9 && session.questionsAnswered >= 10;
        },
      },
      {
        id: 'games_10',
        name: 'Dedicated',
        description: 'Complete 10 games',
        check: () => playerStat.totalGames >= 10,
      },
      {
        id: 'games_50',
        name: 'Veteran',
        description: 'Complete 50 games',
        check: () => playerStat.totalGames >= 50,
      },
      {
        id: 'questions_100',
        name: 'Centurion',
        description: 'Answer 100 questions total',
        check: () => playerStat.totalQuestionsAnswered >= 100,
      },
      {
        id: 'hard_mode',
        name: 'Hard Mode Champion',
        description: 'Complete a game on hard difficulty',
        check: () => session.difficulty === DifficultyLevel.HARD && session.questionsAnswered > 0,
      },
    ];

    for (const achievement of achievementChecks) {
      if (!existingIds.has(achievement.id) && achievement.check()) {
        await prisma.achievement.create({
          data: {
            playerStatId: playerStat.id,
            achievementId: achievement.id,
            name: achievement.name,
            description: achievement.description,
            unlockedAt: new Date(),
          },
        });

        newAchievements.push({
          id: achievement.id,
          name: achievement.name,
          description: achievement.description,
          unlockedAt: new Date(),
        });
      }
    }

    return newAchievements;
  }

  /**
   * Map Prisma model to PlayerStats type
   */
  private mapToPlayerStats(playerStat: any): PlayerStats {
    const quizTypeStats: Record<QuizType, { games: number; accuracy: number; bestScore: number }> = {
      [QuizType.ARITHMETICS]: { games: 0, accuracy: 0, bestScore: 0 },
      [QuizType.EQUATIONS]: { games: 0, accuracy: 0, bestScore: 0 },
    };

    const difficultyStats: Record<DifficultyLevel, { games: number; accuracy: number; bestScore: number }> = {
      [DifficultyLevel.EASY]: { games: 0, accuracy: 0, bestScore: 0 },
      [DifficultyLevel.MEDIUM]: { games: 0, accuracy: 0, bestScore: 0 },
      [DifficultyLevel.HARD]: { games: 0, accuracy: 0, bestScore: 0 },
    };

    // Populate quiz type stats
    for (const stat of playerStat.quizTypeStats) {
      quizTypeStats[stat.quizType as QuizType] = {
        games: stat.games,
        accuracy: stat.accuracy,
        bestScore: stat.bestScore,
      };
    }

    // Populate difficulty stats
    for (const stat of playerStat.difficultyStats) {
      difficultyStats[stat.difficulty as DifficultyLevel] = {
        games: stat.games,
        accuracy: stat.accuracy,
        bestScore: stat.bestScore,
      };
    }

    return {
      playerName: playerStat.playerName,
      totalGames: playerStat.totalGames,
      totalQuestionsAnswered: playerStat.totalQuestionsAnswered,
      totalQuestionsCorrect: playerStat.totalQuestionsCorrect,
      overallAccuracy: playerStat.overallAccuracy,
      bestScore: playerStat.bestScore,
      longestStreak: playerStat.longestStreak,
      achievements: playerStat.achievements.map((a: any) => ({
        id: a.achievementId,
        name: a.name,
        description: a.description,
        unlockedAt: a.unlockedAt,
      })),
      quizTypeStats,
      difficultyStats,
    };
  }
}

export const statsService = new StatsService();
