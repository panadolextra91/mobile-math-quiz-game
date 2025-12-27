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
**POST** `/quiz/generate`

Generate a set of math questions.

**Request Body:**
```json
{
  "type": "arithmetics" | "equations",
  "difficulty": "easy" | "medium" | "hard",
  "count": 20  // optional, default: 20, max: 100
}
```

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
        "question": "5 + 3 = ?",
        "correctAnswer": 8,
        "options": [6, 7, 8, 9],
        "explanation": "5 plus 3 equals 8",
        "metadata": {
          "operation": "+",
          "operands": [5, 3]
        }
      }
    ],
    "count": 20,
    "type": "arithmetics",
    "difficulty": "easy"
  }
}
```

## Game Endpoints

### Create Game Session
**POST** `/game/session`

Create a new game session.

**Request Body:**
```json
{
  "playerName": "John Doe",
  "quizType": "arithmetics" | "equations",
  "difficulty": "easy" | "medium" | "hard"
}
```

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
**GET** `/game/session/:sessionId`

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
**POST** `/game/answer`

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

**Response:**
```json
{
  "success": true,
  "data": {
    "session": {
      // Updated session object
    },
    "earnedBoost": false,  // true if streak reached 3
    "gameOver": false      // true if health reached 0
  }
}
```

### Apply Boost
**POST** `/game/boost`

Apply a boost after earning it (3 consecutive correct answers).

**Request Body:**
```json
{
  "sessionId": "session-uuid",
  "boostType": "erase_obstacle" | "double_points" | "shield"
}
```

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
**POST** `/game/boost/erase`

Use the erase obstacle boost to remove an obstacle.

**Request Body:**
```json
{
  "sessionId": "session-uuid"
}
```

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
**POST** `/game/session/:sessionId/end`

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
**GET** `/leaderboard`

Get leaderboard entries with optional filters.

**Query Parameters:**
- `limit` (optional): Number of entries (default: 100, max: 1000)
- `quizType` (optional): Filter by quiz type
- `difficulty` (optional): Filter by difficulty
- `timeframe` (optional): "daily" | "weekly" | "all-time" (default: "all-time")

**Example:**
```
GET /leaderboard?limit=50&quizType=arithmetics&difficulty=easy&timeframe=daily
```

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
**GET** `/leaderboard/player/:playerName`

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
**GET** `/leaderboard/player/:playerName/rank`

Get a player's rank in the leaderboard.

**Query Parameters:**
- `quizType` (optional): Filter by quiz type
- `difficulty` (optional): Filter by difficulty

**Response:**
```json
{
  "success": true,
  "data": {
    "rank": 5  // or null if not found
  }
}
```

## Stats Endpoints

### Get Player Statistics
**GET** `/stats/player/:playerName`

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
**GET** `/health`

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

## Boost Types

- `erase_obstacle`: Remove one obstacle from the maze
- `double_points`: Next correct answer gives double points
- `shield`: Protect against one wrong answer (doesn't lose health)

## Setup & Configuration

See [PRISMA_SETUP.md](./PRISMA_SETUP.md) for database setup instructions.

**Quick Start**:
1. Start PostgreSQL with Docker: `docker-compose up -d`
2. Configure `.env` with `DATABASE_URL`
3. Run migrations: `npm run prisma:migrate`
4. Start server: `npm run dev`

