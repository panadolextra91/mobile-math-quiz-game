-- CreateEnum
CREATE TYPE "QuizType" AS ENUM ('arithmetics', 'equations');

-- CreateEnum
CREATE TYPE "DifficultyLevel" AS ENUM ('easy', 'medium', 'hard');

-- CreateEnum
CREATE TYPE "BoostType" AS ENUM ('erase_obstacle', 'double_points', 'shield');

-- CreateTable
CREATE TABLE "game_sessions" (
    "id" TEXT NOT NULL,
    "playerName" TEXT NOT NULL,
    "quizType" "QuizType" NOT NULL,
    "difficulty" "DifficultyLevel" NOT NULL,
    "currentQuestionIndex" INTEGER NOT NULL DEFAULT 0,
    "score" INTEGER NOT NULL DEFAULT 0,
    "streak" INTEGER NOT NULL DEFAULT 0,
    "health" INTEGER NOT NULL DEFAULT 3,
    "maxHealth" INTEGER NOT NULL DEFAULT 3,
    "questionsAnswered" INTEGER NOT NULL DEFAULT 0,
    "questionsCorrect" INTEGER NOT NULL DEFAULT 0,
    "startTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" TIMESTAMP(3),
    "boosts" "BoostType"[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "game_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leaderboard_entries" (
    "id" TEXT NOT NULL,
    "playerName" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "questionsCorrect" INTEGER NOT NULL,
    "questionsAnswered" INTEGER NOT NULL,
    "accuracy" DOUBLE PRECISION NOT NULL,
    "quizType" "QuizType" NOT NULL,
    "difficulty" "DifficultyLevel" NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "leaderboard_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "player_stats" (
    "id" TEXT NOT NULL,
    "playerName" TEXT NOT NULL,
    "totalGames" INTEGER NOT NULL DEFAULT 0,
    "totalQuestionsAnswered" INTEGER NOT NULL DEFAULT 0,
    "totalQuestionsCorrect" INTEGER NOT NULL DEFAULT 0,
    "overallAccuracy" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "bestScore" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "player_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "achievements" (
    "id" TEXT NOT NULL,
    "playerStatId" TEXT NOT NULL,
    "achievementId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_type_stats" (
    "id" TEXT NOT NULL,
    "playerStatId" TEXT NOT NULL,
    "quizType" "QuizType" NOT NULL,
    "games" INTEGER NOT NULL DEFAULT 0,
    "accuracy" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "bestScore" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "quiz_type_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "difficulty_stats" (
    "id" TEXT NOT NULL,
    "playerStatId" TEXT NOT NULL,
    "difficulty" "DifficultyLevel" NOT NULL,
    "games" INTEGER NOT NULL DEFAULT 0,
    "accuracy" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "bestScore" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "difficulty_stats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "game_sessions_playerName_idx" ON "game_sessions"("playerName");

-- CreateIndex
CREATE INDEX "game_sessions_startTime_idx" ON "game_sessions"("startTime");

-- CreateIndex
CREATE INDEX "leaderboard_entries_playerName_idx" ON "leaderboard_entries"("playerName");

-- CreateIndex
CREATE INDEX "leaderboard_entries_score_idx" ON "leaderboard_entries"("score");

-- CreateIndex
CREATE INDEX "leaderboard_entries_quizType_difficulty_score_idx" ON "leaderboard_entries"("quizType", "difficulty", "score");

-- CreateIndex
CREATE INDEX "leaderboard_entries_completedAt_idx" ON "leaderboard_entries"("completedAt");

-- CreateIndex
CREATE UNIQUE INDEX "player_stats_playerName_key" ON "player_stats"("playerName");

-- CreateIndex
CREATE INDEX "achievements_playerStatId_idx" ON "achievements"("playerStatId");

-- CreateIndex
CREATE INDEX "quiz_type_stats_playerStatId_idx" ON "quiz_type_stats"("playerStatId");

-- CreateIndex
CREATE UNIQUE INDEX "quiz_type_stats_playerStatId_quizType_key" ON "quiz_type_stats"("playerStatId", "quizType");

-- CreateIndex
CREATE INDEX "difficulty_stats_playerStatId_idx" ON "difficulty_stats"("playerStatId");

-- CreateIndex
CREATE UNIQUE INDEX "difficulty_stats_playerStatId_difficulty_key" ON "difficulty_stats"("playerStatId", "difficulty");

-- AddForeignKey
ALTER TABLE "achievements" ADD CONSTRAINT "achievements_playerStatId_fkey" FOREIGN KEY ("playerStatId") REFERENCES "player_stats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_type_stats" ADD CONSTRAINT "quiz_type_stats_playerStatId_fkey" FOREIGN KEY ("playerStatId") REFERENCES "player_stats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "difficulty_stats" ADD CONSTRAINT "difficulty_stats_playerStatId_fkey" FOREIGN KEY ("playerStatId") REFERENCES "player_stats"("id") ON DELETE CASCADE ON UPDATE CASCADE;
