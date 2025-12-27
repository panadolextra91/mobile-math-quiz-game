# Math Maze Backend

Backend server for the Math Maze Runner game.

## Features

- ✅ Rule-based quiz generation with deduplication
- ✅ Distribution control and coverage tracking
- ✅ Mode collapse prevention
- ✅ Retry logic for question generation
- ✅ Game session management
- ✅ Leaderboard system
- ✅ Player statistics and achievements
- ✅ PostgreSQL database with Prisma ORM
- ✅ Persistent data storage (survives server restarts)
- ✅ Error handling middleware
- ✅ Request logging
- ✅ Rate limiting (100 req/min)
- ✅ Input validation with Zod
- ✅ TypeScript support

## Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Start PostgreSQL database (Docker):**
```bash
docker-compose up -d
# or: npm run db:up
```

3. **Copy `.env.example` to `.env` and configure:**
```bash
cp env.example .env
```
The `.env` file already has the correct `DATABASE_URL` for Docker setup.

4. **Set up database schema:**
```bash
npm run prisma:generate
npm run prisma:migrate
```

5. **Run in development mode:**
```bash
npm run dev
```

6. **Build for production:**
```bash
npm run build
npm start
```

**Note**: See [PRISMA_SETUP.md](./PRISMA_SETUP.md) for detailed database setup instructions.

## API Documentation

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete API reference.

## Quick API Overview

### Quiz
- `POST /api/quiz/generate` - Generate quiz questions

### Game
- `POST /api/game/session` - Create new game session
- `GET /api/game/session/:sessionId` - Get game session
- `POST /api/game/answer` - Submit answer
- `POST /api/game/boost` - Apply boost
- `POST /api/game/boost/erase` - Use erase obstacle boost
- `POST /api/game/session/:sessionId/end` - End game session

### Leaderboard
- `GET /api/leaderboard` - Get leaderboard (with filters)
- `GET /api/leaderboard/player/:playerName` - Get player's best score
- `GET /api/leaderboard/player/:playerName/rank` - Get player's rank

### Stats
- `GET /api/stats/player/:playerName` - Get player statistics

### Health
- `GET /health` - Health check endpoint

## Project Structure

```
src/
  lib/             # Prisma client and database utilities
  middleware/      # Error handling, logging, rate limiting
  routes/          # API route handlers
  services/        # Business logic (uses Prisma for database)
  types/           # TypeScript type definitions
  utils/           # Question generator utilities
  index.ts         # Application entry point
prisma/
  schema.prisma    # Database schema definition
  migrations/      # Database migration files
docker-compose.yml # PostgreSQL Docker configuration
```

## Environment Variables

See `env.example` for available configuration options.

## Development

- **Linting**: `npm run lint`
- **Formatting**: `npm run format`
- **Testing**: `npm test` (when tests are added)

## Rate Limiting

- Default: 100 requests per minute per IP
- Configurable via middleware
- Headers included in responses

## Error Handling

All errors are handled by centralized middleware:
- Validation errors (400)
- Not found errors (404)
- Rate limit errors (429)
- Server errors (500)

