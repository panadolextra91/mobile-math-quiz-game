# Math Maze Runner

A mobile math learning game built with React Native and Node.js. Navigate through a maze by solving math problems!

## Game Concept

Players navigate through a maze from start to finish. Obstacles block the path, and each obstacle is a math question that must be answered correctly to proceed. The game features:

- **Health System**: 3 hearts - lose one for each wrong answer
- **Streak System**: Answer 3 questions correctly to earn a boost
- **Boost Options**:
  - 🗑️ Erase Obstacle: Remove one obstacle from the maze
  - ⚡ Double Points: Next correct answer gives double points
  - 🛡️ Shield: Protect against one wrong answer

## Project Structure

```
dangkhiem/
├── backend/          # Node.js/Express API server
│   ├── src/
│   │   ├── routes/   # API routes
│   │   ├── services/ # Business logic
│   │   ├── utils/    # Question generator
│   │   └── types/    # TypeScript types
│   └── package.json
│
└── frontend/         # React Native mobile app
    ├── src/
    │   ├── components/  # UI components
    │   ├── screens/     # Screen components
    │   ├── store/       # Zustand state management
    │   ├── services/    # API services
    │   └── types/       # TypeScript types
    └── package.json
```

## Features

### Backend
- ✅ Rule-based quiz generation with deduplication
- ✅ Distribution control and coverage tracking
- ✅ Mode collapse prevention
- ✅ Retry logic for question generation
- ✅ Game session management
- ✅ Leaderboard system
- ✅ Player statistics and achievements
- ✅ RESTful API with TypeScript

### Frontend
- ✅ React Native with TypeScript
- ✅ Zustand for state management
- ✅ Maze grid navigation
- ✅ Question modal with multiple choice
- ✅ Boost selection system
- ✅ Health and score display
- ✅ Leaderboard screen
- ✅ Statistics screen
- ✅ Offline support with AsyncStorage

## Getting Started

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env  # Configure your environment variables
npm run dev
```

The API will be available at `http://localhost:3000`

### Frontend Setup

```bash
cd frontend
npm install
# Update API URL in src/config/api.ts if needed
npm start
```

Then press `i` for iOS or `a` for Android.

## API Endpoints

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
- `GET /api/leaderboard` - Get leaderboard
- `GET /api/leaderboard/player/:playerName` - Get player's best score
- `GET /api/leaderboard/player/:playerName/rank` - Get player's rank

### Stats
- `GET /api/stats/player/:playerName` - Get player statistics

## Technologies Used

### Backend
- Node.js + Express
- TypeScript
- Zod for validation
- In-memory storage (can be extended to PostgreSQL/Redis)

### Frontend
- React Native + Expo
- TypeScript
- Zustand for state management
- React Navigation
- React Native Paper (UI components)
- AsyncStorage for persistence
- Axios for API calls

## Future Enhancements

- [ ] Database integration (PostgreSQL + Redis)
- [ ] Sound effects and animations
- [ ] Daily challenges
- [ ] Multiplayer mode
- [ ] Push notifications
- [ ] Dark mode
- [ ] More question types
- [ ] Adaptive difficulty
- [ ] Social features (share achievements)
- [ ] Unique player ID system to handle duplicate player names (currently players with identical names share the same stats record)

## License

MIT

