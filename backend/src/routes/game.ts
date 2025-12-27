import { Router } from 'express';
import { z } from 'zod';
import { QuizType, DifficultyLevel, BoostType } from '../types';
import { gameService } from '../services/gameService';
import { leaderboardService } from '../services/leaderboardService';
import { statsService } from '../services/statsService';

const router = Router();

const createSessionSchema = z.object({
  playerName: z.string().min(1).max(50),
  quizType: z.nativeEnum(QuizType),
  difficulty: z.nativeEnum(DifficultyLevel),
});

const submitAnswerSchema = z.object({
  sessionId: z.string().uuid(),
  questionId: z.string().uuid(),
  answer: z.number(),
  isCorrect: z.boolean(),
});

const applyBoostSchema = z.object({
  sessionId: z.string().uuid(),
  boostType: z.nativeEnum(BoostType),
});

// Create new game session
router.post('/session', async (req, res, next) => {
  try {
    const { playerName, quizType, difficulty } = createSessionSchema.parse(req.body);
    
    const session = await gameService.createSession(playerName, quizType, difficulty);
    
    res.json({
      success: true,
      data: session,
    });
  } catch (error) {
    next(error);
  }
});

// Get game session
router.get('/session/:sessionId', async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const session = await gameService.getSession(sessionId);
    
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found',
      });
    }
    
    res.json({
      success: true,
      data: session,
    });
  } catch (error) {
    next(error);
  }
});

// Submit answer
router.post('/answer', async (req, res, next) => {
  try {
    const { sessionId, questionId, answer, isCorrect } = submitAnswerSchema.parse(req.body);
    
    const result = await gameService.submitAnswer(sessionId, questionId, answer, isCorrect);
    
    // If game over, update leaderboard and stats
    if (result.gameOver) {
      const session = result.session;
      const accuracy = session.questionsCorrect / session.questionsAnswered;
      
      await leaderboardService.addEntry({
        playerName: session.playerName,
        score: session.score,
        questionsCorrect: session.questionsCorrect,
        questionsAnswered: session.questionsAnswered,
        accuracy,
        quizType: session.quizType,
        difficulty: session.difficulty,
        completedAt: session.endTime || new Date(),
      });
      
      await statsService.updateStats(session);
    }
    
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

// Apply boost
router.post('/boost', async (req, res, next) => {
  try {
    const { sessionId, boostType } = applyBoostSchema.parse(req.body);
    
    const session = await gameService.applyBoost(sessionId, boostType);
    
    res.json({
      success: true,
      data: session,
    });
  } catch (error) {
    next(error);
  }
});

// Use erase obstacle boost
router.post('/boost/erase', async (req, res, next) => {
  try {
    const { sessionId } = z.object({
      sessionId: z.string().uuid(),
    }).parse(req.body);
    
    const session = await gameService.useEraseObstacle(sessionId);
    
    res.json({
      success: true,
      data: session,
    });
  } catch (error) {
    next(error);
  }
});

// End game session
router.post('/session/:sessionId/end', async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const session = await gameService.endSession(sessionId);
    
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found',
      });
    }
    
    // Update leaderboard and stats
    const accuracy = session.questionsCorrect / session.questionsAnswered;
    
    await leaderboardService.addEntry({
      playerName: session.playerName,
      score: session.score,
      questionsCorrect: session.questionsCorrect,
      questionsAnswered: session.questionsAnswered,
      accuracy,
      quizType: session.quizType,
      difficulty: session.difficulty,
      completedAt: session.endTime || new Date(),
    });
    
    await statsService.updateStats(session);
    
    res.json({
      success: true,
      data: session,
    });
  } catch (error) {
    next(error);
  }
});

export default router;

