import { Router } from 'express';
import { z } from 'zod';
import { QuizType, DifficultyLevel } from '../types';
import { leaderboardService } from '../services/leaderboardService';

const router = Router();

const getLeaderboardSchema = z.object({
  limit: z.number().int().min(1).max(1000).optional().default(100),
  quizType: z.nativeEnum(QuizType).optional(),
  difficulty: z.nativeEnum(DifficultyLevel).optional(),
  timeframe: z.enum(['daily', 'weekly', 'all-time']).optional().default('all-time'),
  unique: z.boolean().optional().default(false),
});

router.get('/', async (req, res, next) => {
  try {
    const { limit, quizType, difficulty, timeframe, unique } = getLeaderboardSchema.parse({
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      quizType: req.query.quizType,
      difficulty: req.query.difficulty,
      timeframe: req.query.timeframe,
      unique: req.query.unique === 'true' || req.query.unique === '1',
    });
    
    const leaderboard = await leaderboardService.getLeaderboard(limit, quizType, difficulty, timeframe, unique);
    
    res.json({
      success: true,
      data: leaderboard,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/player/:playerName', async (req, res, next) => {
  try {
    const { playerName } = req.params;
    const bestScore = await leaderboardService.getPlayerBestScore(playerName);
    
    res.json({
      success: true,
      data: bestScore || null,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/player/:playerName/rank', async (req, res, next) => {
  try {
    const { playerName } = req.params;
    const quizType = req.query.quizType as QuizType | undefined;
    const difficulty = req.query.difficulty as DifficultyLevel | undefined;
    
    const rank = await leaderboardService.getPlayerRank(playerName, quizType, difficulty);
    
    res.json({
      success: true,
      data: { rank: rank === -1 ? null : rank },
    });
  } catch (error) {
    next(error);
  }
});

export default router;

