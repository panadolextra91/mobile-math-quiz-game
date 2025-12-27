# Math Maze Runner

A mobile math learning game built with React Native and Node.js. Navigate through a maze by solving math problems!

## 📚 Documentation

This project includes comprehensive documentation:

- **[Backend README](./backend/README.md)** - Backend setup, features, and project structure
- **[API Documentation](./backend/API_DOCUMENTATION.md)** - Complete API reference with endpoints, request/response formats, and examples
- **[Database Setup Guide](./backend/PRISMA_SETUP.md)** - PostgreSQL setup with Docker or manual installation
- **[Question Generator Logic](./backend/src/utils/QUESTION_GENERATOR_LOGIC.md)** - Detailed explanation of the question generation algorithm, block-based architecture, and difficulty scaling
- **[Frontend Structure](./frontend/STRUCTURE.md)** - Frontend project organization, path aliases, and best practices

## 🎮 Game Concept

Players navigate through a maze from start to finish. Obstacles block the path, and each obstacle is a math question that must be answered correctly to proceed. The game features:

- **Health System**: 3 hearts - lose one for each wrong answer
- **Streak System**: Answer 3 questions correctly to earn a boost
- **Boost Options**:
  - 🗑️ **Erase Obstacle**: Remove one obstacle from the maze
  - ⚡ **Double Points**: Next correct answer gives double points
  - 🛡️ **Shield**: Protect against one wrong answer

### Question Types

- **Arithmetics**: Multi-operation expressions with `+`, `-`, `×`, `÷`, exponents (², ³), and parentheses
- **Equations**: Linear equations (Easy/Medium) and quadratic equations (Hard)

### Difficulty Levels

- **Easy**: Simple arithmetic (2 blocks, 0-1 op/block) or basic linear equations
- **Medium**: Moderate complexity (2-3 blocks, min 1 op/block) with exponents/parentheses or multi-term equations
- **Hard**: Complex expressions (3-4 blocks, min 1 op/block) with multiple operations or quadratic equations

See [Question Generator Logic](./backend/src/utils/QUESTION_GENERATOR_LOGIC.md) for detailed information.

## 🏗️ Project Structure

```
dangkhiem/
├── backend/                    # Node.js/Express API server
│   ├── src/
│   │   ├── routes/            # API route handlers
│   │   ├── services/         # Business logic (game, leaderboard, stats)
│   │   ├── utils/            # Question generator
│   │   ├── middleware/       # Error handling, logging, rate limiting
│   │   ├── lib/              # Prisma client and database utilities
│   │   ├── types/            # TypeScript type definitions
│   │   └── index.ts          # Application entry point
│   ├── prisma/
│   │   ├── schema.prisma     # Database schema
│   │   └── migrations/       # Database migrations
│   ├── docker-compose.yml    # PostgreSQL Docker configuration
│   ├── API_DOCUMENTATION.md  # Complete API reference
│   ├── PRISMA_SETUP.md       # Database setup guide
│   └── README.md             # Backend documentation
│
└── frontend/                 # React Native mobile app (Expo)
    ├── app/                  # Expo Router routes (file-based routing)
    │   ├── index.tsx        # Home screen
    │   ├── Game.tsx         # Game screen
    │   ├── Leaderboard.tsx  # Leaderboard screen
    │   └── PersonaStats.tsx # Personal statistics screen
    ├── src/
    │   ├── components/      # Reusable UI components
    │   ├── store/           # Zustand state management
    │   ├── services/        # API services
    │   ├── hooks/           # Custom React hooks
    │   ├── constants/       # App constants (fonts, game, theme)
    │   ├── types/           # TypeScript type definitions
    │   └── utils/           # Utility functions
    ├── assets/              # Static assets (images, fonts, sounds)
    ├── STRUCTURE.md         # Frontend project structure guide
    └── package.json
```

## ✨ Features

### Backend
- ✅ **PostgreSQL Database** with Prisma ORM (persistent data storage)
- ✅ **Rule-based quiz generation** with deduplication and distribution control
- ✅ **Block-based arithmetic architecture** guaranteeing 100% integer results
- ✅ **PEMDAS-compliant** question generation
- ✅ **Progressive difficulty scaling** (Easy → Medium → Hard)
- ✅ **Game session management** with health, score, and streak tracking
- ✅ **Leaderboard system** with filtering (quiz type, difficulty, timeframe)
- ✅ **Player statistics** and achievements tracking
- ✅ **Boost system** (erase obstacle, double points, shield)
- ✅ **RESTful API** with TypeScript
- ✅ **Rate limiting** (100 requests/minute)
- ✅ **Input validation** with Zod
- ✅ **Error handling** middleware
- ✅ **Request logging**

### Frontend
- ✅ **React Native** with Expo and TypeScript
- ✅ **Zustand** for state management (game session, UI, quiz state)
- ✅ **Expo Router** for file-based routing
- ✅ **Sprite animations** (cat, obstacles: dogs, rats, birds)
- ✅ **Question modal** with multiple choice options
- ✅ **Boost selection system** with modal
- ✅ **Game stats display** (health, score, streak)
- ✅ **Leaderboard screen** with filters
- ✅ **Personal statistics screen** with achievements
- ✅ **Settings board** (music, sound, language)
- ✅ **End game board** (win/lose conditions)
- ✅ **Background animations** and collision detection

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Docker (for PostgreSQL) or PostgreSQL installed locally
- Expo CLI (for frontend development)

### Backend Setup

1. **Navigate to backend directory:**
```bash
cd backend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up PostgreSQL database:**
```bash
# Using Docker (recommended)
docker-compose up -d
# or: npm run db:up

# See PRISMA_SETUP.md for manual setup
```

4. **Configure environment variables:**
```bash
cp env.example .env
# The .env file already has the correct DATABASE_URL for Docker setup
```

5. **Set up database schema:**
```bash
npm run prisma:generate
npm run prisma:migrate
```

6. **Start development server:**
```bash
npm run dev
```

The API will be available at `http://localhost:3000`

**For detailed setup instructions, see:**
- [Backend README](./backend/README.md)
- [Database Setup Guide](./backend/PRISMA_SETUP.md)

### Frontend Setup

1. **Navigate to frontend directory:**
```bash
cd frontend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Configure API URL (if needed):**
```bash
# Update EXPO_PUBLIC_API_URL in .env or app.json
# Default: http://localhost:3000/api
```

4. **Start Expo development server:**
```bash
npm start
```

5. **Run on device/simulator:**
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with Expo Go app on your phone

**For detailed frontend structure, see:**
- [Frontend Structure Guide](./frontend/STRUCTURE.md)

## 📡 API Overview

The backend provides a RESTful API with the following endpoints:

### Quiz Endpoints
- `POST /api/quiz/generate` - Generate quiz questions

### Game Endpoints
- `POST /api/game/session` - Create new game session
- `GET /api/game/session/:sessionId` - Get game session
- `POST /api/game/answer` - Submit answer
- `POST /api/game/boost` - Apply boost
- `POST /api/game/boost/erase` - Use erase obstacle boost
- `POST /api/game/session/:sessionId/end` - End game session

### Leaderboard Endpoints
- `GET /api/leaderboard` - Get leaderboard (with filters)
- `GET /api/leaderboard/player/:playerName` - Get player's best score
- `GET /api/leaderboard/player/:playerName/rank` - Get player's rank

### Stats Endpoints
- `GET /api/stats/player/:playerName` - Get player statistics

### Health Check
- `GET /health` - Server health check

**For complete API documentation with request/response formats, validation, and examples, see:**
- [API Documentation](./backend/API_DOCUMENTATION.md)

## 🎯 Game Mechanics

### Maximum Questions per Difficulty
- **Easy**: 10 questions
- **Medium**: 15 questions
- **Hard**: 20 questions

### Points Calculation
Points are calculated based on:
- **Base Points**: Easy (10), Medium (20), Hard (30) per correct answer
- **Streak Multiplier**: `1 + (streak × 0.1)`, capped at 2x (max 20 streak)
- **Double Points Boost**: 2x multiplier (stacks with streak)
- **Final Formula**: `floor(basePoints × streakMultiplier × doublePointsMultiplier)`

### Health System
- **Starting Health**: 3 hearts
- **Lose Health**: When answering incorrectly (unless shield is active)
- **Game Over**: When health reaches 0 OR max questions answered

### Streak System
- **Increment**: +1 for each correct answer
- **Reset**: Set to 0 on incorrect answer (unless shield is active)
- **Boost Earned**: Every 3 consecutive correct answers (streak 3, 6, 9, etc.)

### Boost Types
- **Erase Obstacle**: Remove one obstacle from the maze (consumed on use)
- **Double Points**: Next correct answer gives double points (consumed after use)
- **Shield**: Protect against one wrong answer (doesn't lose health, consumed after use)

**For detailed game mechanics, see:**
- [API Documentation - Game Mechanics](./backend/API_DOCUMENTATION.md#game-mechanics)

## 🧠 Question Generation

The question generator uses a sophisticated **block-based architecture** that guarantees:

- ✅ **100% integer results** (no decimal answers)
- ✅ **PEMDAS compliance** (Parentheses, Exponents, Multiplication/Division, Addition/Subtraction)
- ✅ **Progressive difficulty** with complexity scaling
- ✅ **Question diversity** through deduplication and distribution control
- ✅ **Mode collapse prevention**

**For detailed explanation of the algorithm, see:**
- [Question Generator Logic](./backend/src/utils/QUESTION_GENERATOR_LOGIC.md)

## 🛠️ Technologies Used

### Backend
- **Node.js** + **Express** - Web framework
- **TypeScript** - Type safety
- **PostgreSQL** - Database
- **Prisma** - ORM and database toolkit
- **Zod** - Schema validation
- **Docker** - Database containerization
- **CORS** - Cross-origin resource sharing

### Frontend
- **React Native** - Mobile framework
- **Expo** - Development platform
- **TypeScript** - Type safety
- **Zustand** - State management
- **Expo Router** - File-based routing
- **React Native Reanimated** - Animations
- **Expo Image** - Image optimization
- **React Native SVG** - SVG rendering

## 📦 Development Scripts

### Backend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run linter
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run database migrations
npm run prisma:studio    # Open Prisma Studio (database GUI)
npm run db:up        # Start PostgreSQL with Docker
npm run db:down      # Stop PostgreSQL
npm run test:showcase # Run question generator showcase test
```

### Frontend
```bash
npm start            # Start Expo development server
npm run android      # Run on Android
npm run ios          # Run on iOS
npm run web          # Run on web
npm run lint         # Run linter
```

## 🔮 Future Enhancements

- [ ] Sound effects and background music
- [ ] Pause/resume functionality
- [ ] Daily challenges
- [ ] Multiplayer mode
- [ ] Push notifications
- [ ] Dark mode
- [ ] More question types
- [ ] Adaptive difficulty
- [ ] Social features (share achievements)
- [ ] Unique player ID system (currently players with identical names share stats)

## 📄 License

MIT

---

**Need help?** Check out the [documentation](#-documentation) section above for detailed guides on specific topics.
