import { Question, QuizType, DifficultyLevel } from '../types';
import { randomUUID } from 'crypto';

interface QuestionCache {
  questions: Map<string, Question>;
  coverage: Map<string, Set<string>>;
  distribution: Map<string, number>;
}

interface ArithmeticTerm {
  val: number;      // Actual value (e.g., 8)
  view: string;     // Display string (e.g., "2³" or "8" or "(3 + 5)")
}

interface ArithmeticBlock {
  val: number;      // Value of the entire block (e.g., 12)
  view: string;     // Display string (e.g., "2³ × 3 ÷ 2")
}

class QuestionGenerator {
  private cache: QuestionCache = {
    questions: new Map(),
    coverage: new Map(),
    distribution: new Map(),
  };

  private maxRetries = 20; // Base retry count
  private distributionThreshold = 0.15; // Base distribution threshold (15%)
  
  /**
   * Get retry count based on difficulty
   */
  private getMaxRetries(difficulty: DifficultyLevel): number {
    switch (difficulty) {
      case DifficultyLevel.EASY:
        return 20;
      case DifficultyLevel.MEDIUM:
        return 30; // More retries for MEDIUM
      case DifficultyLevel.HARD:
        return 40; // Even more retries for HARD
      default:
        return 20;
    }
  }
  
  /**
   * Get distribution threshold based on difficulty
   */
  private getDistributionThreshold(difficulty: DifficultyLevel): number {
    switch (difficulty) {
      case DifficultyLevel.EASY:
        return 0.15; // 15% for EASY
      case DifficultyLevel.MEDIUM:
        return 0.20; // 20% for MEDIUM (more lenient)
      case DifficultyLevel.HARD:
        return 0.25; // 25% for HARD (most lenient)
      default:
        return 0.15;
    }
  }

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
    const maxRetries = this.getMaxRetries(difficulty);

    while (attempts < maxRetries && !question) {
      const candidate = this.createQuestion(type, difficulty);
      const questionKey = this.getQuestionKey(candidate);

      // Deduplication check
      if (this.isDuplicate(candidate, excludeIds)) {
        attempts++;
        continue;
      }

      // Distribution control
      if (!this.checkDistribution(questionKey, type, difficulty, difficulty)) {
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
      // Fallback: generate a question that respects difficulty level
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
   * Generate arithmetic question with multiple operations
   * IMPROVED VERSION: Bottom-up approach with support for exponents and parentheses
   * Supports: +, -, ×, ÷, ^2, ^3, and parentheses
   * Guarantees: Always integer results, follows PEMDAS
   */
  private generateArithmeticQuestion(difficulty: DifficultyLevel): Question {
    const { min, max } = this.getDifficultyParams(difficulty);
    
    // Configure difficulty settings
    let numBlocks = 2; // Easy: 2 blocks
    let minOpsPerBlock = 0; // Easy: can have 0 operations
    let maxOpsPerBlock = 1; // Easy: max 1 operation per block
    let allowPower = false; // Easy: no exponents
    let allowParentheses = false; // Easy: no parentheses
    
    if (difficulty === DifficultyLevel.MEDIUM) {
      numBlocks = this.randomInt(2, 3);
      minOpsPerBlock = 1; // Medium: MUST have at least 1 operation per block
      maxOpsPerBlock = 2;
      allowPower = true; // Medium: allow exponents
      allowParentheses = true; // Medium: allow parentheses
    } else if (difficulty === DifficultyLevel.HARD) {
      numBlocks = this.randomInt(3, 4);
      minOpsPerBlock = 1; // Hard: MUST have at least 1 operation per block
      maxOpsPerBlock = 3;
      allowPower = true; // Hard: allow exponents
      allowParentheses = true; // Hard: allow parentheses
    }

    const blocks: ArithmeticBlock[] = [];
    
    // 1. Create each Block (multiply/divide cluster)
    // For HARD, ensure at least one block has exponents or parentheses
    let hasComplexFeature = false;
    for (let i = 0; i < numBlocks; i++) {
      // For HARD, ensure at least one block uses exponents or parentheses
      const forceComplex = difficulty === DifficultyLevel.HARD && !hasComplexFeature && i === numBlocks - 1;
      const block = this.createIntegerBlock(
        min, 
        max, 
        minOpsPerBlock, 
        maxOpsPerBlock, 
        allowPower, 
        allowParentheses, 
        difficulty,
        forceComplex
      );
      blocks.push(block);
      
      // Check if this block has exponents or parentheses
      if (block.view.includes('²') || block.view.includes('³') || block.view.includes('(')) {
        hasComplexFeature = true;
      }
    }

    // 2. Combine blocks with + or - operations
    let questionText = blocks[0].view;
    let currentTotal = blocks[0].val;
    const operations: string[] = []; // For metadata
    
    for (let i = 1; i < blocks.length; i++) {
      const isPlus = Math.random() > 0.5;
      const block = blocks[i];
      
      if (isPlus) {
        questionText += ` + ${block.view}`;
        currentTotal += block.val;
        operations.push('+');
      } else {
        questionText += ` - ${block.view}`;
        currentTotal -= block.val;
        operations.push('-');
      }
    }

    const questionStr = `${questionText} = ?`;
    
    // 3. Create options and return
    const options = this.generateOptions(currentTotal, difficulty);

    return {
      id: randomUUID(),
      type: QuizType.ARITHMETICS,
      difficulty,
      question: questionStr,
      correctAnswer: currentTotal,
      options,
      metadata: {
        operation: 'mixed',
        operands: blocks.map(b => b.val), // Store block values for debugging
      },
    };
  }

  /**
   * Create a Term - smallest unit (regular number, exponent, or parentheses expression)
   */
  private createTerm(
    min: number,
    max: number,
    allowPower: boolean,
    allowParentheses: boolean,
    difficulty?: DifficultyLevel
  ): ArithmeticTerm {
    const rand = Math.random();
    
    // Set probabilities based on difficulty
    let parenthesesChance = 0.15; // Default 15%
    let exponentChance = 0.35; // Default threshold (20% chance after parentheses)
    
    if (difficulty === DifficultyLevel.MEDIUM) {
      parenthesesChance = 0.30; // Medium: 30% chance for parentheses
      exponentChance = 0.50; // 20% chance for exponent (0.50 - 0.30 = 0.20)
    } else if (difficulty === DifficultyLevel.HARD) {
      parenthesesChance = 0.50; // Hard: 50% chance for parentheses
      exponentChance = 0.90; // 40% chance for exponent (0.90 - 0.50 = 0.40)
    }
    
    // 1. Logic for parentheses: (A + B) or (A - B)
    // Only generate when numbers aren't too large to avoid confusion
    if (allowParentheses && rand < parenthesesChance) {
      const num1 = this.randomInt(1, 10);
      const num2 = this.randomInt(1, 10);
      const isPlus = Math.random() > 0.5;
      
      if (isPlus) {
        return { val: num1 + num2, view: `(${num1} + ${num2})` };
      } else {
        // Ensure positive result in parentheses for easier reading
        const larger = Math.max(num1, num2);
        const smaller = Math.min(num1, num2);
        return { val: larger - smaller, view: `(${larger} - ${smaller})` };
      }
    }
    
    // 2. Logic for exponents (^2 or ^3)
    if (allowPower && rand < exponentChance) {
      const base = this.randomInt(2, 5); // Small base (2 to 5) to avoid huge numbers
      const power = Math.random() > 0.5 ? 2 : 3; // Power 2 or 3
      const val = Math.pow(base, power);
      
      // Display with superscript
      const powerStr = power === 2 ? '²' : '³';
      return { val, view: `${base}${powerStr}` };
    }
    
    // 3. Regular number
    const val = this.randomInt(min, max);
    return { val, view: `${val}` };
  }

  /**
   * Create a complete multiply/divide block. Example: "2³ × 3 ÷ 4"
   * Guarantees integer result
   */
  private createIntegerBlock(
    min: number,
    max: number,
    minOps: number,
    maxOps: number,
    allowPower: boolean,
    allowParentheses: boolean,
    difficulty?: DifficultyLevel,
    forceComplex: boolean = false
  ): ArithmeticBlock {
    // 1. Initialize first term
    // If forcing complex, prefer exponent or parentheses for first term
    let currentTerm: ArithmeticTerm;
    if (forceComplex) {
      // Force exponent or parentheses for first term
      const useExponent = Math.random() > 0.5;
      if (useExponent && allowPower) {
        const base = this.randomInt(2, 5);
        const power = Math.random() > 0.5 ? 2 : 3;
        const val = Math.pow(base, power);
        const powerStr = power === 2 ? '²' : '³';
        currentTerm = { val, view: `${base}${powerStr}` };
      } else if (allowParentheses) {
        const num1 = this.randomInt(1, 10);
        const num2 = this.randomInt(1, 10);
        const isPlus = Math.random() > 0.5;
        if (isPlus) {
          currentTerm = { val: num1 + num2, view: `(${num1} + ${num2})` };
        } else {
          const larger = Math.max(num1, num2);
          const smaller = Math.min(num1, num2);
          currentTerm = { val: larger - smaller, view: `(${larger} - ${smaller})` };
        }
      } else {
        currentTerm = this.createTerm(min, Math.min(max, 10), allowPower, allowParentheses, difficulty);
      }
    } else {
      currentTerm = this.createTerm(min, Math.min(max, 10), allowPower, allowParentheses, difficulty);
    }
    
    // Avoid 0 for safety in division
    if (currentTerm.val === 0) {
      currentTerm = { val: 2, view: '2' };
    }
    
    let currentVal = currentTerm.val;
    let currentView = currentTerm.view;
    
    // Number of operations in this block - ensure minimum for HARD
    const opsCount = this.randomInt(minOps, maxOps);
    
    for (let i = 0; i < opsCount; i++) {
      const isMult = Math.random() > 0.5;
      
      if (isMult) {
        // MULTIPLICATION
        // Limit multiplier to small numbers to avoid overflow
        // For HARD, prefer using exponents or parentheses in subsequent terms
        const nextTerm = this.createTerm(1, 10, allowPower, allowParentheses, difficulty);
        currentVal *= nextTerm.val;
        currentView += ` × ${nextTerm.view}`;
      } else {
        // DIVISION - Critical: Must find a divisor
        const divisors = this.getDivisors(currentVal, max);
        
        if (divisors.length > 0) {
          // Choose a random divisor
          const divisorVal = divisors[Math.floor(Math.random() * divisors.length)];
          
          // For display, we could show divisor as exponent if applicable
          // But for simplicity and safety, show regular number for divisor
          currentVal /= divisorVal;
          currentView += ` ÷ ${divisorVal}`;
        } else {
          // If not divisible (prime number), switch to MULTIPLICATION to avoid logic error
          // For HARD, still allow power/parentheses in multiplication fallback
          const nextTerm = this.createTerm(1, 5, allowPower && difficulty === DifficultyLevel.HARD, allowParentheses && difficulty === DifficultyLevel.HARD, difficulty);
          currentVal *= nextTerm.val;
          currentView += ` × ${nextTerm.view}`;
        }
      }
    }
    
    // Ensure result is integer (should always be, but double-check)
    if (!Number.isInteger(currentVal)) {
      // Fallback: return a simple block
      const simpleVal = this.randomInt(min, max);
      return { val: simpleVal, view: `${simpleVal}` };
    }
    
    return { val: currentVal, view: currentView };
  }

  /**
   * Get divisors of a number up to a maximum
   */
  private getDivisors(num: number, max: number): number[] {
    if (num === 0) return [];
    const divisors: number[] = [];
    for (let d = 2; d <= Math.min(max, Math.abs(num)); d++) {
      if (Math.abs(num) % d === 0) {
        divisors.push(d);
      }
    }
    return divisors;
  }

  /**
   * Format expression as string
   */
  private formatExpression(numbers: number[], operations: string[]): string {
    let expression = `${numbers[0]}`;
    for (let i = 0; i < operations.length; i++) {
      expression += ` ${operations[i]} ${numbers[i + 1]}`;
    }
    return `${expression} = ?`;
  }

  /**
   * Generate equation question
   */
  private generateEquationQuestion(difficulty: DifficultyLevel): Question {
    const { min, max, maxNumbers } = this.getDifficultyParams(difficulty);
    
    if (difficulty === DifficultyLevel.EASY) {
      // Easy: Simple equation ax + b = c
      const a = this.randomInt(1, 5);
    const x = this.randomInt(min, max);
    const b = this.randomInt(1, max);
    const c = a * x + b;

    const question = `${a}x + ${b} = ${c}`;
    const correctAnswer = x;
    const options = this.generateOptions(correctAnswer, difficulty);

    return {
      id: randomUUID(),
      type: QuizType.EQUATIONS,
      difficulty,
      question,
      correctAnswer,
      options,
      metadata: {
        operation: 'solve',
        operands: [a, b, c],
      },
    };
    } else if (difficulty === DifficultyLevel.MEDIUM) {
      // Medium: Up to 5 numbers with parameters (e.g., ax + b - cx = d or ax + b + c = d)
      const numTerms = this.randomInt(3, 5); // 3 to 5 terms
      const terms: Array<{ coeff: number; isVar: boolean; constant: number; sign: string }> = [];
      let constantSum = 0;
      let xCoeff = 0;
      const x = this.randomInt(min, max);

      // Ensure at least one x term
      const hasXTerm = true;
      
      // Generate terms with signs
      for (let i = 0; i < numTerms; i++) {
        const sign = i === 0 ? '+' : (Math.random() > 0.5 ? '+' : '-');
        const isVar = (hasXTerm && i === 0) || (Math.random() > 0.4 && xCoeff === 0);
        
        if (isVar) {
          const coeff = this.randomInt(1, 10);
          terms.push({ coeff, isVar: true, constant: 0, sign });
          xCoeff += (sign === '+' ? 1 : -1) * coeff;
        } else {
          const constant = this.randomInt(1, max);
          terms.push({ coeff: 0, isVar: false, constant, sign });
          constantSum += (sign === '+' ? 1 : -1) * constant;
        }
      }

      // Ensure we have at least one x term
      if (xCoeff === 0) {
        const coeff = this.randomInt(1, 10);
        terms[0] = { coeff, isVar: true, constant: 0, sign: '+' };
        xCoeff = coeff;
      }

      // Calculate right side
      const rightSide = xCoeff * x + constantSum;

      // Format question
      const leftParts: string[] = [];
      for (let i = 0; i < terms.length; i++) {
        const term = terms[i];
        const prefix = i === 0 ? '' : ` ${term.sign} `;
        if (term.isVar) {
          if (term.coeff === 1) {
            leftParts.push(`${prefix}x`);
          } else {
            leftParts.push(`${prefix}${term.coeff}x`);
          }
        } else {
          leftParts.push(`${prefix}${term.constant}`);
        }
      }
      const question = `${leftParts.join('')} = ${rightSide}`;
      const correctAnswer = x;
      const options = this.generateOptions(correctAnswer, difficulty);

      return {
        id: randomUUID(),
        type: QuizType.EQUATIONS,
        difficulty,
        question,
        correctAnswer,
        options,
        metadata: {
          operation: 'solve',
          operands: [numTerms, rightSide],
        },
      };
    } else {
      // Hard: Quadratic equations (ax² + bx + c = 0) that can be solved by factoring or quadratic formula
      // Generate factorable quadratic equations by constructing from two integer roots
      // This ensures the equation is always solvable by factoring
      
      // Generate two integer roots (x1 and x2)
      // One root will be the answer, the other is used to construct the equation
      let x1 = this.randomInt(-10, 10);
      if (x1 === 0) {
        x1 = this.randomInt(1, 10); // Avoid 0
      }
      
      let x2 = this.randomInt(-10, 10);
      if (x2 === 0) {
        x2 = this.randomInt(1, 10); // Avoid 0
      }
      
      // Choose one root as the answer (prefer the one with smaller absolute value for easier solving)
      const correctAnswer = Math.abs(x1) <= Math.abs(x2) ? x1 : x2;
      
      // Generate coefficient a (1 to 5, can be negative)
      const aSign = Math.random() > 0.5 ? 1 : -1;
      const a = aSign * this.randomInt(1, 5);
      
      // Construct equation from factored form: a(x - x1)(x - x2) = 0
      // Expand: a(x² - (x1 + x2)x + x1*x2) = 0
      // Therefore: ax² - a(x1 + x2)x + a*x1*x2 = 0
      // So: b = -a(x1 + x2), c = a*x1*x2
      const b = -a * (x1 + x2);
      const c = a * x1 * x2;
      
      // Format the equation as: ax² + bx = -c
      const rightSide = -c;
      
      // Build left side string
      const leftParts: string[] = [];
      
      // Add x² term
      if (a === 1) {
        leftParts.push('x²');
      } else if (a === -1) {
        leftParts.push('-x²');
      } else {
        leftParts.push(`${a}x²`);
      }
      
      // Add x term
      if (b > 0) {
        if (b === 1) {
          leftParts.push('+ x');
        } else {
          leftParts.push(`+ ${b}x`);
        }
      } else if (b < 0) {
        if (b === -1) {
          leftParts.push('- x');
        } else {
          leftParts.push(`- ${Math.abs(b)}x`);
        }
      }
      
      // Format: ax² + bx = rightSide
      const question = `${leftParts.join(' ')} = ${rightSide}`;
      const options = this.generateOptions(correctAnswer, difficulty);

      return {
        id: randomUUID(),
        type: QuizType.EQUATIONS,
        difficulty,
        question,
        correctAnswer,
        options,
        metadata: {
          operation: 'solve',
          operands: [a, b, c],
        },
      };
    }
  }

  /**
   * Generate multiple choice options (all integers)
   */
  private generateOptions(correctAnswer: number, difficulty: DifficultyLevel): number[] {
    const options = new Set<number>([correctAnswer]);
    const range = difficulty === DifficultyLevel.EASY ? 5 : difficulty === DifficultyLevel.MEDIUM ? 10 : 20;

    while (options.size < 4) {
      const offset = this.randomInt(-range, range);
      const option = correctAnswer + offset;
      // Allow negative integers
      if (option !== correctAnswer) {
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
    // All levels now have all 4 operations
    switch (difficulty) {
      case DifficultyLevel.EASY:
        return {
          min: 1,
          max: 20,
          operations: ['+', '-', '×', '÷'],
          maxNumbers: 3,
        };
      case DifficultyLevel.MEDIUM:
        return {
          min: 1,
          max: 50,
          operations: ['+', '-', '×', '÷'],
          maxNumbers: 5,
        };
      case DifficultyLevel.HARD:
        return {
          min: 1,
          max: 100,
          operations: ['+', '-', '×', '÷'],
          maxNumbers: 5,
        };
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
    difficulty: DifficultyLevel,
    difficultyForThreshold?: DifficultyLevel
  ): boolean {
    const distributionKey = `${type}_${difficulty}`;
    const count = this.cache.distribution.get(questionKey) || 0;
    const total = this.cache.distribution.get(distributionKey + '_total') || 1;
    const ratio = count / total;
    
    // Use difficulty-specific threshold if provided, otherwise use base threshold
    const threshold = difficultyForThreshold 
      ? this.getDistributionThreshold(difficultyForThreshold)
      : this.distributionThreshold;

    return ratio < threshold;
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
    // For quadratic equations (Hard difficulty), use the full question string
    // to ensure better differentiation and allow more variety
    if (question.difficulty === DifficultyLevel.HARD && question.type === QuizType.EQUATIONS) {
      if (question.question.includes('x²')) {
        return question.question; // Use full question for quadratic equations
      }
    }
    
    if (question.metadata?.operation && question.metadata.operands) {
      // Handle variable-length operands (2 for simple equations, 3 for quadratic)
      const operands = question.metadata.operands;
      if (operands.length === 2) {
        const [op1, op2] = operands;
        return `${question.metadata.operation}_${op1}_${op2}`;
      } else if (operands.length === 3) {
        // For quadratic equations: use a, b, c coefficients
        const [a, b, c] = operands;
        return `${question.metadata.operation}_${a}_${b}_${c}`;
      } else {
        // Fallback: join all operands
        return `${question.metadata.operation}_${operands.join('_')}`;
      }
    }
    return question.question;
  }

  /**
   * Create fallback question if generation fails
   * Respects difficulty level requirements
   */
  private createFallbackQuestion(
    type: QuizType,
    difficulty: DifficultyLevel
  ): Question {
    if (type === QuizType.ARITHMETICS) {
      return this.createFallbackArithmeticQuestion(difficulty);
    } else {
      return this.createFallbackEquationQuestion(difficulty);
    }
  }

  /**
   * Create fallback arithmetic question that respects difficulty
   */
  private createFallbackArithmeticQuestion(difficulty: DifficultyLevel): Question {
    const { min, max } = this.getDifficultyParams(difficulty);
    
    if (difficulty === DifficultyLevel.EASY) {
      // Easy: Simple addition
      const num1 = this.randomInt(min, Math.min(max, 20));
      const num2 = this.randomInt(min, Math.min(max, 20));
      const correctAnswer = num1 + num2;
      const options = this.generateOptions(correctAnswer, difficulty);
      
      return {
        id: randomUUID(),
        type: QuizType.ARITHMETICS,
        difficulty,
        question: `${num1} + ${num2} = ?`,
        correctAnswer,
        options,
      };
    } else if (difficulty === DifficultyLevel.MEDIUM) {
      // Medium: Must have at least 1 operation per block, 2-3 blocks
      // Create 2 blocks, each with 1 operation
      const block1Op1 = this.randomInt(2, 10);
      const block1Op2 = this.randomInt(2, 10);
      const block1Val = block1Op1 * block1Op2;
      
      const block2Op1 = this.randomInt(2, 10);
      const block2Op2 = this.randomInt(2, 10);
      const block2Val = block2Op1 * block2Op2;
      
      const isPlus = Math.random() > 0.5;
      const correctAnswer = isPlus ? block1Val + block2Val : block1Val - block2Val;
      const options = this.generateOptions(correctAnswer, difficulty);
      const operator = isPlus ? '+' : '-';
      
      return {
        id: randomUUID(),
        type: QuizType.ARITHMETICS,
        difficulty,
        question: `${block1Op1} × ${block1Op2} ${operator} ${block2Op1} × ${block2Op2} = ?`,
        correctAnswer,
        options,
        metadata: {
          operation: 'mixed',
          operands: [block1Val, block2Val],
        },
      };
    } else {
      // Hard: Must have at least 1 operation per block, 3-4 blocks, with exponents/parentheses
      // Create 3 blocks, at least one with exponent or parentheses
      const useExponent = Math.random() > 0.5;
      let block1Val: number;
      let block1View: string;
      
      if (useExponent) {
        const base = this.randomInt(2, 5);
        const power = Math.random() > 0.5 ? 2 : 3;
        block1Val = Math.pow(base, power);
        const powerStr = power === 2 ? '²' : '³';
        block1View = `${base}${powerStr}`;
      } else {
        const num1 = this.randomInt(1, 10);
        const num2 = this.randomInt(1, 10);
        block1Val = num1 + num2;
        block1View = `(${num1} + ${num2})`;
      }
      
      // Add one operation to block1
      const block1Op = this.randomInt(2, 5);
      block1Val *= block1Op;
      block1View += ` × ${block1Op}`;
      
      // Block 2: simple multiplication
      const block2Op1 = this.randomInt(2, 10);
      const block2Op2 = this.randomInt(2, 10);
      const block2Val = block2Op1 * block2Op2;
      const block2View = `${block2Op1} × ${block2Op2}`;
      
      // Block 3: simple multiplication
      const block3Op1 = this.randomInt(2, 10);
      const block3Op2 = this.randomInt(2, 10);
      const block3Val = block3Op1 * block3Op2;
      const block3View = `${block3Op1} × ${block3Op2}`;
      
      const op1 = Math.random() > 0.5 ? '+' : '-';
      const op2 = Math.random() > 0.5 ? '+' : '-';
      let correctAnswer = block1Val;
      correctAnswer = op1 === '+' ? correctAnswer + block2Val : correctAnswer - block2Val;
      correctAnswer = op2 === '+' ? correctAnswer + block3Val : correctAnswer - block3Val;
      
      const options = this.generateOptions(correctAnswer, difficulty);
      
      return {
        id: randomUUID(),
        type: QuizType.ARITHMETICS,
        difficulty,
        question: `${block1View} ${op1} ${block2View} ${op2} ${block3View} = ?`,
        correctAnswer,
        options,
        metadata: {
          operation: 'mixed',
          operands: [block1Val, block2Val, block3Val],
        },
      };
    }
  }

  /**
   * Create fallback equation question that respects difficulty
   */
  private createFallbackEquationQuestion(difficulty: DifficultyLevel): Question {
    const { min, max } = this.getDifficultyParams(difficulty);
    
    if (difficulty === DifficultyLevel.EASY) {
      // Easy: Simple linear equation ax + b = c
      const a = this.randomInt(1, 5);
      const x = this.randomInt(min, max);
      const b = this.randomInt(1, max);
      const c = a * x + b;
      const options = this.generateOptions(x, difficulty);
      
      return {
        id: randomUUID(),
        type: QuizType.EQUATIONS,
        difficulty,
        question: `${a}x + ${b} = ${c}`,
        correctAnswer: x,
        options,
        metadata: {
          operation: 'solve',
          operands: [a, b, c],
        },
      };
    } else if (difficulty === DifficultyLevel.MEDIUM) {
      // Medium: Multi-term equation
      const x = this.randomInt(min, max);
      const coeff1 = this.randomInt(1, 10);
      const coeff2 = this.randomInt(1, 10);
      const const1 = this.randomInt(1, max);
      const const2 = this.randomInt(1, max);
      
      const xCoeff = coeff1 - coeff2;
      const constantSum = const1 + const2;
      const rightSide = xCoeff * x + constantSum;
      const options = this.generateOptions(x, difficulty);
      
      return {
        id: randomUUID(),
        type: QuizType.EQUATIONS,
        difficulty,
        question: `${coeff1}x + ${const1} - ${coeff2}x + ${const2} = ${rightSide}`,
        correctAnswer: x,
        options,
        metadata: {
          operation: 'solve',
          operands: [4, rightSide],
        },
      };
    } else {
      // Hard: Quadratic equation
      let x1 = this.randomInt(-10, 10);
      if (x1 === 0) x1 = this.randomInt(1, 10);
      
      let x2 = this.randomInt(-10, 10);
      if (x2 === 0) x2 = this.randomInt(1, 10);
      
      const correctAnswer = Math.abs(x1) <= Math.abs(x2) ? x1 : x2;
      const aSign = Math.random() > 0.5 ? 1 : -1;
      const a = aSign * this.randomInt(1, 5);
      const b = -a * (x1 + x2);
      const c = a * x1 * x2;
      const rightSide = -c;
      const options = this.generateOptions(correctAnswer, difficulty);
      
      let leftParts: string[] = [];
      if (a === 1) {
        leftParts.push('x²');
      } else if (a === -1) {
        leftParts.push('-x²');
      } else {
        leftParts.push(`${a}x²`);
      }
      
      if (b > 0) {
        if (b === 1) {
          leftParts.push('+ x');
        } else {
          leftParts.push(`+ ${b}x`);
        }
      } else if (b < 0) {
        if (b === -1) {
          leftParts.push('- x');
        } else {
          leftParts.push(`- ${Math.abs(b)}x`);
        }
      }
      
      return {
        id: randomUUID(),
        type: QuizType.EQUATIONS,
        difficulty,
        question: `${leftParts.join(' ')} = ${rightSide}`,
        correctAnswer,
        options,
        metadata: {
          operation: 'solve',
          operands: [a, b, c],
        },
      };
    }
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

