import { questionGenerator } from './questionGenerator';
import { QuizType, DifficultyLevel } from '../types';

/**
 * Quick test to verify all questions result in integers
 */
function quickTest() {
  console.log('🧪 Quick Test: Verifying All Questions Result in Integers\n');
  console.log('='.repeat(60));

  let total = 0;
  let passed = 0;
  let failed = 0;
  const failures: Array<{ question: string; answer: number; error: string }> = [];

  const testCases = [
    { type: QuizType.ARITHMETICS, difficulty: DifficultyLevel.EASY, count: 100 },
    { type: QuizType.ARITHMETICS, difficulty: DifficultyLevel.MEDIUM, count: 100 },
    { type: QuizType.ARITHMETICS, difficulty: DifficultyLevel.HARD, count: 100 },
    { type: QuizType.EQUATIONS, difficulty: DifficultyLevel.EASY, count: 50 },
    { type: QuizType.EQUATIONS, difficulty: DifficultyLevel.MEDIUM, count: 50 },
    { type: QuizType.EQUATIONS, difficulty: DifficultyLevel.HARD, count: 50 },
  ];

  for (const testCase of testCases) {
    console.log(`\nTesting ${testCase.type} - ${testCase.difficulty} (${testCase.count} questions)...`);
    
    for (let i = 0; i < testCase.count; i++) {
      try {
        const questions = questionGenerator.generateQuiz(
          testCase.type,
          testCase.difficulty,
          1
        );
        
        if (questions.length === 0) {
          total++;
          failed++;
          failures.push({
            question: 'No question generated',
            answer: 0,
            error: 'Generation failed',
          });
          continue;
        }

        const q = questions[0];
        total++;

        // Critical check: answer must be integer
        if (!Number.isInteger(q.correctAnswer)) {
          failed++;
          failures.push({
            question: q.question,
            answer: q.correctAnswer,
            error: `NON-INTEGER: ${q.correctAnswer}`,
          });
        } else if (!q.options.includes(q.correctAnswer)) {
          failed++;
          failures.push({
            question: q.question,
            answer: q.correctAnswer,
            error: 'Answer not in options',
          });
        } else {
          passed++;
        }
      } catch (error) {
        total++;
        failed++;
        failures.push({
          question: 'Error',
          answer: 0,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('\n=== TEST SUMMARY ===\n');
  console.log(`Total Questions: ${total}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`Success Rate: ${((passed / total) * 100).toFixed(2)}%`);

  if (failed > 0) {
    console.log('\n=== FIRST 10 FAILURES ===\n');
    failures.slice(0, 10).forEach((f, idx) => {
      console.log(`${idx + 1}. ${f.question}`);
      console.log(`   Answer: ${f.answer}`);
      console.log(`   Error: ${f.error}\n`);
    });
  }

  console.log('='.repeat(60));
  process.exit(failed > 0 ? 1 : 0);
}

quickTest();

