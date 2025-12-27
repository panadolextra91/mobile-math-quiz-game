import { Router } from 'express';
import { z } from 'zod';
import { QuizType, DifficultyLevel } from '../types';
import { questionGenerator } from '../utils/questionGenerator';

const router = Router();

const generateQuizSchema = z.object({
  type: z.nativeEnum(QuizType),
  difficulty: z.nativeEnum(DifficultyLevel),
  count: z.number().int().min(1).max(100).optional().default(20),
});

router.post('/generate', (req, res, next) => {
  try {
    const { type, difficulty, count } = generateQuizSchema.parse(req.body);
    
    const questions = questionGenerator.generateQuiz(type, difficulty, count);
    
    res.json({
      success: true,
      data: {
        questions,
        count: questions.length,
        type,
        difficulty,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;

