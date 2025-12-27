import { useState, useEffect, useRef, useCallback } from 'react';
import { Obstacle, ObstacleType } from '@/src/types/game';
import { GAME_CONSTANTS, MAX_QUESTIONS_PER_DIFFICULTY } from '@/src/constants/game';
import { GameSession } from '@/services/api';

interface UseObstaclesProps {
  session: GameSession | null;
  isGameOver?: boolean;
}

export function useObstacles({ session, isGameOver = false }: UseObstaclesProps) {
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [hasCollision, setHasCollision] = useState(false);
  const [collidedObstacleId, setCollidedObstacleId] = useState<string | null>(null);
  const obstacleIdCounter = useRef(0);
  const spawnedCount = useRef(0);

  // Get max questions for current difficulty
  const maxQuestions = session
    ? MAX_QUESTIONS_PER_DIFFICULTY[session.difficulty]
    : MAX_QUESTIONS_PER_DIFFICULTY.easy; // Default to easy if no session

  const spawnObstacle = useCallback(() => {
    if (isGameOver) return; // Don't spawn new obstacles if game is over
    if (hasCollision) return; // Don't spawn new obstacles if collision occurred
    // Check if we've answered enough questions, not how many obstacles spawned
    if (session && session.questionsAnswered >= maxQuestions) {
      console.log(`Reached max questions (${maxQuestions}) for difficulty: ${session.difficulty}`);
      return; // Don't spawn more obstacles if we've answered max questions
    }

    const randomType =
      GAME_CONSTANTS.OBSTACLE_TYPES[
        Math.floor(Math.random() * GAME_CONSTANTS.OBSTACLE_TYPES.length)
      ];

    const newObstacle: Obstacle = {
      id: `obstacle-${obstacleIdCounter.current++}`,
      type: randomType,
    };

    spawnedCount.current++;
    setObstacles((prev) => [...prev, newObstacle]);
  }, [hasCollision, maxQuestions, session, isGameOver]);

  const removeObstacle = useCallback((id: string) => {
    setObstacles((prev) => prev.filter((obs) => obs.id !== id));
  }, []);

  const handleCollision = useCallback((id: string) => {
    if (isGameOver) return; // Don't handle collisions if game is over
    console.log('Collision detected with obstacle:', id);
    setHasCollision(true);
    setCollidedObstacleId(id);
    // TODO: Handle collision (show question, reduce health, etc.)
    // Don't remove obstacle immediately - keep it visible in idle state
  }, [isGameOver]);

  const resetCollision = useCallback(() => {
    setHasCollision(false);
    // Keep collidedObstacleId so we can track which obstacle to remove
  }, []);

  // Continuous obstacle spawning until max questions answered
  useEffect(() => {
    if (isGameOver) return; // Don't spawn new obstacles if game is over
    if (hasCollision) return; // Don't spawn new obstacles if collision occurred
    if (!session) return; // Don't spawn if no session
    // Check if we've answered enough questions
    if (session.questionsAnswered >= maxQuestions) return; // Don't spawn if we've answered max questions

    // Spawn first obstacle after initial delay
    const initialTimer = setTimeout(() => {
      spawnObstacle();
    }, GAME_CONSTANTS.OBSTACLE_SPAWN_DELAY);

    // Then spawn obstacles continuously with interval
    const spawnInterval = setInterval(() => {
      if (session.questionsAnswered >= maxQuestions || hasCollision || isGameOver) {
        clearInterval(spawnInterval);
        return;
      }
      spawnObstacle();
    }, GAME_CONSTANTS.OBSTACLE_SPAWN_DELAY * 2); // Spawn every 4 seconds after first one

    return () => {
      clearTimeout(initialTimer);
      clearInterval(spawnInterval);
    };
  }, [spawnObstacle, hasCollision, maxQuestions, session, isGameOver]);

  // Reset spawned count when session changes
  useEffect(() => {
    spawnedCount.current = 0;
    setObstacles([]);
    setHasCollision(false);
    setCollidedObstacleId(null);
  }, [session?.id]);

  return {
    obstacles,
    hasCollision,
    collidedObstacleId,
    spawnedCount: spawnedCount.current,
    maxQuestions,
    spawnObstacle,
    removeObstacle,
    handleCollision,
    resetCollision,
  };
}

