# API Documentation

Base URL: `http://localhost:3000/api`

## Overview

This API provides endpoints for a math maze runner game. All game data, leaderboards, and player statistics are persisted in a PostgreSQL database using Prisma ORM.

**Note**: All data is now persistent across server restarts. Game sessions, leaderboard entries, and player statistics are stored in the database.

All responses follow this format:
```json
{
  "success": true|false,
  "data": {...},
  "error": "error message",
  "details": [...]
}
```

## Quiz Endpoints

### Generate Quiz
**POST** `/api/quiz/generate`

Generate a set of math questions.

**Request Body:**
```json
{
  "type": "arithmetics" | "equations",
  "difficulty": "easy" | "medium" | "hard",
  "count": 20  // optional, default: 20, max: 100
}
```

**Validation:**
- `type`: Must be `"arithmetics"` or `"equations"`
- `difficulty`: Must be `"easy"`, `"medium"`, or `"hard"`
- `count`: Integer between 1 and 100 (default: 20)

**Response:**
```json
{
  "success": true,
  "data": {
    "questions": [
      {
        "id": "uuid",
        "type": "arithmetics",
        "difficulty": "easy",
        "question": "3 ÷ 3 - 8 = ?",
        "correctAnswer": -7,
        "options": [-7, -8, -9, -4],
        "metadata": {
          "operation": "mixed",
          "operands": [1, 8]
        }
      }
    ],
    "count": 20,
    "type": "arithmetics",
    "difficulty": "easy"
  }
}
```

**Note**: Questions no longer include an `explanation` field. The `metadata` field contains operation type and operands for internal use.

## Game Endpoints

### Create Game Session
**POST** `/api/game/session`

Create a new game session.

**Request Body:**
```json
{
  "playerName": "John Doe",
  "quizType": "arithmetics" | "equations",
  "difficulty": "easy" | "medium" | "hard"
}
```

**Validation:**
- `playerName`: String, 1-50 characters
- `quizType`: Must be `"arithmetics"` or `"equations"`
- `difficulty`: Must be `"easy"`, `"medium"`, or `"hard"`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "session-uuid",
    "playerName": "John Doe",
    "quizType": "arithmetics",
    "difficulty": "easy",
    "currentQuestionIndex": 0,
    "score": 0,
    "streak": 0,
    "health": 3,
    "maxHealth": 3,
    "boosts": [],
    "questionsAnswered": 0,
    "questionsCorrect": 0,
    "startTime": "2024-01-01T00:00:00.000Z"
  }
}
```

### Get Game Session
**GET** `/api/game/session/:sessionId`

Get current game session state.

**Response:**
```json
{
  "success": true,
  "data": {
    // Same as create session response
  }
}
```

### Submit Answer
**POST** `/api/game/answer`

Submit an answer to a question.

**Request Body:**
```json
{
  "sessionId": "session-uuid",
  "questionId": "question-uuid",
  "answer": 8,
  "isCorrect": true
}
```

**Validation:**
- `sessionId`: Must be a valid UUID
- `questionId`: Must be a valid UUID
- `answer`: Must be a number
- `isCorrect`: Must be a boolean

**Response:**
```json
{
  "success": true,
  "data": {
    "session": {
      "id": "session-uuid",
      "playerName": "John Doe",
      "quizType": "arithmetics",
      "difficulty": "easy",
      "currentQuestionIndex": 1,
      "score": 10,
      "streak": 1,
      "health": 3,
      "maxHealth": 3,
      "boosts": [],
      "questionsAnswered": 1,
      "questionsCorrect": 1,
      "startTime": "2024-01-01T00:00:00.000Z"
    },
    "earnedBoost": false,  // true if streak reached 3
    "gameOver": false      // true if health reached 0 or max questions answered
  }
}
```

**Note**: 
- When `gameOver` is `true`, the leaderboard and player stats are automatically updated
- `gameOver` is `true` when health reaches 0 OR when max questions are answered
- Points are calculated based on difficulty and streak (see Game Mechanics section)
- Double points boost is automatically consumed after one correct answer
- Shield boost protects against one wrong answer (doesn't lose health, but boost is consumed)
- Boost is earned when streak reaches 3 (and every 3 after that)

### Apply Boost
**POST** `/api/game/boost`

Apply a boost after earning it (3 consecutive correct answers).

**Request Body:**
```json
{
  "sessionId": "session-uuid",
  "boostType": "erase_obstacle" | "double_points" | "shield"
}
```

**Validation:**
- `sessionId`: Must be a valid UUID
- `boostType`: Must be `"erase_obstacle"`, `"double_points"`, or `"shield"`

**Response:**
```json
{
  "success": true,
  "data": {
    // Updated session with boost added
  }
}
```

### Use Erase Obstacle Boost
**POST** `/api/game/boost/erase`

Use the erase obstacle boost to remove an obstacle.

**Request Body:**
```json
{
  "sessionId": "session-uuid"
}
```

**Validation:**
- `sessionId`: Must be a valid UUID

**Note**: This endpoint removes the `erase_obstacle` boost from the session. The boost must exist in the session's boosts array.

**Response:**
```json
{
  "success": true,
  "data": {
    // Updated session with boost removed
  }
}
```

### End Game Session
**POST** `/api/game/session/:sessionId/end`

Manually end a game session (updates leaderboard and stats).

**Response:**
```json
{
  "success": true,
  "data": {
    // Final session state
  }
}
```

## Leaderboard Endpoints

### Get Leaderboard
**GET** `/api/leaderboard`

Get leaderboard entries with optional filters.

**Query Parameters:**
- `limit` (optional): Number of entries (default: 100, max: 1000)
- `quizType` (optional): Filter by quiz type
- `difficulty` (optional): Filter by difficulty
- `timeframe` (optional): "daily" | "weekly" | "all-time" (default: "all-time")

**Example:**
```
GET /api/leaderboard?limit=50&quizType=arithmetics&difficulty=easy&timeframe=daily
```

**Validation:**
- `limit`: Integer between 1 and 1000 (default: 100)
- `quizType`: Optional, must be `"arithmetics"` or `"equations"`
- `difficulty`: Optional, must be `"easy"`, `"medium"`, or `"hard"`
- `timeframe`: Optional, must be `"daily"`, `"weekly"`, or `"all-time"` (default: `"all-time"`)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "playerName": "John Doe",
      "score": 500,
      "questionsCorrect": 15,
      "questionsAnswered": 20,
      "accuracy": 0.75,
      "quizType": "arithmetics",
      "difficulty": "easy",
      "completedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### Get Player Best Score
**GET** `/api/leaderboard/player/:playerName`

Get a player's best score.

**Response:**
```json
{
  "success": true,
  "data": {
    // Leaderboard entry or null
  }
}
```

### Get Player Rank
**GET** `/api/leaderboard/player/:playerName/rank`

Get a player's rank in the leaderboard.

**Query Parameters:**
- `quizType` (optional): Filter by quiz type (`"arithmetics"` or `"equations"`)
- `difficulty` (optional): Filter by difficulty (`"easy"`, `"medium"`, or `"hard"`)

**Response:**
```json
{
  "success": true,
  "data": {
    "rank": 5  // or null if player not found in leaderboard
  }
}
```

## Stats Endpoints

### Get Player Statistics
**GET** `/api/stats/player/:playerName`

Get comprehensive player statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "playerName": "John Doe",
    "totalGames": 10,
    "totalQuestionsAnswered": 200,
    "totalQuestionsCorrect": 150,
    "overallAccuracy": 0.75,
    "bestScore": 500,
    "longestStreak": 10,
    "achievements": [
      {
        "id": "first_game",
        "name": "First Steps",
        "description": "Complete your first game",
        "unlockedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "quizTypeStats": {
      "arithmetics": {
        "games": 5,
        "accuracy": 0.8,
        "bestScore": 500
      },
      "equations": {
        "games": 5,
        "accuracy": 0.7,
        "bestScore": 400
      }
    },
    "difficultyStats": {
      "easy": {
        "games": 3,
        "accuracy": 0.9,
        "bestScore": 300
      },
      "medium": {
        "games": 5,
        "accuracy": 0.75,
        "bestScore": 500
      },
      "hard": {
        "games": 2,
        "accuracy": 0.6,
        "bestScore": 200
      }
    }
  }
}
```

## Health Check

### Health Check
**GET** `/api/health`

Check server status.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600
}
```

## Error Responses

### Validation Error (400)
```json
{
  "success": false,
  "error": "Validation Error",
  "details": [
    {
      "path": "playerName",
      "message": "Required"
    }
  ]
}
```

### Not Found (404)
```json
{
  "success": false,
  "error": "Session not found"
}
```

### Rate Limit (429)
```json
{
  "success": false,
  "error": "Too many requests. Please try again later.",
  "retryAfter": 30
}
```

### Server Error (500)
```json
{
  "success": false,
  "error": "Internal server error"
}
```

## Rate Limiting

- **Limit**: 100 requests per minute per IP
- **Headers**: 
  - `X-RateLimit-Limit`: Maximum requests
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Reset time (ISO string)

## Database & Persistence

- **Database**: PostgreSQL 16
- **ORM**: Prisma
- **Persistence**: All data (sessions, leaderboards, stats) persists across server restarts
- **Session Cleanup**: Old game sessions (older than 1 hour) are automatically cleaned up

## Game Mechanics

### Maximum Questions per Difficulty
- **Easy**: 10 questions
- **Medium**: 15 questions
- **Hard**: 20 questions

### Points Calculation
Points are calculated based on:
- **Base Points**:
  - Easy: 10 points per correct answer
  - Medium: 20 points per correct answer
  - Hard: 30 points per correct answer
- **Streak Multiplier**: `1 + (streak × 0.1)`, capped at 2x (max 20 streak)
- **Double Points Boost**: 2x multiplier (stacks with streak)
- **Final Formula**: `floor(basePoints × streakMultiplier × doublePointsMultiplier)`

**Examples**:
- Easy, streak 1: `floor(10 × 1.1 × 1) = 11 points`
- Medium, streak 5: `floor(20 × 1.5 × 1) = 30 points`
- Hard, streak 3 with double points: `floor(30 × 1.3 × 2) = 78 points`

### Health System
- **Starting Health**: 3
- **Lose Health**: When answering incorrectly (unless shield is active)
- **Game Over**: When health reaches 0 OR max questions answered

### Streak System
- **Increment**: +1 for each correct answer
- **Reset**: Set to 0 on incorrect answer (unless shield is active)
- **Boost Earned**: Every 3 consecutive correct answers (streak 3, 6, 9, etc.)

## Boost Types

- `erase_obstacle`: Remove one obstacle from the maze (consumed on use)
- `double_points`: Next correct answer gives double points (consumed after use)
- `shield`: Protect against one wrong answer (doesn't lose health, consumed after use)

## Setup & Configuration

See [PRISMA_SETUP.md](./PRISMA_SETUP.md) for database setup instructions.

**Quick Start**:
1. Start PostgreSQL with Docker: `docker-compose up -d`
2. Configure `.env` with `DATABASE_URL`
3. Run migrations: `npm run prisma:migrate`
4. Start server: `npm run dev`

