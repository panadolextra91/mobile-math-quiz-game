import { Question, QuizType, DifficultyLevel } from '../types';
import { randomUUID } from 'crypto';

interface QuestionCache {
  questions: Map<string, Question>;
  coverage: Map<string, Set<string>>;
  distribution: Map<string, number>;
}

class QuestionGenerator {
  private cache: QuestionCache = {
    questions: new Map(),
    coverage: new Map(),
    distribution: new Map(),
  };

  private maxRetries = 10;
  private distributionThreshold = 0.1; // Max 10% of questions should be identical patterns

  /**
   * Generate a single question based on type and difficulty
   */
  generateQuestion(
    type: QuizType,
    difficulty: DifficultyLevel,
    excludeIds: string[] = []
  ): Question {
    let attempts = 0;
    let question: Question | null = null;

    while (attempts < this.maxRetries && !question) {
      const candidate = this.createQuestion(type, difficulty);
      const questionKey = this.getQuestionKey(candidate);

      // Deduplication check
      if (this.isDuplicate(candidate, excludeIds)) {
        attempts++;
        continue;
      }

      // Distribution control
      if (!this.checkDistribution(questionKey, type, difficulty)) {
        attempts++;
        continue;
      }

      // Mode collapse prevention
      if (this.isModeCollapsed(questionKey, type, difficulty)) {
        attempts++;
        continue;
      }

      question = candidate;
      this.updateCache(question, type, difficulty);
    }

    if (!question) {
      // Fallback: generate a simple question if all retries fail
      question = this.createFallbackQuestion(type, difficulty);
    }

    return question;
  }

  /**
   * Generate multiple questions for a quiz
   */
  generateQuiz(
    type: QuizType,
    difficulty: DifficultyLevel,
    count: number
  ): Question[] {
    const questions: Question[] = [];
    const excludeIds: string[] = [];

    for (let i = 0; i < count; i++) {
      const question = this.generateQuestion(type, difficulty, excludeIds);
      questions.push(question);
      excludeIds.push(question.id);
    }

    return questions;
  }

  /**
   * Create a question based on type and difficulty
   */
  private createQuestion(
    type: QuizType,
    difficulty: DifficultyLevel
  ): Question {
    if (type === QuizType.ARITHMETICS) {
      return this.generateArithmeticQuestion(difficulty);
    } else {
      return this.generateEquationQuestion(difficulty);
    }
  }

  /**
   * Generate arithmetic question
   */
  private generateArithmeticQuestion(difficulty: DifficultyLevel): Question {
    const { min, max, operations } = this.getDifficultyParams(difficulty);
    const operation = operations[Math.floor(Math.random() * operations.length)];

    let num1: number, num2: number, correctAnswer: number;
    let question: string;

    switch (operation) {
      case '+':
        num1 = this.randomInt(min, max);
        num2 = this.randomInt(min, max);
        correctAnswer = num1 + num2;
        question = `${num1} + ${num2} = ?`;
        break;

      case '-':
        num1 = this.randomInt(min, max);
        num2 = this.randomInt(min, num1); // Ensure non-negative result
        correctAnswer = num1 - num2;
        question = `${num1} - ${num2} = ?`;
        break;

      case '×':
        num1 = this.randomInt(1, Math.min(12, max / 2));
        num2 = this.randomInt(1, Math.min(12, max / num1));
        correctAnswer = num1 * num2;
        question = `${num1} × ${num2} = ?`;
        break;

      case '÷':
        num2 = this.randomInt(2, Math.min(12, max / 2));
        correctAnswer = this.randomInt(1, Math.min(12, max / num2));
        num1 = num2 * correctAnswer;
        question = `${num1} ÷ ${num2} = ?`;
        break;

      default:
        throw new Error(`Unknown operation: ${operation}`);
    }

    const options = this.generateOptions(correctAnswer, difficulty);
    const explanation = this.generateExplanation(operation, num1, num2, correctAnswer);

    return {
      id: randomUUID(),
      type: QuizType.ARITHMETICS,
      difficulty,
      question,
      correctAnswer,
      options,
      explanation,
      metadata: {
        operation,
        operands: [num1, num2],
      },
    };
  }

  /**
   * Generate equation question
   */
  private generateEquationQuestion(difficulty: DifficultyLevel): Question {
    const { min, max } = this.getDifficultyParams(difficulty);
    
    // Generate equation: ax + b = c => x = (c - b) / a
    const a = this.randomInt(1, difficulty === DifficultyLevel.EASY ? 5 : 10);
    const x = this.randomInt(min, max);
    const b = this.randomInt(1, max);
    const c = a * x + b;

    const question = `${a}x + ${b} = ${c}`;
    const correctAnswer = x;
    const options = this.generateOptions(correctAnswer, difficulty);
    const explanation = `To solve: ${a}x + ${b} = ${c}, subtract ${b} from both sides: ${a}x = ${c - b}, then divide by ${a}: x = ${correctAnswer}`;

    return {
      id: randomUUID(),
      type: QuizType.EQUATIONS,
      difficulty,
      question,
      correctAnswer,
      options,
      explanation,
      metadata: {
        operation: 'solve',
        operands: [a, b, c],
      },
    };
  }

  /**
   * Generate multiple choice options
   */
  private generateOptions(correctAnswer: number, difficulty: DifficultyLevel): number[] {
    const options = new Set<number>([correctAnswer]);
    const range = difficulty === DifficultyLevel.EASY ? 5 : difficulty === DifficultyLevel.MEDIUM ? 10 : 20;

    while (options.size < 4) {
      const offset = this.randomInt(-range, range);
      const option = correctAnswer + offset;
      if (option >= 0 && option !== correctAnswer) {
        options.add(option);
      }
    }

    // Shuffle options
    return Array.from(options).sort(() => Math.random() - 0.5);
  }

  /**
   * Get difficulty parameters
   */
  private getDifficultyParams(difficulty: DifficultyLevel) {
    switch (difficulty) {
      case DifficultyLevel.EASY:
        return {
          min: 1,
          max: 20,
          operations: ['+', '-'],
        };
      case DifficultyLevel.MEDIUM:
        return {
          min: 1,
          max: 50,
          operations: ['+', '-', '×'],
        };
      case DifficultyLevel.HARD:
        return {
          min: 1,
          max: 100,
          operations: ['+', '-', '×', '÷'],
        };
    }
  }

  /**
   * Generate explanation for the answer
   */
  private generateExplanation(
    operation: string,
    num1: number,
    num2: number,
    answer: number
  ): string {
    switch (operation) {
      case '+':
        return `${num1} plus ${num2} equals ${answer}`;
      case '-':
        return `${num1} minus ${num2} equals ${answer}`;
      case '×':
        return `${num1} multiplied by ${num2} equals ${answer}`;
      case '÷':
        return `${num1} divided by ${num2} equals ${answer}`;
      default:
        return `The answer is ${answer}`;
    }
  }

  /**
   * Check if question is duplicate
   */
  private isDuplicate(question: Question, excludeIds: string[]): boolean {
    const key = this.getQuestionKey(question);
    
    // Check against cached questions
    for (const [id, cachedQuestion] of this.cache.questions) {
      if (excludeIds.includes(id)) continue;
      if (this.getQuestionKey(cachedQuestion) === key) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check distribution control
   */
  private checkDistribution(
    questionKey: string,
    type: QuizType,
    difficulty: DifficultyLevel
  ): boolean {
    const distributionKey = `${type}_${difficulty}`;
    const count = this.cache.distribution.get(questionKey) || 0;
    const total = this.cache.distribution.get(distributionKey + '_total') || 1;
    const ratio = count / total;

    return ratio < this.distributionThreshold;
  }

  /**
   * Check for mode collapse (too many similar questions)
   */
  private isModeCollapsed(
    questionKey: string,
    type: QuizType,
    difficulty: DifficultyLevel
  ): boolean {
    const coverageKey = `${type}_${difficulty}`;
    const coverage = this.cache.coverage.get(coverageKey) || new Set();
    
    // Check if this pattern appears too frequently
    const pattern = questionKey.split('_')[0]; // Extract pattern
    let patternCount = 0;
    coverage.forEach((key) => {
      if (key.startsWith(pattern)) patternCount++;
    });

    return patternCount > coverage.size * 0.3; // Max 30% same pattern
  }

  /**
   * Update cache with new question
   */
  private updateCache(
    question: Question,
    type: QuizType,
    difficulty: DifficultyLevel
  ): void {
    const key = this.getQuestionKey(question);
    const distributionKey = `${type}_${difficulty}`;
    const coverageKey = `${type}_${difficulty}`;

    this.cache.questions.set(question.id, question);
    
    const count = this.cache.distribution.get(key) || 0;
    this.cache.distribution.set(key, count + 1);
    
    const total = this.cache.distribution.get(distributionKey + '_total') || 0;
    this.cache.distribution.set(distributionKey + '_total', total + 1);

    const coverage = this.cache.coverage.get(coverageKey) || new Set();
    coverage.add(key);
    this.cache.coverage.set(coverageKey, coverage);
  }

  /**
   * Get unique key for question (for deduplication)
   */
  private getQuestionKey(question: Question): string {
    if (question.metadata?.operation && question.metadata.operands) {
      const [op1, op2] = question.metadata.operands;
      return `${question.metadata.operation}_${op1}_${op2}`;
    }
    return question.question;
  }

  /**
   * Create fallback question if generation fails
   */
  private createFallbackQuestion(
    type: QuizType,
    difficulty: DifficultyLevel
  ): Question {
    const num1 = this.randomInt(1, 10);
    const num2 = this.randomInt(1, 10);
    const correctAnswer = num1 + num2;
    const options = this.generateOptions(correctAnswer, difficulty);

    return {
      id: randomUUID(),
      type,
      difficulty,
      question: `${num1} + ${num2} = ?`,
      correctAnswer,
      options,
      explanation: `${num1} plus ${num2} equals ${correctAnswer}`,
    };
  }

  /**
   * Utility: random integer
   */
  private randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Clear cache (useful for testing or reset)
   */
  clearCache(): void {
    this.cache.questions.clear();
    this.cache.coverage.clear();
    this.cache.distribution.clear();
  }
}

export const questionGenerator = new QuestionGenerator();

