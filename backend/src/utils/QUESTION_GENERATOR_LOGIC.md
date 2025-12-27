# Question Generator Logic Documentation

## Table of Contents
1. [Overview](#overview)
2. [Architecture & Design Philosophy](#architecture--design-philosophy)
3. [Data Structures](#data-structures)
4. [Core Generation Flow](#core-generation-flow)
5. [Arithmetic Question Generation](#arithmetic-question-generation)
6. [Equation Question Generation](#equation-question-generation)
7. [Quality Control Mechanisms](#quality-control-mechanisms)
8. [Examples](#examples)
9. [Edge Cases & Guarantees](#edge-cases--guarantees)

---

## Overview

The `QuestionGenerator` class is responsible for generating quiz questions of two types:
- **ARITHMETICS**: Multi-operation arithmetic expressions (e.g., `2³ × 3 ÷ 2 + 5 = ?`)
- **EQUATIONS**: Algebraic equations with variables (e.g., `3x + 5 = 20`)

The generator supports **three difficulty levels** (Easy, Medium, Hard) for **each type**, implementing a sophisticated "bottom-up" block-based architecture for arithmetic questions to guarantee:
- ✅ **100% integer results** (no decimal answers)
- ✅ **Correct PEMDAS order** (Parentheses, Exponents, Multiplication/Division, Addition/Subtraction)
- ✅ **Support for exponents** (², ³) and **parentheses** `()`
- ✅ **Question diversity** through caching and difficulty-specific distribution control
- ✅ **Progressive difficulty** with difficulty-specific retry counts and thresholds
- ✅ **Intelligent fallbacks** that respect difficulty level requirements

### Question Types & Difficulty Levels Summary

| Type | Easy | Medium | Hard |
|------|------|--------|------|
| **ARITHMETICS** | 2 blocks, 0-1 op/block<br>No exponents/parentheses | 2-3 blocks, **min 1 op/block**, max 2 ops/block<br>Exponents ✅, Parentheses ✅ | 3-4 blocks, **min 1 op/block**, max 3 ops/block<br>Exponents ✅, Parentheses ✅ |
| **EQUATIONS** | Simple linear: `ax + b = c` | Multi-term: `ax + b - cx + d = e`<br>(3-5 terms, combine like terms) | Quadratic: `ax² + bx = c`<br>(Factorable, solvable by factoring or formula) |

---

## Architecture & Design Philosophy

### Block-Based Architecture (Bottom-Up Approach)

The arithmetic question generator uses a **block-based architecture** that fundamentally solves the integer result problem:

**Key Insight**: According to PEMDAS, multiplication and division have higher precedence than addition and subtraction. Therefore, any arithmetic expression can be decomposed into:
- **Blocks**: Clusters of multiplication/division operations (e.g., `2³ × 3 ÷ 2`)
- **Connectors**: Addition/subtraction operations between blocks (e.g., `+`, `-`)

**Example Decomposition**:
```
Expression: 2³ × 3 ÷ 2 + 5 - 4 × 2
Blocks:     [2³ × 3 ÷ 2] + [5] - [4 × 2]
            Block 1        Block 2  Block 3
```

**Why This Works**:
1. Each block is guaranteed to evaluate to an integer (division only happens when exact)
2. Adding/subtracting integers always results in an integer
3. PEMDAS is naturally enforced: blocks are evaluated first, then combined

### Design Principles

1. **Guarantee Integer Results**: Never generate questions that could result in decimals
2. **Respect PEMDAS**: Structure questions to naturally follow order of operations
3. **Progressive Complexity**: Easy → Medium → Hard increases:
   - Number of blocks
   - Operations per block
   - Introduction of exponents and parentheses
4. **Question Diversity**: Prevent duplicate questions and ensure variety

---

## Data Structures

### Interfaces

#### `ArithmeticTerm`
The smallest unit in an arithmetic expression:
```typescript
interface ArithmeticTerm {
  val: number;      // Actual numeric value (e.g., 8)
  view: string;     // Display string (e.g., "2³", "8", "(3 + 5)")
}
```

**Examples**:
- Regular number: `{ val: 5, view: "5" }`
- Exponent: `{ val: 8, view: "2³" }`
- Parentheses: `{ val: 8, view: "(3 + 5)" }`

#### `ArithmeticBlock`
A cluster of multiplication/division operations:
```typescript
interface ArithmeticBlock {
  val: number;      // Value of entire block (e.g., 12)
  view: string;     // Display string (e.g., "2³ × 3 ÷ 2")
}
```

**Examples**:
- Simple: `{ val: 10, view: "10" }`
- Complex: `{ val: 12, view: "2³ × 3 ÷ 2" }`
- With parentheses: `{ val: 16, view: "(3 + 5) × 2" }`

#### `QuestionCache`
Internal cache for quality control:
```typescript
interface QuestionCache {
  questions: Map<string, Question>;        // All generated questions
  coverage: Map<string, Set<string>>;       // Question patterns by type/difficulty
  distribution: Map<string, number>;        // Frequency counts
}
```

---

## Core Generation Flow

### Main Entry Points

#### `generateQuestion(type, difficulty, excludeIds?)`
Generates a single question with quality checks:

```typescript
generateQuestion(QuizType.ARITHMETICS, DifficultyLevel.MEDIUM, [])
```

**Process**:
1. **Attempt Loop** (difficulty-specific retry counts):
   - **Easy**: Up to 20 retries
   - **Medium**: Up to 30 retries (more lenient)
   - **Hard**: Up to 40 retries (most lenient)
   - Generate candidate question
   - Check for duplicates
   - Check distribution limits (difficulty-specific thresholds)
   - Check for mode collapse
   - If all checks pass → accept question
2. **Fallback**: If all retries fail, generate fallback question that **respects difficulty level**
3. **Cache Update**: Store question in cache for future deduplication

#### `generateQuiz(type, difficulty, count)`
Generates multiple unique questions:

```typescript
generateQuiz(QuizType.ARITHMETICS, DifficultyLevel.HARD, 10)
```

**Process**:
1. Maintain `excludeIds` array to prevent duplicates
2. Generate each question with previous IDs excluded
3. Return array of unique questions

---

## Arithmetic Question Generation

### Overview

The arithmetic question generator (`generateArithmeticQuestion`) follows this high-level flow:

```
1. Configure difficulty settings
   ↓
2. Create N blocks (each block = multiply/divide cluster)
   ↓
3. Combine blocks with + or - operations
   ↓
4. Generate options and return Question
```

### Step 1: Difficulty Configuration

Each difficulty level has specific settings:

| Difficulty | Blocks | Min Ops/Block | Max Ops/Block | Exponents | Parentheses |
|------------|--------|---------------|---------------|-----------|-------------|
| **Easy**   | 2      | 0             | 1             | ❌        | ❌          |
| **Medium** | 2-3    | **1**         | 2             | ✅        | ✅          |
| **Hard**   | 3-4    | **1**         | 3             | ✅        | ✅          |

**Key Changes**:
- **MEDIUM** and **HARD** now require **at least 1 operation per block** to prevent simple questions like "1 + 1" or "2 × 5"
- This ensures all MEDIUM and HARD questions have meaningful complexity

**Code Location**: Lines 118-137

### Step 2: Block Creation

For each block, call `createIntegerBlock()`:

**Function**: `createIntegerBlock(min, max, minOps, maxOps, allowPower, allowParentheses, difficulty, forceComplex?)`

**Process**:
1. **Initialize first term** using `createTerm()`
   - Can be: regular number, exponent, or parentheses expression
   - If `forceComplex` is true (for HARD), ensures first term uses exponent or parentheses
2. **Add operations** (`minOps` to `maxOps` times):
   - **Multiplication**: Multiply by another term
   - **Division**: Find valid divisor → divide exactly
   - **Note**: MEDIUM and HARD require at least 1 operation (`minOps = 1`)
3. **Validate**: Ensure result is integer (fallback if not)

**Key Logic for Division** (Lines 278-294):
```typescript
// DIVISION - Critical: Must find a divisor
const divisors = this.getDivisors(currentVal, max);

if (divisors.length > 0) {
  // Choose a random divisor
  const divisorVal = divisors[Math.floor(Math.random() * divisors.length)];
  currentVal /= divisorVal;
  currentView += ` ÷ ${divisorVal}`;
} else {
  // If not divisible (prime number), switch to MULTIPLICATION
  const nextTerm = this.createTerm(1, 5, false, false, difficulty);
  currentVal *= nextTerm.val;
  currentView += ` × ${nextTerm.view}`;
}
```

**Why This Works**:
- `getDivisors()` finds all divisors of `currentVal` up to `max`
- If divisors exist → choose one randomly → exact division guaranteed
- If no divisors (prime number) → switch to multiplication to avoid error

### Step 3: Term Creation

**Function**: `createTerm(min, max, allowPower, allowParentheses, difficulty)`

This function creates the smallest unit (term) with probability-based selection:

#### Probability Logic

**Easy** (not applicable, but defaults):
- Parentheses: 15% (disabled)
- Exponents: 20% (disabled)

**Medium**:
- Parentheses: **30%** chance
- Exponents: **20%** chance (when not parentheses)
- Regular number: 50% chance

**Hard**:
- Parentheses: **50%** chance
- Exponents: **40%** chance (when not parentheses)
- Regular number: 10% chance

**Code Location**: Lines 195-207

#### Term Types

1. **Parentheses Term** (Lines 211-223):
   ```typescript
   if (allowParentheses && rand < parenthesesChance) {
     const num1 = this.randomInt(1, 10);
     const num2 = this.randomInt(1, 10);
     const isPlus = Math.random() > 0.5;
     
     if (isPlus) {
       return { val: num1 + num2, view: `(${num1} + ${num2})` };
     } else {
       // Ensure positive result
       const larger = Math.max(num1, num2);
       const smaller = Math.min(num1, num2);
       return { val: larger - smaller, view: `(${larger} - ${smaller})` };
     }
   }
   ```
   - Generates `(A + B)` or `(A - B)` where result is always positive
   - Numbers limited to 1-10 for readability

2. **Exponent Term** (Lines 227-234):
   ```typescript
   if (allowPower && rand < exponentChance) {
     const base = this.randomInt(2, 5);  // Base: 2-5
     const power = Math.random() > 0.5 ? 2 : 3;  // Power: 2 or 3
     const val = Math.pow(base, power);
     const powerStr = power === 2 ? '²' : '³';
     return { val, view: `${base}${powerStr}` };
   }
   ```
   - Generates `base²` or `base³`
   - Base limited to 2-5 to avoid huge numbers (e.g., `5³ = 125`)

3. **Regular Number** (Lines 237-239):
   ```typescript
   const val = this.randomInt(min, max);
   return { val, view: `${val}` };
   ```
   - Simple random integer within difficulty range

### Step 4: Block Combination

**Code Location**: Lines 144-162

After creating all blocks, combine them with `+` or `-`:

```typescript
let questionText = blocks[0].view;  // Start with first block
let currentTotal = blocks[0].val;

for (let i = 1; i < blocks.length; i++) {
  const isPlus = Math.random() > 0.5;
  const block = blocks[i];
  
  if (isPlus) {
    questionText += ` + ${block.view}`;
    currentTotal += block.val;
  } else {
    questionText += ` - ${block.view}`;
    currentTotal -= block.val;
  }
}
```

**Result**: Expression like `2³ × 3 ÷ 2 + 5 - 4 × 2 = ?`

### Step 5: Final Question Assembly

**Code Location**: Lines 164-182

```typescript
const questionStr = `${questionText} = ?`;
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
    operands: blocks.map(b => b.val),  // Store block values
  },
};
```

**Note**: The `explanation` field has been removed from all question types.

---

## Equation Question Generation

### Overview

The equation generator (`generateEquationQuestion`) creates algebraic equations with variables. Each difficulty level has distinct logic:

### Easy: Simple Linear Equation

**Format**: `ax + b = c`

**Process** (Lines 339-363):
1. Generate coefficient `a` (1-5)
2. Generate variable value `x` (within difficulty range)
3. Generate constant `b` (1 to max)
4. Calculate right side: `c = a * x + b`
5. Question: `${a}x + ${b} = ${c}`
6. Answer: `x`

**Example**: `3x + 5 = 20` → Answer: `5`

### Medium: Multi-Term Equations

**Format**: `ax + b - cx + d = e` (3-5 terms)

**Process** (Lines 364-433):
1. Generate 3-5 terms
2. Each term can be:
   - Variable term: `coeff * x` (e.g., `3x`, `-5x`)
   - Constant term: number (e.g., `+10`, `-7`)
3. Ensure at least one `x` term
4. Calculate right side: sum of all terms evaluated at `x`
5. Question: `${leftSide} = ${rightSide}`
6. Answer: `x`

**Example**: `3x + 5 - 2x + 10 = 30` → Answer: `5`

**Code Logic**:
- Track `xCoeff` (sum of all x coefficients)
- Track `constantSum` (sum of all constants)
- Right side: `xCoeff * x + constantSum`

### Hard: Quadratic Equations

**Format**: `ax² + bx = c` (factorable quadratic equations)

**Requirements**:
- ✅ Must be a quadratic equation (degree 2)
- ✅ Always factorable (constructed from two integer roots)
- ✅ Solvable using standard methods (factoring or quadratic formula)
- ✅ Integer solutions guaranteed

**Process** (Lines 434-520):
1. **Generate two integer roots** (x1, x2):
   ```typescript
   let x1 = this.randomInt(-10, 10);
   let x2 = this.randomInt(-10, 10);
   // Avoid 0 for both roots
   ```

2. **Choose answer** (one of the roots):
   ```typescript
   const correctAnswer = Math.abs(x1) <= Math.abs(x2) ? x1 : x2;
   ```

3. **Generate coefficient a** (1-5, can be negative):
   ```typescript
   const aSign = Math.random() > 0.5 ? 1 : -1;
   const a = aSign * this.randomInt(1, 5);
   ```

4. **Construct equation from factored form**:
   - Factored form: `a(x - x1)(x - x2) = 0`
   - Expand: `a(x² - (x1 + x2)x + x1*x2) = 0`
   - Therefore: `b = -a(x1 + x2)`, `c = a*x1*x2`
   - Rearrange to: `ax² + bx = -c`

5. **Format question** with superscript: `x²`

**Example**: `-2x² - 28x = 96` → Answer: `-6`

**Key Features**:
- Equations are always factorable (constructed from integer roots)
- Can be solved by factoring: `(x - x1)(x - x2) = 0`
- Or using quadratic formula: `x = (-b ± √(b² - 4ac)) / 2a`
- Integer solutions guaranteed (roots are integers)
- `x` values range from -10 to 10 (excluding 0)

---

## Quality Control Mechanisms

### 1. Deduplication (`isDuplicate`)

**Purpose**: Prevent generating identical questions

**Process** (Lines 587-598):
1. Generate question key using `getQuestionKey()`
2. Check against all cached questions (excluding `excludeIds`)
3. If key matches → reject, retry

**Question Key Generation** (Lines 656-681):
- **For Hard quadratic equations**: Use full question string (better differentiation)
- **For equations with 2 operands**: `${operation}_${op1}_${op2}`
- **For equations with 3 operands**: `${operation}_${a}_${b}_${c}` (quadratic coefficients)
- **Otherwise**: Use full question string

### 2. Distribution Control (`checkDistribution`)

**Purpose**: Prevent any question pattern from appearing too frequently

**Process** (Lines 594-605):
1. Track frequency of each question key
2. Calculate ratio: `count / total`
3. Reject if ratio > `distributionThreshold` (difficulty-specific):
   - **Easy**: 15% threshold
   - **Medium**: 20% threshold (more lenient for complex questions)
   - **Hard**: 25% threshold (most lenient for very complex questions)

**Why Difficulty-Specific Thresholds**:
- Complex questions (MEDIUM/HARD) are harder to generate and more likely to be rejected
- Higher thresholds allow more variety while still preventing pattern dominance
- Ensures MEDIUM/HARD questions don't fall back to simple questions unnecessarily

**Example**:
- **Easy**: If `"mixed_12_5"` appears 16 times out of 100 total → ratio = 16% → **REJECT** (exceeds 15%)
- **Medium**: If `"mixed_12_5"` appears 18 times out of 100 total → ratio = 18% → **ACCEPT** (within 20%)
- **Hard**: If `"mixed_12_5"` appears 22 times out of 100 total → ratio = 22% → **ACCEPT** (within 25%)

### 3. Mode Collapse Prevention (`isModeCollapsed`)

**Purpose**: Prevent too many similar questions (same pattern)

**Process** (Lines 620-636):
1. Extract pattern from question key (first part before `_`)
2. Count how many questions share this pattern
3. Reject if pattern count > 30% of total coverage

**Example**:
- Pattern `"mixed"` appears 40 times out of 100 total → 40% → **REJECT**
- Pattern `"mixed"` appears 25 times out of 100 total → 25% → **ACCEPT**

### 4. Cache Management (`updateCache`)

**Purpose**: Maintain cache for quality control

**Process** (Lines 641-661):
1. Store question in `cache.questions`
2. Increment distribution count for question key
3. Increment total count for type/difficulty
4. Add question key to coverage set

---

## Examples

### Example 1: Easy Arithmetic

**Generation Process**:
1. **Difficulty Config**: 2 blocks, 0-1 op/block, no exponents/parentheses
2. **Block 1**: `createIntegerBlock()` → `{ val: 10, view: "10" }` (0 ops allowed for Easy)
3. **Block 2**: `createIntegerBlock()` → `{ val: 5, view: "5" }` (0 ops allowed for Easy)
4. **Combine**: `10 + 5 = ?`
5. **Answer**: `15`

**Result**: `10 + 5 = ?` (Answer: 15)

**Note**: EASY allows 0 operations per block (simple numbers), but MEDIUM and HARD require at least 1 operation per block

### Example 2: Medium Arithmetic with Exponents

**Generation Process**:
1. **Difficulty Config**: 2-3 blocks, **min 1 op/block**, max 2 ops/block, exponents ✅, parentheses ✅
2. **Block 1**: 
   - Term 1: `createTerm()` → `{ val: 8, view: "2³" }` (exponent)
   - Operation: `× 3` → `{ val: 24, view: "2³ × 3" }` (required: min 1 op)
   - Result: `{ val: 24, view: "2³ × 3" }`
3. **Block 2**: 
   - Term 1: `createTerm()` → `{ val: 5, view: "5" }` (regular)
   - Operation: `× 2` → `{ val: 10, view: "5 × 2" }` (required: min 1 op)
   - Result: `{ val: 10, view: "5 × 2" }`
4. **Combine**: `2³ × 3 + 5 × 2 = ?`
5. **Answer**: `24 + 10 = 34`

**Result**: `2³ × 3 + 5 × 2 = ?` (Answer: 34)

**Note**: MEDIUM requires at least 1 operation per block, preventing simple questions like "1 + 1" or "2 × 5"

### Example 3: Hard Arithmetic with Parentheses

**Generation Process**:
1. **Difficulty Config**: 3-4 blocks, **min 1 op/block**, max 3 ops/block, exponents ✅, parentheses ✅
2. **Block 1**: 
   - Term 1: `createTerm()` → `{ val: 8, view: "(3 + 5)" }` (parentheses, 50% chance)
   - Operation: `÷ 2` → `{ val: 4, view: "(3 + 5) ÷ 2" }`
   - Result: `{ val: 4, view: "(3 + 5) ÷ 2" }`
3. **Block 2**: 
   - Term 1: `createTerm()` → `{ val: 9, view: "3²" }` (exponent, 40% chance)
   - Result: `{ val: 9, view: "3²" }`
4. **Block 3**: 
   - Term 1: `createTerm()` → `{ val: 2, view: "2" }` (regular)
   - Result: `{ val: 2, view: "2" }`
5. **Combine**: `(3 + 5) ÷ 2 + 3² - 2 = ?`
6. **Answer**: `4 + 9 - 2 = 11`

**Result**: `(3 + 5) ÷ 2 + 3² - 2 = ?` (Answer: 11)

### Example 4: Medium Equation

**Generation Process**:
1. Generate 4 terms:
   - Term 1: `3x` (variable, coeff=3)
   - Term 2: `+ 5` (constant)
   - Term 3: `- 2x` (variable, coeff=-2)
   - Term 4: `+ 10` (constant)
2. Calculate: `xCoeff = 3 - 2 = 1`, `constantSum = 5 + 10 = 15`
3. Let `x = 5`: Right side = `1 * 5 + 15 = 20`
4. Question: `3x + 5 - 2x + 10 = 20`
5. Answer: `5`

**Result**: `3x + 5 - 2x + 10 = 20` (Answer: 5)

### Example 5: Hard Equation (Quadratic)

**Generation Process**:
1. **Generate roots**: `x1 = -6`, `x2 = 4`
2. **Choose answer**: `x = -6` (smaller absolute value)
3. **Generate coefficient**: `a = -2`
4. **Calculate coefficients**:
   - `b = -a(x1 + x2) = -(-2)(-6 + 4) = -2(-2) = -4`
   - `c = a*x1*x2 = -2*(-6)*4 = 48`
5. **Construct equation**: `-2x² - 4x = -48`
   - Rearranged: `-2x² - 4x + 48 = 0`
   - Factored: `-2(x + 6)(x - 4) = 0`
6. **Question**: `-2x² - 4x = -48`
7. **Answer**: `-6` (or `4`)

**Result**: `-2x² - 4x = -48` (Answer: -6)

**Verification**:
- `-2(-6)² - 4(-6) = -2(36) + 24 = -72 + 24 = -48` ✅

---

## Edge Cases & Guarantees

### Integer Result Guarantee

**How It's Guaranteed**:

1. **Block Level**:
   - Each block only contains `×` and `÷` operations
   - Division only happens when exact divisor exists (`getDivisors()`)
   - If no divisor → switch to multiplication
   - Result: Each block evaluates to integer ✅

2. **Expression Level**:
   - Blocks are combined with `+` or `-`
   - Integer + Integer = Integer ✅
   - Integer - Integer = Integer ✅

3. **Fallback Safety** (Lines 298-303):
   ```typescript
   if (!Number.isInteger(currentVal)) {
     // Fallback: return a simple block
     const simpleVal = this.randomInt(min, max);
     return { val: simpleVal, view: `${simpleVal}` };
   }
   ```

### Division by Zero Prevention

**How It's Prevented**:

1. **Term Creation**: Terms are never 0 (Lines 257-260):
   ```typescript
   if (currentTerm.val === 0) {
     currentTerm = { val: 2, view: '2' };
   }
   ```

2. **Divisor Selection**: `getDivisors()` excludes 0 and 1 (starts from 2)

3. **Division Logic**: Only divides when valid divisors exist

### PEMDAS Compliance

**How It's Enforced**:

1. **Block Structure**: Multiplication/division grouped in blocks
2. **Combination**: Blocks combined with addition/subtraction
3. **Natural Order**: Blocks evaluated first (higher precedence), then combined

**Example**:
```
Expression: 2³ × 3 ÷ 2 + 5
Blocks:     [2³ × 3 ÷ 2] + [5]
            Evaluate first: 12 + 5 = 17 ✅
```

### Large Number Prevention

**How It's Prevented**:

1. **Exponent Bases**: Limited to 2-5 (Lines 228)
2. **Exponent Powers**: Only 2 or 3 (Lines 229)
3. **Term Limits**: `Math.min(max, 10)` for term generation (Line 255)
4. **Equation x Values**: Limited to 1-10 for Hard difficulty (Line 443)

### Question Diversity

**How It's Ensured**:

1. **Deduplication**: Prevents exact duplicates
2. **Distribution Control**: Limits pattern frequency (difficulty-specific):
   - Easy: 15%
   - Medium: 20%
   - Hard: 25%
3. **Mode Collapse Prevention**: Limits pattern dominance to 30%
4. **Retry Mechanism**: Difficulty-specific retry counts:
   - Easy: 20 attempts
   - Medium: 30 attempts (more opportunities for complex questions)
   - Hard: 40 attempts (most opportunities for very complex questions)
5. **Fallback**: Question that respects difficulty level if all retries fail

### Fallback Safety

**When Fallback Triggers**:
- All retry attempts fail (duplicate/distribution/mode collapse)
  - Easy: After 20 attempts
  - Medium: After 30 attempts
  - Hard: After 40 attempts
- Non-integer result detected (should never happen, but safety check)

**Fallback Questions** (Lines 722-900):
Fallback questions now **respect difficulty level** to ensure appropriate complexity:

#### Arithmetic Fallbacks

- **Easy**: Simple addition: `5 + 3 = ?`
- **Medium**: 2 blocks, each with 1 operation: `4 × 5 + 2 × 3 = ?`
  - Ensures minimum 1 operation per block requirement
- **Hard**: 3 blocks with exponents/parentheses: `2³ × 3 + 4 × 5 - 2 × 3 = ?`
  - Includes exponents or parentheses
  - Multiple operations per block

#### Equation Fallbacks

- **Easy**: Simple linear: `3x + 5 = 20`
- **Medium**: Multi-term: `5x + 10 - 2x + 5 = 30`
  - Requires combining like terms
- **Hard**: Quadratic: `4x² + 24x = 64`
  - Factorable quadratic equation

**Key Improvements**:
- ✅ Fallback questions match difficulty requirements
- ✅ No more simple `1 + 1` questions in MEDIUM/HARD
- ✅ All fallbacks guarantee integer results
- ✅ Maintains progressive difficulty even in fallback scenarios

---

## Summary

The `QuestionGenerator` implements a robust, mathematically sound system for generating quiz questions:

✅ **Arithmetic Questions**: Block-based architecture guarantees integer results and PEMDAS compliance  
✅ **Equation Questions**: Progressive complexity from simple linear to quadratic equations  
✅ **Quality Control**: Deduplication, distribution control, and mode collapse prevention  
✅ **Edge Case Handling**: Division by zero prevention, large number limits, fallback safety  
✅ **Difficulty Scaling**: Easy → Medium → Hard increases complexity systematically  
✅ **No Explanations**: All questions are generated without explanation fields for cleaner API responses

### Complete Feature Matrix

| Feature | ARITHMETICS | EQUATIONS |
|---------|-------------|-----------|
| **Easy** | 2 blocks, 0-1 op/block, basic operations | Simple linear: `ax + b = c` |
| **Medium** | 2-3 blocks, **min 1 op/block**, max 2 ops/block, exponents, parentheses | Multi-term with like terms |
| **Hard** | 3-4 blocks, **min 1 op/block**, max 3 ops/block, complex expressions | Quadratic: `ax² + bx = c` |
| **Integer Results** | ✅ Guaranteed | ✅ Guaranteed |
| **PEMDAS Compliance** | ✅ Enforced | ✅ N/A (equations) |
| **Exponents** | ✅ (², ³) | ✅ (x² only in Hard) |
| **Parentheses** | ✅ | ❌ |
| **Factorable** | N/A | ✅ (Hard only) |

The block-based approach is the key innovation that solves the integer result problem while naturally enforcing PEMDAS order of operations.

